'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function GithubProfile() {
  const myGithubRepoProfile =
    'https://api.github.com/repos/SaloRB/nextjs-url-shortener'
  const { data, error, isLoading } = useSWR(myGithubRepoProfile, fetcher)

  if (error) return <div>An error has occurred.</div>
  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👁️ {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
