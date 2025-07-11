'use server';
import { cookies } from 'next/headers';

// Define interface for cookie data
interface CookieData {
  name: string;
  value: string;
  options?: {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  };
}

/**
 * Sets a cookie with the provided data
 * @param data Cookie configuration object
 * @returns Promise<void>
 */
export async function setCookie(data: CookieData): Promise<void> {
  try {
    const { name, value, options } = data;
    cookies().set(name, value, options);
  } catch (error) {
    console.error('Error setting cookie:', error);
    throw error;
  }
}
