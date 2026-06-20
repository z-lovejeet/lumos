import { GET as getSubjects } from '../app/api/subjects/route';

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

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    constructor(input: string) {
      this.url = input;
    }
  } as any;
}

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));

import { createClient } from '@/lib/supabase/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    subject: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', code: 'CS101', name: 'Intro', userId: 'user_123' }
      ]),
    }
  }
}));

describe('Subjects API (CRUD & Auth Filter)', () => {
  let mockRequest: Request;

  beforeEach(() => {
    mockRequest = new Request('http://localhost:3000/api/subjects');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if no user session exists', async () => {
    // Mock unauthorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } })
      }
    });

    const response = await getSubjects(mockRequest);
    expect(response.status).toBe(401);
    
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('should return subjects filtered by userId if session is valid', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } })
      }
    });

    const response = await getSubjects(mockRequest);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.subjects).toHaveLength(1);
    expect(json.subjects[0].code).toBe('CS101');
  });
});
