# SAKURA Math 🌸 — Claude Code 実装プロンプト

## プロジェクト概要

小学4年生（希学園通塾中）の算数の苦手克服を目的とした**間隔反復ドリルWebアプリ**。
実力テストで間違えた問題を登録し、忘れた頃に再出題することで弱点を潰していく。

## ターゲットユーザー

- **利用者**: 小学4年生の女の子（スマホ or タブレットで使う）
- **管理者**: 父親（問題登録・分析を担当）

## 技術スタック

| 項目 | 選定 |
|------|------|
| フレームワーク | Next.js 14（App Router） |
| スタイリング | Tailwind CSS |
| データ管理 | `data/problems.json`（Git管理） |
| 進捗データ | localStorage（ブラウザ側） |
| デプロイ | Vercel（無料枠） |
| AI分類 | Claude Code上で実行（APIコスト不要） |

## アーキテクチャ

```
【問題登録フロー（父親がClaude Codeで実行）】
1. scripts/add-problem.md のプロンプトテンプレートを使う
2. Claude Codeに問題文を渡す → AIがタグ・つまずきポイントを自動分類
3. Claude Codeが data/problems.json に追記
4. git push → Vercel自動デプロイ → 娘のアプリに反映

【ドリル利用フロー（娘がスマホで実行）】
1. スマホでアクセス → ホーム画面にさくらの木
2. 「ドリルをはじめる」→ 復習期日が来た問題が出題
3. 答えを考える → 答えを見る → 自己評価（3段階）
4. 正解すると🌸花が咲く → 間違いは短い間隔で再出題
5. ダッシュボードで苦手分野を可視化
```

## 機能要件

### 1. 🌸 さくらの木（メイン画面 / ゲーミフィケーション）

ホーム画面の中央にさくらの木を表示する。これがアプリの心臓部。

- **木の成長段階**: 登録問題数に応じて木が大きくなる（5段階くらい）
- **花が咲く**: 問題に正解すると木にさくらの花が1つ咲くアニメーション
- **満開演出**: 一定数咲くと「満開🌸」のお祝い演出（花びらが舞い散る）
- **季節の表現**: 花が咲いていない枝は蕾として表示
- **SVGまたはCSS/canvasで描画**（画像ファイル不要で軽量に）
- 木の下に今日の情報を表示:
  - 「きょうの復習: ○もん」
  - 「れんぞく○日がんばってるよ！🔥」
  - 「さくら ○こ / ○○こ（満開まであと○こ！）」

### 2. 🧠 ドリル画面

間隔反復（SM-2アルゴリズム）で出題する。

#### SM-2アルゴリズム仕様:
- 自己評価は3段階にシンプル化:
  - 😢「わからなかった」→ quality=1 → interval=1日（翌日再出題）
  - 🤔「あやしい…」→ quality=3 → interval据え置き or 微増
  - 🌸「できた！」→ quality=5 → intervalを easeFactor 倍に伸ばす
- easeFactor の初期値: 2.5、下限: 1.3
- 出題優先度: ①復習期日を過ぎたもの → ②正答率が高い問題（取るべき問題）を優先

#### 画面の流れ:
1. プログレスバー（○/○問）
2. タグ表示（カラーバッジ）+ 実力テスト正答率
3. 問題文表示
4. 「こたえを見る」ボタン
5. 答え + つまずきポイント表示
6. 3段階の自己評価ボタン
7. 正解時: 🌸 花が咲くアニメーション + 効果音的な視覚演出
8. 全問完了: 結果サマリー（正解数、分野別成績、さくらの花の増加数）

### 3. 📊 弱点ダッシュボード

- **タグ別正答率**: 横棒グラフ（苦手順にソート）
- **つまずきポイント一覧**: 正答率が低いタグに属する問題のつまずきポイントを表示
- **全体サマリー**: 登録問題数、累計回答数、全体正答率
- 色分け: 正答率70%以上=緑、40-70%=黄、40%未満=赤

### 4. 📋 問題一覧

