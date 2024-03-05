export default async function isValidUrl(url, disallowedDomains) {
  // Construct a regular expression pattern to match disallowed domains
  const disallowedPattern = `^https?:\\/\\/(?:${disallowedDomains.join(
    '|'
  )})\\b`
  const disallowedRegex = new RegExp(disallowedPattern, 'i')

  // Regular expression pattern to match a URL (excluding localhost)
  const urlPattern =
    /^(https?:\/\/)?((?!localhost)[\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i
  const urlRegex = new RegExp(urlPattern)

  // Test the URL agains both URL pattern and disallowed domain pattern
  return urlRegex.test(url) && !disallowedRegex.test(url)
}
