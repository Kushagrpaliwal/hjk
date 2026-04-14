import { NextResponse } from 'next/server';

export async function POST(req) {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the authentication cookie
  response.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // This deletes the cookie
    path: '/',
  });

  return response;
}
