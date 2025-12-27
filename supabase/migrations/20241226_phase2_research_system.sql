-- Phase 2: Research System Database Schema
-- Created: 2024-12-26
-- Description: Tables for guided research, citations, plagiarism detection, and paraphrasing

-- =====================================================
-- 1. RESEARCH SOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS research_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  title TEXT NOT NULL,
  author TEXT,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  date_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  date_published TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  highlights TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups by user and project
CREATE INDEX IF NOT EXISTS idx_research_sources_user_id ON research_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_project_id ON research_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_domain ON research_sources(domain);

-- =====================================================
-- 2. RESEARCH SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  visited_urls JSONB DEFAULT '[]'::jsonb,
  saved_highlights JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_project_id ON research_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_start_time ON research_sessions(start_time);

-- =====================================================
-- 3. PLAGIARISM CHECKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS plagiarism_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  student_text TEXT NOT NULL,
  source_ids UUID[] DEFAULT '{}',
  overall_similarity INTEGER NOT NULL DEFAULT 0,
  matches JSONB DEFAULT '[]'::jsonb,
  feedback TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for plagiarism check history
CREATE INDEX IF NOT EXISTS idx_plagiarism_checks_user_id ON plagiarism_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_checks_project_id ON plagiarism_checks(project_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_checks_timestamp ON plagiarism_checks(timestamp);

-- =====================================================
-- 4. PARAPHRASING HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS paraphrasing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  original_text TEXT NOT NULL,
  paraphrased_versions JSONB DEFAULT '[]'::jsonb,
  selected_version INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for paraphrasing history
CREATE INDEX IF NOT EXISTS idx_paraphrasing_history_user_id ON paraphrasing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_paraphrasing_history_project_id ON paraphrasing_history(project_id);
CREATE INDEX IF NOT EXISTS idx_paraphrasing_history_timestamp ON paraphrasing_history(timestamp);

-- =====================================================
-- 5. RESEARCH PROJECTS TABLE (Optional organization)
-- =====================================================
CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project lookups
CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status);

-- =====================================================
-- 6. TRIGGER FUNCTIONS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_research_sources_updated_at ON research_sources;
CREATE TRIGGER update_research_sources_updated_at
  BEFORE UPDATE ON research_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_projects_updated_at ON research_projects;
CREATE TRIGGER update_research_projects_updated_at
  BEFORE UPDATE ON research_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plagiarism_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE paraphrasing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

-- Research Sources Policies
CREATE POLICY "Users can view their own research sources"
  ON research_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research sources"
  ON research_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research sources"
  ON research_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research sources"
  ON research_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Research Sessions Policies
CREATE POLICY "Users can view their own research sessions"
  ON research_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research sessions"
  ON research_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research sessions"
  ON research_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Plagiarism Checks Policies
CREATE POLICY "Users can view their own plagiarism checks"
  ON plagiarism_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plagiarism checks"
  ON plagiarism_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Paraphrasing History Policies
CREATE POLICY "Users can view their own paraphrasing history"
  ON paraphrasing_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own paraphrasing history"
  ON paraphrasing_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Research Projects Policies
CREATE POLICY "Users can view their own research projects"
  ON research_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research projects"
  ON research_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research projects"
  ON research_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research projects"
  ON research_projects FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to get research statistics for a user
CREATE OR REPLACE FUNCTION get_research_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sources', (SELECT COUNT(*) FROM research_sources WHERE user_id = user_uuid),
    'total_sessions', (SELECT COUNT(*) FROM research_sessions WHERE user_id = user_uuid),
    'total_plagiarism_checks', (SELECT COUNT(*) FROM plagiarism_checks WHERE user_id = user_uuid),
    'total_paraphrasing_attempts', (SELECT COUNT(*) FROM paraphrasing_history WHERE user_id = user_uuid),
    'average_similarity_score', (SELECT COALESCE(AVG(overall_similarity), 0) FROM plagiarism_checks WHERE user_id = user_uuid),
    'recent_sources', (
      SELECT json_agg(json_build_object(
        'id', id,
        'title', title,
        'domain', domain,
        'date_accessed', date_accessed
      ))
      FROM (
        SELECT id, title, domain, date_accessed
        FROM research_sources
        WHERE user_id = user_uuid
        ORDER BY created_at DESC
        LIMIT 5
      ) recent
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate session duration
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_research_session_duration ON research_sessions;
CREATE TRIGGER calculate_research_session_duration
  BEFORE UPDATE ON research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- =====================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to add sample data for testing
-- INSERT INTO research_projects (user_id, title, description, subject, due_date)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'The Solar System',
--   'A research project about planets and space',
--   'Science',
--   NOW() + INTERVAL '2 weeks'
-- );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Phase 2 Research System tables created successfully
-- All tables have proper indexes, RLS policies, and relationships
