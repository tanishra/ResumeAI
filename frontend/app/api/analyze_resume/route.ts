import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const backendFormData = new FormData();
    const file = formData.get('file');
    const jobTitle = formData.get('jobTitle') || formData.get('job_title');
    const jobDescription =
      formData.get('jobDescription') || formData.get('job_description');

    if (!(file instanceof File) || typeof jobTitle !== 'string' || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { detail: 'Missing file or job details.' },
        { status: 400 }
      );
    }

    backendFormData.append('file', file);
    backendFormData.append('job_title', jobTitle);
    backendFormData.append('job_description', jobDescription);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/resume/analyze`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { detail: 'Failed to analyze resume.' },
      { status: 500 }
    );
  }
}
