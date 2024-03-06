import { relations } from 'drizzle-orm'
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

export const UsersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey().notNull(),
    username: varchar('username', { length: 50 }).notNull(),
    password: text('password').notNull(),
    email: text('email'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (users) => {
    return {
      usernameIndex: uniqueIndex('username_idx').on(users.username),
    }
  }
)

export const LinksTable = pgTable('links', {
  id: serial('id').primaryKey().notNull(),
  url: text('url').notNull(),
  short: varchar('short', { length: 50 }),
  userId: integer('user_id').references(() => UsersTable.id),
  createdAt: timestamp('created_at').defaultNow(),
})

export const VisitsTable = pgTable('visits', {
  id: serial('id').primaryKey().notNull(),
  linkId: integer('link_id')
    .notNull()
    .references(() => LinksTable.id),
  createdAt: timestamp('created_at').defaultNow(),
})

export const UsersTableRelations = relations(LinksTable, ({ many }) => ({
  links: many(LinksTable),
}))

export const LinksTableRelations = relations(LinksTable, ({ one, many }) => ({
  visits: many(VisitsTable),
  user: one(UsersTable, {
    fields: [LinksTable.userId],
    references: [UsersTable.id],
  }),
}))

export const VisitsTableRelations = relations(VisitsTable, ({ one }) => ({
  link: one(LinksTable, {
    fields: [VisitsTable.linkId],
    references: [LinksTable.id],
  }),
}))
