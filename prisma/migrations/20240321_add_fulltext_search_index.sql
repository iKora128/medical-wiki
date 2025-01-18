-- 記事のフルテキスト検索用インデックス
CREATE INDEX idx_article_tsv ON "Article" 
USING GIN (to_tsvector('english', "title" || ' ' || "content"));

-- 質問のフルテキスト検索用インデックス
CREATE INDEX idx_question_tsv ON "Question" 
USING GIN (to_tsvector('english', "title" || ' ' || "content")); 