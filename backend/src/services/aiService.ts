import geminiService from './geminiService';
import groqService from './groqService';
import huggingFaceService from './huggingFaceService';
import { AnalysisRequest, ProcessedAnalysisResult, ProjectInfo } from '../types/analysis';
import { ProviderConfiguration } from '../interfaces/AIProvider';

class AIService {
  private providers: ProviderConfiguration[] = [
    { name: 'Gemini', service: geminiService, priority: 1 },
    { name: 'Groq', service: groqService, priority: 2, checkAvailable: () => groqService.isAvailable() },
    { name: 'HuggingFace', service: huggingFaceService, priority: 3 }
  ];

  private getAvailableProviders(): ProviderConfiguration[] {
    return this.providers
      .filter(provider => !provider.checkAvailable || provider.checkAvailable())
      .sort((a, b) => a.priority - b.priority);
  }

  private async executeWithFallback<T>(
    operation: (provider: ProviderConfiguration) => Promise<T>,
    preferredProvider?: string
  ): Promise<{ result: T; provider: string }> {
    let sortedProviders = this.getAvailableProviders();

    // Move preferred provider to front if specified
    if (preferredProvider && preferredProvider !== 'auto') {
      const preferredIndex = sortedProviders.findIndex(p =>
        p.name.toLowerCase() === preferredProvider.toLowerCase()
      );

      if (preferredIndex > -1) {
        const preferred = sortedProviders.splice(preferredIndex, 1)[0];
        sortedProviders = [preferred, ...sortedProviders];
      }
    }

    let lastError: Error | null = null;

    for (const provider of sortedProviders) {
      try {
        console.log(`Attempting operation with ${provider.name}...`);
        const result = await operation(provider);
        console.log(`✅ Operation successful with ${provider.name}`);
        return { result, provider: provider.name };

      } catch (error) {
        console.warn(`❌ ${provider.name} failed:`, (error as Error).message);
        lastError = error as Error;

        // Continue to next provider for rate limits or quota errors
        if (error instanceof Error && (
          error.message.includes('429') ||
          error.message.includes('quota') ||
          error.message.includes('rate limit')
        )) {
          console.log(`🔄 Rate limit detected for ${provider.name}, trying next provider...`);
          continue;
        }

        continue;
      }
    }

    throw new Error(
      lastError
        ? `All AI providers failed. Last error: ${lastError.message}`
        : 'No AI providers available'
    );
  }

  async analyzeCode(request: AnalysisRequest): Promise<ProcessedAnalysisResult> {
    const { code, language = 'javascript', analysisType = 'general', preferredProvider = 'auto' } = request;

    const { result: analysis, provider } = await this.executeWithFallback(
      async (provider) => provider.service.analyzeCode(code, language, analysisType),
      preferredProvider
    );

    return {
      analysis,
      provider,
      metadata: {
        language,
        analysisType,
        timestamp: new Date().toISOString()
      }
    };
  }

  async explainCode(code: string, language: string = 'javascript'): Promise<ProcessedAnalysisResult> {
    const { result: explanation, provider } = await this.executeWithFallback(
      async (provider) => provider.service.explainCode(code, language)
    );

    return {
      analysis: explanation,
      provider,
      metadata: {
        language,
        analysisType: 'explanation',
        timestamp: new Date().toISOString()
      }
    };
  }

  async suggestImprovements(code: string, language: string = 'javascript', context: string = ''): Promise<ProcessedAnalysisResult> {
    const { result: suggestions, provider } = await this.executeWithFallback(
      async (provider) => provider.service.suggestImprovements(code, language, context)
    );

    return {
      analysis: suggestions,
      provider,
      metadata: {
        language,
        analysisType: 'improvements',
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateReport(analysisResults: any[], projectInfo?: ProjectInfo): Promise<ProcessedAnalysisResult> {
    const { result: report, provider } = await this.executeWithFallback(
      async (provider) => {
        // Check if provider supports report generation
        if (provider.service.generateReport) {
          return provider.service.generateReport(analysisResults, projectInfo);
        }
        throw new Error('Report generation not supported by this provider');
      }
    );

    return {
      analysis: report,
      provider,
      metadata: {
        language: 'multiple',
        analysisType: 'report',
        timestamp: new Date().toISOString()
      }
    };
  }

  getAvailableProviderNames(): string[] {
    return this.getAvailableProviders().map(provider => provider.name);
  }
}

export default new AIService();