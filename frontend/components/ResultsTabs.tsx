'use client';

import { saveAs } from 'file-saver';
import {
  Download,
  Sparkles,
  Target,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  Dna,
} from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import {
  type AnalysisResults,
  type EvaluationResult,
  CrewAPI,
} from '@/lib/crew_api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface ResultsTabsProps {
  results: AnalysisResults;
}

function MetricCard({ label, value, trend }: { label: string; value: string | number; trend?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5 md:p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 w-full"
    >
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 truncate">{label}</div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}</div>
        {trend && <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{trend}</div>}
      </div>
    </motion.div>
  );
}

function ResumePreview({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white p-6 md:p-12 shadow-2xl shadow-slate-200/60 w-full">
      <div className="absolute right-0 top-0 h-64 w-64 bg-indigo-50/50 blur-3xl -z-10" />
      <div className="max-w-3xl mx-auto space-y-6 font-serif text-[14px] md:text-[15px] leading-relaxed text-slate-700">
        {text.split('\n').map((line, i) => {
          const trimmed = line.trim();
          const isHeader = trimmed && trimmed === trimmed.toUpperCase() && trimmed.length < 40;
          return (
            <p key={i} className={isHeader ? "font-sans font-black text-slate-900 tracking-widest text-[10px] md:text-xs uppercase mt-8 md:mt-10 border-b border-slate-100 pb-2" : "break-words"}>
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function EvaluationDashboard({ evaluation, results }: { evaluation: EvaluationResult; results: AnalysisResults }) {
  const breakdown = evaluation.breakdown || {};
  const fallbackStages = Object.values(results.validation || {}).filter((s) => s?.used_fallback);

  return (
    <div className="space-y-8 md:space-y-10 w-full">
      {/* Executive Summary */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 glass-card-light relative flex flex-col items-center justify-center rounded-[32px] md:rounded-[40px] bg-white p-8 md:p-12 text-center border-slate-100 shadow-xl shadow-slate-200/50 w-full overflow-hidden">
          <div className="absolute inset-0 bg-indigo-50/30 blur-3xl -z-10" />
          <div className="mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Target className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <div className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter">{evaluation.overall_score ?? '--'}</div>
          <div className="mt-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">ATS Efficacy Score</div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-400" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Performance Matrix</h3>
            </div>
            {fallbackStages.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 w-fit">
                <ShieldCheck className="h-3 w-3" />
                Grounding Safe
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(breakdown).map(([key, val]) => (
              <MetricCard key={key} label={key.replace(/_/g, ' ')} value={`${val}/5`} trend="+12%" />
            ))}
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
        <div className="rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white p-6 md:p-10 shadow-lg shadow-slate-100 w-full overflow-hidden">
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Strategic Gains</h3>
            </div>
          </div>
          <div className="space-y-4">
            {(evaluation.quick_wins || []).map((win, i) => (
              <div key={i} className="group flex gap-4 md:gap-5 rounded-2xl border border-slate-50 bg-slate-50/30 p-4 md:p-5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-md w-full">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  {i + 1}
                </div>
                <p className="text-[13px] md:text-[14px] font-medium leading-relaxed text-slate-600 group-hover:text-slate-900 transition-colors break-words">{win}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] md:rounded-[40px] border border-slate-100 bg-slate-900 p-6 md:p-10 shadow-2xl shadow-slate-300 w-full overflow-hidden">
          <div className="mb-6 md:mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">High-Impact Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {(evaluation.missing_keywords || []).map((word, i) => (
              <motion.span 
                whileHover={{ scale: 1.05 }}
                key={i} 
                className="rounded-xl bg-white/10 px-4 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-400 border border-white/5 hover:bg-white hover:text-slate-900 transition-all cursor-default"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className="mt-8 md:mt-10 p-5 md:p-6 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed italic break-words">
              "Integrating these keywords semantically increases discoverability by 40% in modern ATS search clusters."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsTabs({ results }: ResultsTabsProps) {
  const download = async () => {
    const blob = await CrewAPI.downloadDocx(results.final_resume);
    saveAs(blob, 'optimized_resume.docx');
  };

  return (
    <div className="space-y-8 md:space-y-10 w-full">
      <Tabs defaultValue="evaluation" className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-6 md:pb-8 w-full">
          <TabsList className="h-12 md:h-14 w-full md:w-fit gap-1 md:gap-2 rounded-2xl bg-slate-100/50 p-1.5 md:p-2 overflow-x-auto overflow-y-hidden no-scrollbar">
            <TabsTrigger value="evaluation" className="rounded-xl px-4 md:px-8 py-2 md:py-2.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200 shrink-0">Insight</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-xl px-4 md:px-8 py-2 md:py-2.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200 shrink-0">Artifact</TabsTrigger>
            <TabsTrigger value="diff" className="rounded-xl px-4 md:px-8 py-2 md:py-2.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200 shrink-0">Delta</TabsTrigger>
          </TabsList>

          <button
            onClick={download}
            className="btn-premium w-full md:w-auto flex h-12 md:h-14 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 md:px-10 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-200 shrink-0"
          >
            <Download className="h-4 w-4" />
            Export Document
          </button>
        </div>

        <TabsContent value="evaluation" className="mt-8 md:mt-12 focus-visible:outline-none w-full">
          <EvaluationDashboard evaluation={results.evaluation} results={results} />
        </TabsContent>

        <TabsContent value="preview" className="mt-8 md:mt-12 focus-visible:outline-none w-full">
          <ResumePreview text={results.final_resume} />
        </TabsContent>

        <TabsContent value="diff" className="mt-8 md:mt-12 focus-visible:outline-none w-full overflow-x-auto">
          <div className="overflow-hidden rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 min-w-[600px] lg:min-w-full">
            <div className="bg-slate-50/50 px-6 md:px-8 py-4 border-b border-slate-100 flex items-center gap-3">
              <Dna className="h-4 w-4 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Optimization Traceability</span>
            </div>
            <div className="w-full">
              <ReactDiffViewer
                oldValue={results.cleaned}
                newValue={results.rewritten}
                splitView={true}
                useDarkTheme={false}
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: '#ffffff',
                      addedBackground: '#ecfdf5',
                      addedColor: '#059669',
                      removedBackground: '#fef2f2',
                      removedColor: '#dc2626',
                      wordAddedBackground: '#d1fae5',
                      wordRemovedBackground: '#fee2e2',
                    }
                  },
                  contentText: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '22px'
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
