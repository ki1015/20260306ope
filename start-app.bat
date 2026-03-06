@echo off
chcp 65001 >nul
echo ========================================
echo  オペ戦 理論クイズ アプリ
echo ========================================
echo.

cd /d "%~dp0"

where npx >nul 2>&1
if %errorlevel% equ 0 (
  echo [起動中] npx serve でサーバーを起動します...
  echo.
  echo  PCで開く:  http://localhost:3000/app/
  echo.
  echo  携帯で同じ画面を見る場合:
  echo  1. PCと携帯を同じWi-Fiに接続
  echo  2. 下記の「このPCのIP」をメモ
  echo  3. 携帯のブラウザで http://[IP]:3000/app/ を開く
  echo.
  for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo  このPCのIP: %%a
    goto :done_ip
  )
  :done_ip
  echo.
  echo 終了するときはこの窓で Ctrl+C を押してください。
  echo ========================================
  echo.
  npx --yes serve . -p 3000
) else (
  echo Node.js が入っていないか、npx が見つかりません。
  echo.
  echo 方法1: Node.js をインストールしてから再度このファイルを実行
  echo   https://nodejs.org/
  echo.
  echo 方法2: Python がある場合
  echo   python -m http.server 3000
  echo   を実行し、ブラウザで http://localhost:3000/app/ を開く
  echo   携帯では http://[PCのIP]:3000/app/
  echo.
  pause
)
