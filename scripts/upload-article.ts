import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import matter from 'gray-matter'
import glob from 'glob'

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
}

async function uploadArticles(inputPath: string) {
  try {
    const stats = fs.statSync(inputPath)
    
    if (stats.isDirectory()) {
      await uploadDirectory(inputPath)
    } else if (stats.isFile()) {
      const extension = path.extname(inputPath).toLowerCase()
      if (extension === '.md') {
        await uploadMarkdown(inputPath)
      } else {
        throw new Error('サポートされていないファイル形式です。.md ファイルを指定してください。')
      }
    }
  } catch (error) {
    console.error('エラー:', error)
    process.exit(1)
  }
}

async function uploadDirectory(dirPath: string) {
  console.log(`ディレクトリ ${dirPath} から記事を検索中...`)
  
  // .mdファイルを再帰的に検索
  const files = glob.sync('**/*.md', { cwd: dirPath })
  
  if (files.length === 0) {
    console.log('Markdownファイルが見つかりませんでした')
    return
  }

  console.log(`${files.length}件のMarkdownファイルが見つかりました`)
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    await uploadMarkdown(fullPath)
  }
}

async function uploadMarkdown(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  // Front Matterの解析
  const { data, content } = matter(fileContent)
  const metadata = data as ArticleMetadata
  
  // ファイル名からslugを生成（Front Matterで指定がない場合）
  const fileName = path.basename(filePath, '.md')
  const slug = metadata.slug || fileName
  
  // Front Matterからタイトルを取得、なければ1行目から抽出
  let title = metadata.title
  if (!title) {
    const titleMatch = content.match(/^# (.+)$/m)
    title = titleMatch ? titleMatch[1] : fileName
  }

  const article = {
    title,
    slug,
    content,
    tags: metadata.tags || [path.basename(path.dirname(filePath))], // タグ未指定時はディレクトリ名をタグとして使用
    status: metadata.status || 'draft'
  }

  console.log('記事をアップロードしています...')
  console.log('タイトル:', title)
  console.log('スラッグ:', slug)
  console.log('タグ:', article.tags.join(', '))
  console.log('ステータス:', article.status)

  const response = await fetch(`${API_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_API_KEY}`
    },
    body: JSON.stringify(article)
  })

  if (!response.ok) {
    const error = await response.json() as { message?: string }
    throw new Error(`アップロード失敗: ${error.message || response.statusText}`)
  }

  const result = await response.json()
  console.log('アップロード成功:', result)
  console.log('---')
}

// コマンドライン引数からパスを取得
const inputPath = process.argv[2]
if (!inputPath) {
  console.error('使用方法: ts-node upload-article.ts <Markdownファイルまたはディレクトリのパス>')
  process.exit(1)
}

uploadArticles(inputPath) 