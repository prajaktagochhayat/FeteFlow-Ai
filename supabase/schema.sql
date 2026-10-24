-- ==============================================================================
-- FêteFlow AI - Supabase PostgreSQL Schema & Security Policies
-- Run this script in your Supabase project's SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Create Celebrations Table
CREATE TABLE IF NOT EXISTS public.celebrations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT DEFAULT '',
  guest_count INTEGER DEFAULT 1,
  setting TEXT DEFAULT 'undecided',
  duration TEXT DEFAULT '1 Day',
  priorities JSONB DEFAULT '[]'::jsonb,
  atmosphere_vision TEXT DEFAULT '',
  event_concept JSONB NOT NULL DEFAULT '{}'::jsonb,
  budget JSONB NOT NULL DEFAULT '{}'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  vendor_checklist JSONB DEFAULT '[]'::jsonb,
  personalized_ideas JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  next_actions JSONB DEFAULT '[]'::jsonb,
  guests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
-- This strictly guarantees multi-tenant data isolation per authenticated user.
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies
-- Users can only read their own celebrations
CREATE POLICY "Users can view own celebrations"
  ON public.celebrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert celebrations tagged with their own user_id
CREATE POLICY "Users can insert own celebrations"
  ON public.celebrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own celebrations
CREATE POLICY "Users can update own celebrations"
  ON public.celebrations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own celebrations
CREATE POLICY "Users can delete own celebrations"
  ON public.celebrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create an index on user_id for high performance queries
CREATE INDEX IF NOT EXISTS idx_celebrations_user_id ON public.celebrations(user_id);
CREATE INDEX IF NOT EXISTS idx_celebrations_created_at ON public.celebrations(created_at DESC);

-- 5. Trigger for updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_celebrations_updated_at ON public.celebrations;
CREATE TRIGGER trigger_celebrations_updated_at
  BEFORE UPDATE ON public.celebrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Verification query
COMMENT ON TABLE public.celebrations IS 'FêteFlow AI Celebrations store with strict user_id RLS isolation';
