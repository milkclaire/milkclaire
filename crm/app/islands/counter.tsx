import { signOut } from '@hono/auth-js/react';

export default function Counter() {
	return (
		<div>
			<button
				class="cursor-pointer rounded bg-orange-400 px-4 py-2 text-white"
				onClick={() => signOut()}
			>
				Increment
			</button>
		</div>
	);
}
