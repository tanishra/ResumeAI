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
    jobDescription: string
  ): Promise<AnalysisResults> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);

    const response = await fetch(this.ANALYZE_ROUTE, {
      method: 'POST',
      body: formData,
    });

    const data = (await response.json()) as AnalysisResponse;

    if (!response.ok || !data.success || !data.results) {
      throw new Error(data.detail || 'Resume analysis failed.');
    }

    return data.results;
  }
}
