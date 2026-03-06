# GitHub でアプリを公開する手順

GitHub にリポジトリを作り、GitHub Pages で公開すると、誰でも URL からアプリを開けます。

---

## 1. GitHub の準備

1. **https://github.com** にアクセス
2. アカウントがない場合は **Sign up** で作成（無料）
3. ログインする

---

## 2. 新しいリポジトリを作る

1. 右上の **＋** → **New repository**
2. **Repository name** に好きな名前を入力（例: `ope-sen-quiz`）
3. **Public** を選択
4. 「Add a README file」は **つけなくてOK**（手元に既にファイルがあるため）
5. **Create repository** をクリック

---

## 3. 手元のフォルダを Git で GitHub に送る

**ターミナル（コマンドプロンプト or PowerShell）** を開き、このプロジェクトのフォルダに移動してから、次のコマンドを順に実行します。

```bash
cd "C:\Users\k-isayama\dev\20260305オペ戦"
```

（フォルダの場所が違う場合は、そのパスに書き換えてください。）

```bash
git init
git add .
git commit -m "オペ戦クイズアプリを追加"
```

次に、GitHub のリポジトリをリモートに追加してプッシュします。

```bash
git remote add origin https://github.com/ki1015/202603006ope.git
git branch -M main
git push -u origin main
```

- 初回の `git push` で、GitHub の **ユーザー名** と **パスワード** を聞かれた場合  
  - パスワードには、GitHub の **Settings → Developer settings → Personal access tokens** で作った **トークン** を使います（通常のログイン用パスワードでは通らないことがあります）。

---

## 4. GitHub Pages を有効にする

1. GitHub のリポジトリのページを開く
2. 上メニューの **Settings** をクリック
3. 左の一覧で **Pages** をクリック
4. **Source** で **Deploy from a branch** を選ぶ
5. **Branch** で `main`、フォルダは **/ (root)** のまま **Save** をクリック
6. 数分待つと、緑のメッセージで  
   **Your site is live at https://【ユーザー名】.github.io/【リポジトリ名】/**  
   と表示される

---

## 5. 共有する URL

アプリの入口は **`app`** フォルダにあるので、共有する URL は次の形になります。

```
https://【ユーザー名】.github.io/【リポジトリ名】/app/
```

このリポジトリの場合:

```
https://ki1015.github.io/202603006ope/app/
```

この URL を相手に伝え、「パスワードは `takoyaki`」と教えれば使ってもらえます。

---

## 6. あとから更新するとき

内容を直したあと、もう一度 GitHub に反映するには、同じフォルダで次を実行します。

```bash
git add .
git commit -m "説明を追記"
git push
```

プッシュ後、数分以内に GitHub Pages の内容が更新されます。

---

## うまくいかないとき

- **404 になる**  
  - URLの末尾が **`/app/`** になっているか確認してください。
- **問題が表示されない**  
  - リポジトリのルートに **`app`** と **`data`** の両方のフォルダがあるか確認してください。
- **Git が入っていない**  
  - https://git-scm.com/ から Git をインストールしてから、もう一度手順 3 をやり直してください。