- 全問題の閲覧
- タグでフィルタリング
- 復習期日が来ている問題はハイライト
- タップで詳細表示（問題文・答え・つまずきポイント・復習履歴）

## データ構造

### `data/problems.json`

```json
{
  "problems": [
    {
      "id": "2025-04-001",
      "question": "ある品物を定価の2割引きで買ったら960円でした。定価はいくらですか。",
      "answer": "1200円\n\n【解き方】\n2割引き = 定価の8割（0.8）\n960 ÷ 0.8 = 1200円",
      "source": "4月実力テスト 大問3(2)",
      "correctRate": 38,
      "tags": ["割合", "文章題"],
      "difficulty": "標準",
      "stumblingPoint": "「2割引き」を「定価の0.8倍」と変換できるか。割る方向を間違えてかけ算してしまいやすい。",
      "figure": null
    },
    {
      "id": "2025-04-002",
      "question": "下の図で、三角形ABCの面積を求めなさい。",
      "answer": "24cm²\n\n【解き方】\n底辺BC=8cm、高さAH=6cm\n8 × 6 ÷ 2 = 24cm²",
      "source": "4月実力テスト 大問5(1)",
      "correctRate": 55,
      "tags": ["図形", "面積"],
      "difficulty": "標準",
      "stumblingPoint": "どこが底辺でどこが高さかを見抜けるか。高さは底辺に垂直な線であることを理解しているか。",
      "figure": {
        "type": "svg",
        "svg": "<svg viewBox='0 0 200 160' xmlns='http://www.w3.org/2000/svg'><!-- Claude Codeが生成したSVG --><polygon points='20,140 180,140 100,20' fill='none' stroke='#374151' stroke-width='2'/><line x1='100' y1='20' x2='100' y2='140' stroke='#F472B6' stroke-width='1.5' stroke-dasharray='6,4'/><text x='10' y='138' font-size='14' fill='#374151'>B</text><text x='182' y='138' font-size='14' fill='#374151'>C</text><text x='96' y='14' font-size='14' fill='#374151'>A</text><text x='104' y='85' font-size='12' fill='#F472B6'>6cm</text><text x='85' y='156' font-size='12' fill='#374151'>8cm</text></svg>",
        "description": "三角形ABC。底辺BCが8cm、頂点Aから底辺BCに下ろした垂線AHの長さが6cm。"
      }
    },
    {
      "id": "2025-04-003",
      "question": "下の図で、角アの大きさを求めなさい。",
      "answer": "65°\n\n【解き方】\n三角形の内角の和は180°\n180° - 50° - 65° = 65°",
      "source": "4月実力テスト 大問6(2)",
      "correctRate": 42,
      "tags": ["角度", "図形"],
      "difficulty": "標準",
      "stumblingPoint": "三角形の内角の和が180°であることを使えるか。複雑な図から該当する三角形を見つけ出せるか。",
      "figure": {
        "type": "image",
        "path": "figures/2025-04-003.png",
        "description": "複数の直線が交わる図形。三角形の一部に50°と65°の角度が示されており、角アを求める。"
      }
    }
  ],
  "tags": [
    { "id": "calc", "name": "計算", "description": "四則演算、筆算、暗算、計算の工夫" },
    { "id": "unit", "name": "単位換算", "description": "長さ、重さ、かさ、時間の単位変換" },
    { "id": "ratio", "name": "割合", "description": "割合、百分率、歩合、割引" },
    { "id": "figure", "name": "図形", "description": "平面図形、立体図形の性質" },
    { "id": "word", "name": "文章題", "description": "文章を読んで立式する力" },
    { "id": "speed", "name": "速さ", "description": "速さ、時間、距離の関係" },
    { "id": "pattern", "name": "規則性", "description": "数列、規則を見つける問題" },
    { "id": "combo", "name": "場合の数", "description": "並べ方、組み合わせ" },
    { "id": "proportion", "name": "比", "description": "比の計算、比例・反比例" },
    { "id": "angle", "name": "角度", "description": "角度の計算、三角形・多角形の角" },
    { "id": "area", "name": "面積", "description": "面積の求め方、等積変形" },
    { "id": "volume", "name": "体積", "description": "体積・容積の計算" },
    { "id": "other", "name": "その他", "description": "上記に分類できないもの" }
  ]
}
```

