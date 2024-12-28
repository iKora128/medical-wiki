export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  tags: Tag[];
  references: string[];
  status: 'draft' | 'published' | 'archived';
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