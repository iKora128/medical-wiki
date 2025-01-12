This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 記事の一括アップロード

このプロジェクトでは、Markdownファイルから記事を一括でアップロードすることができます。
APIを通じてのみ記事のアップロードが可能で、セキュアな認証が必要です。

### 認証

APIにアクセスするには、Bearer認証が必要です：

```bash
Authorization: Bearer YOUR_API_KEY
```

環境変数の設定：
```env
API_KEY=your_secure_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 開発環境の場合
```

### APIエンドポイント

```
POST /api/articles/bulk
```

### リクエスト形式

```json
{
  "articles": [
    {
      "title": "記事のタイトル",
      "slug": "article-slug",
      "content": "# Markdownコンテンツ\n\nここに記事の内容を書きます",
      "authorId": "作成者のID",
      "tags": ["タグ1", "タグ2"],
      "status": "published",  // オプション: デフォルトは "published"
      "references": "[]"      // オプション: デフォルトは "[]"
    }
  ]
}
```

### 使用例

```bash
curl -X POST http://localhost:3000/api/articles/bulk \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "articles": [
      {
        "title": "はじめての医学記事",
        "slug": "first-medical-article",
        "content": "# はじめての医学記事\n\nここに内容を書きます",
        "authorId": "user_id_here",
        "tags": ["医学", "入門"]
      }
    ]
  }'
```

### 特徴

- Markdownコンテンツは自動的にHTMLに変換されます
- 存在しないタグは自動的に作成されます
- 複数の記事を一度にアップロード可能です
- アップロード後、記事は自動的に静的ページとして生成されます（SSG）
- セキュアなAPI認証による保護

### 注意事項

- APIキーは安全に管理し、公開しないようにしてください
- `authorId` は有効なユーザーIDである必要があります
- `slug` は一意である必要があります
- `status` が "published" の場合、記事は公開されます
- アップロードされた記事は `/articles/[slug]` でアクセス可能になります
- 記事ページは完全に静的生成（SSG）され、高速なアクセスが可能です
