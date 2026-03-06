@echo off
chcp 65001 >nul
cd /d "%~dp0"

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

git add .
git commit -m "オペ戦クイズアプリを追加"
git remote remove origin 2>nul
git remote add origin https://github.com/ki1015/202603006ope.git
git branch -M main
git push -u origin main

echo.
echo 完了したら、GitHub の Settings - Pages で「Deploy from a branch」を有効にしてください。
echo 公開URL: https://ki1015.github.io/202603006ope/app/
echo.
pause
