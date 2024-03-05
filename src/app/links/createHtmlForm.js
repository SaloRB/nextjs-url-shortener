export default function LinksCreateHtmlForm() {
  return (
    <>
      <form action="/api/links" method="POST">
        <input
          type="text"
          defaultValue="https://github.com/SaloRB/nextjs-url-shortener"
          name="url"
          placeholder="Your url to shorten"
          className="text-black"
        />
        <button type="submit">Shorten</button>
      </form>
    </>
  )
}
