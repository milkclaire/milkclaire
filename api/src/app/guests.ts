import { zValidator } from '@hono/zod-validator';
import { count, eq, max } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { z } from 'zod';

import * as schema from '@/db/schema';
import * as vrchat from '@/features/vrchat';

const paramSchema = z.object({
	vrchatId: z
		.string()
		.regex(/^usr_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
});

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.get('/pending', async (c) => {
		const db = drizzle(c.env.milkclaire);

		const guests = await db
			.select()
			.from(schema.guests)
			.where(eq(schema.guests.banStatus, 'pending'));

		return c.json({ data: guests }, 200);
	})
	.get('/banned', async (c) => {
		const db = drizzle(c.env.milkclaire);

		const guests = await db
			.select()
			.from(schema.guests)
			.where(eq(schema.guests.banStatus, 'banned'));

		return c.json({ data: guests }, 200);
	})
	.get('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const guest = await db
			.select()
			.from(schema.guests)
			.where(eq(schema.guests.vrchatId, vrchatId))
			.get();

		if (guest) return c.json({ data: guest }, 200);
		return c.json({ error: { code: 'not_found' } }, 404);
	})
	.post('/:vrchatId', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const [guest] = await db
			.insert(schema.guests)
			.values({ vrchatId })
			.onConflictDoNothing()
			.returning();

		if (guest) return c.json({ data: guest }, 201);
		return c.json({ error: { code: 'conflict' } }, 409);
	})
	.get('/:vrchatId/visits', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const guest = await db
			.select({ id: schema.guests.id })
			.from(schema.guests)
			.where(eq(schema.guests.vrchatId, vrchatId))
			.get();

		if (!guest) return c.json({ code: 'not_found' }, 404);

		const [visit] = await db
			.select({
				count: count(),
				visitedAt: max(schema.guestVisits.visitedAt),
			})
			.from(schema.guestVisits)
			.where(eq(schema.guestVisits.guestId, guest.id));

		return c.json({ data: visit }, 200);
	})
	.post('/:vrchatId/visits', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const [guest] = await db
			.insert(schema.guests)
			.values({ vrchatId })
			.onConflictDoNothing()
			.returning();

		const [visit] = await db.insert(schema.guestVisits).values({ guestId: guest.id }).returning();

		return c.json({ data: visit }, 201);
	})
	.post('/:vrchatId/ban', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const [guest] = await db
			.update(schema.guests)
			.set({ banStatus: 'banned' })
			.where(eq(schema.guests.vrchatId, vrchatId))
			.returning();

		if (!guest) return c.json({ code: 'not_found' }, 404);

		await vrchat.ban(vrchatId);
		return c.json({ data: guest }, 200);
	})
	.delete('/:vrchatId/ban', zValidator('param', paramSchema), async (c) => {
		const db = drizzle(c.env.milkclaire);
		const { vrchatId } = c.req.valid('param');

		const [guest] = await db
			.update(schema.guests)
			.set({ banStatus: 'none' })
			.where(eq(schema.guests.vrchatId, vrchatId))
			.returning();

		if (!guest) return c.json({ code: 'not_found' }, 404);

		await vrchat.unban(vrchatId);
		return c.json({ data: guest }, 200);
	});

export default app;
