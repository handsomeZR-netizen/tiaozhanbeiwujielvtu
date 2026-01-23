import React from 'react';
import { BrainCircuit, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import type { ThinkingStep } from '@/features/diary/diary.utils';

type DiaryThinkingOverlayProps = {
  steps: ThinkingStep[];
};

export const DiaryThinkingOverlay: React.FC<DiaryThinkingOverlayProps> = ({ steps }) => {
  return (
    <div className="absolute inset-0 bg-brand-50/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8">
      <div className="relative mb-12">
        <div className="w-24 h-24 rounded-full bg-white border border-brand-200 flex items-center justify-center shadow-2xl relative z-10">
          <BrainCircuit className="text-brand-accent animate-pulse-slow" size={48} />
        </div>
        <div className="absolute inset-0 rounded-full border border-brand-accent/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-0 rounded-full border border-brand-accent/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-700"></div>
      </div>

      <div className="w-full max-w-md space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 transition-all duration-500 ${
              step.status === 'pending' ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="flex-shrink-0 w-6 flex justify-center">
              {step.status === 'completed' && <CheckCircle2 className="text-green-600" size={20} />}
              {step.status === 'active' && <Loader2 className="text-brand-accent animate-spin" size={20} />}
              {step.status === 'pending' && <CircleDashed className="text-stone-400" size={20} />}
            </div>

            <div className={`flex-1 border-l-2 pl-4 py-1 ${step.status === 'active' ? 'border-brand-accent' : 'border-brand-200'}`}>
              <p
                className={`font-mono text-sm ${
                  step.status === 'active' ? 'text-brand-900 font-bold' : 'text-stone-500'
                }`}
              >
                {step.text}
              </p>
              {step.status === 'active' && <p className="text-xs text-brand-accent mt-1 animate-pulse">处理中...</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
