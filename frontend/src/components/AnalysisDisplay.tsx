import React, { useState } from 'react';
import { Check, AlertTriangle, Info, Zap, Shield, Code2, TrendingUp, Copy, ChevronDown, ChevronRight, Eye, EyeOff, FileText, Target, Users } from 'lucide-react';

// Type definitions for better type safety
interface AnalysisDisplayProps {
  analysis: string;
  provider: string;
  language: string;
  timestamp: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
  title?: string;
}

interface Issue {
  type?: string;
  severity?: string;
  description?: string;
  message?: string;
  line?: number;
  codeSnippet?: string;
  suggestion?: string;
  references?: string[];
}

interface ParsedAnalysis {
  quality_score?: number;
  summary?: string;
  issues?: Issue[];
  recommendations?: string[];
  [key: string]: any;
}

interface SeverityConfig {
  color: string;
  bg: string;
  border: string;
  text: string;
  icon: string;
  badge: string;
}

// Utility functions
const formatText = (text: string): string => {
  return text
    .replace(/`([^`]+)`/g, '<code class="inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">$1</code>')
    .replace(/\n/g, '<br />');
};

const extractJSONFromText = (text: string): { parsed: ParsedAnalysis | null; isJSON: boolean; originalText: string } => {
  try {
    return { parsed: JSON.parse(text), isJSON: true, originalText: text };
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    const match = jsonBlockRegex.exec(text);

    if (match && match[1]) {
      try {
        const jsonContent = match[1].trim();
        return { parsed: JSON.parse(jsonContent), isJSON: true, originalText: text };
      } catch {
        return { parsed: null, isJSON: false, originalText: text };
      }
    }

    return { parsed: null, isJSON: false, originalText: text };
  }
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, title }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <button
          onClick={copyCode}
          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>
    </div>
  );
};

// Configuration mappings
const SEVERITY_CONFIGS: Record<string, SeverityConfig> = {
  critical: {
    color: 'red',
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-900 dark:text-gray-100',
    icon: 'text-red-500',
    badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  },
  high: {
    color: 'orange',
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-900 dark:text-gray-100',
    icon: 'text-orange-500',
    badge: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
  },
  medium: {
    color: 'yellow',
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-900 dark:text-gray-100',
    icon: 'text-yellow-500',
    badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  },
  low: {
    color: 'blue',
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-900 dark:text-gray-100',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
  }
};

const DEFAULT_SEVERITY_CONFIG: SeverityConfig = {
  color: 'gray',
  bg: 'bg-white dark:bg-gray-800',
  border: 'border-gray-200 dark:border-gray-700',
  text: 'text-gray-900 dark:text-gray-100',
  icon: 'text-gray-500',
  badge: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
};

const ISSUE_TYPE_ICONS = {
  security: Shield,
  performance: Zap,
  bug: AlertTriangle,
  style: Code2,
  maintainability: Users
} as const;

const getSeverityConfig = (severity: string): SeverityConfig => {
  return SEVERITY_CONFIGS[severity?.toLowerCase()] || DEFAULT_SEVERITY_CONFIG;
};

const getTypeIcon = (type: string) => {
  return ISSUE_TYPE_ICONS[type?.toLowerCase() as keyof typeof ISSUE_TYPE_ICONS] || Info;
};

interface IssueCardProps {
  issue: Issue;
  index: number;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [expanded, setExpanded] = useState(false);

  const config = getSeverityConfig(issue.severity || '');
  const IconComponent = getTypeIcon(issue.type || '');

  // Parse text content and extract code blocks for rendering
  const parseContentBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: Array<{ type: 'code' | 'text', content: string, language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      blocks.push({
        type: 'code',
        content: match[2],
        language: match[1] || 'javascript'
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      blocks.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return blocks;
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${config.border} ${config.bg}`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <IconComponent className={`w-5 h-5 mt-0.5 ${config.icon}`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {issue.type || 'Issue'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.badge}`}>
                  {issue.severity || 'Medium'}
                </span>
                {issue.line && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Line {issue.line}
                  </span>
                )}
              </div>
              <div
                className="text-sm text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: formatText(issue.description || issue.message || 'No description available')
                }}
              />
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {expanded ? 'Hide Details' : 'View Solution'}
            </span>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Code snippet if available */}
          {issue.codeSnippet && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Problematic Code:
              </h5>
              <CodeBlock
                code={issue.codeSnippet}
                language="javascript"
              />
            </div>
          )}

          {/* Suggestion with proper formatting */}
          {issue.suggestion && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-green-900 dark:text-green-100 mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-600" />
                <span>Recommended Fix:</span>
              </h5>

              <div className="space-y-3">
                {parseContentBlocks(issue.suggestion).map((block, blockIndex) => {
                  if (block.type === 'code') {
                    return (
                      <CodeBlock
                        key={blockIndex}
                        code={block.content}
                        language={block.language || 'javascript'}
                        title="Improved Code"
                      />
                    );
                  } else {
                    return (
                      <div
                        key={blockIndex}
                        className="text-sm text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: formatText(block.content) }}
                      />
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* References */}
          {issue.references && issue.references.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                References:
              </h5>
              <ul className="space-y-1">
                {issue.references.map((ref: string, refIndex: number) => (
                  <li key={refIndex}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, provider, language, timestamp }) => {
  const [showRawView, setShowRawView] = useState(false);

  const { parsed: parsedAnalysis, isJSON, originalText } = extractJSONFromText(analysis);

  // Group and categorize issues for display
  const groupIssuesByType = (issues: Issue[]): Record<string, Issue[]> => {
    return issues.reduce((grouped, issue) => {
      const type = issue.type || 'general';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(issue);
      return grouped;
    }, {} as Record<string, Issue[]>);
  };

  const getCategoryDisplayInfo = (type: string) => {
    const categoryMap = {
      bug: { icon: AlertTriangle, color: 'red', label: 'Bugs & Issues' },
      security: { icon: Shield, color: 'orange', label: 'Security Issues' },
      performance: { icon: Zap, color: 'yellow', label: 'Performance Issues' },
      maintainability: { icon: Users, color: 'blue', label: 'Maintainability' },
      style: { icon: Code2, color: 'purple', label: 'Code Style' }
    };

    return categoryMap[type.toLowerCase() as keyof typeof categoryMap] ||
           { icon: Info, color: 'gray', label: 'General Issues' };
  };

  // Main render logic
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Analysis Results
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {provider} • {language} • {new Date(timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isJSON && parsedAnalysis?.quality_score && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                parsedAnalysis.quality_score >= 8 ? 'text-green-600' :
                parsedAnalysis.quality_score >= 6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {parsedAnalysis.quality_score}/10
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Quality Score</div>
            </div>
          )}

          <button
            onClick={() => setShowRawView(!showRawView)}
            className="flex items-center space-x-2 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium shadow-sm"
          >
            {showRawView ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showRawView ? 'Hide' : 'Show'} Raw</span>
          </button>
        </div>
      </div>

      {/* Show Raw View or Nice UI based on toggle */}
      {showRawView ? (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Code2 className="w-4 h-4 text-gray-400" />
            <h5 className="text-sm font-medium text-gray-300">Raw Analysis Data</h5>
          </div>
          <pre className="text-sm text-gray-100 overflow-x-auto whitespace-pre-wrap">
            <code>{originalText}</code>
          </pre>
        </div>
      ) : isJSON && parsedAnalysis && typeof parsedAnalysis === 'object' ? (
        // Nice UI for structured JSON data
        <>
          {/* Summary */}
          {parsedAnalysis.summary && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Executive Summary</h4>
              </div>
              <div
                className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatText(parsedAnalysis.summary) }}
              />
            </div>
          )}

          {/* Issues by Category */}
          {parsedAnalysis.issues && Array.isArray(parsedAnalysis.issues) && parsedAnalysis.issues.length > 0 && (
            <div className="space-y-6">
              {(() => {
                const groupedIssues = groupIssuesByType(parsedAnalysis.issues);
                return Object.entries(groupedIssues).map(([type, issues]) => {
                  const categoryInfo = getCategoryDisplayInfo(type);
                  const IconComponent = categoryInfo.icon;

                  return (
                    <div key={type} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`w-5 h-5 text-${categoryInfo.color}-500`} />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {categoryInfo.label} ({issues.length})
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {issues.map((issue: any, index: number) => (
                          <IssueCard key={`${type}-${index}`} issue={issue} index={index} />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* Recommendations */}
          {parsedAnalysis.recommendations && Array.isArray(parsedAnalysis.recommendations) && parsedAnalysis.recommendations.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-900 dark:text-green-100">Recommendations</h4>
              </div>
              <ul className="space-y-2">
                {parsedAnalysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span
                      className="text-sm text-green-800 dark:text-green-200"
                      dangerouslySetInnerHTML={{ __html: formatText(rec) }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional structured sections */}
          {Object.entries(parsedAnalysis).map(([key, value]) => {
            if (['summary', 'issues', 'recommendations', 'quality_score'].includes(key)) {
              return null;
            }

            if (typeof value === 'string' && value.length > 0) {
              return (
                <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: formatText(String(value)) }}
                  />
                </div>
              );
            }

            if (typeof value === 'number') {
              return (
                <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
                </div>
              );
            }

            return null;
          })}
        </>
      ) : (
        // Fallback for non-JSON or malformed data - show formatted markdown
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div
            className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${formatText(originalText)}</p>` }}
          />
        </div>
      )}
    </div>
  );
};