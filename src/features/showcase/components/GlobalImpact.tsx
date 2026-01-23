import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, MessageSquareHeart, Zap } from 'lucide-react';

const stats = [
  { id: 1, label: "覆盖国家/地区", value: "50+", suffix: "Countries", icon: <Globe size={24} /> },
  { id: 2, label: "生成文化故事", value: "12k", suffix: "Stories", icon: <MessageSquareHeart size={24} /> },
  { id: 3, label: "活跃国际用户", value: "8,500", suffix: "Users", icon: <Users size={24} /> },
  { id: 4, label: "文化传播效能", value: "300%", suffix: "Growth", icon: <Zap size={24} /> },
];

export const GlobalImpact: React.FC = () => {
  return (
    <div className="py-24 bg-ink-900 text-white relative overflow-hidden">
      {/* Background World Map / Grid Decoration */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }}>
      </div>
      
      {/* Animated Glowing Orbs */}
      <motion.div 
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text & Stats */}
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              以数字足迹 <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">丈量无界世界</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 font-light leading-relaxed">
              Boundless Lens 不仅仅是一个工具，更是一场正在发生的全球文化对话。
              我们通过 AI 赋能，让每一次点击都成为一次跨越国界的握手。
            </p>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4 border-l-2 border-indigo-500/30 bg-white/5 rounded-r-lg hover:bg-white/10 transition-colors"
                >
                  <div className="text-indigo-400 mb-2">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold font-mono text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{stat.suffix}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Abstract Visualization */}
          <div className="relative h-[400px] flex items-center justify-center">
             {/* Central Globe Representation */}
             <div className="relative w-64 h-64">
                <motion.div 
                  className="absolute inset-0 border border-indigo-500/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-4 border border-purple-500/30 rounded-full border-dashed"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-48 h-48 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover mix-blend-overlay filter brightness-150"></div>
                      <Globe size={64} className="text-indigo-400 relative z-10" strokeWidth={1} />
                      
                      {/* Scanning Effect */}
                      <motion.div 
                        className="absolute top-0 left-0 w-full h-1 bg-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                   </div>
                </div>

                {/* Floating Connection Points */}
                {[0, 72, 144, 216, 288].map((deg, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center shadow-lg"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${deg}deg) translate(140px) rotate(-${deg}deg)`
                    }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                     <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  </motion.div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};