import { zValidator } from '@hono/zod-validator';
import { and, asc, count, desc, eq, max } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { createSelectSchema } from 'drizzle-zod';
import { Hono } from 'hono';
import { z } from 'zod';

import * as schema from '@/db/schema';
import * as vrchat from '@/features/vrchat';

const selectGuestSchema = createSelectSchema(schema.guests);

const paramSchema = z.object({
	vrchatId: z
		.string()
		.regex(/^usr_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
});

const querySchema = z
	.object({
		banStatus: selectGuestSchema.shape.banStatus.default('none'),
		sort: z.enum(['visit', 'visitedAt']).default('visitedAt'),
		order: z.enum(['asc', 'desc']).default('desc'),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.get('/', zValidator('query', querySchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const query = c.req.valid('query');

		const visits = db
			.select({
				guestId: schema.guestVisits.guestId,
				visit: count(schema.guestVisits.id).as('visit'),
				visitedAt: max(schema.guestVisits.visitedAt).as('visitedAt'),
			})
			.from(schema.guestVisits)
			.groupBy(schema.guestVisits.guestId)
			.as('visits');

		const conditions = [eq(schema.guests.banStatus, query.banStatus)];

		const sortOrder = query.order === 'asc' ? asc : desc;
		const sortColumn = {
			visit: visits.visit,
			visitedAt: visits.visitedAt,
			createdAt: schema.guests.createdAt,
		}[query.sort];

		const rows = await db
			.select({
				id: schema.guests.id,
				vrchatId: schema.guests.vrchatId,
				banStatus: schema.guests.banStatus,
				createdAt: schema.guests.createdAt,
				visit: visits.visit,
				visitedAt: visits.visitedAt,
			})
			.from(schema.guests)
			.where(and(...conditions))
			.orderBy(sortOrder(sortColumn))
			.limit(20);

		return c.json({ data: rows }, 200);
	})
	.get('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		console.log(vrchatId);

		const row = await db
			.select()
			.from(schema.guests)
			.where(eq(schema.guests.vrchatId, vrchatId))
			.get();

		if (row) return c.json({ data: row }, 200);
		return c.json({ code: 'not_found' }, 404);
	})
	.post('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const rows = await db
			.insert(schema.guests)
			.values({ vrchatId })
			.onConflictDoNothing()
			.returning();

		if (rows.length) return c.json({ data: rows }, 201);
		return c.json({ code: 'conflict' }, 409);
	})
	// .post('/:vrchatId/visits', zValidator('param', paramSchema), async (c) => {
	// 	const db = drizzle(c.env.milkclaire);
	// 	const { vrchatId } = c.req.valid('param');

	// 	const row = await guest.visit(db, vrchatId);

	// 	if (row) return c.json({ data: row }, 200);
	// 	return c.json({ code: 'not_found' }, 404);
	// })
	.post('/:vrchatId/ban', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const row = await db
			.update(schema.guests)
			.set({ banStatus: 'banned' })
			.where(eq(schema.guests.vrchatId, vrchatId))
			.returning()
			.get();

		if (!row) return c.json({ code: 'not_found' }, 404);

		await vrchat.ban(vrchatId);
		return c.json({ data: row }, 200);
	})
	.delete('/:vrchatId/ban', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const row = await db
			.update(schema.guests)
			.set({ banStatus: 'none' })
			.where(eq(schema.guests.vrchatId, vrchatId))
			.returning()
			.get();

		if (!row) return c.json({ code: 'not_found' }, 404);

		await vrchat.unban(vrchatId);
		return c.json({ data: row }, 200);
	});

export default app;
