import React from 'react';
import { AlertTriangle, Clock, FileText, TrendingUp, Code } from 'lucide-react';
import { AnalysisDisplay } from './AnalysisDisplay';

interface AnalysisResult {
  id: string;
  timestamp: string;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    filesAnalyzed: number;
    overallScore: number;
    recommendations: string[];
  };
  issues: any[];
  metrics: {
    complexity: {
      cyclomatic: number;
      cognitive: number;
    };
    maintainability: {
      score: number;
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
  };
  processing_time: number;
  rawResults?: any[];
}

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Results
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Clock className="inline w-4 h-4 mr-1" />
            {formatDuration(analysis.processing_time)}
          </div>
        </div>

        {/* Overall Score */}
        <div className="flex items-center justify-center mb-6">
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${getScoreBgColor(analysis.summary.overallScore)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.summary.overallScore)}`}>
                {analysis.summary.overallScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Overall Score
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analysis.summary.filesAnalyzed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Files Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {analysis.summary.totalIssues}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {analysis.summary.criticalIssues}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Critical Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analysis.metrics.lines_of_code.total}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Lines of Code</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Maintainability */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Maintainability
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <span className={`font-semibold ${getScoreColor(analysis.metrics.maintainability.score)}`}>
                {analysis.metrics.maintainability.score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Complexity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Complexity
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cyclomatic</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.metrics.complexity.cyclomatic}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cognitive</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.metrics.complexity.cognitive}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Debt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technical Debt
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Est. Hours</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.metrics.technical_debt.hours}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Issues</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.metrics.technical_debt.issues}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Detailed Analysis Results */}
      {analysis.rawResults && analysis.rawResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detailed AI Analysis
            </h3>
          </div>
          <div className="space-y-8">
            {analysis.rawResults.map((result, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      File {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
                        {result.metadata?.language || 'unknown'}
                      </span>
                      {result.provider && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {result.provider}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <AnalysisDisplay
                    analysis={result.analysis || 'No analysis available'}
                    provider={result.provider || 'Unknown'}
                    language={result.metadata?.language || 'unknown'}
                    timestamp={result.metadata?.timestamp || new Date().toISOString()}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};