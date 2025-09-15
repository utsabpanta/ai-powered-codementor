import config from '../config/config';

interface HuggingFaceConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
}

class HuggingFaceService {
  private config: HuggingFaceConfig;

  constructor() {
    this.config = {
      apiKey: process.env.HUGGINGFACE_API_KEY,
      baseUrl: 'https://api-inference.huggingface.co/models',
      model: 'bigcode/starcoder2-15b' // Better model for code analysis
    };
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  async analyzeCode(code: string, language: string = 'javascript'): Promise<string> {
    try {
      const prompt = `Analyze this ${language} code for quality, security, and performance issues. Provide specific recommendations:\n\n${code}`;

      const response = await fetch(`${this.config.baseUrl}/${this.config.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const result = await response.json() as any;
      return result[0]?.generated_text || 'Unable to analyze code with Hugging Face API';

    } catch (error) {
      console.error('Hugging Face analysis error:', error);
      throw new Error(`Hugging Face analysis failed: ${(error as Error).message}`);
    }
  }

  async explainCode(code: string, language: string = 'javascript'): Promise<string> {
    const prompt = `Explain what this ${language} code does in simple terms:\n\n${code}`;
    return this.analyzeCode(prompt, language);
  }

  async suggestImprovements(code: string, language: string = 'javascript', context: string = ''): Promise<string> {
    const prompt = `Suggest improvements for this ${language} code. Context: ${context}\n\nFocus on:\n1. Performance optimizations\n2. Best practices\n3. Code quality improvements\n4. Security enhancements\n\nCode:\n${code}`;
    return this.analyzeCode(prompt, language);
  }
}

export default new HuggingFaceService();