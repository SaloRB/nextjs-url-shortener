import { NextResponse } from 'next/server'

import { getUserByUsername } from '@/app/lib/db'
import { isMatchingPassword } from '@/app/lib/passwordUtils'
import { setSessionUser } from '@/app/lib/sessions'

export async function POST(request) {
  const contentType = await request.headers.get('content-type')
  if (contentType !== 'application/json') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 415 })
  }
  const data = await request.json()
  const { username, password } = data

  const isValidData = username && password
  if (!isValidData) {
    return NextResponse.json(
      { message: 'Username and password are required' },
      { status: 400 }
    )
  }

  const dbResponse = await getUserByUsername(username)
  if (!dbResponse) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 400 }
    )
  }

  const userRecord = dbResponse[0]
  if (!userRecord) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 400 }
    )
  }

  const { id: userId, password: userHash } = dbResponse[0]
  if (!userId || !userHash) {
    return NextResponse.json(
      { message: 'Invalid credentials.' },
      { status: 400 }
    )
  }

  const isValidPasswordRequest = await isMatchingPassword(password, userHash)
  if (!isValidPasswordRequest) {
    return NextResponse.json(
      { message: 'Invalid credentials, please try again' },
      { status: 400 }
    )
  }

  await setSessionUser(userId)

  return NextResponse.json({}, { status: 200 })
}
