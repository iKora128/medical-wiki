# Medical Wiki

医療関連の知識共有プラットフォーム

## 機能

- 記事の作成・編集・削除
- 質問と回答
- ブックマーク機能
- ユーザープロフィール管理

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env.example` をコピーして `.env` を作成し、必要な環境変数を設定してください：

```bash
# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"

# Admin Configuration
ADMIN_API_KEY="your-api-key"
```

### GCP Cloud SQL (PostgreSQL) の設定

1. Cloud SQL Proxyのインストール (Mac)
```bash
brew install cloud-sql-proxy
```

2. Cloud SQL Proxyのインストール (Ubuntu)
```bash
# Cloud SQL Proxyのダウンロード
wget https://dl.google.com/cloudsql/cloud-sql-proxy.linux.amd64 -O cloud-sql-proxy

# 実行権限を付与
chmod +x cloud-sql-proxy

# システム全体で使用できるように移動
sudo mv cloud-sql-proxy /usr/local/bin/
```

3. GCPプロジェクトの認証設定
```bash
# GCPプロジェクトにログイン
gcloud auth login

# アプリケーションデフォルト認証の設定
gcloud auth application-default login
```

4. Cloud SQL Proxyの起動
```bash
cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME
```

5. データベースのセットアップ
```bash
npx prisma migrate dev
```

6. 開発サーバーの起動
```bash
npm run dev
```

## 記事のアップロード

### Markdownファイルの形式

記事は以下の形式のMarkdownファイルで作成します：

```markdown
---
title: "本態性高血圧症の基礎知識"
slug: "essential-hypertension"  # URLのパス部分（例: /articles/essential-hypertension）
tags: ["循環器", "高血圧", "生活習慣病"]
status: "published"  # "published" または "draft"（下書き）
---

# 本態性高血圧症の基礎知識

## 概要

本態性高血圧症は、明確な原因疾患がない高血圧症で、全高血圧患者の約95%を占めます。
遺伝的要因と環境要因が複雑に関与して発症すると考えられています。

## 診断基準

診察室血圧による高血圧の診断基準（日本高血圧学会2019）：

- 収縮期血圧：140mmHg以上
- 拡張期血圧：90mmHg以上

## 治療方法

### 生活習慣の修正

- 減塩（6g/日未満）
- 適度な運動（有酸素運動を中心に）
- 禁煙
- 節酒
- 適正体重の維持

### 薬物療法

以下の降圧薬が主に使用されます：

1. Ca拮抗薬
2. ARB/ACE阻害薬
3. 利尿薬
4. β遮断薬

## 参考文献

1. 日本高血圧学会. 高血圧治療ガイドライン2019
2. 日本循環器学会. 循環器病の診断と治療に関するガイドライン
```

別の例（下書き状態の記事）：

```markdown
---
title: "胃食道逆流症（GERD）の概要"
slug: "gerd-overview"
tags: ["消化器", "GERD", "食道疾患"]
status: "draft"  # 下書き状態
---

# 胃食道逆流症（GERD）の概要

## はじめに

胃食道逆流症（GERD: Gastroesophageal Reflux Disease）は、胃内容物が食道に逆流することで
様々な症状や合併症を引き起こす疾患です。

## 主な症状

- 胸焼け
- 呑酸（すっぱい液体の逆流）
- 胸痛
- 慢性的な咳
- 嗄声（しわがれ声）

## 診断

以下の方法で診断を行います：

1. 問診・症状評価
2. 上部消化管内視鏡検査
3. 24時間食道pH測定
4. 食道造影検査

## 参考文献

1. 日本消化器病学会. GERD診療ガイドライン2021
2. American College of Gastroenterology. ACG Clinical Guideline for GERD
```

#### Front Matterのフィールド説明

- **title**: 記事のタイトル（必須）
  - 指定がない場合、Markdown内の最初の`#`見出しが使用されます
- **tags**: タグの配列（オプション）
  - 記事の分類やフィルタリングに使用されます
  - 例: `["循環器", "高血圧", "生活習慣病"]`
- **status**: 公開ステータス（オプション）
  - `published`: 公開
  - `draft`: 下書き（デフォルト）
- **slug**: URLのパス部分（オプション）
  - 指定がない場合、ファイル名（.mdを除いた部分）が使用されます

### アップロード方法

#### 1. 単一の記事をアップロード

```bash
# 新規記事のアップロード
npm run upload-article path/to/article.md

# 既存記事の上書き
npm run upload-article --force path/to/article.md
```

#### 2. ディレクトリ内の全記事をアップロード

```bash
# 新規記事のみアップロード（既存記事はスキップ）
npm run upload-article path/to/articles/

# 全記事を強制アップロード（既存記事も上書き）
npm run upload-article --force path/to/articles/
```

ディレクトリを指定した場合、サブディレクトリも含めて再帰的に全ての`.md`ファイルが処理されます。

### アップロード時の注意点

