import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Cpu, Globe, Layers, ShieldCheck } from 'lucide-react';
import { NeonSphere } from './components/NeonSphere';
import { AgentVis } from './components/AgentVis';
import { FeatureMatrix, FeatureId } from './components/FeatureMatrix';
import { Testimonials } from './components/Testimonials';
import { GlobalImpact } from './components/GlobalImpact';
import { Tab } from '@/shared/types';

export type ShowcaseTarget =
  | { type: 'app' }
  | { type: 'tab'; tab: Tab }
  | { type: 'itinerary' };

type ShowcasePageProps = {
  onEnterProduct: (target: ShowcaseTarget) => void;
};

type HeroProps = {
  onEnterProduct: (target: ShowcaseTarget) => void;
};

const scrollImages = [
  '/showcase/scroll/bg-01.jpg?v=2',
  '/showcase/scroll/bg-02.jpg?v=2',
  '/showcase/scroll/bg-03.jpg?v=2',
  '/showcase/scroll/bg-04.jpg?v=2',
  '/showcase/scroll/bg-05.jpg?v=2',
];

const scrollImagesAlt = [
  '/showcase/scroll-alt/bg-01.jpg',
  '/showcase/scroll-alt/bg-02.jpg',
  '/showcase/scroll-alt/bg-03.jpg',
  '/showcase/scroll-alt/bg-04.jpg',
  '/showcase/scroll-alt/bg-05.jpg',
];

