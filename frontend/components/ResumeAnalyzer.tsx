'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Terminal,
  FileCode,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/ui/file_upload';
import { CrewAPI, type AnalysisResults } from '@/lib/crew_api';

interface ResumeAnalyzerProps {
  onAnalysisComplete: (results: AnalysisResults) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function ResumeAnalyzer({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
}: ResumeAnalyzerProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploadedFile(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !jobTitle.trim() || !jobDescription.trim()) {
      setError('Prerequisite missing: Please provide a resume and job context.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setCurrentStep('Initializing secure connection...');

    try {
      const results = await CrewAPI.analyzeResume(
        uploadedFile,
        jobTitle.trim(),
        jobDescription.trim(),
        (message) => setCurrentStep(message)
      );

      window.setTimeout(() => {
        onAnalysisComplete(results);
        setIsAnalyzing(false);
      }, 300);
    } catch (caughtError) {
      setIsAnalyzing(false);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Optimization interrupted. Please check your connection and try again.'
      );
    }
  };

  const canAnalyze = Boolean(
    uploadedFile && jobTitle.trim() && jobDescription.trim() && !isAnalyzing
  );

  return (
    <div className="glass-card-light rounded-[32px] md:rounded-[40px] p-1.5 md:p-3 bg-white shadow-2xl shadow-slate-200/50 w-full overflow-hidden">
      <div className="rounded-[28px] md:rounded-[32px] bg-white p-5 md:p-12">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 md:mb-10 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-4 md:p-5 text-sm font-medium text-red-600"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="break-words">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-10 md:gap-12 lg:grid-cols-2">
          {/* Left: Input */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">Job Context</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">Target Role Parameters</p>
              </div>
            </div>

            <div className="space-y-5 md:space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                  Professional Title
                </label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 px-5 font-medium focus:bg-white w-full"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                  Role Requirements
                </label>
                <Textarea
                  placeholder="Paste the technical stack and responsibilities..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] md:min-h-[220px] rounded-xl border-slate-200 bg-slate-50/50 p-5 font-medium resize-none focus:bg-white w-full"
                  disabled={isAnalyzing}
                />
              </div>
            </div>
          </div>

          {/* Right: Upload */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">Resume Payload</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">Source Document</p>
              </div>
            </div>

            <div className="relative w-full">
              <FileUpload
                onFileUpload={handleFileUpload}
                onFileClear={() => setUploadedFile(null)}
                acceptedTypes={['.pdf', '.docx', '.txt']}
                maxSize={10}
                isUploading={isAnalyzing}
              />
              
              <AnimatePresence>
                {uploadedFile && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 md:p-5"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm text-emerald-600 border border-emerald-100">
                        <FileCode className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 truncate">
                          Verified • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-emerald-500 ml-4 shrink-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 md:p-6"
              >
                <div className="flex items-center gap-3 text-indigo-600">
                  <Terminal className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Optimization Status</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium gap-4">
                    <span className="text-slate-600 italic tracking-tight truncate">{currentStep}</span>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100/50">
                    <motion.div
                      className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 30, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className={`btn-premium group relative flex w-full h-14 md:h-16 items-center justify-center gap-4 rounded-2xl text-[11px] md:text-sm font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
              canAnalyze 
                ? 'bg-slate-900 text-white shadow-slate-200' 
                : 'cursor-not-allowed bg-slate-100 text-slate-400 shadow-none'
            }`}
          >
            {isAnalyzing ? (
              <>Running Optimization Pipeline</>
            ) : (
              <>
                Confirm and Optimize
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
