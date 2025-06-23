import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.LOGIN_STEP01_URL) {
      throw new Error('LOGIN_STEP01_URL não está configurada');
    }

    const startLoginResponse = await axios.post(
      process.env.LOGIN_STEP01_URL,
      {
        oauth_callback: process.env.NEXTAUTH_URL + '/oauth',
        provider: 'mediawiki',
        extra: request.headers.get('host'),
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!startLoginResponse.data) throw new Error('Empty response from startLogin');

    const { oauth_token, oauth_token_secret } = startLoginResponse.data;

    if (!oauth_token || !oauth_token_secret) {
      throw new Error('OAuth tokens not found in response');
    }

    const redirectURL = process.env.LOGIN_STEP02_URL;
    if (!redirectURL) {
      throw new Error('LOGIN_STEP02_URL is not configured');
    }

    const redirectURLParams = `?oauth_token=${oauth_token}`;
    const fullRedirectURL = redirectURL + redirectURLParams;

    return NextResponse.json({
      oauth_token,
      oauth_token_secret,
      redirect_url: fullRedirectURL,
    });
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: 'Failed to start login process',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
