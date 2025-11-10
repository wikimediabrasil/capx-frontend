export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[check_emailable] POST request received');

  try {
    const body = await request.json();
    const { receiver, sender } = body;

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver username is required' }, { status: 400 });
    }

    console.log('[check_emailable] Checking email for receiver:', receiver);
    if (sender) {
      console.log('[check_emailable] Checking email for sender:', sender);
    }

    const headers = {
      'User-Agent': 'CapX/1.0 (https://capx.toolforge.org/; contact@capx.org) axios/1.0',
    };

    // Check both sender and receiver in a single request if sender is provided
    const usersToCheck = sender ? `${sender}|${receiver}` : receiver;

    const response = await axios.get('https://meta.wikimedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        list: 'users',
        formatversion: 2,
        usprop: 'emailable',
        ususers: usersToCheck,
      },
      headers,
    });

    const users = response.data?.query?.users || [];

    // Find sender and receiver in the response
    let sender_emailable = true; // Default to true if sender not provided
    let receiver_emailable = false;

    if (sender) {
      const senderUser = users.find((u: any) => u.name === sender);
      sender_emailable = senderUser?.emailable === true;
      console.log('[check_emailable] Sender emailable:', sender_emailable);
    }

    const receiverUser = users.find((u: any) => u.name === receiver);
    receiver_emailable = receiverUser?.emailable === true;
    console.log('[check_emailable] Receiver emailable:', receiver_emailable);

    const can_send_email = sender_emailable && receiver_emailable;

    return NextResponse.json({
      sender_emailable,
      receiver_emailable,
      can_send_email,
    });
  } catch (error: any) {
    console.error('[check_emailable] Error:', error.message);
    console.error('[check_emailable] Error stack:', error.stack);
    console.error('[check_emailable] Error response:', error.response?.data);
    return NextResponse.json({ error: 'Failed to check email availability' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log('[check_emailable] OPTIONS request received');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
