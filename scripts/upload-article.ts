import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const API_KEY = process.env.API_KEY
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function uploadArticle(filePath: string) {
  try {
    // ファイル名からslugを生成
    const fileName = path.basename(filePath, '.md')
    const content = fs.readFileSync(filePath, 'utf-8')

    // 最初の行からタイトルを抽出
    const titleMatch = content.match(/^# (.+)$/m)
    const title = titleMatch ? titleMatch[1] : fileName

    // タグを自動生成（例：ファイル名をタグとして使用）
    const tags = [fileName]

    const article = {
      title,
      slug: fileName,
      content,
      tags,
      status: 'published'
    }

    console.log('記事をアップロードしています...')
    console.log('タイトル:', title)
    console.log('スラッグ:', fileName)

    const response = await fetch(`${API_URL}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(article)
    })

    if (!response.ok) {
      const error = await response.json() as { message?: string }
      throw new Error(`アップロード失敗: ${error.message || response.statusText}`)
    }

    const result = await response.json()
    console.log('アップロード成功:', result)
  } catch (error) {
    console.error('エラー:', error)
    process.exit(1)
  }
}

// コマンドライン引数からファイルパスを取得
const filePath = process.argv[2]
if (!filePath) {
  console.error('使用方法: ts-node upload-article.ts <記事のMarkdownファイルパス>')
  process.exit(1)
}

uploadArticle(filePath) 