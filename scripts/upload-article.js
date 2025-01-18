import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a CSV file path');
    process.exit(1);
  }

  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId) {
    console.error('Please set ADMIN_USER_ID environment variable');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  for (const record of records) {
    const tags = record.tags.split(',').map(tag => tag.trim());
    
    const article = await prisma.article.create({
      data: {
        title: record.title,
        content: record.content,
        slug: record.title.toLowerCase().replace(/\s+/g, '-'),
        status: record.status,
        authorId: adminUserId,
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });

    console.log(`Created article: ${article.title}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 