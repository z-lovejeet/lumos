import { GET as getMSAbroad, POST as postMSAbroad } from '../app/api/career/ms-abroad/route';
import { POST as postChat } from '../app/api/ai/chat/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => {
      return {
        status: init?.status || 200,
        json: async () => body
      };
    })
  }
}));

function createMockRequest(url: string, body?: any) {
  return {
    url,
    json: jest.fn().mockResolvedValue(body || {})
  } as unknown as Request;
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));

import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      careerPlan: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      chatMessage: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      semester: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      gradeScale: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      markingScheme: {
        findMany: jest.fn().mockResolvedValue([]),
      }
    }
  };
});

import prismaMock from '@/lib/prisma';
import { handleChatMessage } from '@/lib/ai/academic-chatbot';

jest.mock('@/lib/ai/academic-chatbot', () => ({
  handleChatMessage: jest.fn().mockResolvedValue({ content: 'Mocked LLM response', source: 'llm-mock' })
}));

jest.mock('@/lib/ai/rule-engine', () => ({
  processWithRules: jest.fn().mockReturnValue({ matched: true, response: 'Mocked rule response' })
}));

describe('Career CRUD API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET should return 401 if unauthorized', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
    });
    const req = createMockRequest('http://localhost:3000/api/career/ms-abroad');
    const res = await getMSAbroad(req);
    expect(res.status).toBe(401);
  });

  it('POST should block huge payloads', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
    });
    const hugeData = { a: 'a'.repeat(100001) };
    const req = createMockRequest('http://localhost:3000/api/career/ms-abroad', { data: hugeData, progress: 10 });
    const res = await postMSAbroad(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid or excessively large payload/);
  });
  
  it('POST should block null data payloads', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
    });
    const req = createMockRequest('http://localhost:3000/api/career/ms-abroad', { data: null, progress: 10 });
    const res = await postMSAbroad(req);
    expect(res.status).toBe(400);
  });

  it('POST should create if no existing plan', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
    });
    (prismaMock.careerPlan.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.careerPlan.create as jest.Mock).mockResolvedValue({ id: 'cp1' });

    const req = createMockRequest('http://localhost:3000/api/career/ms-abroad', { data: { hello: 'world' }, progress: 10 });
    const res = await postMSAbroad(req);
    expect(res.status).toBe(201);
    expect(prismaMock.careerPlan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'u1', type: 'ms-abroad' })
    });
  });
});

describe('Chat API & Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows chat if under rate limit', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
    });
    // Mock user has 10 calls (limit is 50)
    (prismaMock.chatMessage.count as jest.Mock).mockResolvedValue(10);

    const req = createMockRequest('http://localhost:3000/api/ai/chat', { message: 'Hello' });
    const res = await postChat(req);
    
    expect(res.status).toBe(200);
    expect(handleChatMessage).toHaveBeenCalled();
  });

  it('blocks LLM chat and falls back to rule-engine if over rate limit', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
    });
    // Mock user has 55 calls (limit is 50)
    (prismaMock.chatMessage.count as jest.Mock).mockResolvedValue(55);

    const req = createMockRequest('http://localhost:3000/api/ai/chat', { message: 'Hello' });
    const res = await postChat(req);
    
    expect(res.status).toBe(200);
    // Should NOT call the external LLM handleChatMessage
    expect(handleChatMessage).not.toHaveBeenCalled();
    const json = await res.json();
    expect(json.source).toBe('rule');
    expect(json.response).toBe('Mocked rule response');
  });
});
