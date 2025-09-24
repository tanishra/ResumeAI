// lib/crew-api.ts
export interface AnalysisRequest {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  fileName?: string;
}

export interface AnalysisResponse {
  success: boolean;
  data?: {
    cleaned: string;
    rewritten: string;
    final_resume: string;
    evaluation: EvaluationResult;
  };
  error?: string;
  message?: string;
}

export interface EvaluationResult {
  overall_score: number;
  scores: {
    keyword_optimization: number;
    format_compliance: number;
    content_quality: number;
    ats_compatibility: number;
    impact_metrics: number;
  };
  suggestions: string[];
  strengths?: string[];
  areas_for_improvement?: string[];
  missing_keywords?: string[];
  recommendation?: string;
}

export class CrewAPI {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  private static readonly TIMEOUT = 300000; // 5 minutes

  /**
   * Analyze resume using the CrewAI pipeline
   */
  static async analyzeResume(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const formData = new FormData();
      formData.append('resumeText', request.resumeText);
      formData.append('jobTitle', request.jobTitle);
      formData.append('jobDescription', request.jobDescription);
      
      if (request.fileName) {
        formData.append('fileName', request.fileName);
      }

      const response = await fetch(`${this.API_BASE_URL}/analyze-resume`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          // Note: Don't set Content-Type for FormData, let the browser set it
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
      };

    } catch (error) {
      console.error('Resume analysis error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get analysis status (for long-running operations)
   */
  static async getAnalysisStatus(analysisId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/analysis-status/${analysisId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Health check for the API
   */
  static async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        return { healthy: true, message: data.message };
      } else {
        return { healthy: false, message: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { 
        healthy: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get supported file types and limits
   */
  static async getUploadLimits(): Promise<{
    maxSize: number;
    supportedTypes: string[];
    maxProcessingTime: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/upload-limits`);
      
      if (response.ok) {
        return await response.json();
      } else {
        // Return defaults if API call fails
        return {
          maxSize: 10 * 1024 * 1024, // 10MB
          supportedTypes: ['.pdf', '.docx', '.txt'],
          maxProcessingTime: 300000, // 5 minutes
        };
      }
    } catch (error) {
      console.error('Failed to get upload limits:', error);
      return {
        maxSize: 10 * 1024 * 1024,
        supportedTypes: ['.pdf', '.docx', '.txt'],
        maxProcessingTime: 300000,
      };
    }
  }

  /**
   * Download optimized resume in different formats
   */
  static async downloadResume(
    resumeContent: string, 
    format: 'txt' | 'docx' | 'pdf',
    fileName?: string
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/download-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: resumeContent,
          format,
          fileName: fileName || `optimized_resume.${format}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Submit feedback on analysis results
   */
  static async submitFeedback(feedback: {
    analysisId?: string;
    rating: number;
    comments?: string;
    helpful: boolean;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        message: data.message,
      };
    } catch (error) {
      console.error('Feedback submission error:', error);
      return {
        success: false,
        message: 'Failed to submit feedback',
      };
    }
  }
}

// Helper functions for API responses
export const parseEvaluation = (evaluation: any): EvaluationResult | null => {
  if (typeof evaluation === 'string') {
    try {
      // Handle single quotes in JSON-like strings
      const cleanJson = evaluation.replace(/'/g, '"');
      return JSON.parse(cleanJson);
    } catch {
      return null;
    }
  }
  
  if (typeof evaluation === 'object' && evaluation !== null) {
    return evaluation as EvaluationResult;
  }
  
  return null;
};

export const formatScore = (score: number): string => {
  return Math.round(score).toString();
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};