### localStorage に保存する進捗データ（キー: `sakura_progress`）

```json
{
  "reviews": {
    "2025-04-001": {
      "easeFactor": 2.5,
      "interval": 3,
      "repetitions": 2,
      "nextReviewDate": "2025-04-20T00:00:00.000Z",
      "lastReviewDate": "2025-04-17T09:30:00.000Z",
      "history": [
        { "date": "2025-04-14T...", "quality": 1, "correct": false },
        { "date": "2025-04-15T...", "quality": 5, "correct": true },
        { "date": "2025-04-17T...", "quality": 5, "correct": true }
      ]
    }
  },
  "sakura": {
    "totalBlooms": 12,
    "currentTreeBlooms": 12,
    "fullBloomCount": 0,
    "fullBloomThreshold": 30
  },
  "streak": {
    "currentStreak": 5,
    "lastActiveDate": "2025-04-17",
    "longestStreak": 7
  }
}
```

## 図形問題の対応（ハイブリッド方式）

図形問題では「図を見ないと解けない」ため、図の表示が必須。
**まずSVG自動生成を試み、複雑すぎる場合は写真切り出しにフォールバック**するハイブリッド方式を採用。

### `figure` フィールドの仕様

問題データの `figure` フィールドは `null`（図なし）または以下の2タイプ:

#### タイプ1: SVG（自動生成）
```json
{
  "type": "svg",
  "svg": "<svg viewBox='0 0 200 160'>...</svg>",
  "description": "三角形ABC。底辺BCが8cm、高さAHが6cm。"
}
```
- Claude Codeがテスト写真から図形を読み取り、SVGコードとして再現
- アプリ側は `dangerouslySetInnerHTML` で描画（問題データは自分で管理するので安全）
- `description` は図が読み込めない場合のフォールバック説明文（アクセシビリティにも使う）

#### タイプ2: 画像（写真切り出し）
```json
{
  "type": "image",
  "path": "figures/2025-04-003.png",
  "description": "複数の直線が交わる図形。三角形の一部に50°と65°の角度が示されている。"
}
```
- SVGでの再現が難しい場合に使う
- テスト写真から該当部分をトリミングして `public/figures/` に保存
- `path` は `public/` からの相対パス（Next.jsの静的ファイル配信）

### Claude Codeでの図形処理フロー

問題登録時にClaude Codeが以下の判断を行う:

```
テスト写真から図形を認識
  ↓
図形の複雑度を判定
  ↓
┌─ シンプル（三角形、四角形、円、角度の図など）
│   → SVGで再現（type: "svg"）
│   → 以下のルールで描画:
│     - viewBox は "0 0 200 160" を基本とする
│     - 線: stroke="#374151" stroke-width="2"
│     - 補助線: stroke="#F472B6" stroke-dasharray="6,4"
│     - ラベル: font-size="14" fill="#374151"
│     - 寸法表記: font-size="12" fill="#F472B6"
│     - 角度の弧: path で小さな弧を描く
│
└─ 複雑（複数図形の重なり、立体図、グラフ、展開図など）
    → フォールバック: 写真切り出しを指示（type: "image"）
    → 「この図はSVGでの再現が難しいため、写真を切り出してください」と表示
    → 切り出し手順:
      1. テスト写真から該当図形部分をトリミング
      2. public/figures/{問題ID}.png として保存
      3. figure.path にパスを設定
```

### SVG自動生成のガイドライン（Claude Code向け）

小学算数でよく出る図形パターンと、SVG描画のポイント:

