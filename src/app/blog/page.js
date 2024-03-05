import getDomain from '@/app/lib/getDomain'
import BlogCard from './card'
import { helloWorld } from '@/app/lib/db'

async function getData() {
  const domain = getDomain()
  const endpoint = `${domain}/api/posts`
  // const res = await fetch(endpoint, { next: { revalidate: 10 } })
  const res = await fetch(endpoint, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  if (res.headers.get('content-type') !== 'application/json') {
    return { items: [] }
  }

  return res.json()
}

export default async function BlogPage() {
  const data = await getData()
  const dbResponse = await helloWorld()
  console.log('dbResponse', dbResponse)
  const items = data && data.items ? [...data.items] : []
  return (
    <main>
      <h1>Hello World</h1>
      <p>DB Response: {JSON.stringify(dbResponse)}</p>
      <p>Posts</p>
      {items &&
        items.map((item, idx) => {
          return <BlogCard key={`post-${idx}`} title={item.title} />
        })}
    </main>
  )
}
