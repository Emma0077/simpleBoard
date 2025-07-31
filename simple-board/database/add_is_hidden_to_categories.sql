-- Add is_hidden column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Create index for is_hidden column for better performance
CREATE INDEX IF NOT EXISTS idx_categories_is_hidden ON public.categories(is_hidden);
CREATE INDEX IF NOT EXISTS idx_categories_board_hidden ON public.categories(board_id, is_hidden); 