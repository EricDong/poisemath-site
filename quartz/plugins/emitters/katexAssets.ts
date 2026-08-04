import fs from "node:fs"
import path from "node:path"
import { FullSlug, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

const katexDist = path.join(process.cwd(), "node_modules", "katex", "dist")
const assetPaths = ["katex.min.css", "contrib/copy-tex.min.js"]

async function listFontPaths() {
  const fontDir = path.join(katexDist, "fonts")
  return (await fs.promises.readdir(fontDir)).map((fileName) => joinSegments("fonts", fileName))
}

export const KatexAssets: QuartzEmitterPlugin = () => ({
  name: "KatexAssets",
  async *emit(ctx) {
    for (const assetPath of [...assetPaths, ...(await listFontPaths())]) {
      const extension = path.extname(assetPath) as `.${string}`
      const slug = joinSegments("static", "katex", assetPath.slice(0, -extension.length))

      yield write({
        ctx,
        content: await fs.promises.readFile(path.join(katexDist, assetPath)),
        slug: slug as FullSlug,
        ext: extension,
      })
    }
  },
  async *partialEmit() {},
})
