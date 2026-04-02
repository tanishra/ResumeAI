'use client';

import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileText,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import {
  type AnalysisResults,
  type EvaluationResult,
  type ValidationStageResult,
} from '@/lib/crew_api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResultsTabsProps {
  results: AnalysisResults;
}

function ValidationBanner({ results }: { results: AnalysisResults }) {
  const stages = Object.values(results.validation || {}) as ValidationStageResult[];
  const fallbackStages = stages.filter((stage) => stage?.used_fallback);

  if (!fallbackStages.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        Grounding protection applied
      </div>
      <p>
        The model introduced unsupported resume details, so ResumeAI fell back to
        the last grounded version for safety.
      </p>
      <div className="mt-3 space-y-2">
        {fallbackStages.map((stage) => (
          <div key={stage.stage}>
            <span className="font-medium">
              {stage.stage.replace(/_/g, ' ')}:
            </span>{' '}
            {stage.issues
              .map((issue) => `${issue.type} (${issue.items.join(', ')})`)
              .join(' | ')}
          </div>
        ))}
      </div>
    </div>
  );
}

function getEvaluation(result: EvaluationResult): EvaluationResult {
  if (typeof result === 'object' && result !== null) {
    return result;
  }

  return { raw_output: 'No evaluation data available.' };
}

function parseResumeSections(text: string) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => line || lines[index - 1] !== '');
}

function downloadTextFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

async function downloadDocx(content: string) {
  const paragraphs = content.split('\n').map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return new Paragraph({ text: '' });
    }

    if (index === 0) {
      return new Paragraph({
        text: trimmed,
        heading: HeadingLevel.TITLE,
      });
    }

    if (/^[A-Z][A-Z\s&]+$/.test(trimmed) && !trimmed.includes('|')) {
      return new Paragraph({
        text: trimmed,
        heading: HeadingLevel.HEADING_2,
      });
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return new Paragraph({
        text: trimmed.replace(/^[-•]\s*/, ''),
        bullet: { level: 0 },
      });
    }

    return new Paragraph({ text: trimmed });
  });

  const document = new Document({
    sections: [{ children: paragraphs }],
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, 'optimized_resume.docx');
}

function ResumePreview({ text }: { text: string }) {
  const lines = parseResumeSections(text);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-3">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={`${line}-${index}`} className="h-2" />;
          }

          if (index === 0) {
            return (
              <h2
                key={`${line}-${index}`}
                className="text-3xl font-bold tracking-tight text-slate-900"
              >
                {trimmed}
              </h2>
            );
          }

          if (/^[A-Z][A-Z\s&]+$/.test(trimmed) && !trimmed.includes('|')) {
            return (
              <h3
                key={`${line}-${index}`}
                className="border-b border-slate-200 pt-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700"
              >
                {trimmed}
              </h3>
            );
          }

          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            return (
              <div
                key={`${line}-${index}`}
                className="flex items-start gap-3 text-sm text-slate-700"
              >
                <span className="mt-0.5 text-blue-600">•</span>
                <p className="leading-6">{trimmed.replace(/^[-•]\s*/, '')}</p>
              </div>
            );
          }

          return (
            <p
              key={`${line}-${index}`}
              className="text-sm leading-6 text-slate-700"
            >
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function EvaluationPanel({ evaluation }: { evaluation: EvaluationResult }) {
  const normalized = getEvaluation(evaluation);
  const scoreMap = normalized.scores || normalized.breakdown || {};
  const suggestions = normalized.suggestions || normalized.quick_wins || [];
  const missingKeywords = normalized.missing_keywords || [];
  const strengths = normalized.strengths || [];

  if (normalized.raw_output && Object.keys(scoreMap).length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Raw evaluation output
        </div>
        <pre className="whitespace-pre-wrap font-sans text-xs">
          {normalized.raw_output}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Target className="h-4 w-4" />
            ATS Score
          </div>
          <div className="text-5xl font-bold text-slate-900">
            {normalized.overall_score ?? '--'}
          </div>
          <div className="mt-1 text-sm text-slate-600">out of 100</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Score Breakdown
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(scoreMap).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            <FileText className="h-4 w-4" />
            Summary
          </div>
          <p className="text-sm leading-6 text-blue-950">
            {normalized.summary || 'No summary returned.'}
          </p>
          <p className="mt-4 text-sm leading-6 text-blue-900">
            {normalized.recommendation || 'No recommendation returned.'}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            <CheckCircle className="h-4 w-4" />
            Strengths
          </div>
          <div className="space-y-3">
            {strengths.length ? (
              strengths.map((strength) => (
                <div
                  key={strength}
                  className="flex items-start gap-2 text-sm text-emerald-950"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-emerald-900">No strengths returned.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-green-800">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </div>
          <div className="space-y-3">
            {suggestions.length ? (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="flex items-start gap-2 text-sm text-green-900"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{suggestion}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-green-900">No recommendations returned.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
            <Sparkles className="h-4 w-4" />
            Missing Keywords
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.length ? (
              missingKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-white px-3 py-1 text-sm text-amber-900 shadow-sm"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-amber-900">No missing keywords returned.</p>
            )}
          </div>
        </div>
      </div>

      {normalized.raw_output ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          The model response required normalization before rendering structured results.
        </div>
      ) : null}
    </div>
  );
}

export default function ResultsTabs({ results }: ResultsTabsProps) {
  return (
    <Tabs defaultValue="evaluation" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-2 md:grid-cols-4">
        <TabsTrigger value="evaluation">ATS Evaluation</TabsTrigger>
        <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
        <TabsTrigger value="rewritten">Rewritten Version</TabsTrigger>
        <TabsTrigger value="cleaned">Cleaned Resume</TabsTrigger>
      </TabsList>

      <TabsContent value="evaluation" className="mt-6">
        <Card className="border-0 bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">ATS Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ValidationBanner results={results} />
            <EvaluationPanel evaluation={results.evaluation} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="optimized" className="mt-6">
        <Card className="border-0 bg-white/90 shadow-xl">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">Optimized Resume</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => downloadTextFile(results.final_resume, 'optimized_resume.txt')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download TXT
              </Button>
              <Button onClick={() => downloadDocx(results.final_resume)}>
                <Download className="mr-2 h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </CardHeader>
          <CardContent className="bg-slate-50 p-6">
            <ResumePreview text={results.final_resume} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rewritten" className="mt-6">
        <Card className="border-0 bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Rewritten Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <ReactDiffViewer
                oldValue={results.cleaned}
                newValue={results.rewritten}
                splitView
                showDiffOnly={false}
                leftTitle="Cleaned Resume"
                rightTitle="ATS Rewrite"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cleaned" className="mt-6">
        <Card className="border-0 bg-white/90 shadow-xl">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">Cleaned Resume</CardTitle>
            <Button
              variant="outline"
              onClick={() => downloadTextFile(results.cleaned, 'cleaned_resume.txt')}
            >
              <Download className="mr-2 h-4 w-4" />
              Download TXT
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {results.cleaned}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
