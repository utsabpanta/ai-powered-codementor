import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
console.log('API Base URL:', API_BASE_URL);

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 120000, // 2 minutes timeout for analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<APIResponse>) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    throw new Error(errorMessage);
  }
);

export interface AnalysisRequest {
  code: string;
  language?: string;
  analysisType?: 'general' | 'security' | 'performance' | 'maintainability';
  preferredProvider?: 'gemini' | 'groq' | 'huggingface' | 'auto';
}

export interface ExplainRequest {
  code: string;
  language?: string;
}

export interface ImprovementRequest {
  code: string;
  language?: string;
  context?: string;
}

export interface ReportRequest {
  analysisResults: any[];
  projectInfo?: {
    name?: string;
    language?: string;
    framework?: string;
    description?: string;
  };
}

export interface AnalysisResponse {
  analysis: string;
  metadata: {
    language: string;
    analysisType: string;
    timestamp: string;
  };
}

export interface ExplainResponse {
  explanation: string;
  metadata: {
    language: string;
    timestamp: string;
  };
}

export interface ImprovementResponse {
  suggestions: string;
  metadata: {
    language: string;
    context: string;
    timestamp: string;
  };
}

export interface ReportResponse {
  report: string;
  metadata: {
    projectInfo: any;
    generatedAt: string;
    resultsCount: number;
  };
}

class ApiService {
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get<{ status: string; timestamp: string }>(`${API_BASE_URL}/health`);
    return response.data;
  }

  // Analyze code
  async analyzeCode(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await api.post<APIResponse<AnalysisResponse>>('/analysis/analyze', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Analysis failed');
    }
    return response.data.data!;
  }

  // Explain code
  async explainCode(request: ExplainRequest): Promise<ExplainResponse> {
    const response = await api.post<APIResponse<ExplainResponse>>('/analysis/explain', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Code explanation failed');
    }
    return response.data.data!;
  }

  // Get improvement suggestions
  async suggestImprovements(request: ImprovementRequest): Promise<ImprovementResponse> {
    const response = await api.post<APIResponse<ImprovementResponse>>('/analysis/improve', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Improvement suggestions failed');
    }
    return response.data.data!;
  }

  // Generate comprehensive report
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    const response = await api.post<APIResponse<ReportResponse>>('/analysis/report', request);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Report generation failed');
    }
    return response.data.data!;
  }

  // Helper method to read file contents
  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Analyze multiple files
  async analyzeMultipleFiles(
    files: { file: File; language: string }[],
    analysisType: 'general' | 'security' | 'performance' | 'maintainability' = 'general',
    preferredProvider: 'gemini' | 'groq' | 'huggingface' | 'auto' = 'auto'
  ): Promise<AnalysisResponse[]> {
    const results: AnalysisResponse[] = [];

    for (const { file, language } of files) {
      try {
        const content = await this.readFileContent(file);
        const analysis = await this.analyzeCode({
          code: content,
          language,
          analysisType,
          preferredProvider
        });
        results.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze file ${file.name}:`, error);
        throw error;
      }
    }

    return results;
  }
}

export const apiService = new ApiService();
export default apiService;