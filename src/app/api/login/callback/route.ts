import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { oauth_token, oauth_verifier, stored_token_secret, oauth_token_secret } = body;

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

    const response = await axios.post(process.env.LOGIN_STEP03_URL as string, {
      oauth_token,
      oauth_verifier,
      oauth_token_secret: token_secret,
    });

    if (response.data && response.data.token) {
      return NextResponse.json({
        success: true,
        user: {
          token: response.data.token,
          id: response.data.id,
          username: response.data.username,
          first_login: response.data.first_name === null,
        },
      });
    }

    console.error('Invalid response from server:', response.data);
    return NextResponse.json({ error: 'Invalid response from server' }, { status: 400 });
  } catch (error: any) {
    console.error('Login callback error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Authentication failed' },
      { status: error.response?.status || 500 }
    );
  }
}
