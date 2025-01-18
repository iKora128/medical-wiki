import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import matter from 'gray-matter'
import { glob } from 'glob'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!ADMIN_API_KEY) {
  console.error('環境変数 ADMIN_API_KEY が設定されていません')
  process.exit(1)
}

interface ArticleMetadata {
  title: string;
  tags?: string[];
  status?: 'draft' | 'published';
  slug?: string;
  references?: string[];
}

// 記事の存在チェック
async function checkArticleExists(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/articles/${slug}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function uploadArticles(inputPath: string, force: boolean = false) {
  try {
    const stats = fs.statSync(inputPath)
    
    if (stats.isDirectory()) {
      await uploadDirectory(inputPath, force)
    } else if (stats.isFile()) {
      const extension = path.extname(inputPath).toLowerCase()
      if (extension === '.md') {
        await uploadMarkdown(inputPath, force)
      } else {
        throw new Error('サポートされていないファイル形式です。.md ファイルを指定してください。')
      }
    }
  } catch (error) {
    console.error('エラー:', error)
    process.exit(1)
  }
}

async function uploadDirectory(dirPath: string, force: boolean) {
  console.log(`ディレクトリ ${dirPath} から記事を検索中...`)
  
  const files = glob.sync('**/*.md', { cwd: dirPath })
  
  if (files.length === 0) {
    console.log('Markdownファイルが見つかりませんでした')
    return
  }

  console.log(`${files.length}件のMarkdownファイルが見つかりました`)
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    try {
      await uploadMarkdown(fullPath, force)
    } catch (error) {
      console.error(`エラー (${file}):`, error)
      continue
    }
  }
}

async function uploadMarkdown(filePath: string, force: boolean) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  const { data, content } = matter(fileContent)
  const metadata = data as ArticleMetadata
  
  const fileName = path.basename(filePath, '.md')
  const slug = metadata.slug || fileName
  
  const exists = await checkArticleExists(slug)
  
  let title = metadata.title
  if (!title) {
    const titleMatch = content.match(/^# (.+)$/m)
    title = titleMatch ? titleMatch[1] : fileName
  }

  const article = {
    title,
    slug,
    content,
    tags: metadata.tags || [],
    status: metadata.status || 'draft',
    references: metadata.references || []
  }

  // forceフラグに関係なく、存在チェックに基づいてメソッドを決定
  const method = exists ? 'PUT' : 'POST'
  const endpoint = exists ? `${API_URL}/api/articles/${slug}` : `${API_URL}/api/articles`

  console.log(`記事を${exists ? '更新' : 'アップロード'}しています...`)
  console.log('タイトル:', title)
  console.log('スラッグ:', slug)
  console.log('タグ:', article.tags.join(', '))
  console.log('ステータス:', article.status)

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      },
      body: JSON.stringify(article)
    })

    if (!response.ok) {
      const text = await response.text()
      let error
      try {
        error = JSON.parse(text)
      } catch {
        error = { message: text || response.statusText }
      }
      throw new Error(`${exists ? '更新' : 'アップロード'}失敗: ${error.message || response.statusText}`)
    }

    const text = await response.text()
    if (!text) {
      console.log(`${exists ? '更新' : 'アップロード'}成功（レスポンスなし）`)
      return
    }

    try {
      const result = JSON.parse(text)
      console.log(`${exists ? '更新' : 'アップロード'}成功:`, result)
    } catch (e) {
      console.log(`${exists ? '更新' : 'アップロード'}成功（JSONパースエラー）:`, text)
    }
  } catch (error) {
    console.error('エラー:', error)
    throw error
  } finally {
    console.log('---')
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2)
const force = args.includes('--force')
const inputPath = args.filter(arg => arg !== '--force')[0]

if (!inputPath) {
  console.error(`使用方法: 
  npm run upload-article <Markdownファイルまたはディレクトリのパス>
  npm run upload-article --force <Markdownファイルまたはディレクトリのパス>  # 既存の記事を上書き
  `)
  process.exit(1)
}

uploadArticles(inputPath, force)