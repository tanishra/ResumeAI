'use client';

import { motion } from 'framer-motion';
import { Target, Github } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full"
    >
      <div className="border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="section-container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
            <Target className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            Resume<span className="text-indigo-600">AI.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          <button 
            onClick={() => scrollTo('features')}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-indigo-600 cursor-pointer"
          >
            Methodology
          </button>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <a
            href="https://github.com/tanishra/ResumeAI"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-slate-400 transition-colors hover:text-slate-900"
          >
            <Github className="h-5 w-5" />
          </a>
          <button 
            onClick={() => scrollTo('analyzer')}
            className="btn-premium rounded-xl bg-slate-900 px-5 md:px-6 py-2.5 md:py-3 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-200 shrink-0"
          >
            Get Started
          </button>
        </div>
        </div>
      </div>
      <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs md:text-sm font-medium text-amber-800 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        We are currently experiencing technical issues with our AI backend. We will be right back soon!
      </div>
    </motion.header>
  );
}
