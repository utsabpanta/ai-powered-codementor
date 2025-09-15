import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FolderOpen, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAnalysisStore } from '../store/analysisStore';
import { apiService } from '../services/apiService';
import { processAnalysisResults } from '../utils/analysisUtils';

// Component interfaces
interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
}

type ModelType = 'gemini' | 'groq' | 'huggingface' | 'auto';
type AnalysisType = 'general' | 'security' | 'performance' | 'maintainability';

// Supported file extensions for code analysis
const SUPPORTED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx',
  '.py', '.java', '.cpp', '.c', '.cs',
  '.php', '.rb', '.go', '.rs', '.swift',
  '.html', '.css', '.scss', '.json',
  '.md', '.txt', '.sql', '.sh'
] as const;

// Language mapping for file extensions
const LANGUAGE_MAP: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.php': 'php',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.swift': 'swift',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'bash'
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const { files, setFiles, isAnalyzing, startAnalysis, completeAnalysis, failAnalysis } = useAnalysisStore();
  const [selectedModel, setSelectedModel] = useState<ModelType>('auto');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('general');

  // Utility functions
  const getFileExtension = (filename: string): string => {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  };

  const isCodeFile = (file: File): boolean => {
    const extension = getFileExtension(file.name);
    return SUPPORTED_EXTENSIONS.includes(extension as any);
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = getFileExtension(filename);
    return LANGUAGE_MAP[ext] || 'text';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const codeFiles = acceptedFiles.filter(isCodeFile);

    if (codeFiles.length === 0) {
      toast.error('Please upload code files (.js, .ts, .py, etc.)');
      return;
    }

    if (codeFiles.length !== acceptedFiles.length) {
      const filtered = acceptedFiles.length - codeFiles.length;
      toast.success(`Selected ${codeFiles.length} code files (filtered out ${filtered} non-code files)`);
    }

    // Process files for analysis
    const processedFiles = codeFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      path: file.name,
      content: '',
      language: getLanguageFromExtension(file.name),
      size: file.size,
      lastModified: file.lastModified,
      file: file
    }));

    setFiles(processedFiles);
    onFilesSelected?.(codeFiles);
    toast.success(`${codeFiles.length} files ready for analysis`);
  }, [setFiles, onFilesSelected]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isAnalyzing,
    multiple: true,
    accept: {
      'text/*': [...SUPPORTED_EXTENSIONS]
    }
  });

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAnalyzeCode = async () => {
    if (files.length === 0) {
      toast.error('Please upload files first');
      return;
    }

    try {
      startAnalysis();
      toast.success('Starting code analysis...');

      // Prepare files for analysis
      const filesToAnalyze = files
        .filter(file => file.file) // Only files with File objects
        .map(file => ({
          file: file.file!,
          language: file.language
        }));

      if (filesToAnalyze.length === 0) {
        throw new Error('No valid files found for analysis');
      }

      // Analyze files with selected options
      const analysisResults = await apiService.analyzeMultipleFiles(filesToAnalyze, analysisType, selectedModel);

      // Process results using utility function
      const analysisResult = await processAnalysisResults(analysisResults, files);

      completeAnalysis(analysisResult);
      toast.success(`Analysis completed! Found ${analysisResult.summary.totalIssues} issues across ${files.length} files.`);

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      failAnalysis(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <FolderOpen className="w-12 h-12 text-blue-500" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Drop files here' : 'Upload Code Files'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Drag & drop code files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Supports: JavaScript, TypeScript, Python, Java, C++, and more
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Selected Files ({files.length})
            </h4>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div key={file.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.path}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.language} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(file.id)}
                  disabled={isAnalyzing}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Options & Action Button */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Analysis Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Analysis Options</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Model Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  AI Model
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="auto">Auto (Fallback)</option>
                    <option value="gemini">Gemini 2.5 Flash</option>
                    <option value="groq">Groq Llama 3.3</option>
                    <option value="huggingface">HuggingFace</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Analysis Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Analysis Type
                </label>
                <div className="relative">
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="general">General Analysis</option>
                    <option value="security">Security Focus</option>
                    <option value="performance">Performance Focus</option>
                    <option value="maintainability">Maintainability Focus</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Model Description */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedModel === 'auto' && "Automatically tries Gemini → Groq → HuggingFace"}
              {selectedModel === 'gemini' && "Google's latest Gemini 2.5 Flash model"}
              {selectedModel === 'groq' && "Ultra-fast Llama 3.3 70B on Groq"}
              {selectedModel === 'huggingface' && "Open-source models via HuggingFace"}
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalyzeCode}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Analyze Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};