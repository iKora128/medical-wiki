import { customAlphabet } from 'nanoid'

const generateId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

export function generateSlug(title: string): string {
  // Check if title contains Japanese characters
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(title)
  
  if (hasJapanese) {
    // For Japanese titles, generate a random ID
    return generateId()
  }

  // For English titles, convert to slug
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
} 