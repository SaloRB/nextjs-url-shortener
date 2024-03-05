import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)

export async function helloWorld() {
  const start = new Date()
  const [dbResponse] = await sql`SELECT NOW();`
  const dbNow = dbResponse && dbResponse.now ? dbResponse.now : ''
  const end = new Date()
  return { dbNow, latency: Math.abs(end - start) }
}
