import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();

    return NextResponse.json(
      {
        ...data,
        backendUrl,
      },
      { status: response.status }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'offline',
        backendUrl,
      },
      { status: 503 }
    );
  }
}
