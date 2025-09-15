import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config';

interface AnalysisResult {
  quality_score: number;
  issues: Array<{
    type: 'bug' | 'performance' | 'security' | 'style';
    severity: 'low' | 'medium' | 'high';
    description: string;
    line?: number;
    suggestion: string;
  }>;
  summary: string;
  recommendations: string[];
}

interface ProjectInfo {
  name?: string;
  language?: string;
  framework?: string;
  description?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    // Use the correct current model name
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  isAvailable(): boolean {
    return !!config.gemini.apiKey;
  }

  async analyzeCode(
    code: string,
    language: string = 'javascript',
    analysisType: 'general' | 'security' | 'performance' | 'maintainability' = 'general'
  ): Promise<string> {
    try {
      const prompt = this.buildAnalysisPrompt(code, language, analysisType);
      const result = await this.retryWithBackoff(() => this.model.generateContent(prompt));
      const response = await (result as any).response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing code with Gemini:', error);

      // Handle specific quota exceeded error
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('API quota exceeded. Please wait a moment and try again, or check your Gemini API billing.');
      }

      throw new Error(`Code analysis failed: ${(error as Error).message}`);
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isRateLimitError = error instanceof Error &&
          (error.message.includes('429') || error.message.includes('quota'));

        if (isLastAttempt || !isRateLimitError) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private buildAnalysisPrompt(code: string, language: string, analysisType: string): string {
    const basePrompt = `Please analyze the following ${language} code and provide insights based on the analysis type: ${analysisType}`;

    const analysisPrompts: Record<string, string> = {
      general: `${basePrompt}

Please provide:
1. Code quality assessment (1-10 scale)
2. Potential bugs or issues
3. Performance considerations
4. Security vulnerabilities
5. Code maintainability
6. Suggestions for improvement
7. Best practices compliance

Format your response in JSON with the following structure:
{
  "quality_score": number,
  "issues": [{"type": "bug|performance|security|style", "severity": "low|medium|high", "description": "...", "line": number, "suggestion": "..."}],
  "summary": "Overall assessment",
  "recommendations": ["..."]
}`,

      security: `${basePrompt}

Focus on security analysis:
1. Identify security vulnerabilities
2. Check for common security anti-patterns
3. Assess input validation
4. Look for authentication/authorization issues
5. Check for data exposure risks

Format as JSON with security-specific findings.`,

      performance: `${basePrompt}

Focus on performance analysis:
1. Identify performance bottlenecks
2. Memory usage concerns
3. Algorithm efficiency
4. Database query optimization (if applicable)
5. Caching opportunities

Format as JSON with performance-specific findings.`,

      maintainability: `${basePrompt}

Focus on code maintainability:
1. Code readability and clarity
2. Documentation quality
3. Code organization and structure
4. Naming conventions
5. Complexity analysis
6. Refactoring suggestions

Format as JSON with maintainability-specific findings.`
    };

    return `${analysisPrompts[analysisType] || analysisPrompts.general}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
  }

  async generateReport(analysisResults: AnalysisResult[], projectInfo: ProjectInfo = {}): Promise<string> {
    try {
      const prompt = `Generate a comprehensive code analysis report based on the following analysis results:

Analysis Results:
${JSON.stringify(analysisResults, null, 2)}

Project Information:
${JSON.stringify(projectInfo, null, 2)}

Please create a detailed report in markdown format that includes:
1. Executive Summary
2. Overall Code Quality Score
3. Key Findings
4. Security Assessment
5. Performance Analysis
6. Maintainability Score
7. Detailed Issues Breakdown
8. Recommendations and Action Items
9. Conclusion

Make the report professional and actionable for developers.`;

      const result = await this.model.generateContent(prompt);
      const response = await (result as any).response;
      return response.text();
    } catch (error) {
      console.error('Error generating report with Gemini:', error);
      throw new Error(`Report generation failed: ${(error as Error).message}`);
    }
  }

  async explainCode(code: string, language: string = 'javascript'): Promise<string> {
    try {
      const prompt = `Please explain the following ${language} code in detail:

1. What does this code do? (high-level purpose)
2. How does it work? (step-by-step explanation)
3. Key concepts and patterns used
4. Input and output explanation
5. Dependencies and requirements
6. Potential use cases

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Please provide a clear, educational explanation suitable for developers learning this code.`;

      const result = await this.model.generateContent(prompt);
      const response = await (result as any).response;
      return response.text();
    } catch (error) {
      console.error('Error explaining code with Gemini:', error);
      throw new Error(`Code explanation failed: ${(error as Error).message}`);
    }
  }

  async suggestImprovements(code: string, language: string = 'javascript', context: string = ''): Promise<string> {
    try {
      const prompt = `Please suggest improvements for the following ${language} code:

Context: ${context}

Focus on:
1. Code optimization
2. Best practices implementation
3. Readability improvements
4. Performance enhancements
5. Security hardening
6. Error handling improvements
7. Modern language features utilization

Please provide:
- Specific improvement suggestions
- Refactored code examples where applicable
- Explanation of why each improvement is beneficial

Code to improve:
\`\`\`${language}
${code}
\`\`\``;

      const result = await this.model.generateContent(prompt);
      const response = await (result as any).response;
      return response.text();
    } catch (error) {
      console.error('Error suggesting improvements with Gemini:', error);
      throw new Error(`Code improvement suggestions failed: ${(error as Error).message}`);
    }
  }
}

export default new GeminiService();