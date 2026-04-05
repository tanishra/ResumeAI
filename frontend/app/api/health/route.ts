import { NextResponse } from 'next/server';
import { fetchBackendHealth } from '@/lib/backend_proxy';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetchBackendHealth(backendUrl);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
