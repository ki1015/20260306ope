# オペ戦 理論学習アプリ データ

A（理論クイズ）と C（用語カード）のハイブリッド用データです。  
BOM Day2・Day3・Day4・Day5、製造業SCMの基本、オペレーション管理の用語・プロセス入門から理論・フレームワークを抽出し、問題集を拡充しています。  
**解説には具体例を入れ、イメージしやすいようにしています。**

## ファイル構成

| ファイル | 内容 |
|----------|------|
| `term_cards.json` | 用語カード（51用語）。id・用語名・定義・トレードオフ/軸・一言・カテゴリ。 |
| `quiz_questions.json` | クイズ問題（87問）。4択または○×、解説（具体例付き）・カテゴリ・関連用語ID。オペ戦レポート講評の論点を反映。 |

## 用語カード（term_cards.json）

- **categories**: カテゴリ一覧（id, name）
- **terms**: 各用語
  - `id`: 用語ID（クイズの termIds で参照）
  - `term`: 用語名（表示用）
  - `category`: カテゴリID
  - `definition`: 定義
  - `tradeoffs_or_axis`: トレードオフや2軸の説明
  - `one_liner`: 一言要約

## クイズ問題（quiz_questions.json）

- **questions**: 問題の配列
  - `id`: 問題ID
  - `type`: `"choice"`（4択） or `"boolean"`（○×）
  - `category`: カテゴリID（単元フィルタ用）
  - `question`: 問題文
  - **4択の場合**: `options`（配列）, `correctIndex`（0〜3）
  - **○×の場合**: `correct`（true/false）
  - `explanation`: 解説
  - `termIds`: 関連する用語カードの id の配列（不正解時などにカードへ遷移する際に使用）

## カテゴリ一覧

- positioning: ポジショニング・Value Line
- make_buy: 内製・外製
- partnership: パートナーシップ・リーン
- scm: SCM
- inventory: 在庫・PSI
- franchise: フランチャイズ
- global: グローバル
- industry: 業界分析
- ops_framework: オペ戦略の枠組み
- continuous: 継続的改善
- scale_economy: 規模の経済・範囲・密度
- production_mode: 計画生産・受注生産
- process_analysis: プロセス・ボトルネック
- cost_benefit: 費用対効果・意思決定

## アプリでの利用例

- クイズ: カテゴリでフィルタ → 出題 → 正誤表示と解説 → 不正解なら `termIds` の用語カードへリンク
- 用語カード: 一覧表示 → タップで詳細（定義・トレードオフ・一言）→ 必要に応じてそのカテゴリのクイズへ
