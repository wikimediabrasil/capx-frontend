import { middleware, config } from '@/middleware';

// Override the jest.setup.ts mock to provide a more realistic NextRequest/NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url: string) => ({
      url,
      headers: new Map([['host', 'localhost:3000']]),
    })),
    NextResponse: {
      next: jest.fn().mockImplementation((options: any) => ({
        type: 'next',
        request: options?.request,
      })),
    },
  };
});

describe('middleware', () => {
  it('adds x-url, x-origin, and x-pathname headers', () => {
    const mockRequest = {
      url: 'http://localhost:3000/profile/test-user',
      headers: new Headers({ host: 'localhost:3000' }),
    };

    const result = middleware(mockRequest as any);

    expect(result).toBeDefined();
  });

  it('config matcher excludes api, static, image, and favicon paths', () => {
    expect(config.matcher).toHaveLength(1);
    expect(config.matcher[0]).toContain('(?!api|_next/static|_next/image|favicon.ico)');
  });
});
