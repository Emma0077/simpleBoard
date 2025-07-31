-- SimpleBoard Database Schema
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (RLS) for better security
-- Note: We're not using auth, so we'll create open policies

-- Content types enum (확장)
CREATE TYPE content_type AS ENUM ('text', 'image', 'link', 'file');

-- Create boards table
CREATE TABLE IF NOT EXISTS public.boards (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    created_by_identifier UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id VARCHAR(255) NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    position INTEGER DEFAULT 0,
    created_by_identifier UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create content_items table (확장)
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type content_type NOT NULL,
    content TEXT,
    title VARCHAR(500),
    image_url TEXT,
    link_url TEXT,
    file_url TEXT,
    file_name VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    author_name VARCHAR(100),
    user_identifier UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create likes table for content items
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    user_identifier UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(content_item_id, user_identifier)
);

-- Create indexes for boards table
CREATE INDEX IF NOT EXISTS idx_boards_created_by ON public.boards(created_by_identifier);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON public.boards(created_at DESC);

-- Create indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_board_id ON public.categories(board_id);
CREATE INDEX IF NOT EXISTS idx_categories_position ON public.categories(board_id, position);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories(created_at DESC);

-- Create indexes for content_items table
CREATE INDEX IF NOT EXISTS idx_content_items_board_id ON public.content_items(board_id);
CREATE INDEX IF NOT EXISTS idx_content_items_category_id ON public.content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON public.content_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_user_identifier ON public.content_items(user_identifier);

-- Create indexes for likes table
CREATE INDEX IF NOT EXISTS idx_likes_content_item_id ON public.likes(content_item_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_identifier ON public.likes(user_identifier);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- Create a composite index for board and creation time (most common query)
CREATE INDEX IF NOT EXISTS idx_content_items_board_created ON public.content_items(board_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_category_created ON public.content_items(category_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (since we don't have auth, allow all operations)
-- In a production environment, you might want to add more restrictive policies

-- Boards policies
CREATE POLICY "Allow read access for all users" ON public.boards
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access for all users" ON public.boards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON public.boards
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete access for all users" ON public.boards
    FOR DELETE USING (true);

-- Categories policies
CREATE POLICY "Allow read access for all users" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access for all users" ON public.categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON public.categories
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete access for all users" ON public.categories
    FOR DELETE USING (true);

-- Content items policies
CREATE POLICY "Allow read access for all users" ON public.content_items
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access for all users" ON public.content_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access for own content" ON public.content_items
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete access for own content" ON public.content_items
    FOR DELETE USING (true);

-- Likes policies
CREATE POLICY "Allow read access for all users" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access for all users" ON public.likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete access for own likes" ON public.likes
    FOR DELETE USING (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_boards_updated_at ON public.boards;
CREATE TRIGGER update_boards_updated_at
    BEFORE UPDATE ON public.boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON public.content_items;
CREATE TRIGGER update_content_items_updated_at
    BEFORE UPDATE ON public.content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;

-- Create a view for content items with like counts
CREATE OR REPLACE VIEW public.content_items_with_likes AS
SELECT 
    ci.*,
    COALESCE(like_counts.like_count, 0) AS like_count,
    EXTRACT(EPOCH FROM (NOW() - ci.created_at)) AS age_seconds
FROM public.content_items ci
LEFT JOIN (
    SELECT 
        content_item_id,
        COUNT(*) AS like_count
    FROM public.likes
    GROUP BY content_item_id
) like_counts ON ci.id = like_counts.content_item_id;

-- Optional: Create a view for better querying (if needed in the future)
CREATE OR REPLACE VIEW public.content_items_with_stats AS
SELECT 
    *,
    EXTRACT(EPOCH FROM (NOW() - created_at)) AS age_seconds
FROM public.content_items;

-- Grant necessary permissions (if using RLS with service role)
GRANT ALL ON public.boards TO anon;
GRANT ALL ON public.boards TO authenticated;
GRANT ALL ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.content_items TO anon;
GRANT ALL ON public.content_items TO authenticated;
GRANT ALL ON public.likes TO anon;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.content_items_with_likes TO anon;
GRANT ALL ON public.content_items_with_likes TO authenticated;
GRANT ALL ON public.content_items_with_stats TO anon;
GRANT ALL ON public.content_items_with_stats TO authenticated; 