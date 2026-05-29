#!/usr/bin/env bash
# Fetch content from the content repo at build time.
# Used by Cloudflare Pages and local builds.
set -euo pipefail

CONTENT_REPO="${CONTENT_REPO:-https://github.com/EricDong/poiseacademy-content.git}"
CONTENT_BRANCH="${CONTENT_BRANCH:-main}"
CONTENT_DIR="content"

echo "→ Syncing content from $CONTENT_REPO ($CONTENT_BRANCH)"

rm -rf "$CONTENT_DIR"
git clone --depth=1 --branch "$CONTENT_BRANCH" "$CONTENT_REPO" "$CONTENT_DIR"

# Strip the content repo's .git so Quartz' git-date plugin uses site repo's
rm -rf "$CONTENT_DIR/.git"

echo "→ Content synced:"
find "$CONTENT_DIR" -maxdepth 2 -name '*.md' | head -20
