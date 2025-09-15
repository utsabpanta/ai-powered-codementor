import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Temporary interfaces until shared package is working
interface CodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified?: number;
  file?: File; // Reference to original File object
}

interface AnalysisIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'maintainability' | 'bugs' | 'style' | 'architecture';
  title: string;
  description: string;
  explanation?: string;
  file: string;
  line?: number;
  column?: number;
  codeSnippet?: string;
  suggestion?: string;
  references?: string[];
}

interface QualityMetrics {
  complexity: {
    cyclomatic: number;
    cognitive: number;
  };
  maintainability: {
    score: number; // 0-100
  };
  technical_debt: {
    hours: number;
    issues: number;
  };
  lines_of_code: {
    total: number;
    source: number;
    comments: number;
    blank: number;
  };
}

interface AnalysisResult {
  id: string;
  timestamp: string;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    filesAnalyzed: number;
    overallScore: number; // 0-100
    recommendations: string[];
  };
  issues: AnalysisIssue[];
  metrics: QualityMetrics;
  processing_time: number;
}

interface AnalysisStore {
  // State
  files: CodeFile[];
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  uploadId: string | null;
  selectedFile: string | null;
  
  // Actions
  setFiles: (files: CodeFile[]) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  setUploadId: (uploadId: string | null) => void;
  setSelectedFile: (fileId: string | null) => void;
  reset: () => void;
  
  // File operations
  addFile: (file: CodeFile) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<CodeFile>) => void;
  
  // Analysis operations
  startAnalysis: () => void;
  completeAnalysis: (result: AnalysisResult) => void;
  failAnalysis: (error: string) => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  devtools(
    (set) => ({
      // Initial state
      files: [],
      analysis: null,
      isAnalyzing: false,
      error: null,
      uploadId: null,
      selectedFile: null,

      // Basic setters
      setFiles: (files) => set({ files }),
      setAnalysis: (analysis) => set({ analysis }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setError: (error) => set({ error }),
      setUploadId: (uploadId) => set({ uploadId }),
      setSelectedFile: (selectedFile) => set({ selectedFile }),

      // Reset everything
      reset: () => set({
        files: [],
        analysis: null,
        isAnalyzing: false,
        error: null,
        uploadId: null,
        selectedFile: null,
      }),

      // File operations
      addFile: (file) => set((state) => ({
        files: [...state.files, file]
      })),

      removeFile: (fileId) => set((state) => ({
        files: state.files.filter(f => f.id !== fileId),
        selectedFile: state.selectedFile === fileId ? null : state.selectedFile
      })),

      updateFile: (fileId, updates) => set((state) => ({
        files: state.files.map(f => 
          f.id === fileId ? { ...f, ...updates } : f
        )
      })),

      // Analysis operations
      startAnalysis: () => set({
        isAnalyzing: true,
        error: null,
        analysis: null,
      }),

      completeAnalysis: (result) => set({
        isAnalyzing: false,
        analysis: result,
        error: null,
      }),

      failAnalysis: (error) => set({
        isAnalyzing: false,
        error,
        analysis: null,
      }),
    }),
    {
      name: 'analysis-store',
    }
  )
);

// Selectors for derived state
export const useFiles = () => useAnalysisStore((state) => state.files);
export const useAnalysis = () => useAnalysisStore((state) => state.analysis);
export const useIsAnalyzing = () => useAnalysisStore((state) => state.isAnalyzing);
export const useError = () => useAnalysisStore((state) => state.error);
export const useSelectedFile = () => useAnalysisStore((state) => state.selectedFile);

// Computed selectors
export const useFileCount = () => useAnalysisStore((state) => state.files.length);
export const useTotalFileSize = () => useAnalysisStore((state) => 
  state.files.reduce((total, file) => total + file.size, 0)
);
export const useLanguageStats = () => useAnalysisStore((state) => {
  const stats: Record<string, number> = {};
  state.files.forEach(file => {
    stats[file.language] = (stats[file.language] || 0) + 1;
  });
  return stats;
});