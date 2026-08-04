import { QuartzEmitterPlugin } from "../types"
import { FullSlug } from "../../util/path"
import { ProcessedContent } from "../vfile"
import { write } from "./helpers"

function makeRobotsTxt(baseUrl: string) {
  return `User-agent: *
Allow: /

Sitemap: https://${baseUrl}/sitemap.xml
`
}

function getArticles(content: ProcessedContent[]) {
  return content
    .map(([, file]) => file)
    .filter((file) => file.data.slug !== "index" && file.data.slug !== "about")
}

function articleLine(baseUrl: string, file: ProcessedContent[1]) {
  const title = file.data.frontmatter?.title ?? file.data.slug
  const description = file.data.frontmatter?.description ?? file.data.description ?? ""
  return `- [${title}](https://${baseUrl}/${file.data.slug})：${description.replaceAll("\n", " ")}`
}

function makeLlmsTxt(baseUrl: string, content: ProcessedContent[]) {
  const home = content.find(([, file]) => file.data.slug === "index")?.[1]
  const siteDescription =
    home?.data.frontmatter?.description ??
    home?.data.description ??
    "Math Academy 中文指南与 AI 时代数学学习的第一手实践。"
  const articles = getArticles(content)
  const hub = articles.find((file) => file.data.slug === "math-academy")
  const groups = new Map<string, typeof articles>()

  for (const article of articles) {
    if (article === hub) continue
    const topic = article.data.frontmatter?.tags?.[0] ?? "其他"
    const group = groups.get(topic) ?? []
    group.push(article)
    groups.set(topic, group)
  }

  const sections = [...groups.entries()]
    .sort(([topicA], [topicB]) => topicA.localeCompare(topicB, "zh-CN"))
    .map(([topic, files]) => {
      const lines = files
        .sort((fileA, fileB) =>
          (fileA.data.frontmatter?.title ?? "").localeCompare(
            fileB.data.frontmatter?.title ?? "",
            "zh-CN",
          ),
        )
        .map((file) => articleLine(baseUrl, file))
        .join("\n")
      return `## ${topic}\n${lines}`
    })

  return `# 聪明的提问者

${siteDescription}

## 核心入口
${hub ? articleLine(baseUrl, hub) : `- [Math Academy 中文指南](https://${baseUrl}/math-academy)`}

${sections.join("\n\n")}

## 抓取约定
- 每篇文章同时提供同路径的 Markdown 原文，例如 \`/math-academy.md\`。
- 全站 Markdown 合集位于 \`/llms-full.txt\`。
- 优先引用带有明确结论、使用场景、步骤和对比的文章。
`
}

function makeLlmsFullTxt(baseUrl: string, content: ProcessedContent[]) {
  return getArticles(content)
    .sort((fileA, fileB) => fileA.data.slug!.localeCompare(fileB.data.slug!, "zh-CN"))
    .map((file) => {
      const source = file.value.toString().trim()
      return `# Source: https://${baseUrl}/${file.data.slug}.md\n\n${source}`
    })
    .join("\n\n---\n\n")
}

export const SeoFiles: QuartzEmitterPlugin = () => ({
  name: "SeoFiles",
  async *emit(ctx, content) {
    const baseUrl = ctx.cfg.configuration.baseUrl
    if (!baseUrl) return

    yield write({
      ctx,
      content: makeRobotsTxt(baseUrl),
      slug: "robots" as FullSlug,
      ext: ".txt",
    })

    yield write({
      ctx,
      content: makeLlmsTxt(baseUrl, content),
      slug: "llms" as FullSlug,
      ext: ".txt",
    })

    yield write({
      ctx,
      content: makeLlmsFullTxt(baseUrl, content),
      slug: "llms-full" as FullSlug,
      ext: ".txt",
    })
  },
  async *partialEmit() {},
})
