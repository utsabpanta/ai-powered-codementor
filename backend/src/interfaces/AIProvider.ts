import { AnalysisType, ProjectInfo } from '../types/analysis';

/**
 * Interface that all AI providers must implement
 */
export interface AIProvider {
  /**
   * Check if the provider is available and configured
   */
  isAvailable(): boolean;

  /**
   * Analyze code and return structured results
   */
  analyzeCode(
    code: string,
    language: string,
    analysisType: AnalysisType
  ): Promise<string>;

  /**
   * Explain code functionality
   */
  explainCode(code: string, language: string): Promise<string>;

  /**
   * Suggest improvements for code
   */
  suggestImprovements(
    code: string,
    language: string,
    context?: string
  ): Promise<string>;

  /**
   * Generate comprehensive report from analysis results
   */
  generateReport?(
    analysisResults: any[],
    projectInfo?: ProjectInfo
  ): Promise<string>;
}

/**
 * Provider configuration for the AI service
 */
export interface ProviderConfiguration {
  name: string;
  service: AIProvider;
  priority: number;
  checkAvailable?: () => boolean;
}