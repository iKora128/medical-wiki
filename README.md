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
title: "記事のタイトル"
tags: ["タグ1", "タグ2"]
status: "published"  # または "draft"
slug: "custom-url"   # オプション：指定しない場合はファイル名がslugになります
---

# 記事のタイトル

## はじめに
...
```

#### Front Matterのフィールド説明

- **title**: 記事のタイトル（必須）
  - 指定がない場合、Markdown内の最初の`#`見出しが使用されます
- **tags**: カンマ区切りのタグリスト（オプション）
  - 指定がない場合、ファイルが置かれているディレクトリ名がタグとして使用されます
- **status**: 公開ステータス（オプション）
  - `published`: 公開
  - `draft`: 下書き（デフォルト）
- **slug**: URLのパス部分（オプション）
  - 指定がない場合、ファイル名（.mdを除いた部分）が使用されます

### アップロード方法

#### 1. 単一の記事をアップロード

```bash
npm run upload-article path/to/article.md
```

#### 2. ディレクトリ内の全記事をアップロード

```bash
npm run upload-article path/to/articles/
```

ディレクトリを指定した場合、サブディレクトリも含めて再帰的に全ての`.md`ファイルが処理されます。

### ディレクトリ構造の例

```
articles/
├── 循環器/
│   ├── hypertension.md     # タグ: ["循環器"]
│   └── heart-failure.md    # タグ: ["循環器"]
├── 消化器/
│   ├── gerd.md            # タグ: ["消化器"]
│   └── ibd.md             # タグ: ["消化器"]
└── 感染症/
    └── covid19.md         # タグ: ["感染症"]
```

### アップロード時の注意点

1. **Front Matterのフォーマット**
   - YAMLの形式に従って正しく記述してください
   - インデントはスペースを使用してください

2. **ファイル名**
   - 日本語のファイル名も使用可能ですが、URLの可読性を考慮して英数字を推奨します
   - スペースの代わりにハイフン(`-`)を使用してください

3. **コンテンツの形式**
   - Markdown記法に従って記述してください
   - 画像は外部URLまたはBase64エンコードされた形式でサポートされています

4. **エラーハンドリング**
   - アップロード失敗時は詳細なエラーメッセージが表示されます
   - ネットワークエラーや認証エラーの場合は再試行してください

### 既存の記事の更新

同じslugの記事をアップロードすると、既存の記事が更新されます。
更新時は以下の点に注意してください：

1. slugが一致する記事が存在する場合、その記事が更新されます
2. slugが異なる場合、新しい記事として作成されます
3. タグは完全に置き換えられます（既存のタグは削除されます）

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
