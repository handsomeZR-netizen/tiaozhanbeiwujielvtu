import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Compass, PenTool, Sparkles, 
  FileText, Map, Calendar, Search, 
  Check, Hash, User, MapPin, 
  Stamp, Printer, Coffee
} from 'lucide-react';
import { AGENTS } from '../itinerary.data';

interface ItineraryAgentFlowProps {
  onComplete: () => void;
}

// Visual components for each agent stage
const AnalyzerStage = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-paper-100 border-2 border-ink p-6 rounded-sm shadow-neu-flat w-64 rotate-1 relative"
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink text-paper-50 px-2 py-0.5 text-xs font-mono">PROFILE</div>
      <div className="flex gap-4 mb-4 border-b border-ink/10 pb-4">
        <div className="w-12 h-12 bg-paper-300 rounded border border-ink/20 flex items-center justify-center">
            <User className="text-ink-light" />
        </div>
        <div className="space-y-2 flex-1">
            <motion.div 
                initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 1 }}
                className="h-2 bg-ink/20 rounded-full" 
            />
            <motion.div 
                initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 1, delay: 0.2 }}
                className="h-2 bg-ink/20 rounded-full" 
            />
        </div>
      </div>
      <div className="space-y-2">
        {['History', 'Culture', 'Nature'].map((tag, i) => (
            <motion.div 
                key={tag}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.3 }}
                className="flex items-center gap-2 text-sm font-mono text-ink"
            >
                <Hash size={12} className="text-ink-accent" /> {tag}
            </motion.div>
        ))}
      </div>
    </motion.div>
    {/* Floating elements */}
    <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 right-10 opacity-20"
    >
        <Brain size={64} className="text-ink-blue" />
    </motion.div>
  </div>
);

const PlannerStage = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
    <div className="relative w-full max-w-xs aspect-square bg-paper-200 border border-ink/20 rounded-sm p-4 overflow-hidden">
        {/* Map Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#2c2c2a 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.path 
                d="M 60 60 L 150 120 L 240 80"
                fill="none"
                stroke="#d9463e"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
        </svg>

        {/* Pins */}
        {[
            { x: 60, y: 60, delay: 0 },
            { x: 150, y: 120, delay: 0.8 },
            { x: 240, y: 80, delay: 1.6 }
        ].map((pin, i) => (
            <motion.div
                key={i}
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: pin.delay, type: "spring" }}
                className="absolute -ml-3 -mt-6"
                style={{ left: pin.x, top: pin.y }}
            >
                <MapPin className="text-ink w-6 h-6 fill-paper-50" />
            </motion.div>
        ))}
        
        <motion.div 
            className="absolute bottom-4 right-4 bg-paper-50 border border-ink px-2 py-1 text-xs font-mono flex items-center gap-2 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
        >
            <Compass size={12} className="animate-spin" /> OPTIMIZING
        </motion.div>
    </div>
  </div>
);

const DesignerStage = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
     <div className="w-64 bg-paper-50 border-t-8 border-ink-blue shadow-neu-flat p-4 rounded-sm">
        <div className="flex justify-between items-center mb-4 border-b border-ink/10 pb-2">
            <span className="font-bold text-lg font-serif">日程表</span>
            <Calendar size={16} className="text-ink-light" />
        </div>
        <div className="space-y-3">
            {[1, 2, 3].map((item) => (
                <motion.div
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: item * 0.4 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-12 text-xs font-mono text-ink-light text-right">09:00</div>
                    <div className="flex-1 h-8 bg-paper-200 rounded-sm border border-transparent flex items-center px-2">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: item * 0.4 + 0.2, duration: 0.5 }}
                            className="h-1 bg-ink/20 rounded-full"
                        />
                    </div>
                </motion.div>
            ))}
        </div>
     </div>
     <motion.div 
        className="absolute top-1/2 right-10 text-ink-blue opacity-20"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
     >
        <PenTool size={48} />
     </motion.div>
  </div>
);

const PolisherStage = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
    <div className="relative">
        <motion.div 
            className="bg-paper-100 p-6 border border-ink/10 shadow-lg max-w-xs text-justify font-serif text-sm leading-relaxed text-ink/60 blur-[1px]"
            animate={{ filter: "blur(0px)", color: "#2c2c2a" }}
            transition={{ duration: 1.5 }}
        >
            <p>本次旅程精心挑选了京都最具代表性的文化地标，不仅有清水寺的晨钟暮鼓，更安排了隐秘的怀石料理...</p>
        </motion.div>
        
        {/* Magnifying Glass */}
        <motion.div
            className="absolute -top-6 -right-6 text-ink-accent"
            animate={{ x: [-20, 20, 0], y: [20, -20, 0] }}
            transition={{ duration: 2 }}
        >
            <Search size={48} />
        </motion.div>

        {/* Stamp Animation */}
        <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
        >
            <div className="border-4 border-ink-accent text-ink-accent font-black text-xl px-4 py-2 rounded-sm -rotate-12 opacity-80 mix-blend-multiply flex items-center gap-2">
                <Stamp size={24} /> APPROVED
            </div>
        </motion.div>
    </div>
  </div>
);