// Hero Section Component
const Hero: React.FC<HeroProps> = ({ onEnterProduct }) => {
  const marqueeImages = [...scrollImages, ...scrollImages];
  const marqueeImagesAlt = [...scrollImagesAlt, ...scrollImagesAlt];

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-ink-50">
      {/* Artistic Background Elements */}
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-b from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl opacity-60 pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-t from-emerald-100/50 to-teal-100/50 rounded-full blur-3xl opacity-60 pointer-events-none mix-blend-multiply" />

      {/* Scrolling Showcase Images (background layer) */}
      <div className="absolute inset-x-0 bottom-6 h-48 md:h-56 lg:h-64 overflow-hidden pointer-events-none z-0 opacity-55">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-50 via-transparent to-ink-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-50 via-transparent to-transparent" />
        <div className="relative flex w-max gap-6 animate-marquee">
          {marqueeImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="h-48 md:h-56 lg:h-64 w-[360px] md:w-[420px] lg:w-[520px] rounded-3xl overflow-hidden bg-white/70 shadow-lg"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover opacity-90 brightness-125"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling Showcase Images (upper layer, reverse direction) */}
      <div className="absolute inset-x-0 bottom-64 md:bottom-72 lg:bottom-80 h-40 md:h-48 lg:h-56 overflow-hidden pointer-events-none z-0 opacity-55">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-50 via-transparent to-ink-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-50 via-transparent to-transparent" />
        <div className="relative flex w-max gap-6 animate-marquee-reverse">
          {marqueeImagesAlt.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="h-40 md:h-48 lg:h-56 w-[300px] md:w-[360px] lg:w-[440px] rounded-3xl overflow-hidden bg-white/70 shadow-md"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover opacity-90 brightness-125"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Central Visual */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 scale-125 md:scale-100 z-0"
      >
        <NeonSphere />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-[-50px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 border border-slate-200 shadow-sm backdrop-blur-md mb-8 hover:bg-white transition-colors cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">2026 Challenge Cup Project</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight mb-4 leading-[1.0] text-ink-900">
            <span className="typewriter-loop inline-block" style={{ ['--tw-w' as any]: '4.2em', ['--tw-steps' as any]: 4 }}>
              无界旅<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600">图</span>
            </span>
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm mb-6">
            <span className="text-2xl md:text-3xl font-serif font-semibold text-ink-800">BOUNDLESS</span>
            <span className="text-2xl md:text-3xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-300 animate-gradient">LENS</span>
          </div>
          
          <div className="w-full max-w-3xl mx-auto mb-12 text-center">
            <div className="mx-auto max-w-2xl rounded-3xl bg-white/80 backdrop-blur-md shadow-sm px-6 py-4">
              <p className="text-lg md:text-xl text-ink-600 leading-relaxed font-light">
                以<span className="text-indigo-600 font-medium">多智能体协同</span>重塑视觉化青年外交。
                <br className="hidden md:block" />
                打破认知边界，以 AI 为笔，绘制真实中国图景。
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <button
              type="button"
              onClick={() => onEnterProduct({ type: 'app' })}
              className="px-8 py-4 bg-ink-900 hover:bg-ink-800 text-white font-medium rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 group"
            >
              一键体验 Graphic Weaver
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-400 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest">Explore</span>
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
};

// Problem Statement Section
const ProblemSection = () => {
  return (
    <section id="problem" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink-900 mb-10 leading-tight">
                当向往中国，<br/>却困于 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">"三重门"</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "认知门 · Gap", desc: "想象与真实的断裂：海外信息生态造成的刻板印象与现实巨变之间的叙事赤字。", icon: <Globe className="text-rose-500" /> },
                  { title: "数字门 · Wall", desc: "发达与隔离的悖论：高度数字化的社会对国际访客构成'软性壁垒'。", icon: <ShieldCheck className="text-rose-500" /> },
                  { title: "传播门 · Void", desc: "宏大与个体的脱节：传统外宣缺乏触达海外Z世代的视觉语境。", icon: <Layers className="text-rose-500" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="mt-1 p-3 bg-white rounded-xl shadow-sm h-fit text-rose-500">{item.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-ink-900 mb-2 font-serif">{item.title}</h3>
                      <p className="text-ink-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="relative h-[500px] bg-slate-100 rounded-[2rem] p-10 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
             {/* Artistic Abstract Representation of Barriers */}
             <div className="absolute inset-0 bg-slate-200">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-rose-100/50 to-transparent"></div>
             </div>
             
             <div className="relative z-10 text-center">
               <div className="text-[120px] font-black text-white leading-none select-none opacity-50 mix-blend-overlay">FAIL</div>
               <div className="text-5xl font-black text-ink-900/10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">BARRIERS</div>
               
               {/* Animated Bars */}
               <div className="mt-12 flex justify-center gap-4">
                 {[1,2,3].map(i => (
                   <motion.div 
                    key={i} 
                    className="w-4 bg-rose-500 rounded-full"
                    animate={{ height: [60, 100, 40, 80] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                   />
                 ))}
               </div>
               <p className="mt-8 text-ink-400 font-mono text-xs tracking-widest uppercase">Structured Contradiction Analysis</p>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Architecture Diagram Section
const ArchitectureSection = () => {
  return (
    <section id="architecture" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 text-center mb-16">
        <h2 className="text-4xl font-serif font-bold text-ink-900">TrueView China 架构全景</h2>
        <p className="text-ink-500 mt-4 font-light">基于视觉叙事驱动的三层体验架构</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto pb-8">
        {/* Simplified Visualization */}
        <div className="min-w-[800px] flex flex-col gap-6 text-sm">
          {/* Layer 1 */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-ink-400 font-mono text-center flex items-center justify-center writing-mode-vertical text-xs tracking-widest uppercase">Input Layer</div>
            <div className="col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
               <div className="text-center font-bold text-xl text-ink-900 mb-8 font-serif">Multi-Agent Collaboration Framework</div>
               <div className="grid grid-cols-4 gap-4">
                  {['Perception', 'Translation', 'Design', 'Distribution'].map((agent, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center group hover:border-indigo-200 transition-colors">
                      <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500">
                         <Cpu size={18} />
                      </div>
                      <div className="text-ink-800 font-semibold mb-1">{agent}</div>
                      <div className="text-ink-400 text-[10px] uppercase tracking-wide">Agent</div>
                    </div>
                  ))}
               </div>
               <div className="mt-8 bg-indigo-50 p-3 rounded border border-indigo-100 text-center text-indigo-800 font-mono text-xs font-medium">
                 Central Large LLM Brain (DeepSeek / Doubao)
               </div>
            </div>
            <div className="col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-ink-400 font-mono text-center flex flex-col items-center justify-center gap-2">
              <span className="text-xs tracking-widest uppercase">Output</span>
              <div className="text-ink-800 font-bold font-serif">AIGC Visuals</div>
            </div>
          </div>
          
          {/* Data Loop */}
          <div className="grid grid-cols-12 gap-6">
             <div className="col-span-12 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center justify-center gap-12 text-emerald-700">
                <span className="flex items-center gap-2 font-medium"><Globe size={18} /> User Behavior Feedback Loop</span>
                <span className="flex items-center gap-2 font-medium"><Layers size={18} /> Cross-cultural Gap Analysis</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// PDF Image Section
const PdfImageSection = () => {
  return (
    <section id="pdf" className="py-24 bg-ink-900 text-white relative">
      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl font-serif font-bold text-white mb-10">项目核心理念概览</h2>
        <div className="relative group perspective-1000">
           {/* Glow Effect */}
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
           
           <div className="relative bg-ink-800 rounded-xl p-2 border border-ink-700 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.01]">
             {/* Simulating the PDF Image placement */}
             <div className="aspect-[16/9] w-full bg-ink-900 flex flex-col items-center justify-center overflow-hidden rounded-lg relative">
               <img 
                 src="/fangan.jpg" 
                 alt="Boundless Lens 核心理念概览" 
                 loading="lazy"
                 className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
               <div className="absolute bottom-6 left-6 text-left">
                 <div className="text-xs font-mono text-indigo-400 mb-1">DOCUMENT PREVIEW</div>
                 <div className="text-xl font-serif font-bold">Concept & Strategy</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center rounded-lg">
               <Globe size={18} />
             </div>
             <div className="flex flex-col leading-tight">
               <span className="text-base font-serif font-bold text-ink-900">无界旅<span className="text-purple-600">图</span></span>
               <span className="text-[9px] text-ink-500 tracking-wider">BOUNDLESS LENS</span>
             </div>
          </div>
          <p className="text-ink-500 text-sm max-w-xs">
            挑战杯全国大学生课外学术科技作品竞赛参赛作品。<br/>
            重塑青年外交的视觉语言。
          </p>
        </div>
        
        <div className="flex gap-12">
           <div>
             <h4 className="font-bold text-ink-900 mb-4 text-sm uppercase tracking-wider">Project</h4>
             <ul className="space-y-2 text-sm text-ink-500">
               <li><a href="#pdf" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
               <li><a href="#architecture" className="hover:text-indigo-600 transition-colors">Architecture</a></li>
               <li><a href="#features" className="hover:text-indigo-600 transition-colors">Team</a></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-ink-900 mb-4 text-sm uppercase tracking-wider">Connect</h4>
             <ul className="space-y-2 text-sm text-ink-500">
               <li><a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
               <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
             </ul>
           </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-50 flex justify-between items-center text-xs text-ink-400">
        <div>&copy; 2026 Boundless Lens Team. All rights reserved.</div>
        <div className="font-mono">v1.0.0 (Concept)</div>
      </div>
    </footer>
  );
};

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ onEnterProduct }) => {
  const handleFeatureEnter = (featureId: FeatureId) => {
    switch (featureId) {
      case 'atlas':
        onEnterProduct({ type: 'tab', tab: Tab.MAP });
        break;
      case 'diary':
        onEnterProduct({ type: 'tab', tab: Tab.DIARY });
        break;
      case 'itinerary':
        onEnterProduct({ type: 'itinerary' });
        break;
      case 'studio':
        onEnterProduct({ type: 'tab', tab: Tab.STUDIO });
        break;
      case 'community':
        onEnterProduct({ type: 'tab', tab: Tab.COMMUNITY });
        break;
      case 'story':
        onEnterProduct({ type: 'tab', tab: Tab.MAP });
        break;
      default:
        onEnterProduct({ type: 'app' });
        break;
    }
  };

  return (
    <div className="bg-ink-50 min-h-screen text-ink-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans scroll-smooth">
      {/* Navigation Overlay */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 w-full z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-serif font-bold text-ink-900 tracking-tight flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-1.5 rounded-lg shadow-md">
               <Globe size={18} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base">无界旅<span className="text-purple-600">图</span></span>
              <span className="text-[10px] text-ink-500 font-normal tracking-wider">BOUNDLESS LENS</span>
            </div>
          </div>
          <div className="hidden md:flex gap-10 text-sm font-medium text-ink-500">
            <a href="#hero" className="hover:text-indigo-600 transition-colors">首页</a>
            <a href="#problem" className="hover:text-indigo-600 transition-colors">痛点分析</a>
            <a href="#agent" className="hover:text-indigo-600 transition-colors">Graphic Weaver</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">功能矩阵</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEnterProduct({ type: 'app' })}
              className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-white text-xs font-bold rounded-full transition-all shadow-md hover:shadow-lg"
            >
              进入产品
            </button>
          </div>
        </div>
      </motion.nav>

      <main>
        <Hero onEnterProduct={onEnterProduct} />
        <ProblemSection />
        <section id="agent" className="bg-slate-50 py-24 border-t border-slate-100">
           <AgentVis />
        </section>
        <section id="features">
          <FeatureMatrix onEnterFeature={handleFeatureEnter} />
        </section>
        <section id="impact">
          <GlobalImpact />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <ArchitectureSection />
        <PdfImageSection />
      </main>
      
      <Footer />
    </div>
  );
};
