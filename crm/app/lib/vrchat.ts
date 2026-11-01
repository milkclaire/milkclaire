function ogp(html: string, property: string) {
	return (
		html.match(
			new RegExp(
				`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
				'i',
			),
		)?.[1] ?? ''
	);
}

export async function vrchatProfile(vrchatId: string) {
	const response = await fetch(`https://vrchat.com/home/user/${vrchatId}`, {
		headers: {
			'User-Agent': 'Milkclaire/1.0 milkclaire.milfy@gmail.com',
		},
	});
	const html = await response.text();

	return {
		title: ogp(html, 'og:title'),
		image: ogp(html, 'og:image'),
	};
}

export async function vrchatProfiles(guests: { vrchatId: string }[]) {
	return Promise.all(
		guests.map(async ({ vrchatId }) => {
			const response = await fetch(`https://vrchat.com/home/user/${vrchatId}`, {
				headers: {
					'User-Agent': 'Milkclaire/1.0 milkclaire.milfy@gmail.com',
				},
			});
			const html = await response.text();

			return {
				title: ogp(html, 'og:title'),
				image: ogp(html, 'og:image'),
			};
		}),
	);
}
