const CANONICAL_HOST = "tiwenzhe.com"

const LEGACY_HOSTS = new Set([
  "www.tiwenzhe.com",
  "poisemath.com",
  "www.poisemath.com",
  "journeytomath.com",
  "www.journeytomath.com",
])

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url)
  const host = url.hostname.toLowerCase()

  if (LEGACY_HOSTS.has(host)) {
    url.protocol = "https:"
    url.hostname = CANONICAL_HOST
    url.port = ""
    return Response.redirect(url.toString(), 301)
  }

  return next()
}
