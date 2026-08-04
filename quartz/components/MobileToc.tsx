import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

// 手机端专用的可折叠目录：<details> 实现、默认收起，放在文章标题下方。
// 桌面端由 layout 的 DesktopOnly(TableOfContents) 负责，此组件配合 MobileOnly 使用。
const MobileToc: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  if (!fileData.toc || fileData.toc.length < 2) {
    return null
  }
  return (
    <details class={classNames(displayClass, "mobile-toc")}>
      <summary>{i18n(cfg.locale).components.tableOfContents.title}</summary>
      <ul>
        {fileData.toc.map((tocEntry) => (
          <li key={tocEntry.slug} class={`depth-${tocEntry.depth}`}>
            <a href={`#${tocEntry.slug}`} data-for={tocEntry.slug}>
              {tocEntry.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

export default (() => MobileToc) satisfies QuartzComponentConstructor
