import { neon } from '@neondatabase/serverless'
import { desc, eq, sql as sqld } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import randomShortStrings from './randomShortString'
import { LinksTable, UsersTable, VisitsTable } from './schema'
import * as schema from './schema'
import { getSessionUser } from './sessions'
import { hashPassword } from './passwordUtils'

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

export async function helloWorld() {
  const start = new Date()
  const [dbResponse] = await sql`SELECT NOW();`
  const dbNow = dbResponse && dbResponse.now ? dbResponse.now : ''
  const end = new Date()
  return { dbNow, latency: Math.abs(end - start) }
}

async function configureDatabase() {
  await sql`CREATE TABLE IF NOT EXISTS "links" (
    "id" serial PRIMARY KEY NOT NULL,
    "url" text NOT NULL,
    "short" varchar(50),
    "user_id" integer,
    "created_at" timestamp DEFAULT now()
  );`

  await sql`CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "username" varchar(50) NOT NULL,
    "password" text NOT NULL,
    "email" text,
    "created_at" timestamp DEFAULT now()
  );`

  await sql`CREATE TABLE IF NOT EXISTS "visits" (
    "id" serial PRIMARY KEY NOT NULL,
    "link_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now()
  );`

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "users" ("username");`

  await sql`DO $$ BEGIN
   ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;`

  await sql`DO $$ BEGIN
   ALTER TABLE "visits" ADD CONSTRAINT "visits_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE no action ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  `
}

configureDatabase().catch((err) => console.log('db config error', err))

export async function addLink(url) {
  const short = randomShortStrings()
  const user = await getSessionUser()

  const newLink = { url, short }
  if (user) newLink['userId'] = user

  let response = { message: `${url} is not valid. Please try again` }
  let responseStatus = 400
  try {
    response = await db.insert(LinksTable).values(newLink).returning()
    responseStatus = 201
  } catch ({ name, message }) {
    if (
      `${message}`.includes('duplicate key value violates unique constraint')
    ) {
      response = { message: `${url} has already been added` }
    }
  }

  return { data: response, status: 201 }
}

export async function registerUser(newUserData) {
  const { username, password } = newUserData

  const toInsertData = {
    username,
    password: await hashPassword(password),
  }
  if (newUserData.email) toInsertData['email'] = newUserData.email

  let response = { message: `Failed to register. Please try again` }
  let responseStatus = 400
  try {
    let dbResponse = await db
      .insert(UsersTable)
      .values(toInsertData)
      .returning()

    response = {
      id: dbResponse[0].id,
      username: dbResponse[0].username,
      createdAt: dbResponse[0].createdAt,
    }

    responseStatus = 201
  } catch ({ name, message }) {
    if (
      `${message}`.includes('duplicate key value violates unique constraint')
    ) {
      response = {
        message: `${username} is taken. Try another one`,
      }

      responseStatus = 400
    }
  }

  return { data: response, status: responseStatus }
}

export async function getUserByUsername(username) {
  return await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.username, username))
}

export async function getLinks(limit, offset) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
  return await db
    .select()
    .from(LinksTable)
    .limit(lookupLimit)
    .offset(lookupOffset)
}

export async function getShortLinkRecord(shortSlugValue) {
  return await db
    .select()
    .from(LinksTable)
    .where(eq(LinksTable.short, shortSlugValue))
}

export async function saveLinkVisit(linkId) {
  return await db.insert(VisitsTable).values({ linkId })
}

export async function getMinLinks(limit, offset) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
  const sessionUser = await getSessionUser()
  return await db
    .select({
      id: LinksTable.id,
      url: LinksTable.url,
      timestamp: LinksTable.createdAt,
    })
    .from(LinksTable)
    .limit(lookupLimit)
    .offset(lookupOffset)
    .orderBy(desc(LinksTable.createdAt))
    .where(eq(LinksTable.userId, sessionUser))
}

export async function getMinLinksAndVisits(limit, offset) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
  const sessionUser = await getSessionUser()
  // return await db
  //   .select({
  //     id: LinksTable.id,
  //     url: LinksTable.url,
  //     timestamp: LinksTable.createdAt,
  //   })
  //   .from(LinksTable)
  //   .limit(lookupLimit)
  //   .offset(lookupOffset)
  //   .orderBy(desc(LinksTable.createdAt))
  return await db.query.LinksTable.findMany({
    limit: lookupLimit,
    offset: lookupOffset,
    orderBy: [desc(LinksTable.createdAt)],
    columns: { url: true, short: true, createdAt: true, userId: true },
    where: eq(LinksTable.userId, sessionUser),
    with: { visits: { columns: { createdAt: true } } },
    // extras: { count: sqld`count(${VisitsTable.id})`.as('count') },
  })
}
