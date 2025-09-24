'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Github, 
  Settings, 
  Menu, 
  X, 
  Star,
  ExternalLink,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FeaturesSection } from './Features';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'API Docs', href: 'https://euron.one/euri', icon: ExternalLink },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <motion.div
                className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.4 }
                }}
              >
                <Brain className="h-6 w-6 text-white" />
              </motion.div>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl animate-ping opacity-20" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">
                Resume<span className="text-blue-600">AI</span>
              </h1>
              <p className="text-sm text-gray-600 leading-tight">
                ATS-Optimized Agent
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className='ml-43'>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-blue-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </motion.a>
            ))}
          </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-500 rounded-full"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-700 font-medium">API Online</span>
            </motion.div>

            {/* Settings Button */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex items-center space-x-2 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </motion.div> */}

            {/* GitHub Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex items-center space-x-2 bg-gray-900 text-white transition-transform duration-200 transform hover:scale-105"
                onClick={() => window.open('https://github.com/tanishra/ResumeAI', '_blank')}
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Button>
            </motion.div>

            {/* Get Started Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* shadow-xl hover:shadow-lg transition-all duration-200 */}
              <Button 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-transform duration-200 transform hover:scale-105"
              >
                <Zap className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-3">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-blue-50"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.a>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        window.open('https://github.com', '_blank');
                        setIsMenuOpen(false);
                      }}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white justify-start"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                </div>

                {/* Mobile Status */}
                <div className="pt-4">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700 font-medium">API Online</span>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
} 