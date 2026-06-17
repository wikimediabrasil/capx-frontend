import { handleApiError, isInvalidTokenError } from '@/lib/utils/api-error-handler';
import { NextResponse } from 'next/server';

// NextResponse is mocked globally in jest.setup.ts:
//   NextResponse.json returns { status, headers, json }
// We capture calls via the jest mock to inspect arguments.
const mockedNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// isInvalidTokenError
// ---------------------------------------------------------------------------
describe('isInvalidTokenError', () => {
  it('returns true for a 401 with "Invalid token." detail', () => {
    const error = { response: { status: 401, data: { detail: 'Invalid token.' } } };
    expect(isInvalidTokenError(error)).toBe(true);
  });

  it('returns false for a 401 without matching detail', () => {
    const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
    expect(isInvalidTokenError(error)).toBe(false);
  });

  it('returns false for a 401 with no data', () => {
    const error = { response: { status: 401 } };
    expect(isInvalidTokenError(error)).toBe(false);
  });

  it('returns false for a non-401 error that has Invalid token. in detail', () => {
    const error = { response: { status: 403, data: { detail: 'Invalid token.' } } };
    expect(isInvalidTokenError(error)).toBe(false);
  });

  it('returns false for a 500 error', () => {
    const error = { response: { status: 500, data: { detail: 'Server error' } } };
    expect(isInvalidTokenError(error)).toBe(false);
  });

  it('returns false when there is no response at all', () => {
    const error = { message: 'Network error' };
    expect(isInvalidTokenError(error)).toBe(false);
  });

  it('returns false for an empty error object', () => {
    expect(isInvalidTokenError({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleApiError — 401 with "Invalid token."
// ---------------------------------------------------------------------------
describe('handleApiError - 401 Invalid token', () => {
  it('calls NextResponse.json with shouldLogout:true and status 401', () => {
    const error = { response: { status: 401, data: { detail: 'Invalid token.' } } };
    handleApiError(error);

    expect(mockedNextResponseJson).toHaveBeenCalledTimes(1);
    const [body, options] = mockedNextResponseJson.mock.calls[0];
    expect(body).toEqual({
      error: 'Token expirado',
      detail: 'Invalid token.',
      shouldLogout: true,
    });
    expect(options).toEqual({ status: 401 });
  });

  it('returns the value produced by NextResponse.json', () => {
    const error = { response: { status: 401, data: { detail: 'Invalid token.' } } };
    const result = handleApiError(error);
    // The mock returns { status, headers, json }
    expect(result).toBeDefined();
    expect((result as any).status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// handleApiError — 401 without "Invalid token."
// ---------------------------------------------------------------------------
describe('handleApiError - generic 401', () => {
  it('calls NextResponse.json with "Não autorizado" and status 401', () => {
    const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
    handleApiError(error);

    const [body, options] = mockedNextResponseJson.mock.calls[0];
    expect(body).toEqual({ error: 'Não autorizado' });
    expect(options).toEqual({ status: 401 });
  });

  it('handles 401 with no data field at all', () => {
    const error = { response: { status: 401 } };
    handleApiError(error);

    const [body, options] = mockedNextResponseJson.mock.calls[0];
    expect(body).toEqual({ error: 'Não autorizado' });
    expect(options).toEqual({ status: 401 });
  });

  it('does NOT include shouldLogout for generic 401', () => {
    const error = { response: { status: 401, data: {} } };
    handleApiError(error);

    const [body] = mockedNextResponseJson.mock.calls[0];
    expect((body as any).shouldLogout).toBeUndefined();
  });

  it('does NOT include shouldLogout when detail is a different string', () => {
    const error = { response: { status: 401, data: { detail: 'Token is expired' } } };
    handleApiError(error);

    const [body] = mockedNextResponseJson.mock.calls[0];
    expect((body as any).shouldLogout).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// handleApiError — other errors (non-401)
// ---------------------------------------------------------------------------
describe('handleApiError - other errors', () => {
  it('calls NextResponse.json with status from error.response.status', () => {
    const error = {
      response: { status: 500, data: { detail: 'Internal server error' } },
    };
    handleApiError(error);

    const [, options] = mockedNextResponseJson.mock.calls[0];
    expect(options).toEqual({ status: 500 });
  });

  it('returns status 500 when error has no response', () => {
    const error = { message: 'Network timeout' };
    handleApiError(error);

    const [, options] = mockedNextResponseJson.mock.calls[0];
    expect(options).toEqual({ status: 500 });
  });

  it('includes error response data in details', () => {
    const errorData = { detail: 'Not found' };
    const error = { response: { status: 404, data: errorData } };
    handleApiError(error);

    const [body] = mockedNextResponseJson.mock.calls[0];
    expect((body as any).details).toEqual(errorData);
  });

  it('falls back to error.message in details when no response data', () => {
    const error = { message: 'Something went wrong' };
    handleApiError(error);

    const [body] = mockedNextResponseJson.mock.calls[0];
    expect((body as any).details).toBe('Something went wrong');
  });

  it('returns "Erro interno do servidor" as the error message', () => {
    const error = { response: { status: 503, data: {} } };
    handleApiError(error);

    const [body] = mockedNextResponseJson.mock.calls[0];
    expect((body as any).error).toBe('Erro interno do servidor');
  });

  it('handles a 403 error correctly', () => {
    const error = { response: { status: 403, data: { detail: 'Forbidden' } } };
    handleApiError(error);

    const [body, options] = mockedNextResponseJson.mock.calls[0];
    expect((options as any).status).toBe(403);
    expect((body as any).error).toBe('Erro interno do servidor');
  });

  it('handles a 422 error correctly', () => {
    const error = {
      response: {
        status: 422,
        data: { detail: [{ msg: 'field required' }] },
      },
    };
    handleApiError(error);

    const [, options] = mockedNextResponseJson.mock.calls[0];
    expect((options as any).status).toBe(422);
  });

  it('handles error with no response and no message', () => {
    const error = {};
    handleApiError(error);

    const [, options] = mockedNextResponseJson.mock.calls[0];
    expect((options as any).status).toBe(500);
  });
});
