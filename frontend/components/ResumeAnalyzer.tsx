'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Target, Loader2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/ui/file_upload';
import { useFileUpload } from '@/hooks/use_file_upload';
import { FileProcessor, FileProcessingResult } from '@/lib/file_processor';
import { CrewAPI, AnalysisRequest } from '@/lib/crew_api';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface ResumeAnalyzerProps {
  onAnalysisComplete: (results: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function ResumeAnalyzer({ 
  onAnalysisComplete, 
  isAnalyzing, 
  setIsAnalyzing 
}: ResumeAnalyzerProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { uploadFile, isUploading, uploadProgress } = useFileUpload();

  const analysisSteps = [
    { threshold: 20, message: "Processing your resume..." },
    { threshold: 40, message: "Extracting text content..." },
    { threshold: 60, message: "Analyzing job requirements..." },
    { threshold: 80, message: "Optimizing content..." },
    { threshold: 95, message: "Finalizing results..." },
    { threshold: 100, message: "Complete!" }
  ];

  const getCurrentStep = (progress: number) => {
    return analysisSteps.find(step => progress <= step.threshold)?.message || "Processing...";
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploadedFile(file);
    
    try {
      // Validate file
      const validation = FileProcessor.validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Process file
      const result: FileProcessingResult = await FileProcessor.processFile(file);
      
      if (result.success && result.text) {
        setExtractedText(result.text);
      } else {
        setError(result.error || 'Failed to extract text from file');
      }
    } catch (error) {
      console.error('File processing failed:', error);
      setError('Failed to process file. Please try again.');
    }
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleAnalyze = async () => {
    if (!uploadedFile || !jobTitle.trim() || !jobDescription.trim()) {
      setError('Please upload a resume and provide job details');
      return;
    }

    if (!extractedText.trim()) {
      setError('No text could be extracted from the uploaded file');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep(getCurrentStep(0));

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 12, 95);
        setCurrentStep(getCurrentStep(newProgress));
        
        if (newProgress >= 95) {
          clearInterval(progressInterval);
        }
        
        return newProgress;
      });
    }, 800);

    // --- Start of Changed Section ---
    try {
      // Create a FormData object to send the file and text data
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('job_title', jobTitle.trim());
      formData.append('job_description', jobDescription.trim());

      // Make the API call to your FastAPI backend
      const response = await axios.post(
        `${API_BASE_URL}/resume/analyze`,
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep(getCurrentStep(100));

      // Check for a successful response and the expected data
      if (response.data && response.data.success) {
        setTimeout(() => {
          // Pass the 'results' object to the parent component
          onAnalysisComplete(response.data.results); 
          setIsAnalyzing(false);
        }, 1000);
      } else {
        throw new Error(response.data.detail || 'Analysis failed to return results.');
      }
      
    } catch (error: any) {
      console.error('Analysis failed:', error);
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setProgress(0);
      
      // Display a more helpful error message
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed. Please try again.';
      setError(errorMessage);
    }
  };


  const canAnalyze = uploadedFile && jobTitle.trim() && jobDescription.trim() && extractedText.trim();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="p-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Analysis</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume and provide job details for AI-powered ATS optimization
          </p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Upload className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Upload Resume</h3>
            <span className="text-sm text-gray-500">(.pdf, .docx, .txt up to 10MB)</span>
          </div>
          
          <FileUpload
            onFileUpload={handleFileUpload}
            acceptedTypes={['.pdf', '.docx', '.txt']}
            maxSize={10} // 10MB
            isUploading={isUploading}
            progress={uploadProgress}
          />

          {uploadedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-800 truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  {extractedText && ` • ${extractedText.length} characters extracted`}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Job Details Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Job Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Target Job Title *
              </label>
              <Input
                placeholder="e.g., Machine Learning Engineer, Software Developer, Data Scientist"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <Textarea
                placeholder="Paste the complete job description here. Include requirements, responsibilities, and desired skills for best optimization results..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isAnalyzing}
              />
              <div className="text-sm text-gray-500 flex items-center space-x-1">
                <span>💡 Tip: More detailed job descriptions lead to better optimization</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    <span className="font-semibold text-blue-900 text-lg">
                      Analyzing Your Resume...
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-blue-700">
                      <span>{currentStep}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-blue-600 space-y-1">
                    <p>🤖 AI agents are working on your resume</p>
                    <p>⏱️ This typically takes 30-60 seconds</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className={cn(
              "px-8 py-3 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]",
              canAnalyze && !isAnalyzing
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            )}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="h-5 w-5 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>

          {!canAnalyze && !isAnalyzing && (
            <p className="text-sm text-gray-500 text-center">
              Please upload a resume and provide job details to continue
            </p>
          )}
        </motion.div>

        {/* Tips Section */}
        {!isAnalyzing && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-900">Pro Tips for Best Results</h4>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Upload your resume in <strong>PDF or DOCX format</strong> for optimal text extraction</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Include the <strong>complete job description</strong> with requirements and responsibilities</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>Mention specific <strong>skills, tools, and technologies</strong> from the job posting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>The AI will optimize keyword density and improve ATS compatibility</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center items-center space-x-4 py-4"
        >
          {[
            { step: 1, label: "Upload", icon: Upload, completed: !!uploadedFile },
            { step: 2, label: "Details", icon: FileText, completed: !!(jobTitle && jobDescription) },
            { step: 3, label: "Analyze", icon: Target, completed: false, active: isAnalyzing }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                item.completed 
                  ? "bg-green-500 border-green-500 text-white" 
                  : item.active
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium",
                item.completed ? "text-green-600" : item.active ? "text-blue-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
              {index < 2 && (
                <div className={cn(
                  "w-8 h-0.5 mx-3",
                  item.completed ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </Card>
  );
}