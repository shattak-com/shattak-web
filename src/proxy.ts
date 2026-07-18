import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizePathname = (pathname: string) => (pathname === '/' ? pathname : trimTrailingSlash(pathname));

const redirectTo = (request: NextRequest, pathname: string) => NextResponse.redirect(new URL(pathname, request.url));

export const proxy = (request: NextRequest) => {
	const pathname = normalizePathname(request.nextUrl.pathname);

	if (pathname === '/admin') {
		return redirectTo(request, '/admin/courses/');
	}

	return NextResponse.next();
};

export const config = {
	matcher: ['/admin/:path*']
};
