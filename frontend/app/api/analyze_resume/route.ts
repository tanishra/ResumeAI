import { NextRequest, NextResponse } from 'next/server';
import { forwardAnalyzeRequest } from '@/lib/backend_proxy';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await forwardAnalyzeRequest(formData, backendUrl);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
