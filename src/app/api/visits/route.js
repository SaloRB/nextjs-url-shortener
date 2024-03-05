import { NextResponse } from 'next/server'

import { saveLinkVisit } from '@/app/lib/db'

export async function POST(request) {
  const data = await request.json()
  const { linkId } = data
  await saveLinkVisit(linkId)
  return NextResponse.json({}, { status: 201 })
}
