-- RUN THIS IN SUPABASE SQL EDITOR TO FIX FEED JOIN ERRORS
-- This establishes explicit relationships that PostgREST needs for the Feed -> Profiles join.

ALTER TABLE IF EXISTS public.feed_posts 
  DROP CONSTRAINT IF EXISTS feed_posts_user_id_fkey,
  ADD CONSTRAINT feed_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.feed_comments
  DROP CONSTRAINT IF EXISTS feed_comments_user_id_fkey,
  ADD CONSTRAINT feed_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.news_posts
  DROP CONSTRAINT IF EXISTS news_posts_created_by_fkey,
  ADD CONSTRAINT news_posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure RLS is active
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- If you still see errors, visit the Supabase Dashboard -> API Settings -> PostgREST -> Reload Schema.
