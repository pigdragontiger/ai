import type React from 'react';

// Main Role definition
export interface EvaluationCriterion {
  id: string;
  name: string;
  levels: Record<number, string>;
}

export interface Role {
  id:string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  evaluationCriteria: EvaluationCriterion[]; 
}

// Selectable option structure
export interface SelectOption<T> {
  id: T;
  name: string;
  description?: string;
}

// Type definitions for various selectors
export type AgencySize = 'small' | 'medium' | 'large';
export type Location = 'seoul' | 'other';
export type EducationLevelId = 'highschool' | 'associate' | 'bachelor' | 'master';
export type EngineerLevelId = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Represents the data structure for the AI's salary prediction result's reasoning
export interface SalaryReasoning {
  summary: string;
  marketAnalysis: string; // This will now hold the baseline market analysis
  competencyAnalysis?: string; // New field for detailed competency breakdown
  comparison: string;
  dataSource: string;
  desiredSalaryAnalysis?: string;
  previousSalaryAnalysis?: string;
}

// Represents the data structure for the AI's salary prediction result
export interface SalaryResultData {
  minSalary: number; // Final adjusted min
  avgSalary: number; // Final adjusted avg
  maxSalary: number; // Final adjusted max
  reasoning: SalaryReasoning;
  desiredSalary?: number;
  previousSalary?: number;
  companyStandard?: SalaryEvaluation | null;
  // New fields for UI rendering
  baselineMinSalary?: number;
  baselineAvgSalary?: number;
  baselineMaxSalary?: number;
  competencyPremium?: number;
  potentialValueGap?: number;
  competencyGrade?: string;
}


// Mode for career info input
export type CareerInputMode = 'auto' | 'manual';

// Active tab type
export type ActiveTab = 'personal' | 'company' | 'guide' | 'proposal';

// Experience tiers for company salary table
export interface ExperienceTier {
    id: string;
    name: string;
}

// Salary range for company salary table based on evaluation
export interface SalaryEvaluation {
    low: number | null;
    middle: number | null;
    high: number | null;
}

// Data structure for a single salary table (Year -> Salary)
export type YearlySalaryTable = Record<string, SalaryEvaluation>;

// Data structure for the entire company salary table, categorized by education level.
export type CompanySalaryTableData = Record<EducationLevelId, YearlySalaryTable>;

// Data structure for planner evaluation details sent to AI
export interface RoleEvaluationDetails {
    [key: string]: {
        name: string;
        score: number;
        description: string;
    }
}
// FIX: Added missing BulkEditFormState interface.
export interface BulkEditFormState {
    baseSalary: number;
    increaseRate: number;
    lowSpread: number;
    highSpread: number;
}

// New type for applicant profile data for the hiring proposal
export interface ApplicantProfile {
  applicantName?: string;
  roleName: string;
  educationName?: string;
  experienceYears: number;
  engineerLevelName: string;
}

// New type for AI-generated hiring proposal content
export interface HiringProposalContent {
  summary: string;
  strengths: string;
  improvements: string;
  rationale: string;
}