-- Phase 1 Migration: Step Validation Tracking for Dual Whiteboard System
-- Nova Schola Primaria - Intelligent Board with Step-by-Step Validation

-- Create step_validations table to track student problem-solving progress
CREATE TABLE IF NOT EXISTS step_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id VARCHAR(100) NOT NULL,
    problem_title TEXT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    
    -- Step information
    total_steps INTEGER NOT NULL DEFAULT 4,
    current_step INTEGER NOT NULL DEFAULT 1,
    completed_steps INTEGER NOT NULL DEFAULT 0,
    
    -- Step details (JSON array of step objects)
    steps_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Validation tracking
    attempts_count INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    
    -- Canvas snapshots (Base64 images for each step)
    student_work_snapshots JSONB DEFAULT '[]'::jsonb,
    nova_guidance_snapshots JSONB DEFAULT '[]'::jsonb,
    
    -- Session metadata
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER,
    
    -- Performance metrics
    accuracy_score DECIMAL(5,2), -- Percentage of correct first attempts
    help_score DECIMAL(5,2), -- Score considering hints used
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_step_validations_student ON step_validations(student_id);
CREATE INDEX IF NOT EXISTS idx_step_validations_status ON step_validations(status);
CREATE INDEX IF NOT EXISTS idx_step_validations_subject ON step_validations(subject);
CREATE INDEX IF NOT EXISTS idx_step_validations_created ON step_validations(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_step_validation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_step_validation_timestamp ON step_validations;
CREATE TRIGGER trigger_update_step_validation_timestamp
    BEFORE UPDATE ON step_validations
    FOR EACH ROW
    EXECUTE FUNCTION update_step_validation_timestamp();

-- Add comments for documentation
COMMENT ON TABLE step_validations IS 'Tracks student progress through step-by-step problem solving in the dual whiteboard system';
COMMENT ON COLUMN step_validations.steps_data IS 'JSON array containing step details: [{step: 1, validated: true, attempts: 2, feedback: "...", timestamp: "..."}]';
COMMENT ON COLUMN step_validations.student_work_snapshots IS 'JSON array of Base64-encoded canvas snapshots from student board';
COMMENT ON COLUMN step_validations.nova_guidance_snapshots IS 'JSON array of Base64-encoded canvas snapshots from Nova guidance board';
COMMENT ON COLUMN step_validations.accuracy_score IS 'Percentage of steps completed correctly on first attempt';
COMMENT ON COLUMN step_validations.help_score IS 'Overall score factoring in hints and attempts (higher is better)';

-- Grant permissions (adjust based on your RLS policies)
-- Example: Allow students to insert and update their own validations
-- ALTER TABLE step_validations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Students can manage their own validations" ON step_validations
--     FOR ALL USING (auth.uid() = student_id);
