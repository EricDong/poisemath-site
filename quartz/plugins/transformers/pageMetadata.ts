import { QuartzTransformerPlugin } from "../types"

type PageMetadataOptions = Record<string, Record<string, unknown>>

export const PageMetadata: QuartzTransformerPlugin<PageMetadataOptions> = (
  metadataBySlug = {},
) => ({
  name: "PageMetadata",
  markdownPlugins() {
    return [
      () => (_tree, file) => {
        if (!file.data.slug) return
        const metadata = metadataBySlug[file.data.slug]
        if (!metadata || !file.data.frontmatter) return
        file.data.frontmatter = { ...file.data.frontmatter, ...metadata }
      },
    ]
  },
})
