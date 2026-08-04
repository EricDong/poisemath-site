import fs from "node:fs/promises"

const host = process.env.INDEXNOW_HOST ?? "tiwenzhe.com"
const endpoint = process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow"
const key = (await fs.readFile(new URL("../indexnow-key.txt", import.meta.url), "utf8")).trim()
const sitemapPath = process.argv[2] ?? "public/sitemap.xml"
const sitemap = /^https?:\/\//.test(sitemapPath)
  ? await (await fetch(sitemapPath)).text()
  : await fs.readFile(sitemapPath, "utf8")
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])

if (urlList.length === 0) {
  throw new Error(`No URLs found in ${sitemapPath}`)
}

const payload = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList,
}

if (process.env.INDEXNOW_DRY_RUN === "1") {
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
})

if (!response.ok) {
  throw new Error(`IndexNow request failed: ${response.status} ${await response.text()}`)
}

console.log(`IndexNow accepted ${urlList.length} URLs with status ${response.status}.`)
