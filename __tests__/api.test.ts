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

import { POST as postAttendance } from '../app/api/subjects/[id]/attendance/route';
import { GET as getNotes } from '../app/api/notes/route';
import { PATCH as patchNote } from '../app/api/notes/[id]/route';

describe('Security Work: Attendance & Notes Auth Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Attendance API: should block attendance upsert if subject is not owned by user', async () => {
    // Authorized user, but subject does not belong to them
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'hacker_user' } } }) }
    });

    const prismaMock = require('@/lib/prisma').default;
    prismaMock.subject.findFirst = jest.fn().mockResolvedValue(null); // subject not found for this user

    const mockReq = new Request('http://localhost:3000/api/subjects/sub123/attendance');
    mockReq.json = jest.fn().mockResolvedValue({ date: '2024-01-01', attended: true });

    const response = await postAttendance(mockReq, { params: Promise.resolve({ id: 'sub123' }) });
    expect(response.status).toBe(404);
    
    const json = await response.json();
    expect(json.error).toBe('Subject not found');
  });

  it('Notes API: should fetch only notes belonging to the user', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user_123' } } }) }
    });

    const prismaMock = require('@/lib/prisma').default;
    prismaMock.note = {
      findMany: jest.fn().mockResolvedValue([{ id: 'note1', userId: 'user_123' }])
    };

    const mockReq = new Request('http://localhost:3000/api/notes');
    const response = await getNotes(mockReq);
    
    expect(response.status).toBe(200);
    expect(prismaMock.note.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: 'user_123' })
    }));
  });

  it('Notes API: should block note PATCH if new subjectId is not owned by user', async () => {
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'hacker_user' } } }) }
    });

    const prismaMock = require('@/lib/prisma').default;
    prismaMock.note = {
      findFirst: jest.fn().mockResolvedValue({ id: 'note1', userId: 'hacker_user' }) // Note owned by hacker
    };
    prismaMock.subject.findFirst = jest.fn().mockResolvedValue(null); // But the target subject belongs to someone else!

    const mockReq = new Request('http://localhost:3000/api/notes/note1');
    mockReq.json = jest.fn().mockResolvedValue({ subjectId: 'stolen_subject' });

    const response = await patchNote(mockReq, { params: Promise.resolve({ id: 'note1' }) });
    expect(response.status).toBe(404);
    
    const json = await response.json();
    expect(json.error).toBe('Subject not found');
  });
});
