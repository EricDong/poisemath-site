import { Element, ElementContent, Root, Text } from "hast"
import { QuartzTransformerPlugin } from "../types"

// 把正文段落按中文句末标点切句，每句包进 <span class="sentence">。
// 仅作用于普通段落；pre/code/table/li/blockquote/figure 内的内容全部跳过。
// 行内元素（链接、strong、行内 KaTeX 等）作为原子节点归属当前句，绝不切开。
// 展示效果由 CSS 控制（手机断点下每句独立成行），桌面端不受影响。

const SKIP_TAGS = new Set(["pre", "code", "table", "li", "blockquote", "figure"])

// 句末标点（全角），后跟收尾引号/括号时一并归入前句。不切半角 "."，避免 3.14、URL、缩写误切。
const SENTENCE_END = /([。！？；]+[”』」）》"'\)]*)/

function splitTextNode(text: string): string[] {
  const parts = text.split(SENTENCE_END)
  const chunks: string[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const body = parts[i] ?? ""
    const end = parts[i + 1] ?? ""
    if (body + end !== "") {
      chunks.push(body + end)
    }
  }
  return chunks
}

function endsWithSentenceEnd(text: string): boolean {
  return new RegExp(`${SENTENCE_END.source}$`).test(text)
}

function textContent(node: ElementContent): string {
  if (node.type === "text") {
    return node.value
  }
  if (node.type === "element") {
    return node.children.map(textContent).join("")
  }
  return ""
}

function transformParagraph(p: Element) {
  // 纯图片段落跳过
  const meaningfulChildren = p.children.filter((c) => !(c.type === "text" && c.value.trim() === ""))
  if (meaningfulChildren.every((c) => c.type === "element" && ["img", "br"].includes(c.tagName))) {
    return
  }

  const sentences: ElementContent[][] = []
  let current: ElementContent[] = []

  const flush = () => {
    if (current.length > 0) {
      sentences.push(current)
      current = []
    }
  }

  for (const child of p.children) {
    if (child.type === "text") {
      const chunks = splitTextNode(child.value)
      for (const chunk of chunks) {
        current.push({ type: "text", value: chunk } satisfies Text)
        if (endsWithSentenceEnd(chunk)) {
          flush()
        }
      }
    } else {
      // 元素节点原子归入当前句；若其内部文本以句末标点结尾（如加粗句），也在其后切分
      current.push(child)
      if (child.type === "element" && endsWithSentenceEnd(textContent(child))) {
        flush()
      }
    }
  }
  flush()

  if (sentences.length <= 1) {
    return
  }

  p.children = sentences.map(
    (nodes) =>
      ({
        type: "element",
        tagName: "span",
        properties: { className: ["sentence"] },
        children: nodes,
      }) satisfies Element,
  )
}

function walk(node: Root | Element, insideSkip: boolean) {
  if (node.type === "element") {
    if (SKIP_TAGS.has(node.tagName)) {
      insideSkip = true
    }
    if (!insideSkip && node.tagName === "p") {
      transformParagraph(node)
      return
    }
  }
  for (const child of node.children ?? []) {
    if (child.type === "element") {
      walk(child, insideSkip)
    }
  }
}

export const SentenceSplit: QuartzTransformerPlugin = () => {
  return {
    name: "SentenceSplit",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          walk(tree, false)
        },
      ]
    },
  }
}
