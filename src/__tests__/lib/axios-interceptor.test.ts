import { isTokenExpiredError } from '@/lib/axios-interceptor';

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
  });
});
