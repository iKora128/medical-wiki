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

## 単一記事の投稿

単一の記事を投稿する場合は、以下のエンドポイントを使用します：

```
POST /api/articles
```

### リクエスト形式

```json
{
  "title": "記事のタイトル",
  "slug": "article-slug",
  "content": "# Markdownコンテンツ\n\nここに記事の内容を書きます",
  "tags": ["タグ1", "タグ2"],
  "status": "published"  // オプション: デフォルトは "draft"
}
```

### 使用例

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "高血圧について",
    "slug": "hypertension",
    "content": "# 高血圧について\n\n高血圧は現代社会において...",
    "tags": ["循環器", "生活習慣病"]
  }'
```

### 記事の更新

既存の記事を更新する場合は、以下のエンドポイントを使用します：

```
PUT /api/articles/{slug}
```

### 更新リクエストの例

```bash
curl -X PUT http://localhost:3000/api/articles/hypertension \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "高血圧（改訂版）",
    "content": "# 高血圧について（改訂版）\n\n最新の研究によると...",
    "tags": ["循環器", "生活習慣病", "予防医学"]
  }'
```

### 記事の削除

記事を削除する場合は、以下のエンドポイントを使用します：

```
DELETE /api/articles/{slug}
```

### 削除リクエストの例

```bash
curl -X DELETE http://localhost:3000/api/articles/hypertension \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 注意事項

- 単一記事の投稿・更新・削除も、一括アップロードと同様にBearer認証が必要です
- 更新時にはslugを指定する必要があります
- タグは自動的に作成または関連付けされます
- 記事のステータスは "draft"（下書き）または "published"（公開）を指定できます
- 更新時にはタイトルやタグなど、変更したいフィールドのみを含めることができます

## データベース設定

このプロジェクトはGoogle Cloud SQL (PostgreSQL)を使用しています。

### ローカル開発環境のセットアップ

1. Cloud SQL Proxyのインストール:
```bash
# Macの場合
brew install cloud-sql-proxy

# または直接ダウンロード
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.0.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy
```

2. Cloud SQL Proxyの起動:
```bash
# プロジェクトIDとリージョン、インスタンス名を指定して起動
cloud-sql-proxy ${PROJECT_ID}:${REGION}:${INSTANCE_NAME}
```

3. 環境変数の設定:
```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=medical_wiki
PROJECT_ID=your_project_id
REGION=us-central1
INSTANCE_NAME=medical-wiki

# Development Database URL (for local development with Cloud SQL proxy)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"

# Production Database URL (for GCP deployment)
PRODUCTION_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@[INSTANCE_IP]:5432/${POSTGRES_DB}"
```

4. データベースのマイグレーション:
```bash
# マイグレーションの実行
npx prisma migrate dev

# （必要な場合）データベースのリセット
npx prisma migrate reset --force
```

### 本番環境での注意点

- 本番環境では`PRODUCTION_DATABASE_URL`を使用します
- Cloud SQL Proxyは自動的に設定されます
- マイグレーションは慎重に行ってください

### 管理者UI

記事の管理は以下のURLから行えます：

- `/admin` - 記事一覧・管理ページ
- `/admin/post` - 新規記事投稿
- `/admin/edit/[slug]` - 記事編集

管理者UIからは以下の操作が可能です：

- 記事の新規作成
- 既存記事の編集
- 記事の削除
- 記事のステータス管理（下書き/公開）
- タグの管理

アクセスには管理者権限が必要です。
