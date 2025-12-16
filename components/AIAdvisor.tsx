import React, { useState } from 'react';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';
import { Subscription } from '../types';
import { analyzeSubscriptions } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  subscriptions: Subscription[];
}

export const AIAdvisor: React.FC<Props> = ({ subscriptions }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeSubscriptions(subscriptions);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-950/50 to-purple-900/30 rounded-2xl border border-indigo-500/30 backdrop-blur-lg p-6 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-400/30">
          <Bot className="w-10 h-10 text-indigo-300" />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
            AI Nexus Advisor <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </h2>
          
          {!analysis && !loading && (
            <p className="text-gray-300 mb-4">
              Attiva l'intelligenza artificiale per analizzare i tuoi flussi di spesa e ottimizzare i rinnovi.
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-indigo-300 animate-pulse my-4">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Elaborazione dati neurale in corso...</span>
            </div>
          )}

          {analysis && !loading && (
            <div className="prose prose-invert prose-sm max-w-none text-gray-200 bg-black/20 p-4 rounded-lg border border-indigo-500/20 shadow-inner">
               <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analysis ? 'Aggiorna Analisi' : 'Analizza Dati'}
          </button>
        </div>
      </div>
    </div>
  );
};