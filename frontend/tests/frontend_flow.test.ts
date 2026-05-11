import test from 'node:test';
import assert from 'node:assert/strict';

import { CrewAPI } from '../lib/crew_api.ts';
import { forwardAnalyzeRequest } from '../lib/backend_proxy.ts';

test('frontend analyze flow succeeds through the app-facing route', async () => {
  const originalFetch = globalThis.fetch;
  const file = new File(['resume text'], 'resume.txt', { type: 'text/plain' });
  let capturedUrl = '';

  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    assert.equal(init?.method, 'POST');
    assert.ok(init?.body instanceof FormData);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type": "results", "data": {"final_resume": "final resume", "evaluation": {"overall_score": 88}}}\n\n'
          )
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };

  try {
    const results = await CrewAPI.analyzeResume(
      file,
      'Backend Engineer',
      'Build reliable APIs'
    );

    assert.equal(capturedUrl, '/api/analyze_resume');
    assert.equal(results.final_resume, 'final resume');
    assert.equal(results.evaluation.overall_score, 88);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('frontend analyze route returns a stable failure when backend is unavailable', async () => {
  const originalFetch = globalThis.fetch;
  const formData = new FormData();
  formData.append('file', new File(['resume text'], 'resume.txt', { type: 'text/plain' }));
  formData.append('job_title', 'Backend Engineer');
  formData.append('job_description', 'Build reliable APIs');

  globalThis.fetch = async () => {
    throw new Error('backend offline');
  };

  try {
    const response = await forwardAnalyzeRequest(formData, 'http://localhost:8000');
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(payload, { detail: 'Failed to connect to backend.' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
