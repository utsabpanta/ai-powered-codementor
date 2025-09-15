import { AnalysisType, ProviderType } from '../types/analysis';

/**
 * Validation utilities for request data
 */

export const validateCode = (code: any): string | null => {
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return 'Code is required and must be a non-empty string';
  }

  if (code.length > 2000000) { // 2MB limit
    return 'Code is too large. Maximum size is 2MB';
  }

  return null;
};

export const validateLanguage = (language: any): string => {
  if (!language || typeof language !== 'string') {
    return 'javascript'; // Default language
  }

  const supportedLanguages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'html', 'css', 'scss', 'json',
    'markdown', 'sql', 'bash', 'text'
  ];

  return supportedLanguages.includes(language.toLowerCase())
    ? language.toLowerCase()
    : 'javascript';
};

export const validateAnalysisType = (analysisType: any): AnalysisType => {
  const validTypes: AnalysisType[] = ['general', 'security', 'performance', 'maintainability'];
  return validTypes.includes(analysisType) ? analysisType : 'general';
};

export const validateProviderType = (provider: any): ProviderType => {
  const validProviders: ProviderType[] = ['gemini', 'groq', 'huggingface', 'auto'];
  return validProviders.includes(provider) ? provider : 'auto';
};

export const validateAnalysisResults = (results: any): string | null => {
  if (!results || !Array.isArray(results)) {
    return 'Analysis results must be provided as an array';
  }

  if (results.length === 0) {
    return 'Analysis results array cannot be empty';
  }

  if (results.length > 50) { // Reasonable limit
    return 'Too many analysis results. Maximum is 50';
  }

  return null;
};