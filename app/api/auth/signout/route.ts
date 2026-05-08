import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  return response;
}
