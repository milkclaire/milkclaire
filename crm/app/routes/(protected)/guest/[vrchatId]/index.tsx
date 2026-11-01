import { zValidator } from '@hono/zod-validator';
import { createRoute } from 'honox/factory';
import z from 'zod';

import { BanButton, UnbanButton, VisitButton } from '$/islands/guest';
import { api } from '$/lib/api';
import { vrchatProfile } from '$/lib/vrchat';

const status = {
	banned: {
		label: 'BAN',
		className: 'bg-red-800',
	},
	pending: {
		label: 'BAN 申請中',
		className: 'bg-yellow-800',
	},
	none: {
		label: '通常',
		className: 'bg-neutral-100 text-neutral-800',
	},
};

export default createRoute(
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
		const [guestResponse, visitResponse] = await Promise.all([
			api(c).guests[':vrchatId'].$get({ param: { vrchatId } }),
			api(c).guests[':vrchatId'].visits.$get({ param: { vrchatId } }),
		]);

		const profile = await vrchatProfile(vrchatId);

		if (!guestResponse.ok || !visitResponse.ok)
			return c.render(
				<main class="flex h-screen w-screen items-center justify-center">
					<img src={profile.image} class="fixed -z-10 size-full opacity-20 blur-md" />

					<div class="flex size-128 flex-col items-center justify-between gap-8 rounded-xl bg-neutral-600 p-8 text-neutral-100 shadow-xl">
						<div class="flex w-full items-center justify-start gap-8">
							<img src={profile.image} class="size-16 rounded-xl object-cover" />

							<p class="text-lg font-medium">{profile.title}</p>
						</div>

						<div class="flex h-full w-full flex-col gap-8 rounded-xl bg-neutral-500 p-8">
							<div class="flex items-center justify-between text-sm">
								<p>ユーザー</p>
								<p>{vrchatId}</p>
							</div>

							<div class="flex items-center justify-between text-sm">
								<p>ステータス</p>
								<p
									class={`rounded-full bg-neutral-100 px-4 py-1 text-center text-xs text-neutral-800`}
								>
									初帰宅
								</p>
							</div>
						</div>

						<div class="flex w-full gap-8">
							<VisitButton vrchatId={vrchatId} />
						</div>
					</div>
				</main>,
			);

		const { data: guest } = await guestResponse.json();
		const { data: visit } = await visitResponse.json();

		return c.render(
			<main class="flex h-screen w-screen items-center justify-center">
				<img src={profile.image} class="fixed -z-10 size-full opacity-20 blur-md" />

				<div class="flex size-128 flex-col items-center justify-between gap-8 rounded-xl bg-neutral-600 p-8 text-neutral-100 shadow-xl">
					<div class="flex w-full items-center justify-start gap-8">
						<img src={profile.image} class="size-16 rounded-xl object-cover" />

						<p class="text-lg font-medium">{profile.title}</p>
					</div>

					<div class="flex h-full w-full flex-col gap-8 rounded-xl bg-neutral-500 p-8">
						<div class="flex items-center justify-between text-sm">
							<p>ステータス</p>

							<p
								class={`rounded-full px-4 py-1 text-center text-xs ${status[guest.banStatus].className}`}
							>
								{status[guest.banStatus].label}
							</p>
						</div>

						{guest.banStatus !== 'none' && <p class="text-sm">{guest.banReason}</p>}
					</div>

					{guest.banStatus === 'none' && (
						<div class="flex w-full items-center justify-between gap-8">
							<div class="flex w-full flex-col justify-between gap-4 rounded-xl bg-neutral-500 p-8 text-xs">
								<p>ご帰宅回数</p>

								<p class="text-base font-medium">{visit.count ? `${visit.count} 回` : ' - '}</p>
							</div>

							<div class="flex w-full flex-col justify-between gap-4 rounded-xl bg-neutral-500 p-8 text-xs">
								<p>最終ご帰宅日</p>

								<p class="text-base font-medium">
									{visit.visitedAt
										? new Date(visit.visitedAt).toLocaleDateString('ja-JP', {
												timeZone: 'Asia/Tokyo',
											})
										: ' - '}
								</p>
							</div>
						</div>
					)}

					<div class="flex w-full gap-8">
						{guest.banStatus === 'none' && (
							<VisitButton
								vrchatId={vrchatId}
								disabled={
									visit.visitedAt
										? new Date(visit.visitedAt).toLocaleDateString('ja-JP', {
												timeZone: 'Asia/Tokyo',
											}) ===
											new Date().toLocaleDateString('ja-JP', {
												timeZone: 'Asia/Tokyo',
											})
										: false
								}
							/>
						)}

						{guest.banStatus === 'pending' && <BanButton vrchatId={vrchatId} />}

						{guest.banStatus !== 'none' && <UnbanButton vrchatId={vrchatId} />}
					</div>
				</div>
			</main>,
		);
	},
);
