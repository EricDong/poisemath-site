# 完成上线的剩余步骤

本地基础设施已就绪：
- ✅ `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/poiseacademy.com` — content repo（vault + .gitignore + GitHub Action + 示例 markdown）
- ✅ `~/code/poiseacademy-site` — Quartz 4 + sync 脚本 + 配置
- ✅ Quartz 本地构建已验证通过（生成 19 个文件）

下面是无法自动完成的 OAuth / GUI 步骤。按顺序执行约 15 分钟。

---

## 1. GitHub CLI 重新登录（你的 token 失效了）

```bash
gh auth login -h github.com
```
选 `HTTPS` + `Login with a web browser`，按提示在浏览器完成。

验证：
```bash
gh auth status
```

---

## 2. 创建两个 GitHub repo 并推送

**content repo（vault）**：
```bash
cd "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/poiseacademy.com"
gh repo create poiseacademy-content --private --source=. --remote=origin --push
```

**site repo（Quartz）**：
```bash
cd "$HOME/code/poiseacademy-site"
gh repo create poiseacademy-site --public --source=. --remote=origin --push
```

> content repo 私有更安全（避免草稿被搜到）；site repo 公开方便 Cloudflare Pages 接入。

---

## 3. Cloudflare Pages 创建项目

打开 https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git。

授权 GitHub → 选 `poiseacademy-site` repo → 配置：

| 字段 | 值 |
|------|-----|
| Project name | `poiseacademy` |
| Production branch | `main` |
| Framework preset | None |
| Build command | `bash scripts/sync-content.sh && npx quartz build` |
| Build output directory | `public` |
| Root directory | `/`（留空） |

**Environment variables（重要）**：
- `NODE_VERSION` = `22`
- `CONTENT_REPO` = `https://github.com/<你的用户名>/poiseacademy-content.git`

> 如果 content repo 私有，把 URL 改成带 PAT 的形式：`https://<USER>:<PAT>@github.com/<USER>/poiseacademy-content.git`，并在 Cloudflare 把 PAT 存为 secret env var。

点 **Save and Deploy**，第一次构建约 2 分钟。成功后会得到 `poiseacademy.pages.dev` 临时域名。

---

## 4. 创建 Deploy Hook（用于 content push 自动触发）

Cloudflare Pages 项目 → Settings → Builds & deployments → **Deploy hooks** → Add deploy hook：
- Hook name: `content-push`
- Branch: `main`
- 复制生成的 URL（形如 `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxxx`）

把它存为 content repo 的 secret：
```bash
gh secret set CLOUDFLARE_DEPLOY_HOOK \
  --repo <你的用户名>/poiseacademy-content \
  --body "https://api.cloudflare.com/.../xxxx"
```

> 验证：在 content repo 里随便改一行 markdown 推送，Actions 应该跑过 → Cloudflare Pages 应该被触发重新部署。

---

## 5. 绑定自定义域名 poiseacademy.com

Cloudflare Pages 项目 → Custom domains → Set up a custom domain → 输入 `poiseacademy.com`。

如果域名 NS 已经托管在 Cloudflare：自动添加 CNAME，几秒生效。

如果在别的注册商：按 Cloudflare 提示加 CNAME 记录指向 `poiseacademy.pages.dev`，并把根域 ALIAS / CNAME flattening 设好。

SSL 自动签发。

---

## 6. Obsidian 启用 Git 插件（自动 push）

1. 打开 Obsidian → 切换到 `poiseacademy.com` vault
2. Settings → Community plugins → Turn on community plugins → Browse
3. 搜 **Obsidian Git** → Install → Enable
4. Settings → Obsidian Git：
   - `Vault backup interval (minutes)`: `10`
   - `Auto push after backup`: ✅
   - `Auto pull on startup`: ✅
   - `Commit message`: `vault auto-commit {{date}}`

> 在多设备使用：每台 Mac 都要装并配置一次，移动端用 Obsidian Mobile 也支持。

---

## 7. 端到端验证

```bash
# 在 vault 里改点东西
cd "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/poiseacademy.com"
echo "测试时间 $(date)" >> index.md
git add index.md && git commit -m "test deploy" && git push
```

预期：
1. GitHub Actions 里 `Trigger Cloudflare Pages deploy` 跑过（< 10 秒）
2. Cloudflare Pages 自动开始构建（~ 2 分钟）
3. `poiseacademy.com` 看到新内容

---

## 常见问题

**iCloud `.icloud` 占位符进 git 了**：vault `.gitignore` 已含 `*.icloud`。如果已经被 track，跑 `git rm --cached *.icloud`。

**笔记里图片不显示**：把附件放在 vault 根目录或 `attachments/`，Obsidian Settings → Files & Links → Default location for new attachments 设成 vault 根。

**草稿不想发布**：frontmatter 加 `draft: true`，Quartz 的 `RemoveDrafts` plugin 会过滤掉。

**改主题/字体**：编辑 `~/code/poiseacademy-site/quartz.config.ts` → 推 site repo → Cloudflare 自动重建。
