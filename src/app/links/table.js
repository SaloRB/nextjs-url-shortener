import { getLinks } from '@/app/lib/db'

export default async function LinksHtmlTable() {
  const linksResponse = await getLinks()
  return (
    <div>
      <table>
        <tbody>
          {linksResponse &&
            linksResponse.map((link, index) => (
              <tr key={`link-item-${link.id}-${index}`}>
                <td>{link.id}</td>
                <td>{link.url}</td>
                <td>{link.short}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
