'use client'

import { Alert } from 'flowbite-react'
import { useState } from 'react'

export default function RegisterForm({ didSubmit }) {
  const [results, setResults] = useState(null)
  const [message, setMessage] = useState(null)

  const handleFormSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData)
    const JSONData = JSON.stringify(data)

    const endpoint = '/api/auth/register'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONData,
    }

    const response = await fetch(endpoint, options)

    if (response.status === 201) {
      window.location.href = '/'
    }
    const result = await response.json()

    setResults(result)
    if (didSubmit) {
      didSubmit(result)
    }

    if (result.message) {
      setMessage(result.message)
    }
  }
  return (
    <>
      {message && <Alert color="warning">{message}</Alert>}
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="text-black"
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          className="text-black"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="text-black"
        />
        <input
          type="password"
          name="passwordConfirm"
          // onChange={verifyPassword}
          placeholder="Confirm password"
          className="text-black"
        />
        <button type="submit">Register</button>
      </form>
    </>
  )
}
