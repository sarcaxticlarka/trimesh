import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/upload', '/settings', '/ai-studio'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isProtected = PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/settings/:path*', '/ai-studio/:path*'],
};
