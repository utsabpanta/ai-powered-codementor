import Groq from 'groq-sdk';

interface GroqConfig {
  apiKey?: string;
  model: string;
}

class GroqService {
  private client: Groq | null = null;
  private config: GroqConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile' // Latest available model
    };

    if (!this.config.apiKey) {
      console.warn('Warning: GROQ_API_KEY is not set. Groq service will not be available.');
      return;
    }

    this.client = new Groq({
      apiKey: this.config.apiKey
    });
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async analyzeCode(
    code: string,
    language: string = 'javascript',
    analysisType: 'general' | 'security' | 'performance' | 'maintainability' = 'general'
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Groq client not initialized - missing API key');
    }

    try {
      const prompt = this.buildAnalysisPrompt(code, language, analysisType);

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.config.model,
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'No analysis generated';

    } catch (error) {
      console.error('Error analyzing code with Groq:', error);
      throw new Error(`Groq analysis failed: ${(error as Error).message}`);
    }
  }

  async explainCode(code: string, language: string = 'javascript'): Promise<string> {
    if (!this.client) {
      throw new Error('Groq client not initialized - missing API key');
    }

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

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.config.model,
        temperature: 0.3,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'No explanation generated';

    } catch (error) {
      console.error('Error explaining code with Groq:', error);
      throw new Error(`Groq explanation failed: ${(error as Error).message}`);
    }
  }

  async suggestImprovements(code: string, language: string = 'javascript', context: string = ''): Promise<string> {
    if (!this.client) {
      throw new Error('Groq client not initialized - missing API key');
    }

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

      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.config.model,
        temperature: 0.4,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'No suggestions generated';

    } catch (error) {
      console.error('Error suggesting improvements with Groq:', error);
      throw new Error(`Groq improvement suggestions failed: ${(error as Error).message}`);
    }
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
}

export default new GroqService();