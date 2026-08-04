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
      creator: { "@type": "Person", name: "Eric Dong", url: authorUrl },
    }
  }

  if (!isArticle) return base

  return {
    ...base,
    headline: title,
    author: { "@type": "Person", name: "Eric Dong", url: authorUrl },
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
      ? "聪明的提问者｜AI 时代的具身学习：Math Academy 与数学学习"
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
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
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
