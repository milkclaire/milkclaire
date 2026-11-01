import { createRoute } from 'honox/factory';

import { api } from '$/lib/api';
import { vrchatProfiles } from '$/lib/vrchat';

export default createRoute(async (c) => {
	const [pendingGuestsResponse, bannedGuestsResponse] = await Promise.all([
		api(c).guests.pending.$get(),
		api(c).guests.banned.$get(),
	]);

	if (!pendingGuestsResponse.ok || !bannedGuestsResponse.ok) return c.notFound();

	const [{ data: pendingGuests }, { data: bannedGuests }] = await Promise.all([
		pendingGuestsResponse.json(),
		bannedGuestsResponse.json(),
	]);

	const [pendingProfiles, bannedProfiles] = await Promise.all([
		vrchatProfiles(pendingGuests),
		vrchatProfiles(bannedGuests),
	]);

	return c.render(
		<main class="mx-auto w-6xl">
			<section class="flex justify-start gap-8">
				{pendingGuests.map((guest, index) => {
					return (
						<a href={`/guest/${guest.vrchatId}`}>
							<div class="flex h-32 w-lg items-center gap-8 rounded-xl bg-neutral-600 p-8 text-neutral-100 transition-all duration-200 hover:opacity-40">
								<img src={pendingProfiles[index].image} class="size-16 rounded-xl object-cover" />

								<p class="text-lg font-medium">{pendingProfiles[index].title}</p>
							</div>
						</a>
					);
				})}
			</section>

			<section class="m-8 flex gap-8">
				{bannedGuests.map((guest, index) => {
					return (
						<a href={`/guest/${guest.vrchatId}`}>
							<div class="flex h-32 w-lg items-center gap-8 rounded-xl bg-neutral-600 p-8 text-neutral-100 transition-all duration-200 hover:opacity-40">
								<img src={bannedProfiles[index].image} class="size-16 rounded-xl object-cover" />

								<div class="flex flex-col">
									<p class="text-lg font-medium">{bannedProfiles[index].title}</p>
								</div>
							</div>
						</a>
					);
				})}
			</section>
		</main>,
	);
});
