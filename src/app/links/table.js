'use client'

import useSWR from 'swr'
import LinksCreateForm from './createForm'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function LinksHtmlTable() {
  const endpoint = '/api/links'
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher)

  if (error) return <div>An error has occurred.</div>
  if (isLoading) return <div>Loading...</div>

  const didSubmit = (newItem) => {
    mutate()
  }

  return (
    <>
      <LinksCreateForm didSubmit={didSubmit} />
      <table>
        <tbody>
          {data &&
            data.map((link, index) => (
              <tr key={`link-item-${link.id}-${index}`}>
                <td>{link.id}</td>
                <td>{link.url}</td>
                <td>{link.short}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  )
}
