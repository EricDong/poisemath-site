import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "聪明的提问者",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    baseUrl: "tiwenzhe.com",
    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      ".trash",
      ".git",
      "node_modules",
      "*.icloud",
    ],
    defaultDateType: "published",
    theme: {
      fontOrigin: "local",
      cdnCaching: false,
      typography: {
        header: "Noto Serif SC",
        body: "Noto Sans SC",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.PageMetadata({
        "math-academy": {
          faq: [
            {
              q: "Math Academy 有免费试用吗？",
              a: "没有，但官网订阅第一个月内不满意可全额退款；学校账户通道为开通后两周内。",
            },
            {
              q: "Math Academy 有中文版吗？",
              a: "没有。实际使用中，用英语学习数学通常三天左右即可适应。",
            },
            {
              q: "孩子几岁可以开始学 Math Academy？",
              a: "官方学习路径从美国四年级、约 9 至 10 岁起步；成人可使用 Mathematical Foundations 系列。",
            },
            {
              q: "在哪里咨询 Math Academy 中文使用问题？",
              a: "可在微信公众号“聪明的提问者”留言，或加入 Math Academy 华人共学群交流。",
            },
          ],
        },
      }),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SentenceSplit(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.KatexAssets(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        rssLimit: 1000,
        rssFullHtml: true,
        rssDescription: "聪明的提问者：Math Academy 中文指南与 AI 时代数学学习。",
      }),
      Plugin.SeoFiles(),
      Plugin.IndexNow(),
      Plugin.MarkdownPages(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
