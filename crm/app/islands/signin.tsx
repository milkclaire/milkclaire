import { signIn } from '@hono/auth-js/react';

export default function SigninButton() {
	return (
		<div>
			<button
				class="cursor-pointer rounded bg-orange-400 px-4 py-2 text-white"
				onClick={() => signIn()}
			>
				Sign in
			</button>
		</div>
	);
}
