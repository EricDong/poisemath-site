import fs from "fs"
import path from "path"
import { FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

const keyPath = path.join(process.cwd(), "indexnow-key.txt")

export const IndexNow: QuartzEmitterPlugin = () => ({
  name: "IndexNow",
  async *emit(ctx) {
    const key = (await fs.promises.readFile(keyPath, "utf8")).trim()

    yield write({
      ctx,
      content: `${key}\n`,
      slug: key as FullSlug,
      ext: ".txt",
    })
  },
  async *partialEmit() {},
})