1. **重複チェック**
   - 同じslugの記事が既に存在する場合は、デフォルトでスキップされます
   - 既存の記事を上書きする場合は、`--force`オプションを使用してください
   - slugは記事のURLパスとして使用されるため、一意である必要があります

2. **Front Matterのフォーマット**
   - YAMLの形式に従って正しく記述してください
   - インデントはスペースを使用してください

3. **ファイル名**
   - 日本語のファイル名も使用可能ですが、URLの可読性を考慮して英数字を推奨します
   - スペースの代わりにハイフン(`-`)を使用してください

4. **コンテンツの形式**
   - Markdown記法に従って記述してください
   - 画像は外部URLまたはBase64エンコードされた形式でサポートされています

5. **エラーハンドリング**
   - アップロード失敗時は詳細なエラーメッセージが表示されます
   - ネットワークエラーや認証エラーの場合は再試行してください

### 既存の記事の更新

同じslugの記事をアップロードすると、既存の記事が更新されます。
更新時は以下の点に注意してください：

1. slugが一致する記事が存在する場合、その記事が更新されます
2. slugが異なる場合、新しい記事として作成されます
3. タグは完全に置き換えられます（既存のタグは削除されます）

### ディレクトリ構造の例

ディレクトリ構造は自由に整理できます。以下は一例です：

```
articles/
├── published/
│   ├── cardiovascular/
│   │   └── hypertension.md
│   └── digestive/
│       └── gerd.md
└── drafts/
    └── upcoming/
        └── diabetes.md
```

または

```
articles/
├── 2024-01/
│   └── hypertension.md
└── 2024-02/
    └── gerd.md
```

**注意**: ディレクトリ構造はファイルの整理用であり、記事のタグ付けには影響しません。
タグは必ずFront Matterの`tags`フィールドで指定してください。

## API エンドポイント

### 認証が必要なエンドポイント

以下のエンドポイントには認証が必要です：

- `/api/articles/*` - 記事関連の操作
- `/api/questions/*` - 質問関連の操作
- `/api/profile/*` - プロフィール関連の操作

### エラーレスポンス

APIは以下の形式でエラーを返します：

```typescript
{
  error: string,
  details?: any
}
```

### 成功レスポンス

```typescript
{
  message: string,
  data?: any
}
```

## 開発ガイド

### ログレベル

環境変数 `LOG_LEVEL` で設定可能なログレベル：

- `debug` - 開発環境向けの詳細なログ
- `info` - 本番環境向けの標準的なログ
- `warn` - 警告レベルのログ
- `error` - エラーレベルのログ

### エラーハンドリング

新しいAPIエンドポイントを作成する際は、以下のパターンに従ってください：

```typescript
import { withErrorHandling } from '@/lib/api-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

export const GET = withErrorHandling(async (request: Request) => {
  // バリデーション
  // ビジネスロジック
  return successResponse(data, "成功メッセージ")
})
```

### バリデーション

Zodを使用したバリデーションの例：

```typescript
import { z } from 'zod'

const schema = z.object({
  title: z.string(),
  content: z.string(),
})

const data = schema.parse(await request.json())
```

## クイズ機能の使用方法

医療に関するクイズを提供する機能です。毎日自動的に新しいクイズが表示されます。

### クイズの追加方法

クイズは以下のような形式のJSONデータをAPIにPOSTすることで追加できます：

```bash
curl -X POST http://localhost:3000/api/quizzes/bulk \
  -H "Authorization: Bearer YOUR_SYSTEM_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "question": "心臓の構造について、正しいのはどれ？",
      "options": ["左心房と右心房がある", "心室は1つ", "弁膜は2つ"],
      "answer": "左心房と右心房がある",
      "explanation": "心臓には左心房、右心房、左心室、右心室の4つの部屋があります。"
    }
  ]'
```

#### リクエストの形式

- エンドポイント: `/api/quizzes/bulk`
- メソッド: POST
- ヘッダー:
  - `Authorization`: `Bearer YOUR_SYSTEM_API_TOKEN`
  - `Content-Type`: `application/json`
- ボディ: クイズの配列
  - `question`: クイズの問題文（必須）
  - `options`: 選択肢の配列（必須）
  - `answer`: 正解（必須、optionsの中に含まれる必要があります）
  - `explanation`: 解説（必須）

#### 認証

クイズの追加には`SYSTEM_API_TOKEN`による認証が必要です。このトークンは`.env`ファイルで設定します：

```env
SYSTEM_API_TOKEN="your-secure-token-here"
```

### クイズの自動更新

クイズは毎日自動的に更新されます。以下の条件で新しいクイズが選択されます：

1. 最後に表示されたクイズが今日のものであれば、そのクイズを表示
2. そうでなければ、最も古く表示されたクイズを1つ選択して表示

### エラーレスポンス

- 401: 認証エラー
- 400: リクエストボディが不正
- 500: サーバーエラー