| 図形タイプ | SVG要素 | 注意点 |
|-----------|---------|--------|
| 三角形 | `<polygon>` | 頂点ラベル(A,B,C)を外側に配置 |
| 四角形・台形 | `<polygon>` | 平行マーク(>>)を小さい矢印で表現 |
| 円 | `<circle>` | 中心点と半径の補助線を点線で |
| 角度 | `<path>` で弧 | 角度数値は弧の近くに配置 |
| 直角マーク | 小さな `<rect>` | 5×5程度の正方形を角に配置 |
| 辺の長さ | `<text>` | 辺の中点付近に配置、ピンク色で強調 |
| 点線（補助線）| `stroke-dasharray` | "6,4" を標準とする |
| 二等辺マーク | 辺の中央に小さな `|` | 等しい辺に同じマークを付ける |

### アプリ側のコンポーネント: `FigureDisplay.js`

```jsx
// components/FigureDisplay.js
'use client';

export default function FigureDisplay({ figure }) {
  if (!figure) return null;

  if (figure.type === 'svg') {
    return (
      <div className="my-4 flex justify-center">
        <div 
          className="w-full max-w-[280px] bg-white rounded-xl p-4 border border-gray-100"
          dangerouslySetInnerHTML={{ __html: figure.svg }}
        />
      </div>
    );
  }

  if (figure.type === 'image') {
    return (
      <div className="my-4 flex justify-center">
        <div className="w-full max-w-[320px] bg-white rounded-xl p-3 border border-gray-100">
          <img 
            src={`/${figure.path}`}
            alt={figure.description}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    );
  }

  return null;
}
```

ドリル画面・問題一覧の問題文表示直後にこのコンポーネントを配置する。

### ファイル構成への追加

```
public/
├── figures/              # 写真切り出し画像を格納
│   ├── 2025-04-003.png
│   └── ...
└── manifest.json
```

`public/figures/` は `.gitignore` に入れず、Git管理する（Vercelにデプロイするため）。

## デザイン方針

### トーン
- **やわらかく、あたたかい、和テイスト**
- 小4女子が「かわいい」と思える色使い
- ゲーム感があるけど子供っぽすぎない

### カラーパレット
- メイン: さくらピンク `#F472B6`
- アクセント: あたたかオレンジ `#FB923C`、やさしい黄色 `#FBBF24`
- 成功: やわらか緑 `#34D399`
- 背景: ピンク〜ブルーのグラデーション `from-pink-50 via-rose-50 to-blue-50`

### フォント
- メイン: Zen Maru Gothic（丸ゴシック、やさしい印象）
- 数字・強調: Kiwi Maru（手書き風セリフ）
- Google Fonts から読み込み

### レスポンシブ
- **モバイルファースト**（主にスマホで使う）
- max-width: 480px を基準にデザイン
- タップしやすい大きめボタン（最低44px）

## さくらの木の描画仕様

SVGで描画する。以下のような構成:

```
        🌸 🌸
      🌸  🌸  🌸
    🌸  🌸  🌸  🌸
      🌸  🌸  🌸
        \  |  /
         \ | /
          \|/
           |
           |
          /|\
```

- **木の幹**: 茶色のパス（固定）
- **枝**: 幹から左右に伸びる曲線パス（固定）
- **花の位置**: 枝の先端・途中にあらかじめ30個のスロットを定義
- **花の状態**:
  - 未開花: 小さな緑の蕾（circle, 薄緑）
  - 開花: ピンクの花（5枚花弁 + 中央の黄色い丸）、bloom アニメーション付き
- **満開**: 全スロット開花 → 花びらが散るパーティクルアニメーション
  - 満開後、花がリセットされ次の木が始まる（世代カウント: 「○本目のさくら」）

花の開花アニメーション:
- scale(0) → scale(1.3) → scale(1) + rotate で「ぽん」と咲く感じ
- 0.6秒くらいの duration

## Claude Code用: 問題登録スクリプト

`scripts/add-problem.md` として以下のテンプレートを作成する。
父親がClaude Codeで問題を追加する際のワークフロー用。

