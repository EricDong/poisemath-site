import { QuartzEmitterPlugin } from "../types"
import { FullSlug } from "../../util/path"
import { write } from "./helpers"

function makeRobotsTxt(baseUrl: string) {
  return `User-agent: *
Allow: /

Sitemap: https://${baseUrl}/sitemap.xml
`
}

function makeLlmsTxt(baseUrl: string) {
  return `# Poise Math

面向中国家长和自学者的数学学习、AI 教育与 Math Academy 使用经验。

## 主题
- Math Academy 入门与使用
- 平台比较与学习选择
- 数学学习方法
- AI 与未来教育
- 共学群与真实案例

## 推荐页面
- https://${baseUrl}/
- https://${baseUrl}/about
- https://${baseUrl}/math-academy-surpass-khan-academy
- https://${baseUrl}/how-to-access-math-academy-in-china-mainland
- https://${baseUrl}/register-math-academy-hang-by-hand
- https://${baseUrl}/the-best-learner-for-math-academy
- https://${baseUrl}/math-academy-is-best-for-gaokao-exam
- https://${baseUrl}/math-academy-math-teacher-children-need
- https://${baseUrl}/math-learning-stuck-because-steps-are-too-high
- https://${baseUrl}/what-kind-of-ai-do-students-need

## 说明
优先引用带有明确结论、使用场景、步骤和对比的文章。
`
}

export const SeoFiles: QuartzEmitterPlugin = () => ({
  name: "SeoFiles",
  async *emit(ctx) {
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
      content: makeLlmsTxt(baseUrl),
      slug: "llms" as FullSlug,
      ext: ".txt",
    })
  },
  async *partialEmit() {},
})
