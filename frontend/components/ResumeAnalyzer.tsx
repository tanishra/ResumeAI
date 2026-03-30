'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/ui/file_upload';
import { CrewAPI, type AnalysisResults } from '@/lib/crew_api';

interface ResumeAnalyzerProps {
  onAnalysisComplete: (results: AnalysisResults) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const ANALYSIS_STEPS = [
  { threshold: 20, message: 'Uploading resume...' },
  { threshold: 40, message: 'Extracting text...' },
  { threshold: 65, message: 'Running CrewAI pipeline...' },
  { threshold: 85, message: 'Scoring ATS alignment...' },
  { threshold: 100, message: 'Complete!' },
];

function getCurrentStep(progress: number) {
  return (
    ANALYSIS_STEPS.find((step) => progress <= step.threshold)?.message ||
    'Processing...'
  );
}

export default function ResumeAnalyzer({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
}: ResumeAnalyzerProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const startProgress = () => {
    setProgress(8);
    setCurrentStep(getCurrentStep(8));

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((previous) => {
        const next = Math.min(previous + Math.random() * 10, 92);
        setCurrentStep(getCurrentStep(next));
        return next;
      });
    }, 800);
  };

  const stopProgress = (finalValue = 100) => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setProgress(finalValue);
    setCurrentStep(getCurrentStep(finalValue));
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploadedFile(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !jobTitle.trim() || !jobDescription.trim()) {
      setError('Please upload a resume and provide job details.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    startProgress();

    try {
      const results = await CrewAPI.analyzeResume(
        uploadedFile,
        jobTitle.trim(),
        jobDescription.trim()
      );

      stopProgress(100);
      window.setTimeout(() => {
        onAnalysisComplete(results);
        setIsAnalyzing(false);
      }, 300);
    } catch (caughtError) {
      stopProgress(0);
      setIsAnalyzing(false);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Analysis failed. Please try again.'
      );
    }
  };

  const canAnalyze = Boolean(
    uploadedFile && jobTitle.trim() && jobDescription.trim() && !isAnalyzing
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Card className="border-0 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="space-y-2 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Analysis</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Upload your resume and provide job details for ATS-focused
            optimization using the FastAPI + CrewAI backend.
          </p>
        </motion.div>

        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="mb-3 flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Upload Resume</h3>
            <span className="text-sm text-gray-500">
              (.pdf, .docx, .txt up to 10MB)
            </span>
          </div>

          <FileUpload
            onFileUpload={handleFileUpload}
            onFileClear={() => setUploadedFile(null)}
            acceptedTypes={['.pdf', '.docx', '.txt']}
            maxSize={10}
            isUploading={isAnalyzing}
            progress={progress}
          />

          {uploadedFile ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-4"
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-green-800">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </motion.div>
          ) : null}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Job Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Target Job Title *
              </label>
              <Input
                placeholder="e.g., Machine Learning Engineer"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                className="min-h-[220px] text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                disabled={isAnalyzing}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Resume
              </>
            ) : (
              'Run ATS Analysis'
            )}
          </Button>

          {(isAnalyzing || progress > 0) && currentStep ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{currentStep}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </Card>
  );
}
