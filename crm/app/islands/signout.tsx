import { signOut } from '@hono/auth-js/react';

export default function SignoutButton() {
	return (
		<div>
			<button
				class="cursor-pointer rounded bg-orange-400 px-4 py-2 text-white"
				onClick={() => signOut()}
			>
				Sign out
			</button>
		</div>
	);
}
