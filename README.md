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
`.env.example` をコピーして `.env` を作成し、必要な環境変数を設定してください。

3. データベースのセットアップ
```bash
npx prisma migrate dev
```

4. 開発サーバーの起動
```bash
npm run dev
```

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
  success: false,
  message: string,
  code: string,
  data: null
}
```

主なエラーコード：
- `UNAUTHORIZED` - 認証が必要
- `FORBIDDEN` - 権限がない
- `NOT_FOUND` - リソースが見つからない
- `VALIDATION_ERROR` - バリデーションエラー
- `INTERNAL_SERVER_ERROR` - サーバーエラー

### 成功レスポンス

```typescript
{
  success: true,
  message: string,
  data: any
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
