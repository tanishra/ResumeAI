'use client';

export interface EvaluationResult {
  overall_score?: number;
  scores?: Record<string, number>;
  breakdown?: Record<string, number | string>;
  suggestions?: string[];
  quick_wins?: string[];
  strengths?: string[];
  missing_keywords?: string[];
  summary?: string;
  recommendation?: string;
  raw_output?: string;
}

export interface ValidationStageResult {
  stage: string;
  passed: boolean;
  used_fallback: boolean;
  issues: Array<{
    type: string;
    items: string[];
  }>;
}

export interface ValidationResult {
  rewrite?: ValidationStageResult;
  final_resume?: ValidationStageResult;
}

export interface AnalysisTelemetry {
  file_type?: string;
  timings_ms?: Record<string, number>;
  pipeline?: {
    stages?: Array<{
      stage: string;
      succeeded: boolean;
      used_fallback: boolean;
      fallback_reason?: string | null;
      error_type?: string | null;
      error_message?: string | null;
    }>;
  };
  grounding?: Record<
    string,
    {
      repair_attempted?: boolean;
      repair_succeeded?: boolean;
      used_fallback?: boolean;
    }
  >;
  evaluation?: {
    source?: string;
    parsed_json?: boolean;
    raw_output_included?: boolean;
  };
}

export interface AnalysisResults {
  cleaned: string;
  rewritten: string;
  final_resume: string;
  evaluation: EvaluationResult;
  validation?: ValidationResult;
  telemetry?: AnalysisTelemetry;
}

export interface AnalysisResponse {
  success: boolean;
  results?: AnalysisResults;
  detail?: string;
}

export class CrewAPI {
  private static readonly ANALYZE_ROUTE = '/api/analyze_resume';

  static async analyzeResume(
    file: File,
    jobTitle: string,
    jobDescription: string,
    onProgress?: (message: string) => void
  ): Promise<AnalysisResults> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);

    const response = await fetch(this.ANALYZE_ROUTE, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Analysis failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body received from server.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let results: AnalysisResults | null = null;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        
        const dataStr = line.replace('data: ', '').trim();
        try {
          const payload = JSON.parse(dataStr);
          
          if (payload.type === 'progress' && onProgress) {
            onProgress(payload.message);
          } else if (payload.type === 'results') {
            results = payload.data;
          } else if (payload.type === 'error') {
            throw new Error(payload.detail || 'Analysis failed unexpectedly.');
          }
        } catch (e) {
          console.error('Error parsing SSE message:', e);
        }
      }
    }

    if (!results) {
      throw new Error('Analysis completed but no results were received.');
    }

    return results;
  }

  static async downloadDocx(finalResume: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('final_resume', finalResume);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/resume/download-docx`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to generate DOCX document.');
    }

    return await response.blob();
  }
}
