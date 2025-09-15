import { Request, Response } from 'express';
import aiService from '../services/aiService';
import { AnalysisRequest } from '../types/analysis';
import { sendSuccess, sendError, sendValidationError, sendServerError } from '../utils/responseUtils';
import { validateCode, validateLanguage, validateAnalysisType, validateProviderType } from '../utils/validation';

export const analyzeCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, language, analysisType, preferredProvider } = req.body;

    // Validate required fields
    const codeError = validateCode(code);
    if (codeError) {
      return sendValidationError(res, codeError);
    }

    // Prepare validated request
    const analysisRequest: AnalysisRequest = {
      code: code.trim(),
      language: validateLanguage(language),
      analysisType: validateAnalysisType(analysisType),
      preferredProvider: validateProviderType(preferredProvider)
    };

    const result = await aiService.analyzeCode(analysisRequest);
    return sendSuccess(res, result);

  } catch (error) {
    return sendServerError(res, error as Error);
  }
};

export const explainCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, language } = req.body;

    const codeError = validateCode(code);
    if (codeError) {
      return sendValidationError(res, codeError);
    }

    const validatedLanguage = validateLanguage(language);
    const result = await aiService.explainCode(code.trim(), validatedLanguage);
    return sendSuccess(res, result);

  } catch (error) {
    return sendServerError(res, error as Error);
  }
};

export const suggestImprovements = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, language, context = '' } = req.body;

    const codeError = validateCode(code);
    if (codeError) {
      return sendValidationError(res, codeError);
    }

    const validatedLanguage = validateLanguage(language);
    const result = await aiService.suggestImprovements(
      code.trim(),
      validatedLanguage,
      context
    );
    return sendSuccess(res, result);

  } catch (error) {
    return sendServerError(res, error as Error);
  }
};

export const generateReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { analysisResults, projectInfo = {} } = req.body;

    if (!analysisResults || !Array.isArray(analysisResults) || analysisResults.length === 0) {
      return sendValidationError(res, 'Analysis results must be provided as a non-empty array');
    }

    // Use AI service for report generation with fallback support
    const report = await aiService.generateReport(analysisResults, projectInfo);

    return sendSuccess(res, {
      report,
      metadata: {
        projectInfo,
        generatedAt: new Date().toISOString(),
        resultsCount: analysisResults.length
      }
    });

  } catch (error) {
    return sendServerError(res, error as Error);
  }
};

export const getProviderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const availableProviders = aiService.getAvailableProviderNames();

    const providerStatus = {
      available_providers: availableProviders,
      provider_configs: {
        gemini: !!process.env.GEMINI_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        huggingface: !!process.env.HUGGINGFACE_API_KEY
      }
    };

    return sendSuccess(res, providerStatus);

  } catch (error) {
    return sendServerError(res, error as Error);
  }
};