```markdown
# 問題登録テンプレート

以下の問題を分析して `data/problems.json` に追加してください。

## 入力情報
- 問題文: （ここに問題文）
- 答え: （ここに答えと解き方）
- 出典: （例: 5月実力テスト 大問2(3)）
- 全体正答率: （例: 45%）

## やること
1. 問題文を分析し、以下を判定:
   - tags: data/problems.json の tags 定義から該当するものを1〜3個選択
   - difficulty: 基礎 / 標準 / 発展
   - stumblingPoint: この問題で小学生がつまずきやすいポイントを1-2文で簡潔に
2. 新しいIDを採番（"YYYY-MM-NNN" 形式、既存の最大番号+1）
3. data/problems.json の problems 配列に追加
4. 変更内容を表示して確認を求める
```

## PWA対応

`public/manifest.json` を作成:

```json
{
  "name": "SAKURA Math",
  "short_name": "さくら算数",
  "description": "算数つまずき克服ドリル",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF5F7",
  "theme_color": "#F472B6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

アイコンはSVGで🌸をシンプルに描いたものをPNG化するか、絵文字ベースで生成。

## ファイル構成

```
sakura-math/
├── app/
│   ├── layout.js          # ルートレイアウト（フォント、メタ、PWA）
│   ├── globals.css         # Tailwind + カスタムアニメーション
│   ├── page.js             # ホーム（さくらの木 + ナビゲーション）
│   ├── drill/
│   │   └── page.js         # ドリル画面
│   ├── dashboard/
│   │   └── page.js         # 弱点ダッシュボード
│   └── problems/
│       └── page.js         # 問題一覧
├── components/
│   ├── SakuraTree.js       # さくらの木 SVG コンポーネント
│   ├── FlowerBloom.js      # 花が咲くアニメーション
│   ├── PetalFall.js        # 花びらが散るエフェクト
│   ├── DrillCard.js        # ドリル1問分のカード
│   ├── FigureDisplay.js    # 図形表示（SVG / 画像 ハイブリッド）
│   ├── TagBadge.js         # タグのカラーバッジ
│   ├── ProgressBar.js      # プログレスバー
│   └── WeaknessChart.js    # 弱点の横棒グラフ
├── lib/
│   ├── spaced-repetition.js # SM-2 アルゴリズム
│   ├── storage.js           # localStorage ラッパー
│   └── problems.js          # problems.json 読み込み + ユーティリティ
├── data/
│   └── problems.json        # 問題データ（Git管理）
├── scripts/
│   └── add-problem.md       # Claude Code用 問題登録テンプレート
├── public/
│   ├── figures/             # 図形画像（写真切り出し時のフォールバック）
│   └── manifest.json        # PWA マニフェスト
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 実装の優先順序

1. **まずさくらの木 + ドリル画面を動かす**（コア体験）
2. 弱点ダッシュボード
3. 問題一覧・編集
4. PWA対応・アイコン
5. アニメーションの磨き込み

## 注意事項

- `'use client'` ディレクティブを必要なコンポーネントに付与すること（localStorage使用のため）
- Next.js の `output: 'export'` を使って静的エクスポート（Vercel無料枠で十分）
- 問題データは `import` で読み込む（`data/problems.json` を直接 import）
- 子どもが使うので、漢字にはできるだけふりがなを振るか、ひらがな表記にする（UI部分のみ。問題文は塾のテストそのままなので漢字OK）

---

## Claude Code での写真OCR運用フロー

Claude Code はターミナル上で画像を受け取り、内容を読み取ることができる。
これを活用して、**問題登録**と**解き直し判定**の2つのワークフローをClaude Code上で完結させる。

### フロー1: テスト写真からの問題一括登録

#### 使い方（父親の操作）
```bash
# Claude Code上で画像を添付しながら指示する
# 例:
claude "この実力テストの写真から問題を登録して。間違えたのは大問2(3)、大問4、大問5(1)。全体正答率は順に62%、35%、48%。出典は「2025年5月実力テスト」"
# → テスト用紙の写真を添付
```

#### Claude Code が実行すること
1. **画像を読み取り**、問題文をテキストとして抽出（OCR）
2. 指定された問題番号の問題文を特定
3. **図形の有無を判定**し、図がある場合:
   - シンプルな図形 → SVGコードを自動生成（`figure.type: "svg"`）
   - 複雑な図形 → 「この図はSVGでの再現が難しいです。写真からトリミングして `public/figures/{問題ID}.png` に保存してください」と指示（`figure.type: "image"`）
   - 図なし → `figure: null`
