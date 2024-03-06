'use client'

import { useState } from 'react'

export default function LoginForm({ didSubmit }) {
  const [results, setResults] = useState(null)

  const handleFormSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData)
    const JSONData = JSON.stringify(data)

    const endpoint = '/api/auth/login'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONData,
    }

    const response = await fetch(endpoint, options)

    const result = await response.json()

    setResults(result)
    if (didSubmit) {
      didSubmit(result)
    }
  }
  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="text-black"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="text-black"
        />

        <button type="submit">Login</button>
      </form>
      {results && JSON.stringify(results)}
    </>
  )
}
