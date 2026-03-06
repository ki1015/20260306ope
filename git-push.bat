@echo off
chcp 65001 >nul
cd /d "%~dp0"
REM リポジトリ名を変えた場合は、次の GITHUB_REPO を新しい名前に書き換えてください
set GITHUB_REPO=20260306ope

echo ========================================
echo  GitHub へプッシュ
echo ========================================
echo.

git init
if %errorlevel% neq 0 (
  echo git がインストールされていません。 https://git-scm.com/ からインストールしてください。
  pause
  exit /b 1
)

git remote remove origin 2>nul
git remote add origin https://github.com/ki1015/%GITHUB_REPO%.git
git branch -M main

git pull origin main --rebase
git add .
git status --short
git diff --cached --quiet || git commit -m "回答時間を制限なし・10秒・20秒・30秒に変更"
git push -u origin main

echo.
echo 完了したら、GitHub の Settings - Pages で Deploy from a branch を有効にしてください。
echo 公開URL https://ki1015.github.io/%GITHUB_REPO%/app/
echo.
pause
