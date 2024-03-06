import { NextResponse } from 'next/server'

import isValidUrl from '@/app/lib/isValidUrl'
import { getMinLinksAndVisits } from '@/app/lib/db'
import { addLink } from '@/app/lib/db'
import { setSessionUser } from '@/app/lib/sessions'

export async function GET(request) {
  await setSessionUser(1)
  const links = await getMinLinksAndVisits(100, 0)
  return NextResponse.json(links, { status: 200 })
}

export async function POST(request) {
  // using standar HTML form
  // const formData = await request.formData()
  // console.log(formData)

  const contentType = await request.headers.get('content-type')
  if (contentType !== 'application/json') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 415 })
  }
  const data = await request.json()
  const url = data && data.url ? data.url : null
  const validUrl = await isValidUrl(url, [
    'jref.io',
    'nextjs-url-shortener-livid.vercel.app',
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ])

  if (!validUrl) {
    return NextResponse.json(
      { message: `${url} is not valid` },
      { status: 400 }
    )
  }

  const dbResponse = await addLink(url)
  const responseData = dbResponse && dbResponse.data ? dbResponse.data : {}
  const responseStatus =
    dbResponse && dbResponse.status ? dbResponse.status : 500

  return NextResponse.json(responseData, { status: responseStatus })
}