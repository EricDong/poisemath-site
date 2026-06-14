# poisemath-site

Quartz 4 静态站点项目，部署 poisemath.com。

内容源在 [`poisemath-content`](https://github.com/EricDong/poisemath-content) 仓库（Obsidian vault）。

## 架构

```
content repo (Obsidian vault, iCloud 同步)
  ↓ Obsidian Git 插件每 10 分钟 push
GitHub: poisemath-content
  ↓ workflow trigger-deploy.yml 调用 Cloudflare deploy hook
Cloudflare Pages (this repo)
  ↓ build command: bash scripts/sync-content.sh && npx quartz build
poisemath.com
```

## 本地开发

```bash
bash scripts/sync-content.sh   # 把 content repo 拉到 content/
npx quartz build --serve       # http://localhost:8080
```

## Cloudflare Pages 构建配置

| 项                     | 值                                                 |
| ---------------------- | -------------------------------------------------- |
| Framework preset       | None                                               |
| Build command          | `bash scripts/sync-content.sh && npx quartz build && bash scripts/copy-cloudflare-pages-files.sh` |
| Build output directory | `public`                                           |
| Root directory         | `/`                                                |
| Node version           | `22` (env var `NODE_VERSION=22`)                   |

环境变量（可选）：

- `CONTENT_REPO`: 默认 `https://github.com/EricDong/poisemath-content.git`
- `CONTENT_BRANCH`: 默认 `main`

## 修改样式 / 主题

`quartz.config.ts` — 颜色、字体、site title、locale。

## 发布目录

content repo 里只有 `publish/` 目录会发布到网站；同步脚本会把 `publish/` 作为 Quartz 的内容根目录，所以 `publish/index.md` 会发布为 `/`，`publish/about.md` 会发布为 `/about`。

`publish/` 里的笔记如果暂时不想发布，frontmatter 加 `draft: true`。

## 域名迁移

`cloudflare/_redirects` 会把 `journeytomath.com` 和 `www.journeytomath.com` 的所有路径用 301 跳转到 `poisemath.com` 的同一路径。Cloudflare Pages 构建命令必须在 Quartz 构建后运行：

```bash
bash scripts/copy-cloudflare-pages-files.sh
```

Quartz 已设置 `baseUrl: "poisemath.com"`，构建会生成 `public/sitemap.xml`。页面 head 中也会输出 canonical，指向 `https://poisemath.com/...`。
