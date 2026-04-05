'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AISettings() {
  const [backendUrl, setBackendUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  );
  const [status, setStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkBackendHealth() {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-store',
        });

        const payload = (await response.json()) as {
          backendUrl?: string;
        };

        if (!cancelled) {
          if (payload.backendUrl) {
            setBackendUrl(payload.backendUrl);
          }
          setStatus(response.ok ? 'connected' : 'offline');
        }
      } catch {
        if (!cancelled) {
          setStatus('offline');
        }
      }
    }

    checkBackendHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusCopy = {
    checking: {
      icon: Loader2,
      label: 'Checking backend',
      tone: 'text-amber-700',
      box: 'bg-amber-50 border-amber-200',
      iconClass: 'animate-spin text-amber-600',
    },
    connected: {
      icon: CheckCircle,
      label: 'FastAPI backend connected',
      tone: 'text-green-700',
      box: 'bg-green-50 border-green-200',
      iconClass: 'text-green-600',
    },
    offline: {
      icon: AlertCircle,
      label: 'Backend unavailable',
      tone: 'text-red-700',
      box: 'bg-red-50 border-red-200',
      iconClass: 'text-red-600',
    },
  }[status];

  const StatusIcon = statusCopy.icon;

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
              <p className="text-sm text-blue-700 font-mono">OpenAI via CrewAI</p>
            </div>

            <div className={`p-4 rounded-lg border ${statusCopy.box}`}>
              <div className="flex items-center space-x-2 mb-2">
                <StatusIcon className={`h-4 w-4 ${statusCopy.iconClass}`} />
                <span className="font-medium text-green-900">API Status</span>
              </div>
              <p className={`text-sm ${statusCopy.tone}`}>{statusCopy.label}</p>
              <p className="mt-1 break-all text-xs text-gray-500">{backendUrl}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">CrewAI pipeline orchestration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Server-side PDF/DOCX extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">ATS resume rewriting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Scoring and recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