4. 各問題について以下を自動判定:
   - `tags`: 該当するタグを1〜3個
   - `difficulty`: 基礎 / 標準 / 発展
   - `stumblingPoint`: つまずきやすいポイントを1-2文で
5. 答えと解き方を生成（模範解答）
6. IDを自動採番（"YYYY-MM-NNN" 形式）
7. `data/problems.json` の `problems` 配列に追記
8. **追加内容をターミナルに表示して確認を求める**（確認後にファイル書き込み）

#### テンプレート: `scripts/register-from-photo.md`

```markdown
# 写真から問題登録

## 手順
テスト用紙の写真が添付されたら、以下を実行してください。

1. 画像から問題文を読み取る
2. ユーザーが指定した問題番号の問題を抽出する
3. **図形の判定と処理**:
   - 図がない問題 → `figure: null`
   - シンプルな図形（三角形、四角形、円、角度の図など）
     → SVGコードを生成して `figure: { type: "svg", svg: "...", description: "..." }` に設定
     → SVGルール: viewBox="0 0 200 160"、線は#374151、補助線は#F472B6の点線、ラベルはfont-size 14
   - 複雑な図形（立体、展開図、複雑な重なりなど）
     → `figure: { type: "image", path: "figures/{問題ID}.png", description: "..." }` に設定
     → 「この問題の図は写真からトリミングが必要です」と通知
4. 各問題について分析:
   - tags: data/problems.json の tags 定義から1〜3個選択
   - difficulty: 基礎 / 標準 / 発展
   - stumblingPoint: 小学生がつまずきやすいポイント（1-2文）
5. 答えと解き方を作成（小学生向けの丁寧な解説）
6. ID採番: 既存の最大ID + 1（"YYYY-MM-NNN"形式）
7. data/problems.json に追記する前に、内容を表示して確認を求める

## 注意
- 問題文は原文のまま忠実に転記する（誤字修正はしない）
- 図形問題は図の情報を漏れなくテキスト化する
- 解き方は小4が理解できるレベルの説明にする
- 1度に複数問題を登録する場合、すべてまとめて表示してから一括確認
```

### フロー2: 解き直しノートの判定

#### 使い方（父親の操作）
```bash
# 解き直しノートの写真を添付しながら指示する
# 例:
claude "この解き直しを判定して。問題ID: 2025-05-003, 2025-05-007"
# → 娘の解き直しノートの写真を添付
```

#### Claude Code が実行すること
1. **画像を読み取り**、娘の解答内容を認識
2. `data/problems.json` から該当問題の正答を参照
3. 各問題について以下を判定:

| 判定結果 | quality値 | 基準 | 次のアクション |
|---------|----------|------|--------------|
| ✅ 完璧に正解 | 5 | 式・答えともに正しい | 間隔を伸ばす |
| 🔺 惜しい（部分正解） | 3 | 考え方は合っているが計算ミス、または式は正しいが答えが違う | 間隔据え置き |
| ❌ 不正解 | 1 | 立式から間違っている、または白紙・根本的に誤り | 翌日再出題 |

4. 判定結果を表示:
   ```
   📝 判定結果:
   
   2025-05-003「ある品物を定価の2割引きで…」
   → ✅ 完璧に正解（quality: 5）
   　式: 960 ÷ 0.8 = 1200 ✓
   　答え: 1200円 ✓
   
   2025-05-007「三角形ABCの面積を…」
   → 🔺 惜しい（quality: 3）
   　式: 6 × 8 ÷ 2 = 24 ✓（考え方は正しい）
   　答え: 28cm² ✗（計算ミス。正答は24cm²）
   　💡 かけ算の筆算を丁寧にやろう
   ```
5. 確認後、**進捗更新用のJSONスニペットを生成**:
   ```json
   {
     "2025-05-003": { "quality": 5, "date": "2025-05-18T..." },
     "2025-05-007": { "quality": 3, "date": "2025-05-18T..." }
   }
   ```

