import { NextResponse } from 'next/server';
import { COOKIE_NAMES } from '../../../../utils/cookies';

export async function POST() {
  const response = NextResponse.json({ 
    message: 'Logged out successfully'
  });
  
  response.cookies.set(COOKIE_NAMES.AUTH_TOKEN, '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  response.cookies.set(COOKIE_NAMES.USER_SESSION, '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  return response;
} 