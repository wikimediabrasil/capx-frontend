import axios from 'axios';
import { NextResponse } from 'next/server';

// Cache to prevent multiple simultaneous calls with the same tokens
const tokenCache = new Map<string, { timestamp: number; result: any }>();
const CACHE_TTL = 5000; // 5 seconds TTL

// Lock to prevent multiple simultaneous executions with the same tokens
const executionLocks = new Map<string, Promise<any>>();

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  tokenCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      tokenCache.delete(key);
    }
  });

  // Also clean up execution locks
  executionLocks.clear();
}, CACHE_TTL);

// Helper function to execute login logic
async function executeLoginWithTokens(
  oauth_token: string,
  oauth_verifier: string,
  token_secret: string,
  cacheKey: string
) {
  const requestPayload = {
    oauth_token,
    oauth_verifier,
    oauth_token_secret: token_secret,
  };

  try {
    const response = await axios.post(process.env.LOGIN_STEP03_URL as string, requestPayload, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CapX-Frontend/1.0',
      },
    });

    if (response.data && response.data.token) {
      const userData = {
        success: true,
        user: {
          token: response.data.token,
          id: response.data.id,
          username: response.data.username,
          first_login: response.data.first_name === null,
        },
      };

      // Cache the successful result
      tokenCache.set(cacheKey, {
        timestamp: Date.now(),
        result: userData,
      });

      return userData;
    }

    console.error('Invalid response from server:', response.data);
    throw new Error('Invalid response from server');
  } catch (axiosError: any) {
    console.error('🦊 Axios request failed:', {
      error: axiosError.message,
      code: axiosError.code,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });

    // If it's a 400 error, provide more specific error message and cache the failure
    if (axiosError.response?.status === 400) {
      console.error('🦊 HTTP 400 - OAuth tokens may have been consumed or are invalid');

      // Cache the failure to prevent multiple attempts with the same tokens
      const errorResponse = {
        error: 'OAuth tokens invalid or already used. Please try logging in again.',
      };
      tokenCache.set(cacheKey, {
        timestamp: Date.now(),
        result: errorResponse,
      });

      throw new Error('OAuth tokens invalid or already used. Please try logging in again.');
    }

    // For other errors, also cache the failure to prevent multiple attempts
    console.warn('🦊 Caching failure for other error types');
    tokenCache.set(cacheKey, {
      timestamp: Date.now(),
      result: { error: 'Authentication failed' },
    });

    throw axiosError;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { oauth_token, oauth_verifier, stored_token_secret, oauth_token_secret } = body;

    // Create a cache key from the tokens
    const cacheKey = `${oauth_token}:${oauth_verifier}:${stored_token_secret || oauth_token_secret}`;

    // Check if we have a cached result for these exact tokens
    const cached = tokenCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.result);
    }

    // Check if there's already an execution in progress for these tokens
    const existingLock = executionLocks.get(cacheKey);
    if (existingLock) {
      try {
        const result = await existingLock;
        return NextResponse.json(result);
      } catch (error) {
        executionLocks.delete(cacheKey);
      }
    }

    // Use oauth_token_secret if available, otherwise fallback to stored_token_secret
    const token_secret = oauth_token_secret || stored_token_secret;

    if (!oauth_token || !oauth_verifier || !token_secret) {
      console.error('Missing required parameters:', {
        oauth_token,
        oauth_verifier,
        token_secret,
      });
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create execution lock for these tokens
    const executionPromise = executeLoginWithTokens(
      oauth_token,
      oauth_verifier,
      token_secret,
      cacheKey
    );
    executionLocks.set(cacheKey, executionPromise);

    try {
      const result = await executionPromise;
      return NextResponse.json(result);
    } finally {
      // Clean up the lock
      executionLocks.delete(cacheKey);
    }
  } catch (error: any) {
    console.error('🦊 Login callback error:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      stack: error.stack,
    });

    let errorMessage = 'Authentication failed';
    let statusCode = 500;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - external service not responding';
      statusCode = 504;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'External service not found';
      statusCode = 503;
    } else if (error.response?.status) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.error || `HTTP ${error.response.status}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
