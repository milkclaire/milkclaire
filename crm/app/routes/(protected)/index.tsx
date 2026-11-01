import { createRoute } from 'honox/factory';

import SigninButton from '$/islands/signin';
import SignoutButton from '$/islands/signout';

export default createRoute((c) => {
	const name = c.req.query('name') ?? 'Hono';
	return c.render(
		<div class="py-8 text-center">
			<title>{name}</title>
			<h1 class="text-3xl font-bold">Hello, {name}!</h1>
			<SigninButton />
			<SignoutButton />
		</div>,
	);
});
