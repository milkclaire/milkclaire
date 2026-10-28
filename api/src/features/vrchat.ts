import { env } from 'cloudflare:workers';
import { VRChat } from 'vrchat';

const vrchat = new VRChat({
	application: {
		name: 'Milkclaire API',
		version: '1.0.0',
		contact: 'milkclaire.milfy@google.com',
	},
	authentication: {
		credentials: {
			username: env.VRCHAT_USERNAME,
			password: env.VRCHAT_PASSWORD,
			totpSecret: env.VRCHAT_TOTP_SECRET,
		},
	},
});

export async function ban(userId: string) {
	return await vrchat.banGroupMember({
		path: {
			groupId: env.VRCHAT_GORUP_ID,
		},
		body: {
			userId,
		},
	});
}

export async function unban(userId: string) {
	return await vrchat.unbanGroupMember({
		path: {
			groupId: env.VRCHAT_GORUP_ID,
			userId,
		},
	});
}
