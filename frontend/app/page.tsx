'use client';

import { useState } from 'react';
import { motion, Variants} from 'framer-motion';
import { Brain, Sparkles, Target, Zap, Github, Linkedin, Twitter } from 'lucide-react';
import Header from '@/components/Header';
import ResumeAnalyzer from '@/components/ResumeAnalyzer';
import ResultsTabs from '@/components/ResultsTabs';
import AISettings from '@/components/AISettings';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants : Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your resume against ATS requirements"
    },
    {
      icon: Target,
      title: "Job-Specific Optimization",
      description: "Tailored recommendations based on your target job description"
    },
    {
      icon: Sparkles,
      title: "Content Enhancement",
      description: "Improve bullet points and sections for maximum impact"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get optimized resumes and scores in minutes, not hours"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
              <Brain className="h-8 w-8 text-indigo-600 animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              ATS-Optimized{' '}
              <span className="gradient-text">Resume Agent</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your resume with AI-powered optimization. Upload your resume, 
              target a role, and get an ATS-friendly version with scores and actionable insights.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-6 h-full card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Application */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <AISettings />
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-8">
              {/* Resume Analyzer */}
              <ResumeAnalyzer 
                onAnalysisComplete={setAnalysisResults}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />

              {/* Results */}
              {analysisResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResultsTabs results={analysisResults} />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="text-center py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have optimized their resumes 
                and increased their interview callbacks by up to 300%.
              </p>
              
              <motion.div
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
                <span>Start Optimizing Now</span>
              </motion.div>
            </div>
          </motion.div>

             {/* Footer */}
      <footer className="bg-slate-100/80 backdrop-blur-sm border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Agent</h3>
              <p className="text-gray-600 max-w-sm">
                Advanced resume optimization powered by AI. We help you create ATS-friendly resumes with actionable insights to land your dream job.
              </p>
            </div>

            {/* Links Section */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Resources Section */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-8 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 mb-6">
              <p className="order-2 sm:order-1 mt-4 sm:mt-0">© {new Date().getFullYear()} Resume Agent. All rights reserved.</p>
              <div className="flex space-x-4 order-1 sm:order-2">
                <a href="https://x.com/RajputTani53991" className="hover:text-indigo-600 transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="https://github.com/tanishra" className="hover:text-indigo-600 transition-colors"><Github className="h-5 w-5" /></a>
                <a href="https://www.linkedin.com/in/tr26/" className="hover:text-indigo-600 transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Resume intelligence powered by <a 
                href="https://euron.one/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-indigo-600 hover:underline"
              >
                Euron
              </a>.
            </p>
          </div>
        </div>
      </footer>
        </motion.div>
      </main>


      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>
    </div>
  );
}