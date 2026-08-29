/**
 * Shapes for the JSON an AI provider returns inside its analysis text.
 * Every field is optional: providers are prompted for this structure but
 * are not guaranteed to produce it, so consumers must narrow before use.
 */
export interface Issue {
  type?: string;
  severity?: string;
  description?: string;
  message?: string;
  line?: number;
  codeSnippet?: string;
  suggestion?: string;
  references?: string[];
}

export interface ParsedAnalysis {
  quality_score?: number;
  summary?: string;
  issues?: Issue[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface ProjectInfo {
  name?: string;
  language?: string;
  framework?: string;
  description?: string;
}
