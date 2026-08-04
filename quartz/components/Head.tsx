import { i18n } from "../i18n"
import {
  FullSlug,
  getFileExtension,
  isAbsoluteURL,
  joinSegments,
  pathToRoot,
  simplifySlug,
} from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"

const AUTHOR_SAME_AS = [
  "https://github.com/EricDong",
  // TODO(Eric): Add the public profile URLs for 聪明的提问者, X, and Weibo.
]

function makeAuthor(authorUrl: string) {
  return {
    "@type": "Person",
    "@id": `${authorUrl}#person`,
    name: "Eric Dong",
    url: authorUrl,
    sameAs: AUTHOR_SAME_AS,
  }
}

function makeJsonLd(
  fileData: QuartzComponentProps["fileData"],
  cfg: QuartzComponentProps["cfg"],
  description: string,
  socialUrl: string,
) {
  const title = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
  const isHome = fileData.slug === "index"
  const isAbout = fileData.slug === "about"
  const isArticle = fileData.filePath !== undefined && !isHome && !isAbout
  const authorUrl = `https://${cfg.baseUrl}/about`
  const author = makeAuthor(authorUrl)
  const socialImage = fileData.frontmatter?.socialImage
  const image = socialImage
    ? isAbsoluteURL(socialImage)
      ? socialImage
      : `https://${cfg.baseUrl}/static/${socialImage}`
    : isArticle
      ? `https://${cfg.baseUrl}/${fileData.slug}-og-image.webp`
      : `https://${cfg.baseUrl}/static/og-image.png`
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isHome
      ? "WebSite"
      : isAbout
        ? "AboutPage"
        : isArticle
          ? "BlogPosting"
          : "CollectionPage",
    name: title,
    description,
    url: socialUrl,
    inLanguage: cfg.locale,
    image,
  }

  if (isHome) {
    return {
      ...base,
      publisher: { "@type": "Organization", name: cfg.pageTitle, url: socialUrl },
      creator: author,
    }
  }

  if (!isArticle) return base

  return {
    ...base,
    headline: title,
    author,
    publisher: {
      "@type": "Organization",
      name: cfg.pageTitle,
      url: `https://${cfg.baseUrl}/`,
      logo: { "@type": "ImageObject", url: `https://${cfg.baseUrl}/static/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": socialUrl },
    ...(fileData.dates?.published && { datePublished: fileData.dates.published.toISOString() }),
    ...(fileData.dates?.modified && { dateModified: fileData.dates.modified.toISOString() }),
  }
}

function makePersonJsonLd(
  fileData: QuartzComponentProps["fileData"],
  cfg: QuartzComponentProps["cfg"],
) {
  if (fileData.slug !== "about" || !cfg.baseUrl) return undefined
  return { "@context": "https://schema.org", ...makeAuthor(`https://${cfg.baseUrl}/about`) }
}

function makeFaqJsonLd(fileData: QuartzComponentProps["fileData"]) {
  const faq = fileData.frontmatter?.faq
  if (!Array.isArray(faq) || faq.length === 0) return undefined

  const mainEntity = faq
    .filter(
      (item): item is { q: string; a: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof item.q === "string" &&
        typeof item.a === "string",
    )
    .map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))

  if (mainEntity.length === 0) return undefined
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity }
}
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const pageName = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const isHome = fileData.slug === "index"
    const isNotFound = fileData.slug === "404"
    const isArticle = fileData.filePath !== undefined && !isHome && fileData.slug !== "about"
    const title = isHome
      ? "聪明的提问者｜Math Academy 中文指南与 AI 时代数学学习"
      : `${pageName}｜${cfg.pageTitle}`
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" || fileData.slug === "index"
        ? url.toString()
        : joinSegments(url.toString(), simplifySlug(fileData.slug!))
    const canonicalUrl = isNotFound ? undefined : socialUrl
    const jsonLd = makeJsonLd(fileData, cfg, description, socialUrl)
    const faqJsonLd = makeFaqJsonLd(fileData)
    const personJsonLd = makePersonJsonLd(fileData, cfg)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta property="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${(getFileExtension(ogImageDefaultPath) ?? "png").replace(".", "")}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta name="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta name="twitter:url" content={socialUrl}></meta>
          </>
        )}

        {cfg.baseUrl && canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {isArticle && <link rel="alternate" type="text/markdown" href={`${socialUrl}.md`} />}
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        {isNotFound && <meta name="robots" content="noindex,follow" />}
        <meta name="generator" content="Quartz" />
        {!isNotFound && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
        {personJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          />
        )}

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
