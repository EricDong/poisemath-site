#!/usr/bin/env bash
set -euo pipefail

mkdir -p public
cp cloudflare/_redirects public/_redirects

echo "Cloudflare Pages files copied to public/"
