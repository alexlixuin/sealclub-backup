-- Create news table for storing news articles and updates
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add this to make author_id nullable if the table already exists
ALTER TABLE public.news ALTER COLUMN author_id DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);

-- Create RLS policies
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published news
CREATE POLICY "Public can view published news" ON news
  FOR SELECT USING (status = 'published');

-- Policy for authenticated users to view all news (for admin)
CREATE POLICY "Authenticated users can view all news" ON news
  FOR SELECT TO authenticated USING (true);

-- Policy for authenticated users to insert news (admin only)
CREATE POLICY "Authenticated users can insert news" ON news
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy for authenticated users to update news (admin only)
CREATE POLICY "Authenticated users can update news" ON news
  FOR UPDATE TO authenticated USING (true);

-- Policy for authenticated users to delete news (admin only)
CREATE POLICY "Authenticated users can delete news" ON news
  FOR DELETE TO authenticated USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at 
  BEFORE UPDATE ON news 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
