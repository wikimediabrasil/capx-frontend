import { NextRequest } from 'next/server';

/**
 * Creates a mock NextRequest for API route testing
 */
export function createMockRequest(config: {
  userId: number;
  token: string;
  method?: string;
}): NextRequest {
  return {
    json: jest.fn().mockResolvedValue({
      user: { id: config.userId },
    }),
    headers: {
      get: jest.fn((header: string) => {
        if (header === 'authorization') return `Token ${config.token}`;
        return null;
      }),
    },
  } as unknown as NextRequest;
}
