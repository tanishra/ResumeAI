'use client';

import { motion } from 'framer-motion';
import { Settings, Zap, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AISettings() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Model</span>
              </div>
              <p className="text-sm text-blue-700 font-mono">GPT-4.1-nano</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">API Status</span>
              </div>
              <p className="text-sm text-green-700">✅ Euri API Connected</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">ATS Keyword Optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Content Enhancement</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Format Optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Scoring & Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
