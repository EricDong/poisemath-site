import { FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

function yamlString(value: unknown) {
  return JSON.stringify(String(value ?? ""))
}

function stripFrontmatter(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim()
}

export const MarkdownPages: QuartzEmitterPlugin = () => ({
  name: "MarkdownPages",
  async *emit(ctx, content) {
    for (const [, file] of content) {
      if (file.data.slug === "index" || file.data.slug === "about") continue

      const frontmatter = file.data.frontmatter
      const date =
        frontmatter?.date ??
        frontmatter?.published ??
        file.data.dates?.published?.toISOString().slice(0, 10) ??
        ""
      const markdown = `---
title: ${yamlString(frontmatter?.title ?? file.data.slug)}
date: ${yamlString(date)}
description: ${yamlString(frontmatter?.description ?? file.data.description ?? "")}
---

${stripFrontmatter(file.value.toString())}
`

      yield write({
        ctx,
        content: markdown,
        slug: file.data.slug as FullSlug,
        ext: ".md",
      })
    }
  },
  async *partialEmit() {},
})
