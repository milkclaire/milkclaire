import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';
import z from 'zod';

import { api } from '$/lib/api';

export const POST = createRoute(
	zValidator(
		'param',
		z.object({
			vrchatId: z
				.string()
				.regex(/^usr_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
		}),
	),
	async (c) => {
		const { vrchatId } = c.req.valid('param');

		await api(c).guests[':vrchatId'].visits.$post({ param: { vrchatId } });

		return c.redirect(`/guest/${vrchatId}`);
	},
);
