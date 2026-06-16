// Mock axios before importing the interceptor
jest.mock('axios', () => {
  const mockInterceptors = {
    response: {
      use: jest.fn(),
    },
  };
  return {
    __esModule: true,
    default: {
      interceptors: mockInterceptors,
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
    interceptors: mockInterceptors,
  };
});

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

import axios from 'axios';
import { isTokenExpiredError } from '@/lib/axios-interceptor';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('axios-interceptor', () => {
  describe('isTokenExpiredError', () => {
    test('should detect invalid token error from backend', () => {
      const error = {
        response: {
          status: 401,
          data: {
            detail: 'Invalid token.',
          },
        },
      };

      expect(isTokenExpiredError(error)).toBe(true);
    });

    test('should detect shouldLogout flag', () => {
      const error = {
        response: {
          status: 401,
          data: {
            shouldLogout: true,
          },
        },
      };

      expect(isTokenExpiredError(error)).toBe(true);
    });

    test('should detect token expirado error from internal API', () => {
      const error = {
        response: {
          status: 401,
          data: {
            error: 'Token expirado',
            shouldLogout: true,
          },
        },
      };

      expect(isTokenExpiredError(error)).toBe(true);
    });

    test('should not detect regular 401 errors', () => {
      const error = {
        response: {
          status: 401,
          data: {
            error: 'Unauthorized',
          },
        },
      };

      expect(isTokenExpiredError(error)).toBe(false);
    });

    test('should not detect non-401 errors', () => {
      const error = {
        response: {
          status: 500,
          data: {
            detail: 'Invalid token.',
          },
        },
      };

      expect(isTokenExpiredError(error)).toBe(false);
    });

    test('should handle missing response data', () => {
      const error = {
        response: {
          status: 401,
        },
      };

      expect(isTokenExpiredError(error)).toBe(false);
    });

    test('should return false for null error', () => {
      expect(isTokenExpiredError(null)).toBe(false);
    });

    test('should return false for error without response', () => {
      expect(isTokenExpiredError({ message: 'Network Error' })).toBe(false);
    });

    test('should not trigger on Token expirado without shouldLogout', () => {
      const error = {
        response: {
          status: 401,
          data: {
            error: 'Token expirado',
            shouldLogout: false,
          },
        },
      };
      expect(isTokenExpiredError(error)).toBe(false);
    });
  });

  describe('setupAxiosInterceptor', () => {
    let responseInterceptor: (response: any) => any;
    let errorInterceptor: (error: any) => Promise<any>;

    beforeEach(() => {
      jest.clearAllMocks();

      // Capture interceptor callbacks synchronously
      (mockAxios.interceptors.response.use as jest.Mock).mockImplementation(
        (onFulfilled: any, onRejected: any) => {
          responseInterceptor = onFulfilled;
          errorInterceptor = onRejected;
          return 0;
        }
      );

      // Call the already-imported default export
      const setupAxiosInterceptor = require('@/lib/axios-interceptor').default;
      setupAxiosInterceptor();
    });

    test('response interceptor passes through successful responses', () => {
      const mockResponse = { status: 200, data: { ok: true } };
      const result = responseInterceptor(mockResponse);
      expect(result).toBe(mockResponse);
    });

    test('error interceptor rejects non-401 errors', async () => {
      const error = { response: { status: 500, data: {} } };
      await expect(errorInterceptor(error)).rejects.toBe(error);
    });

    test('error interceptor rejects 401 errors without token expiry flags', async () => {
      const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
      await expect(errorInterceptor(error)).rejects.toBe(error);
    });

    test('error interceptor rejects errors with no response', async () => {
      const error = { message: 'Network Error' };
      await expect(errorInterceptor(error)).rejects.toBe(error);
    });

    test('error interceptor still rejects after handling invalid token', async () => {
      const error = {
        response: { status: 401, data: { detail: 'Invalid token.' } },
      };
      // The interceptor tries to sign out but still rejects
      await expect(errorInterceptor(error)).rejects.toBe(error);
    });

    test('error interceptor rejects after handling shouldLogout=true', async () => {
      const error = {
        response: { status: 401, data: { shouldLogout: true } },
      };
      await expect(errorInterceptor(error)).rejects.toBe(error);
    });
  });
});
