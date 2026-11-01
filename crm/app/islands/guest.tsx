import { useState } from 'hono/jsx/dom';

export function VisitButton({ vrchatId, disabled }: { vrchatId: string; disabled?: boolean }) {
	const [isPending, setIsPending] = useState(false);

	return (
		<button
			type="button"
			disabled={isPending || disabled}
			onClick={async () => {
				setIsPending(true);

				await fetch(`/guest/${vrchatId}/visit`, { method: 'post' });

				setIsPending(false);
				location.reload();
			}}
			className="h-12 w-full rounded-full bg-neutral-100 text-sm font-medium text-neutral-800 transition-all duration-200 hover:opacity-40 disabled:opacity-40"
		>
			{isPending || disabled ? 'ご帰宅中' : 'ご帰宅'}
		</button>
	);
}

export function BanButton({ vrchatId }: { vrchatId: string }) {
	const [isPending, setIsPending] = useState(false);

	return (
		<button
			type="button"
			disabled={isPending}
			onClick={async () => {
				setIsPending(true);

				await fetch(`/guest/${vrchatId}/ban`, { method: 'post' });

				setIsPending(false);
				location.reload();
			}}
			className="h-12 w-full rounded-full bg-red-800 text-sm font-medium text-neutral-100 transition-all duration-200 hover:opacity-40 disabled:opacity-40"
		>
			{isPending ? 'BAN 実行中' : 'BAN を実行'}
		</button>
	);
}

export function UnbanButton({ vrchatId }: { vrchatId: string }) {
	const [isPending, setIsPending] = useState(false);

	return (
		<button
			type="button"
			disabled={isPending}
			onClick={async () => {
				setIsPending(true);

				await fetch(`/guest/${vrchatId}/ban`, { method: 'delete' });

				setIsPending(false);
				location.reload();
			}}
			className="h-12 w-full rounded-full bg-neutral-800 text-sm font-medium text-neutral-100 transition-all duration-200 hover:opacity-40 disabled:opacity-40"
		>
			{isPending ? 'BAN 解除中' : 'BAN を解除'}
		</button>
	);
}
