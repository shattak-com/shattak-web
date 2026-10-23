import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ scope: z.enum(['courses', 'notes']) }).strict();
const reply = (body: object, status = 200) =>
	Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export const POST = async (request: Request) => {
	const secret = process.env.PUBLIC_CACHE_REVALIDATION_SECRET;
	if (!secret || secret.length < 32) return reply({ error: 'Revalidation is not configured' }, 503);
	const expected = Buffer.from(`Bearer ${secret}`);
	const provided = Buffer.from(request.headers.get('authorization') ?? '');
	if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
		return reply({ error: 'Unauthorized' }, 401);
	}

	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return reply({ error: 'Invalid scope' }, 400);
	const { scope } = parsed.data;
	revalidateTag(`shattak-${scope}`, { expire: 0 });
	if (scope === 'courses') {
		revalidatePath('/');
		revalidatePath('/course/[id]', 'page');
	}
	// Notes pages also contain featured courses.
	revalidatePath('/notes', 'layout');
	return reply({ revalidated: true, scope });
};
