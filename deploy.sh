#!/usr/bin/env sh

# 發生錯誤時立即中止
set -e

# 建置
npm run build

# 進入建置輸出目錄
cd dist

# 初始化並提交
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到 GitHub gh-pages branch
# 請將下方 URL 換成你的實際 Repository 位址
git push -f git@github.com:pec-upe-web/msm2.0.git gh-pages

cd -