#### テンプレート: `scripts/grade-review.md`

```markdown
# 解き直し判定

## 手順
解き直しノートの写真が添付されたら、以下を実行してください。

1. 画像から娘の解答を読み取る（式、筆算の過程、答えすべて）
2. ユーザーが指定した問題IDで data/problems.json から正答を取得
3. 各問題について判定:
   - 式の立て方は正しいか
   - 計算過程に誤りはないか
   - 最終的な答えは正しいか
4. quality値を決定:
   - 5: 式・計算・答えすべて正しい
   - 3: 考え方（立式）は正しいが計算ミスがある、または答えの単位忘れなど軽微なミス
   - 1: 立式から間違っている、白紙、根本的に理解できていない
5. 判定結果を見やすく表示し、確認を求める
6. 確認後、進捗更新用のJSONを出力する

## 進捗反映について
出力されたJSONは、Webアプリ側の「進捗インポート」機能で読み込む。
（または父親が手動でlocalStorage更新用のブックマークレットで反映）
```

### アプリ側の対応: 進捗インポート機能

Webアプリ側に**管理者用の隠し機能**として進捗インポートを実装する。

#### 仕様
- URLに `?admin=1` を付けるとヘッダーに ⚙️ ボタンが出現
- タップすると管理画面が開く
- 管理画面の機能:
  1. **進捗インポート**: JSONテキストエリアに貼り付け → localStorageの進捗データに反映
  2. **進捗リセット**: 特定問題 or 全問題の進捗をリセット
  3. **データエクスポート**: 現在の進捗データをJSONで表示（バックアップ用）

```javascript
// インポート時の処理イメージ
function importReviewResults(jsonData) {
  // jsonData = { "2025-05-003": { quality: 5, date: "..." }, ... }
  const progress = loadProgress();
  
  Object.entries(jsonData).forEach(([problemId, result]) => {
    const current = progress.reviews[problemId] || {
      easeFactor: 2.5, interval: 0, repetitions: 0, history: []
    };
    
    // SM-2 で次回復習日を計算
    const updated = calculateNextReview(current, result.quality);
    updated.history = [...(current.history || []), {
      date: result.date,
      quality: result.quality,
      correct: result.quality >= 3
    }];
    
    progress.reviews[problemId] = updated;
    
    // 正解なら🌸を増やす
    if (result.quality >= 3) {
      progress.sakura.totalBlooms += 1;
      progress.sakura.currentTreeBlooms += 1;
    }
  });
  
  saveProgress(progress);
}
```

### 運用まとめ

```
【毎月: テスト返却時】
1. テスト用紙を撮影
2. Claude Code: 「写真から登録して。間違いは大問○、○、○」
3. 確認 → git push → 自動デプロイ

【毎日〜数日おき: 解き直し時】
パターンA（アプリ上で自己評価）:
  娘がスマホでドリル → 自己評価ボタンで完結

パターンB（ノート解き直し → 写真判定）:
  1. 娘がノートに解き直し
  2. 父がノートを撮影 → Claude Code で判定
  3. 出力されたJSONを管理画面でインポート
  → さくらの木に反映 🌸

どちらのパターンも併用可能。
普段はパターンAで手軽に、
じっくり解き直す日はパターンBで精密な判定。
```

---

## 開発ロードマップ

各Phaseの詳細タスクと進捗状況は `MEMORY.md` で管理する。

### Phase 1: コア体験（MVP）
**ゴール**: 娘がスマホで毎日ドリルを解けて、さくらの木が育つ状態

- プロジェクト初期セットアップ（Next.js + Tailwind + PWA）
- `lib/` 基盤（SM-2アルゴリズム、localStorage ラッパー、problems.json読み込み）
- さくらの木コンポーネント（SVG、花スロット30個、開花アニメーション）
- ホーム画面（さくらの木 + 今日の復習数 + 連続ログイン日数）
- ドリル画面（出題 → 答え表示 → 3段階自己評価 → 花が咲く演出）
- 弱点ダッシュボード（タグ別正答率グラフ、つまずきポイント一覧）
- 問題一覧画面（閲覧、タグフィルタ、復習待ちハイライト）
- 図形表示コンポーネント（SVG / 画像ハイブリッド）
- 管理者画面（`?admin=1`、進捗インポート / エクスポート / リセット）
- Vercelデプロイ + PWA動作確認

