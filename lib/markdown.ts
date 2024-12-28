import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export async function parseMarkdown(markdown: string) {
  const { data, content } = matter(markdown);
  const processedContent = await remark()
    .use(html)
    .process(content);
  
  return {
    metadata: data,
    content: processedContent.toString()
  };
} 