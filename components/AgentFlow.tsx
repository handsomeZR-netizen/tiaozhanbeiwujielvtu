import React, { useEffect, useState } from 'react';
import { Eye, Languages, Palette, Share2, CheckCircle2 } from 'lucide-react';

interface AgentFlowProps {
  isRunning: boolean;
  onComplete?: () => void;
}

export const AgentFlow: React.FC<AgentFlowProps> = ({ isRunning, onComplete }) => {
  const [activeStep, setActiveStep] = useState(-1);

  const steps = [
    { id: 0, icon: Eye, label: "场景感知", sub: "ScenePerceptor", desc: "正在识别环境..." },
    { id: 1, icon: Languages, label: "文化转译", sub: "ContextTranslator", desc: "正在解码文化符号..." },
    { id: 2, icon: Palette, label: "视觉重构", sub: "ArtCreator", desc: "正在生成反差海报..." },
    { id: 3, icon: Share2, label: "传播优化", sub: "SpreadOptimizer", desc: "正在生成智能标签..." },
  ];

  useEffect(() => {
    if (isRunning) {
      setActiveStep(0);
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            if(onComplete) setTimeout(onComplete, 500);
            return 4; // Done
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    } else {
      setActiveStep(-1);
    }
  }, [isRunning, onComplete]);

  if (!isRunning && activeStep === -1) return null;

  return (
    <div className="w-full bg-stone-900 text-stone-100 rounded-sm p-5 my-6 shadow-2xl border border-stone-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10 font-mono text-xs text-right leading-3 pointer-events-none">
         AI AGENT<br/>ACTIVE
      </div>
      
      <div className="flex justify-between items-end mb-4 pb-2 border-b border-stone-800">
        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">智能体协作流</span>
        {activeStep === 4 ? (
           <span className="text-emerald-400 text-xs flex items-center gap-1 tracking-wider"><CheckCircle2 size={12}/> 完成生成</span>
        ) : (
           <span className="text-amber-500 text-xs animate-pulse tracking-wider">正在协作...</span>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {steps.map((step, index) => {
            const Icon = step.icon;
            const isPast = activeStep > index;
            const isCurrent = activeStep === index;
            const isFuture = activeStep < index;

            return (
                <div key={step.id} className={`flex items-start gap-4 transition-all duration-500 ${isFuture ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                    <div className={`mt-0.5 p-1.5 rounded-sm border ${isCurrent ? 'border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : isPast ? 'border-emerald-600 text-emerald-500 bg-emerald-900/20' : 'border-stone-700 text-stone-600'}`}>
                        <Icon size={14} strokeWidth={isCurrent ? 2 : 1.5} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center h-6">
                            <div className="flex items-baseline gap-2">
                                <span className={`text-sm font-bold tracking-wide ${isCurrent ? 'text-amber-100' : 'text-stone-300'}`}>{step.label}</span>
                                <span className="text-[9px] font-mono text-stone-600 uppercase hidden sm:inline-block">{step.sub}</span>
                            </div>
                            {isCurrent && <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"/>}
                        </div>
                        <p className={`text-xs mt-0.5 font-light transition-colors ${isCurrent ? 'text-stone-400' : 'text-stone-600'}`}>{step.desc}</p>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};