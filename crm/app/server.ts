import Google from '@auth/core/providers/google';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { env } from 'hono/adapter';
import { showRoutes } from 'hono/dev';
import { HTTPException } from 'hono/http-exception';
import { createHono } from 'honox/factory';
import { createApp } from 'honox/server';

const hono = createHono()
	.use(
		'*',
		initAuthConfig((c) => {
			const { AUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET, AUTH_ALLOWED_EMAIL } = env<{
				AUTH_SECRET: string;
				GOOGLE_ID: string;
				GOOGLE_SECRET: string;
				AUTH_ALLOWED_EMAIL: string;
			}>(c);

			return {
				basePath: '/api/auth',
				secret: AUTH_SECRET,
				providers: [
					Google({
						clientId: GOOGLE_ID,
						clientSecret: GOOGLE_SECRET,
					}),
				],
				session: { strategy: 'jwt' },
				callbacks: {
					async signIn({ account, profile, user }) {
						return (
							account?.provider === 'google' &&
							profile?.email_verified === true &&
							user.email?.toLowerCase() === AUTH_ALLOWED_EMAIL.toLowerCase()
						);
					},
				},
			};
		}),
	)
	.use('/api/auth/*', authHandler())
	.onError((error, c) => {
		if (error instanceof HTTPException && error.status === 401) {
			return c.redirect('/api/auth/signin');
		}

		return c.text('Internal server error', 500);
	});

const app = createApp({ app: hono });
showRoutes(app);

export default app;