### Phase 2: Supabase連携 + 学習効果の深化
**ゴール**: 夫婦どちらのスマホからでも管理でき、解き直しだけでなく根本理解を深める仕組みにする

#### 2-A: Supabase連携（デバイス間データ同期）
夫婦どちらからでも問題登録・進捗確認ができるようにする。

- Supabaseプロジェクト作成（無料枠）
- DBスキーマ設計（problems / reviews / sakura_progress テーブル）
- `data/problems.json` → Supabaseへのマイグレーション
- localStorage → Supabase への進捗データ移行
- `lib/storage.js` をSupabase対応に書き換え（オフライン時はlocalStorageにフォールバック）
- 管理者画面の進捗インポート/エクスポートをSupabase経由に変更
- git push → Vercelデプロイのフローは維持（問題データのみDBに移動）

#### 2-B: 学習効果の向上
ただ解き直すだけでなく、根本的な理解を深める。

- **類題の自動生成**: 同じタグ・つまずきポイントの問題をClaude Codeで作成し追加。間違えた問題の「数値を変えたバリエーション」や「同じ考え方で解ける別パターン」を生成する。`scripts/generate-similar.md` テンプレートを用意
- **つまずきポイント別の解説ページ**: タグごとに「そもそもこの分野は何？」「よくある間違いパターン」「考え方のコツ」をまとめたミニ教材。ダッシュボードの苦手タグから直接アクセスできる。コンテンツはClaude Codeで生成して `data/tutorials.json` に格納
- **正答率トレンドグラフ**: 週次・月次で正答率の推移を折れ線グラフで表示。タグ別にも見られる。「先月より割合が15%上がった！」のような成長の実感を可視化
- **実力テスト結果の時系列記録**: テストごとの偏差値・点数・順位を記録。推移グラフで長期的な伸びをトラッキング。`data/test-results.json` に格納

### Phase 3: ゲーミフィケーション強化
**ゴール**: 長期的なモチベーション維持。娘が自分から「やりたい」と思える仕掛けを増やす

- **満開演出の強化**: 花びらが画面いっぱいに舞い散るパーティクルアニメーション。世代カウント「○本目のさくら」で歴代の記録を表示
- **月間カレンダー**: 取り組んだ日にさくらマーク🌸。連続日数の記録も表示。カレンダーが花で埋まっていく達成感
- **目標設定機能**: 「今月は20問クリアする！」→ 達成時にスペシャル演出。親子で目標を相談して設定
- **称号システム**: 「さくらマスター」「計算の達人」「図形はかせ」など。タグ別の正答率や累計問題数で解放。ホーム画面に現在の称号を表示
- **親子で見る週間レポート**: 今週のがんばり（解いた問題数、正答率、成長した分野）＋来週の重点分野を自動でまとめる

### Phase 4: 運用効率化
**ゴール**: 問題登録や判定のオペレーションを高速・確実にする

- Claude Code用の問題登録テンプレート整備（`scripts/register-from-photo.md`）
- 解き直し判定テンプレート整備（`scripts/grade-review.md`）
- 図形SVG自動生成の精度検証・テンプレートパターン蓄積
- 複数テスト分の一括登録ワークフロー
- 問題データのバリデーションスクリプト（JSON整合性チェック）

### Phase 5: 将来拡張
**ゴール**: より便利に、よりスケーラブルに

- 写真OCR → 問題登録のワンストップ化（Web UI上で完結）
- 理科・国語への対応拡張
- テスト結果CSV取り込み（希学園のマイページからのデータ連携）
- 複数ユーザー対応（兄弟姉妹で使えるように）
- 希学園のカリキュラムに合わせた単元マッピング
