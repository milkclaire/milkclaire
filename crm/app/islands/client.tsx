import { useState } from 'hono/jsx/dom';
import { JSX } from 'hono/jsx/jsx-runtime';

export function ServerAction({
	method,
	action,
	label,
	className,
}: {
	method: 'get' | 'post' | 'dialog';
	action: string;
	label: string;
	className: string;
}) {
	const [isPending, setIsPending] = useState(false);

	return (
		<form
			method="post"
			onSubmit={async (event) => {
				event.preventDefault();
				setIsPending(true);

				await fetch(action, { method });

				setIsPending(false);
				window.location.reload();
			}}
			class={className}
		>
			<button type="submit" disabled={isPending}>
				{isPending ? '...' : label}
			</button>
		</form>
	);
}

export function Button({ children }: { children: JSX.Element }) {
	return (
		<button type="button" onClick={() => alert('clicked')}>
			{children}
		</button>
	);
}
