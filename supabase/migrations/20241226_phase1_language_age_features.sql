-- Phase 1 Migration: Language Preferences & Age Settings
-- Nova Schola Primaria - Primary School Features

-- Add language preference column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'es' CHECK (language_preference IN ('es', 'en', 'bilingual'));

-- Add student age column to profiles table (for primary students)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_age INTEGER DEFAULT 8 CHECK (student_age >= 6 AND student_age <= 11);

-- Add TTS settings column (JSON for voice preferences)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tts_settings JSONB DEFAULT '{"rate": 1.0, "pitch": 1.0, "volume": 1.0, "enabled": true}'::jsonb;

-- Update existing primary students with default values
UPDATE profiles 
SET language_preference = 'es', 
    student_age = 8,
    tts_settings = '{"rate": 1.0, "pitch": 1.0, "volume": 1.0, "enabled": true}'::jsonb
WHERE level = 'primary' 
AND (language_preference IS NULL OR student_age IS NULL);

-- Create index for faster language queries
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language_preference);

-- Add comment for documentation
COMMENT ON COLUMN profiles.language_preference IS 'Student language preference: es (Spanish), en (English), or bilingual (both)';
COMMENT ON COLUMN profiles.student_age IS 'Student age (6-11 years) for age-adaptive content and TTS';
COMMENT ON COLUMN profiles.tts_settings IS 'Text-to-speech settings including rate, pitch, volume, and enabled status';
