export async function forwardAnalyzeRequest(
  formData: FormData,
  backendUrl: string
): Promise<Response> {
  const backendFormData = new FormData();
  const file = formData.get('file');
  const jobTitle = formData.get('jobTitle') || formData.get('job_title');
  const jobDescription =
    formData.get('jobDescription') || formData.get('job_description');

  if (
    !(file instanceof File) ||
    typeof jobTitle !== 'string' ||
    typeof jobDescription !== 'string'
  ) {
    return Response.json({ detail: 'Missing file or job details.' }, { status: 400 });
  }

  backendFormData.append('file', file);
  backendFormData.append('job_title', jobTitle);
  backendFormData.append('job_description', jobDescription);

  try {
    const response = await fetch(`${backendUrl}/resume/analyze`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch {
    return Response.json(
      { detail: 'Failed to analyze resume.' },
      { status: 500 }
    );
  }
}

export async function fetchBackendHealth(backendUrl: string): Promise<Response> {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();

    return Response.json(
      {
        ...data,
        backendUrl,
      },
      { status: response.status }
    );
  } catch {
    return Response.json(
      {
        status: 'offline',
        backendUrl,
      },
      { status: 503 }
    );
  }
}
