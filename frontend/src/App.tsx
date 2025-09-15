import { Toaster } from 'react-hot-toast';
import { FileUpload } from './components/FileUpload';
import { AnalysisResults } from './components/AnalysisResults';
import { useAnalysisStore } from './store/analysisStore';
import { Code2, Github, Upload, BarChart3, Coffee } from 'lucide-react';

function App() {
  const { files, analysis, isAnalyzing, setFiles, setAnalysis } = useAnalysisStore();

  const handleGoHome = () => {
    setFiles([]);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={handleGoHome}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI-Powered CodeMentor
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Intelligent Code Analysis with AI
                </p>
              </div>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open('https://github.com/yourusername/ai-powered-codementor', '_blank')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {files.length === 0 ? (
          // Landing/Upload View
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Upload Your Code for AI Analysis
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Get intelligent code analysis, security insights, and improvement suggestions powered by advanced AI models.
                Your code is analyzed securely with multiple AI providers.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4 mx-auto">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Smart Upload
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Drag & drop multiple files or entire projects. Automatically detects code files.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4 mx-auto">
                  <Code2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  AI Analysis
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Advanced AI models analyze your code for security, performance, and quality issues.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4 mx-auto">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Detailed Reports
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Get comprehensive reports with actionable recommendations and metrics.
                </p>
              </div>
            </div>

            {/* File Upload Component */}
            <FileUpload />
          </div>
        ) : (
          // Analysis View (when files are uploaded)
          <div className="space-y-6">
            {/* Files Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Files Ready for Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {files.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {new Set(files.map(f => f.language)).size}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(files.reduce((sum, f) => sum + f.size, 0) / 1024)}KB
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Size</div>
                </div>
              </div>

              {/* Upload More Files Button */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <FileUpload />
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && <AnalysisResults analysis={analysis} />}
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Analyzing Your Code
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  AI is reviewing your code for security, performance, and quality issues...
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
            <span>Made with</span>
            <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>by</span>
            <a
              href="https://github.com/utsabpanta"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Utsab Pant
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;