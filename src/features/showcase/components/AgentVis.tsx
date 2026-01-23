import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Languages, Palette, Share2, Sparkles, Activity, Network, Zap, Cpu, Search, Code, BarChart3 } from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  role: string;
  desc: string;
  logs: string[];
  icon: React.ReactNode;
  color: string;
  bg: string;
  borderColor: string;
}

const agents: AgentStep[] = [
  { 
    id: 'perception', 
    name: '全域感知智能体', 
    role: 'Scene Perception',
    desc: '深度解析视觉场景，识别市井烟火与潜在文化冲突点。', 
    logs: [
      '> 初始化视觉编码器 (ViT)...',
      '> 识别场景实体: [古建筑, 街道, 游客]',
      '> 分析情感基调: "怀旧" (Confidence: 0.92)',
      '> 检测到潜在文化符号: "马头墙"'
    ],
    icon: <Eye size={20} />, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  { 
    id: 'translation', 
    name: '文化转译智能体', 
    role: 'Context Translation',
    desc: '连接当代中国文化图谱 (RAG)，消弭认知理解偏差。', 
    logs: [
      '> 接收视觉上下文...',
      '> RAG 检索知识库: "Huizhou Architecture"',
      '> 生成跨文化隐喻解释...',
      '> 语义对齐完成: 核心叙事构建'
    ],
    icon: <Languages size={20} />, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  { 
    id: 'creation', 
    name: '视觉重构智能体', 
    role: 'Art Creation',
    desc: '基于叙事逻辑构建创意 Prompt，产出高审美视觉作品。', 
    logs: [
      '> 解析叙事结构...',
      '> 构建 Stable Diffusion 提示词...',
      '> 应用风格迁移: "新中式赛博朋克"',
      '> 渲染图层合成与优化'
    ],
    icon: <Palette size={20} />, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  { 
    id: 'distribution', 
    name: '传播策略智能体', 
    role: 'Spread Optimization',
    desc: '分析全球社交热点趋势，最大化视觉内容的传播潜力。', 
    logs: [
      '> 扫描 TikTok/Instagram 趋势...',
      '> 匹配热门 Hashtag: #ChinaTravel',
      '> 生成受众画像分析...',
      '> 预测传播指数: 98.5 (High)'
    ],
    icon: <Share2 size={20} />, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50',
    borderColor: 'border-rose-200'
  },
];

export const AgentVis: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % agents.length);
    }, 4000); // Slower interval to allow reading logs
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      {/* Section Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-indigo-800 text-xs font-bold mb-6 tracking-widest uppercase z-10"
        >
          <Network size={14} className="text-indigo-500" /> 
          AI Collaboration Engine
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold text-ink-900 mb-6 font-serif">
          Graphic Weaver <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">织图引擎</span>
        </h2>
        <p className="text-ink-500 max-w-2xl mx-auto font-light leading-relaxed">
          模拟人类认知的 <span className="font-medium text-ink-800">"感知-理解-创作-传播"</span> 闭环链路，<br/>
          通过多智能体交织协作，实现视觉叙事的自动化与深度化。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* Left: Complex Network Visualization (7 columns) */}
        <div className="lg:col-span-7 relative h-[500px] flex items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* Decorative Grid */}
          <div className="absolute inset-0 tech-grid opacity-40"></div>
          
          {/* Connecting Lines Layer (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             {/* Draw connections between all nodes to form a web */}
             {agents.map((agent, i) => {
                const angle = (i * 90) * (Math.PI / 180);
                const radius = 160;
                const x = 50 + (Math.cos(angle) * radius / 500 * 100); // Percentage approx
                const y = 50 + (Math.sin(angle) * radius / 500 * 100);

                // Line to Center
                return (
                  <g key={`lines-${i}`}>
                    {/* Center Connection */}
                    <motion.line 
                      x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`}
                      stroke={activeStep === i ? "url(#gradient-line)" : "#e2e8f0"}
                      strokeWidth={activeStep === i ? 2 : 1}
                      strokeDasharray={activeStep === i ? "0" : "4 4"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                    />
                    
                    {/* Neighbor Connection (The Weaving) */}
                    {agents.map((_, j) => {
                       if (i === j) return null;
                       const angle2 = (j * 90) * (Math.PI / 180);
                       const x2 = 50 + (Math.cos(angle2) * radius / 500 * 100);
                       const y2 = 50 + (Math.sin(angle2) * radius / 500 * 100);
                       return (
                         <motion.line 
                           key={`cross-${i}-${j}`}
                           x1={`${x}%`} y1={`${y}%`} x2={`${x2}%`} y2={`${y2}%`}
                           stroke="#f1f5f9"
                           strokeWidth="1"
                           opacity="0.5"
                         />
                       )
                    })}

                    {/* Active Particle flowing to center */}
                    {activeStep === i && (
                      <motion.circle r="3" fill="#6366f1">
                        <animateMotion 
                          dur="1s" 
                          repeatCount="indefinite"
                          path={`M ${Math.cos(angle) * 160 + 250},${Math.sin(angle) * 160 + 250} L 250,250`} 
                        />
                      </motion.circle>
                    )}
                  </g>
                );
             })}
             <defs>
               <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#6366f1" />
                 <stop offset="100%" stopColor="#a855f7" />
               </linearGradient>
             </defs>
          </svg>

          {/* Central Hub: Orchestrator */}
          <div className="relative z-10">
            <motion.div 
              className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-indigo-50 relative"
              animate={{ boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0)", "0 0 0 20px rgba(99, 102, 241, 0.1)", "0 0 0 0 rgba(99, 102, 241, 0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-0 rounded-full border border-indigo-100 opacity-50 animate-ping"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-2 shadow-inner">
                 <Brain size={32} />
              </div>
              <div className="text-[10px] font-bold text-ink-900 tracking-wider">多模态协同中枢</div>
              <div className="text-[8px] text-ink-400 font-mono">ORCHESTRATOR</div>
            </motion.div>
          </div>

          {/* Satellite Agents */}
          {agents.map((agent, index) => {
            const angle = (index * 90) * (Math.PI / 180);
            const radius = 160; 
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isActive = index === activeStep;

            return (
              <motion.div
                key={agent.id}
                className={`absolute z-20 w-auto p-3 pr-4 rounded-2xl flex items-center gap-3 border transition-all duration-500 cursor-pointer
                  ${isActive 
                    ? 'bg-white border-indigo-200 shadow-xl scale-105 z-30' 
                    : 'bg-white/80 border-slate-100 shadow-sm text-slate-400 grayscale hover:grayscale-0'}`}
                style={{ 
                  left: `calc(50% + ${x}px)`, 
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)' 
                }}
                onClick={() => setActiveStep(index)}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? agent.bg + ' ' + agent.color : 'bg-slate-100 text-slate-400'}`}>
                  {agent.icon}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-ink-900' : 'text-slate-400'}`}>{agent.name}</span>
                  {isActive && <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-wider">Active</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Agent Details & Console (5 columns) */}
        <div className="lg:col-span-5 flex flex-col h-[500px]">
          {/* Agent Tabs */}
          <div className="flex-1 space-y-3">
             {agents.map((agent, index) => (
                <div 
                  key={agent.id}
                  onClick={() => setActiveStep(index)}
                  className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-4 group
                    ${activeStep === index 
                      ? `bg-white ${agent.borderColor} shadow-md` 
                      : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'}`}
                >
                  {/* Progress Bar for Active Item */}
                  {activeStep === index && (
                    <motion.div 
                      layoutId="active-left-bar"
                      className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${agent.color.replace('text-', 'bg-')}`}
                    />
                  )}
                  
                  <div className={`p-2 rounded-lg transition-colors ${activeStep === index ? agent.bg + ' ' + agent.color : 'bg-slate-50 text-slate-400'}`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${activeStep === index ? 'text-ink-900' : 'text-slate-500'}`}>
                      {agent.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{agent.role}</div>
                  </div>
                  {activeStep === index && <Zap size={14} className="ml-auto text-amber-400 fill-amber-400 animate-pulse" />}
                </div>
             ))}
          </div>

          {/* Simulated Terminal/Console */}
          <div className="mt-6 h-[200px] bg-ink-900 rounded-2xl p-5 font-mono text-xs text-slate-300 shadow-2xl overflow-hidden relative border border-ink-800">
             <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-slate-500 ml-2">GraphicWeaver.sys — {agents[activeStep].role}</div>
             </div>
             
             <div className="space-y-2">
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                     {agents[activeStep].logs.map((log, i) => (
                       <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="flex gap-2"
                       >
                         <span className={i === agents[activeStep].logs.length - 1 ? "text-indigo-400 animate-pulse" : "text-emerald-500"}>
                           {i === agents[activeStep].logs.length - 1 ? "▋" : "$"}
                         </span>
                         <span className={i === agents[activeStep].logs.length - 1 ? "text-white" : "text-slate-400"}>
                           {log}
                         </span>
                       </motion.div>
                     ))}
                  </motion.div>
                </AnimatePresence>
             </div>
             
             {/* Background Matrix Effect */}
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <Cpu size={80} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};