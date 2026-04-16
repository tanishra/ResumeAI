'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, ArrowDown, ChevronRight, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import ResumeAnalyzer from '@/components/ResumeAnalyzer';
import ResultsTabs from '@/components/ResultsTabs';
import { type AnalysisResults } from '@/lib/crew_api';

function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center pt-20">
      <div className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">The Gold Standard in ATS Optimization</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-gradient-indigo text-6xl font-black leading-[1.05] tracking-tight sm:text-8xl lg:text-9xl"
        >
          Elevate your <br />
          <span className="serif-display italic font-normal text-indigo-600">professional</span> story.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl font-medium"
        >
          Grounded AI that bridges the gap between your real-world experience and 
          automated recruitment algorithms. Zero fabrication. Maximum impact.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <button 
            onClick={() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-premium flex h-14 items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-10 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200"
          >
            Start Analyzing
            <ChevronRight className="h-4 w-4" />
          </button>
          <button className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-10 text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50">
            Read Methodology
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, accent }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-card-light group relative overflow-hidden rounded-[32px] border-slate-200/60 bg-white/50 p-10 shadow-sm transition-all"
    >
      <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-sm border border-slate-100 text-${accent}-600`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-4 text-lg leading-relaxed text-slate-500 font-medium">{desc}</p>
      
      <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more <ChevronRight className="h-3 w-3" />
      </div>
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-40 bg-slate-50/50">
      <div className="section-container">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Engineered for the <span className="text-indigo-600">modern candidate.</span>
            </h2>
            <p className="mt-6 text-xl text-slate-500 font-medium leading-relaxed">
              We've replaced generic LLM prompts with a deterministic verification pipeline that preserves 100% of your truth.
            </p>
          </div>
          <div className="h-px flex-1 bg-slate-200 mb-4 hidden lg:block" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={Shield} 
            title="Grounding Engine" 
            desc="A dedicated validation pass that cross-references every AI claim against your source document."
            accent="emerald"
          />
          <FeatureCard 
            icon={Target} 
            title="Semantic Tuning" 
            desc="Go beyond keyword stuffing. We align your experience with the recruiter's intent."
            accent="blue"
          />
          <FeatureCard 
            icon={Zap} 
            title="Async Pipeline" 
            desc="Experience zero-latency feedback with real-time status updates through our secure SSE stream."
            accent="indigo"
          />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <main className="relative selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden min-h-screen">
      <div className="light-mesh" />
      <Header />

      <AnimatePresence mode="wait">
        {!analysisResults ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroSection />
            <FeaturesSection />
            
            <section id="analyzer" className="section-container py-24 md:py-40">
              <div className="mx-auto max-w-4xl w-full">
                <div className="mb-12 md:mb-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Begin Optimization</h2>
                  <p className="mt-4 text-lg md:text-xl text-slate-500 font-medium">Upload your profile to start the high-fidelity transformation.</p>
                </div>
                <ResumeAnalyzer
                  onAnalysisComplete={setAnalysisResults}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
                />
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="section-container pb-24 md:pb-32 pt-32"
          >
            <div className="mb-10 md:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                  Intelligence Report 01
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 break-words">Analysis Result.</h2>
              </div>
              <button
                onClick={() => setAnalysisResults(null)}
                className="btn-premium w-full md:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-slate-600 shadow-sm"
              >
                Reset Session
              </button>
            </div>
            
            <ResultsTabs results={analysisResults} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-100 bg-white py-16 md:py-20">
        <div className="section-container flex flex-col items-center justify-between gap-10 md:flex-row text-center md:text-left">
          <div className="space-y-4">
            <div className="text-xl font-black tracking-tighter text-slate-900">Resume<span className="text-indigo-600">AI.</span></div>
            <div className="text-slate-400 font-medium max-w-xs mx-auto md:mx-0">
              Handcrafted career tools for high-stakes engineering pipelines.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
