import { neon } from '@neondatabase/serverless'
import { desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import randomShortStrings from './randomShortString'
import { LinksTable } from './schema'

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)

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
