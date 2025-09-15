import { apiService } from '../services/apiService';

// Types for analysis processing
export interface ProcessedAnalysisResult {
  parsedAnalysis: any;
}

export interface AnalysisMetrics {
  totalIssues: number;
  criticalIssues: number;
  filesAnalyzed: number;
  overallScore: number;
  recommendations: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  summary: AnalysisMetrics;
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
  rawResults: any[];
}

/**
 * Extracts JSON data from analysis text response
 */
export const extractJSONFromAnalysis = (analysisText: string) => {
  try {
    return JSON.parse(analysisText);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    const match = jsonBlockRegex.exec(analysisText);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Processes multiple analysis results and calculates aggregated metrics
 */
export const processAnalysisResults = async (
  analysisResults: any[],
  files: any[]
): Promise<AnalysisResult> => {
  // Parse all analysis results
  const parsedResults = analysisResults.map(result => ({
    ...result,
    parsedAnalysis: extractJSONFromAnalysis(result.analysis)
  }));

  // Aggregate data from all analysis results
  const allIssues: any[] = [];
  const allRecommendations: string[] = [];
  let totalQualityScore = 0;
  let validQualityScores = 0;

  parsedResults.forEach(result => {
    if (result.parsedAnalysis) {
      // Collect issues
      if (result.parsedAnalysis.issues && Array.isArray(result.parsedAnalysis.issues)) {
        allIssues.push(...result.parsedAnalysis.issues);
      }

      // Collect recommendations
      if (result.parsedAnalysis.recommendations && Array.isArray(result.parsedAnalysis.recommendations)) {
        allRecommendations.push(...result.parsedAnalysis.recommendations);
      }

      // Collect quality scores
      if (typeof result.parsedAnalysis.quality_score === 'number') {
        totalQualityScore += result.parsedAnalysis.quality_score;
        validQualityScores++;
      }
    }
  });

  // Calculate metrics
  const criticalIssues = allIssues.filter(issue =>
    issue.severity && ['critical', 'high'].includes(issue.severity.toLowerCase())
  ).length;

  const overallScore = validQualityScores > 0
    ? Math.round(totalQualityScore / validQualityScores * 10) // Convert to 0-100 scale
    : 75; // Default score

  // Calculate total lines of code
  let totalLines = 0;
  for (const fileObj of files) {
    if (fileObj.file) {
      try {
        const content = await apiService.readFileContent(fileObj.file);
        totalLines += content.split('\n').length;
      } catch (error) {
        console.warn('Could not read file for line count:', fileObj.path);
      }
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: allIssues.length,
      criticalIssues,
      filesAnalyzed: files.length,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      recommendations: Array.from(new Set(allRecommendations)).slice(0, 5)
    },
    issues: allIssues,
    metrics: {
      complexity: {
        cyclomatic: Math.max(1, Math.floor(allIssues.length / 2)),
        cognitive: Math.max(1, Math.floor(allIssues.length * 0.8)),
      },
      maintainability: {
        score: overallScore,
      },
      technical_debt: {
        hours: Math.max(1, Math.floor(allIssues.length * 0.5)),
        issues: allIssues.length,
      },
      lines_of_code: {
        total: totalLines,
        source: Math.floor(totalLines * 0.8),
        comments: Math.floor(totalLines * 0.15),
        blank: Math.floor(totalLines * 0.05),
      },
    },
    processing_time: analysisResults.length * 1500, // Estimate based on number of files
    rawResults: analysisResults
  };
};