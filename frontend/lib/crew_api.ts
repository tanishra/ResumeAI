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

export interface AnalysisResults {
  cleaned: string;
  rewritten: string;
  final_resume: string;
  evaluation: EvaluationResult;
}

export interface AnalysisResponse {
  success: boolean;
  results?: AnalysisResults;
  detail?: string;
}

export class CrewAPI {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  static async analyzeResume(
    file: File,
    jobTitle: string,
    jobDescription: string
  ): Promise<AnalysisResults> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${this.API_BASE_URL}/resume/analyze`, {
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
