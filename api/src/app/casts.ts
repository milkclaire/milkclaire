import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { createSelectSchema } from 'drizzle-zod';
import { Hono } from 'hono';
import { z } from 'zod';

import * as schema from '@/db/schema';

const selectGuestSchema = createSelectSchema(schema.casts);

const paramSchema = z.object({
	vrchatId: selectGuestSchema.shape.vrchatId,
});

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.get('/', async (c) => {
		const db = drizzle(c.env.milkclaire);

		const rows = await db.select().from(schema.casts).limit(20);

		return c.json({ data: rows }, 200);
	})
	.get('/:vrchatId', async (c) => {
		const db = drizzle(c.env.milkclaire);
		const vrchatId = c.req.param('vrchatId');

		const row = await db
			.select()
			.from(schema.casts)
			.where(eq(schema.casts.vrchatId, vrchatId))
			.get();

		if (row) return c.json({ data: row }, 200);
		return c.json({ error: { code: 'not_found' } }, 404);
	})
	.post('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const row = await db
			.insert(schema.casts)
			.values({ vrchatId })
			.onConflictDoNothing()
			.returning();

		if (row) return c.json({ data: row }, 201);
		return c.json({ error: { code: 'conflict' } }, 409);
	});
// .post('/:vrchatId/attend', zValidator('param', paramSchema), async (c) => {
// 	const db = drizzle(c.env.milkclaire);
// 	const { vrchatId } = c.req.valid('param');

// 	const row = await cast.attend(db, vrchatId);

// 	if (row) return c.json({ data: row }, 200);
// 	return c.json({ error: { code: 'not_found' } }, 404);
// });

export default app;
