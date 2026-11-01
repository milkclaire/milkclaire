import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { except } from 'hono/combine';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import casts from '@/app/casts';
import google from '@/app/google';
import guests from '@/app/guests';

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use(
		'*',
		logger(),
		secureHeaders(),
		cors({
			origin: ['https://crm.milkclaire.workers.dev', 'http://localhost:5173'],
			allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
		}),
	)
	.use('*', async (c, next) => {
		const { success } = await env.RATE_LIMITER.limit({
			key: c.req.header('cf-connecting-ip') ?? '',
		});

		if (!success) return c.json({ error: { code: 'too_many_requests' } }, 429);

		await next();
	})
	.use(
		'*',
		except(
			'/google/*',

			bearerAuth({
				token: env.API_TOKEN,
			}),
		),
	)
	.use(
		'/google/*',
		bearerAuth({
			token: env.GAS_TOKEN,
		}),
	)
	.route('/casts', casts)
	.route('/guests', guests)
	.route('/google', google);

export type AppType = typeof app;
export default app;
