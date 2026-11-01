import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const casts = sqliteTable('casts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	vrchatId: text('vrchat_id').notNull().unique(),
	twitterId: text('twitter_id').unique(),
	emoji: text('emoji'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
});

export const castAttends = sqliteTable('cast_visits', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	castId: integer('cast_id')
		.notNull()
		.references(() => casts.id, { onDelete: 'cascade' }),
	attendedAt: integer('visited_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const guests = sqliteTable('guests', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	vrchatId: text('vrchat_id').notNull().unique(),
	banStatus: text('ban_status', {
		enum: ['none', 'pending', 'banned'],
	})
		.notNull()
		.default('none'),
	banReason: text('ban_reason'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
});

export const guestVisits = sqliteTable('guest_visits', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	guestId: integer('guest_id')
		.notNull()
		.references(() => guests.id, { onDelete: 'cascade' }),
	visitedAt: integer('visited_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});
