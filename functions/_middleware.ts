export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url)
  const host = url.hostname.toLowerCase()

  if (host === "journeytomath.com" || host === "www.journeytomath.com") {
    url.protocol = "https:"
    url.hostname = "poisemath.com"
    url.port = ""
    return Response.redirect(url.toString(), 301)
  }

  return next()
}
