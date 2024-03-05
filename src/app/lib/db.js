import { neon } from '@neondatabase/serverless'
import { desc, eq, sql as sqld } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import randomShortStrings from './randomShortString'
import { LinksTable, VisitsTable } from './schema'
import * as schema from './schema'
import { getSessionUser } from './sessions'

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
  const dbResponse = await sql`CREATE TABLE IF NOT EXISTS "links" (
    "id" serial PRIMARY KEY NOT NULL,
    "url" text NOT NULL,
    "short" varchar(50),
    "created_at" timestamp DEFAULT now()
  );`

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "url_idx" ON "links" ((LOWER("url")));`

  await sql`CREATE TABLE IF NOT EXISTS "visits" (
    "id" serial PRIMARY KEY NOT NULL,
    "link_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now()
  );`

  await sql`DO $$ BEGIN
  ALTER TABLE "visits" ADD CONSTRAINT "visits_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE no action ON UPDATE no action;
 EXCEPTION
  WHEN duplicate_object THEN null;
 END $$;`
}

configureDatabase().catch((err) => console.log('db config error', err))

export async function addLink(url) {
  const short = randomShortStrings()

  const newLink = { url, short }
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
}

export async function getMinLinksAndVisits(limit, offset) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
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
    columns: { url: true, short: true, createdAt: true },
    with: { visits: { columns: { createdAt: true } } },
    // extras: { count: sqld`count(${VisitsTable.id})`.as('count') },
  })
}
