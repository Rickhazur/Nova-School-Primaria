
import React from 'react';

export type Language = 'es' | 'en' | 'bilingual';
export type UserLevel = 'primary' | 'bachillerato' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  level: UserLevel;
  avatar?: string;
  points: number; // For gamification
  subscriptionTier: 'FREE' | 'PREMIUM' | 'INSTITUTION';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  usageQuota: {
    aiQueries: number;
    flashcardsGenerated: number;
    lastResetDate: string;
  };
}

export const FREE_TIER_LIMITS = {
  DAILY_AI_QUERIES: 5,
  DAILY_FLASHCARDS: 3,
  ALLOW_DIAGNOSTIC: false,
};

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCHEDULE = 'SCHEDULE',
  CURRICULUM = 'CURRICULUM',
  AI_CONSULTANT = 'AI_CONSULTANT',
  METRICS = 'METRICS',
  PROGRESS = 'PROGRESS',
  DIAGNOSTIC = 'DIAGNOSTIC',
  SOCIAL = 'SOCIAL',
  FLASHCARDS = 'FLASHCARDS',
  REWARDS = 'REWARDS',
  SETTINGS = 'SETTINGS',
  PRICING = 'PRICING',
  REPOSITORY = 'REPOSITORY',
  WHITEBOARD = 'WHITEBOARD',
  TEACHER_REPORT = 'TEACHER_REPORT',
  PAYMENTS = 'PAYMENTS',
  RESEARCH = 'RESEARCH'
}

export interface AppMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  type: 'SUPPORT_TICKET' | 'ADMIN_ALERT' | 'SYSTEM_NOTIFY' | 'ADMIN_REPLY';
  timestamp: string;
  read: boolean;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  image?: string; // Base64 string for vision tasks
  groundingMetadata?: {
    groundingChunks: GroundingChunk[];
  };
}

export interface ScheduleBlock {
  time: string;
  activity: string;
  type: 'academic' | 'break' | 'skills' | 'wellness';
  description: string;
}

export interface Infraction {
  id: string;
  type: 'ACADEMIC_DISHONESTY' | 'LATENESS' | 'UNPREPARED' | 'DISTRACTION' | 'OFF_TOPIC';
  description: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  category: 'avatar' | 'theme' | 'coupon' | 'real';
  image?: string; // Emoji or URL
  color?: string;
  owned: boolean;
  minLevel?: number;
}

export interface Assignment {
  title: string;
  description: string;
  dueDate: string;
  timestamp: number;
}

// Nueva interfaz para Planes
export interface EducationalPlan {
  id: string;
  name: string;
  description: string;
  allowedViews: string[]; // List of ViewState IDs
}

export const SCHOOL_VALUES = [
  "Autonomía",
  "Excelencia",
  "Curiosidad",
  "Resiliencia",
  "Colaboración",
  "Impacto Social",
  "Felicidad"
];

// --- CURRICULUM INTERFACES (Moved from Curriculum.tsx) ---

export interface AIClassBlueprint {
  hook: string;
  development: string;
  practice: string;
  closure: string;
  differentiation: string;
}

export interface ClassSession {
  id: number;
  title: string;
  duration: string;
  topic: string;
  blueprint: AIClassBlueprint;
  isRemedial?: boolean;
  isEvaluation?: boolean;
  isWrittenExam?: boolean;
  questions?: { id: number; text: string; options: string[] }[];
  isLocked?: boolean;
  score?: number; // 0-100 score for Mastery Learning
}

export interface Module {
  id: number;
  name: string;
  level: string;
  focus: string;
  classes: ClassSession[];
}

export interface SkillTrack {
  id: string;
  name: string;
  overview: string;
  modules: Module[];
}

export interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  tracks: SkillTrack[];
  colorTheme: 'amber' | 'sky' | 'rose' | 'emerald' | 'indigo' | 'fuchsia' | 'teal' | 'violet';
}

// --- PHASE 2: RESEARCH SYSTEM TYPES ---

export interface ResearchSource {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  author?: string;
  url: string;
  domain: string;
  dateAccessed: string;
  datePublished?: string;
  notes?: string;
  highlights: string[];
  screenshots: string[];
  createdAt: string;
}

export interface ResearchSession {
  id: string;
  userId: string;
  projectId?: string;
  startTime: string;
  endTime?: string;
  visitedUrls: {
    url: string;
    title: string;
    timestamp: string;
    duration: number;
  }[];
  savedHighlights: {
    text: string;
    url: string;
    timestamp: string;
  }[];
}

export interface PlagiarismCheck {
  id: string;
  userId: string;
  projectId?: string;
  studentText: string;
  sources: ResearchSource[];
  results: {
    overallSimilarity: number;
    matches: {
      sourceId: string;
      sourceTitle: string;
      matchedText: string;
      studentText: string;
      similarity: number;
      startIndex: number;
      endIndex: number;
    }[];
  };
  timestamp: string;
}

export interface ParaphrasingAttempt {
  id: string;
  userId: string;
  projectId?: string;
  originalText: string;
  paraphrasedVersions: {
    text: string;
    readingLevel: string;
    explanations: string[];
    vocabularySuggestions: string[];
  }[];
  selectedVersion?: number;
  timestamp: string;
}

export interface Citation {
  source: ResearchSource;
  format: 'kid-friendly' | 'mla' | 'apa';
  text: string;
}

export type CitationFormat = 'kid-friendly' | 'mla' | 'apa';
