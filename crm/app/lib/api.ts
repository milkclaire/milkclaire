import type { AppType } from '@milkclaire/api';
import { Context } from 'hono';
import { env } from 'hono/adapter';
import { hc } from 'hono/client';

export function api(c: Context) {
	const { API, API_TOKEN } = env<{ API: Fetcher; API_TOKEN: string }>(c);

	return hc<AppType>(
		import.meta.env.DEV ? 'http://localhost:8787' : 'https://api.milkclaire.workers.dev',
		{
			fetch: API.fetch.bind(API),
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
			},
		},
	);
}
