import { NextRequest } from 'next/server';
import { forwardAnalyzeRequest } from '@/lib/backend_proxy';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return await forwardAnalyzeRequest(formData, backendUrl);
}
