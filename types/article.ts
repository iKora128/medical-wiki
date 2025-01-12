export type Article = {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  references: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface ArticleMetadata {
  title: string;
  tags: string[];
  references: string[];
} 