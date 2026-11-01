import { zValidator } from '@hono/zod-validator';
import { count, eq, max } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { z } from 'zod';

import * as schema from '@/db/schema';

const paramSchema = z.object({
	vrchatId: z
		.string()
		.regex(/^usr_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
});

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.get('/', async (c) => {
		const db = drizzle(c.env.milkclaire);

		const casts = await db.select().from(schema.casts).limit(20);

		return c.json({ data: casts }, 200);
	})
	.get('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const cast = await db
			.select()
			.from(schema.casts)
			.where(eq(schema.casts.vrchatId, vrchatId))
			.get();

		if (cast) return c.json({ data: cast }, 200);
		return c.json({ error: { code: 'not_found' } }, 404);
	})
	.post('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const [cast] = await db
			.insert(schema.casts)
			.values({ vrchatId })
			.onConflictDoNothing()
			.returning();

		if (cast) return c.json({ data: cast }, 201);
		return c.json({ error: { code: 'conflict' } }, 409);
	})
	.get('/:vrchatId/attends', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const cast = await db
			.select({ id: schema.casts.id })
			.from(schema.casts)
			.where(eq(schema.casts.vrchatId, vrchatId))
			.get();

		if (!cast) return c.json({ code: 'not_found' }, 404);

		const [attend] = await db
			.select({
				count: count(),
				attendedAt: max(schema.castAttends.attendedAt),
			})
			.from(schema.castAttends)
			.where(eq(schema.castAttends.castId, cast.id));

		return c.json({ data: attend }, 200);
	})
	.post('/:vrchatId/attends', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const [cast] = await db
			.insert(schema.casts)
			.values({ vrchatId })
			.onConflictDoNothing()
			.returning();

		const [attend] = await db.insert(schema.castAttends).values({ castId: cast.id }).returning();

		return c.json({ data: attend }, 201);
	});

export default app;