export const ItineraryAgentFlow: React.FC<ItineraryAgentFlowProps> = ({ onComplete }) => {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');

  // Overall progress timer
  useEffect(() => {
    const totalDuration = AGENTS.reduce((acc, agent) => acc + agent.duration, 0);
    const interval = 50;
    const increment = 100 / (totalDuration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Agent sequencing logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const processAgents = async () => {
      for (let i = 0; i < AGENTS.length; i++) {
        setCurrentAgentIndex(i);
        const agent = AGENTS[i];
        
        const stepDuration = agent.duration / agent.steps.length;
        for (const step of agent.steps) {
            setCurrentStepText(step);
            await new Promise(r => setTimeout(r, stepDuration));
        }
      }
      await new Promise(r => setTimeout(r, 800));
      onComplete();
    };

    processAgents();

    return () => clearTimeout(timeoutId);
  }, [onComplete]);

  const CurrentStageComponent = [AnalyzerStage, PlannerStage, DesignerStage, PolisherStage][currentAgentIndex];

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-paper-300/90 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-flow-title"
        aria-describedby="agent-flow-desc"
    >
      <div className="w-full max-w-4xl h-[600px] flex gap-6 p-4">
        
        {/* Left Side: Agent Queue (Sidebar) */}
        <div className="w-64 bg-paper-50 shadow-2xl border border-ink/10 flex flex-col relative overflow-hidden hidden md:flex" role="complementary" aria-label="工作流程队列">
             <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" aria-hidden="true" />
             <div className="p-4 border-b border-ink/10 bg-paper-200">
                <h3 id="agent-flow-title" className="font-bold text-ink tracking-widest text-xs flex items-center gap-2">
                    <Printer size={12} aria-hidden="true" /> WORKFLOW QUEUE
                </h3>
             </div>
             
             <div className="flex-1 p-4 space-y-6 overflow-hidden" role="list" aria-label="智能体处理步骤">
                <div className="absolute left-7 top-16 bottom-10 w-px bg-ink/10 border-l border-dashed border-ink/20" aria-hidden="true" />
                {AGENTS.map((agent, index) => {
                    const isActive = index === currentAgentIndex;
                    const isCompleted = index < currentAgentIndex;
                    
                    return (
                        <div key={agent.id} className="relative pl-8 z-10" role="listitem" aria-current={isActive ? 'step' : undefined}>
                            <motion.div 
                                className={`absolute left-0 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-paper-50 ${
                                    isActive ? 'border-ink text-ink scale-110 shadow-sm' : 
                                    isCompleted ? 'border-ink-light text-ink-light bg-paper-200' : 'border-paper-300'
                                }`}
                                animate={isActive ? { borderColor: ['#2c2c2a', '#d9463e', '#2c2c2a'] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                aria-label={`${agent.name} - ${isCompleted ? '已完成' : isActive ? '进行中' : '等待中'}`}
                            >
                                {isCompleted && <Check size={12} aria-hidden="true" />}
                                {isActive && <motion.div className="w-2 h-2 bg-ink rounded-full animate-pulse" aria-hidden="true" />}
                            </motion.div>
                            
                            <div className={`${isActive ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                                <div className="text-xs font-bold font-mono uppercase tracking-wider mb-0.5">
                                    {agent.name}
                                </div>
                                {isActive && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-[10px] text-ink-blue font-mono mt-1"
                                    >
                                        &gt; {currentStepText} <span className="animate-pulse">_</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )
                })}
             </div>
             
             <div className="p-4 border-t border-ink/10 bg-paper-100 text-[10px] font-mono text-ink-light flex justify-between">
                <span>SYS: ONLINE</span>
                <span>CPU: {Math.round(Math.random() * 40 + 20)}%</span>
             </div>
        </div>

        {/* Right Side: Main Stage */}
        <div className="flex-1 bg-paper-50 shadow-2xl border border-ink/10 relative flex flex-col" role="main" aria-labelledby="agent-flow-desc">
            <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" aria-hidden="true" />
            
            {/* Stage Header */}
            <div className="h-14 border-b border-ink/10 flex items-center justify-between px-6 bg-paper-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-ink-accent animate-pulse" aria-hidden="true" />
                    <span id="agent-flow-desc" className="font-bold text-ink tracking-tight font-serif text-lg" aria-live="polite">
                        {AGENTS[currentAgentIndex].desc}
                    </span>
                </div>
                <div className="font-mono text-xs text-ink-light" aria-label="任务编号">
                    JOB_ID: #8392-A
                </div>
            </div>

            {/* Stage Visualization */}
            <div className="flex-1 relative overflow-hidden bg-paper-100/50">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-5" 
                     style={{ backgroundImage: 'linear-gradient(#2c2c2a 1px, transparent 1px), linear-gradient(90deg, #2c2c2a 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentAgentIndex}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                    >
                        <CurrentStageComponent />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Footer */}
            <div className="h-16 border-t border-ink/10 px-6 flex items-center gap-4 bg-paper-50">
                <div className="flex-1 h-2 bg-paper-300 rounded-sm overflow-hidden border border-ink/5 relative" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="生成进度">
                    <div className="absolute inset-0 flex" aria-hidden="true">
                        {[...Array(20)].map((_, i) => (
                             <div key={i} className="flex-1 border-r border-paper-50/20" />
                        ))}
                    </div>
                    <motion.div 
                        className="h-full bg-ink shadow-[0_0_10px_rgba(44,44,42,0.4)] relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-ink-light animate-pulse" aria-hidden="true" />
                    </motion.div>
                </div>
                <div className="font-mono text-xl font-bold text-ink w-16 text-right" aria-live="polite">
                    {Math.round(progress)}%
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
}
