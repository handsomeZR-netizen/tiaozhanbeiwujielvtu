import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useItineraryGenerator } from './hooks/useItineraryGenerator';
import { ItineraryWizard } from './components/ItineraryWizard';
import { ItineraryAgentFlow } from './components/ItineraryAgentFlow';
import { ItineraryResult } from './components/ItineraryResult';
import { ItineraryForm } from './itinerary.types';
import { AlertCircle, X } from 'lucide-react';

interface ItineraryPageProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const ItineraryPage: React.FC<ItineraryPageProps> = ({ onComplete, onCancel }) => {
  const { isGenerating, result, error, startGeneration, finishGeneration, retry, reset, clearError } = useItineraryGenerator();

  const handleWizardComplete = (form: ItineraryForm) => {
    startGeneration(form);
  };

  const handleGenerationComplete = () => {
    finishGeneration();
  };

  const handleBack = () => {
    reset();
  };

  const handleRetry = () => {
    clearError();
    retry();
  };

  return (
    <div className="min-h-screen bg-paper-100 relative">
      {/* Error Notification Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
          >
            <div className="bg-red-50 border-2 border-red-200 rounded-sm shadow-float p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-serif text-red-900">{error}</p>
                {retry && (
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-xs font-bold text-red-700 hover:text-red-900 underline transition-colors"
                  >
                    重试
                  </button>
                )}
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="关闭错误提示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isGenerating && !result && (
          <ItineraryWizard key="wizard" onComplete={handleWizardComplete} onCancel={onCancel} />
        )}
        
        {isGenerating && (
          <ItineraryAgentFlow key="flow" onComplete={handleGenerationComplete} />
        )}
        
        {result && (
          <ItineraryResult key="result" data={result} onBack={handleBack} />
        )}
      </AnimatePresence>
    </div>
  );
};
