import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'shattak_admin';

export const POST = async (request: Request) => {
	const payload = await request.json().catch(() => null);
	const password = typeof payload?.password === 'string' ? payload.password.trim() : '';
	const adminPassword = process.env.ADMIN_PASSWORD;

	if (!adminPassword) {
		return NextResponse.json({ error: 'Admin password not configured.' }, { status: 500 });
	}

	if (!password || password !== adminPassword) {
		return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
	}

	const response = NextResponse.json({ ok: true });
	response.cookies.set(ADMIN_COOKIE_NAME, '1', {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7,
		path: '/'
	});

	return response;
};
