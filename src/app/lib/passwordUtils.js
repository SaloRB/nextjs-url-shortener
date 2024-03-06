import pbkdf2 from './pbkdf2'

const saltKey = process.env.SALT_KEY ? process.env.SALT_key : 'salt'
const hashIterations = 10000

export const runtime = 'edge'

export async function hashPassword(rawPasswordString) {
  const key = await pbkdf2(
    rawPasswordString,
    saltKey,
    hashIterations,
    64,
    'sha512'
  )
  return key
}

export async function isMatchingPassword(enteredPassword, storedHash) {
  const hash = await pbkdf2(
    enteredPassword,
    saltKey,
    hashIterations,
    64,
    'sha512'
  )
  return storedHash === hash
}
