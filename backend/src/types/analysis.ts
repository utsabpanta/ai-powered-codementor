// Core analysis types and interfaces

export type AnalysisType = 'general' | 'security' | 'performance' | 'maintainability';
export type ProviderType = 'gemini' | 'groq' | 'huggingface' | 'auto';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueType = 'bug' | 'performance' | 'security' | 'style' | 'maintainability';

export interface Issue {
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  line?: number;
  suggestion: string;
  codeSnippet?: string;
  references?: string[];
}

export interface AnalysisRequest {
  code: string;
  language?: string;
  analysisType?: AnalysisType;
  preferredProvider?: ProviderType;
}

export interface AnalysisResult {
  quality_score: number;
  issues: Issue[];
  summary: string;
  recommendations: string[];
}

export interface ProcessedAnalysisResult {
  analysis: string;
  provider: string;
  metadata: {
    language: string;
    analysisType: string;
    timestamp: string;
  };
}

export interface ProjectInfo {
  name?: string;
  language?: string;
  framework?: string;
  description?: string;
}

export interface ReportRequest {
  analysisResults: any[];
  projectInfo?: ProjectInfo;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProviderConfig {
  apiKey: string;
  isConfigured: boolean;
}

export interface ProviderStatus {
  available_providers: string[];
  provider_configs: Record<string, boolean>;
}