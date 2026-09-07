#!/usr/bin/env bash
# 心有灵犀 · 一键部署
# main 分支 = 完整项目源码；gh-pages 分支 = 纯 H5 静态站点（GitHub Pages）
set -euo pipefail
cd "$(dirname "$0")"

REPO=git@github.com:YUFEI96HE/moque.git
PAGES_URL=https://yufei96he.github.io/moque/

# 0) 跑测试，保证核心逻辑不被改坏
node test/core.test.js

# 1) 同步 core.js 到两端副本（shared/ 是唯一事实源）
cp shared/core.js h5/core.js
cp shared/core.js mp/utils/core.js

# 2) 确保 moque 自身是 git 仓库且指向远端
if [ ! -d .git ]; then
  git init -b main
  git remote add origin "$REPO"
fi
git remote set-url origin "$REPO" 2>/dev/null || git remote add origin "$REPO"

# 3) main：完整项目
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "main 无新改动"
git push -u origin main

# 4) gh-pages：只放 H5 静态文件
git stash -u >/dev/null 2>&1 || true
git worktree add -f /tmp/moque-pages gh-pages 2>/dev/null || git worktree add -f /tmp/moque-pages -b gh-pages
rm -rf /tmp/moque-pages/*
cp h5/index.html h5/style.css h5/app.js h5/core.js /tmp/moque-pages/
(cd /tmp/moque-pages && git add -A && git commit -m "pages: $(date '+%Y-%m-%d %H:%M:%S')" && git push origin gh-pages)
git worktree remove --force /tmp/moque-pages
git stash pop >/dev/null 2>&1 || true

echo "✅ 部署完成（约 1 分钟后生效）：$PAGES_URL"
