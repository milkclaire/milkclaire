import { zValidator } from '@hono/zod-validator';
import { and, eq, ne } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import z from 'zod';

import * as schema from '@/db/schema';

const jsonSchema = z.object({
	'報告対象者の VRChat URL を記入してください。': z
		.string()
		.regex(/^usr_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
	'報告する理由 を記入してください。': z.string(),
});

const app = new Hono<{ Bindings: CloudflareBindings }>().post(
	'/form',
	zValidator('json', jsonSchema),
	async (c) => {
		const db = drizzle(c.env.milkclaire);
		const {
			'報告対象者の VRChat URL を記入してください。': vrchatId,
			'報告する理由 を記入してください。': banReason,
		} = c.req.valid('json');

		await db.insert(schema.guests).values({ vrchatId, banStatus: 'pending' }).onConflictDoNothing();
		await db
			.update(schema.guests)
			.set({ banStatus: 'pending', banReason })
			.where(and(eq(schema.guests.vrchatId, vrchatId), ne(schema.guests.banStatus, 'banned')));

		return c.json({ success: true }, 200);
	},
);

export default app;
