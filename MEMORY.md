# MEMORY.md — SAKURA Math 開発メモリー

> このファイルはプロジェクトの進捗・意思決定・現在のフォーカスを記録する。
> Claude Codeは作業開始時にこのファイルを読み、作業完了時に更新すること。

## 現在のフェーズ

**Phase 1: コア体験（MVP）**

## 現在のタスク進捗

### Phase 1 チェックリスト
- [x] プロジェクト初期セットアップ（Next.js + Tailwind + PWA）
- [x] `lib/` 基盤（SM-2アルゴリズム、localStorage ラッパー、problems.json読み込み）
- [x] さくらの木コンポーネント（SVG、花スロット30個、開花アニメーション）
- [x] ホーム画面（さくらの木 + 今日の復習数 + 連続ログイン日数）
- [x] ドリル画面（出題 → 答え表示 → 3段階自己評価 → 花が咲く演出）
- [x] 弱点ダッシュボード（タグ別正答率グラフ、つまずきポイント一覧）
- [x] 問題一覧画面（閲覧、タグフィルタ、復習待ちハイライト）
- [x] 図形表示コンポーネント（SVG / 画像ハイブリッド）
- [x] 管理者画面（`?admin=1`、進捗インポート / エクスポート / リセット）
- [ ] Vercelデプロイ + PWA動作確認

## 意思決定ログ

| 日付 | 決定事項 | 理由 |
|------|---------|------|
| 2025-02-22 | API呼び出しは使わない。AI分類はClaude Code上で実行 | ランニングコストをゼロにするため |
| 2025-02-22 | データ管理はJSONファイル + Git（Phase 1） | シンプルに始めて、Phase 2でSupabaseに移行 |
| 2025-02-22 | 図形はSVG自動生成→写真フォールバックのハイブリッド | 手作業を最小化しつつ複雑な図にも対応 |
| 2025-02-22 | ゲーミフィケーションはさくらの木を中心に | 娘さんの好みに合わせて選定 |
| 2025-02-22 | Supabase連携をPhase 2に前倒し | 夫婦で共同管理するため早期に必要 |
| 2025-02-22 | 塾は希学園（浜学園ではない） | 初期の誤りを訂正 |

## 既知の課題・TODO

- サンプル問題が3問だけなので、実運用開始時に実際のテスト問題を登録する必要あり
- PWAアイコン（icon-192.png, icon-512.png）の作成が必要
- さくらの木のSVGデザインは実装時に調整が必要

## 作業ログ

### 2025-02-22
- プロジェクト構想・設計をclaude.ai上で実施
- CLAUDE.md（仕様書）を作成
- MEMORY.md（本ファイル）を作成
- Phase 1 コア実装完了:
  - Next.js 14 + Tailwind CSS + PWAマニフェスト セットアップ
  - lib/ 基盤: spaced-repetition.js (SM-2), storage.js (localStorage), problems.js
  - data/problems.json: サンプル3問 + 13タグ定義
  - components: SakuraTree, FlowerBloom, PetalFall, DrillCard, FigureDisplay, TagBadge, ProgressBar
  - pages: ホーム画面 (app/page.js), ドリル画面 (app/drill/page.js)
  - scripts: add-problem.md, register-from-photo.md
  - `npm run build` 静的エクスポート成功確認済み

### 2026-02-22
- Phase 1 残りタスク実装完了:
  - app/dashboard/page.js: 弱点ダッシュボード（タグ別正答率横棒グラフ、つまずきポイント一覧、全体サマリー）
  - app/problems/page.js: 問題一覧画面（タグフィルタ、復習期日ハイライト、アコーディオン詳細展開、復習履歴表示）
  - app/page.js: 管理者画面追加（?admin=1で⚙️ボタン表示、進捗インポート/エクスポート/リセットのモーダル）
  - `npm run build` 静的エクスポート成功確認済み（全5ページ生成）
- Phase 1 残タスク: Vercelデプロイ + PWA動作確認のみ
