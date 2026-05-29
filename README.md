# poiseacademy-site

Quartz 4 静态站点项目，部署 poiseacademy.com。

内容源在 [`poiseacademy-content`](https://github.com/EricDong/poiseacademy-content) 仓库（Obsidian vault）。

## 架构

```
content repo (Obsidian vault, iCloud 同步)
  ↓ Obsidian Git 插件每 10 分钟 push
GitHub: poiseacademy-content
  ↓ workflow trigger-deploy.yml 调用 Cloudflare deploy hook
Cloudflare Pages (this repo)
  ↓ build command: bash scripts/sync-content.sh && npx quartz build
poiseacademy.com
```

## 本地开发

```bash
bash scripts/sync-content.sh   # 把 content repo 拉到 content/
npx quartz build --serve       # http://localhost:8080
```

## Cloudflare Pages 构建配置

| 项 | 值 |
|----|-----|
| Framework preset | None |
| Build command | `bash scripts/sync-content.sh && npx quartz build` |
| Build output directory | `public` |
| Root directory | `/` |
| Node version | `22` (env var `NODE_VERSION=22`) |

环境变量（可选）：
- `CONTENT_REPO`: 默认 `https://github.com/EricDong/poiseacademy-content.git`
- `CONTENT_BRANCH`: 默认 `main`

## 修改样式 / 主题

`quartz.config.ts` — 颜色、字体、site title、locale。

## 不发布某些笔记

content repo 笔记 frontmatter 加 `draft: true`。
