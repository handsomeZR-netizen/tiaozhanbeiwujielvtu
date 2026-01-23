import React from 'react';
import { motion } from 'framer-motion';
import { Map, Image as ImageIcon, Calendar, Camera, Users, BookOpen, ArrowRight, ArrowUpRight } from 'lucide-react';

export type FeatureId = 'atlas' | 'diary' | 'itinerary' | 'studio' | 'community' | 'story';

type FeatureConfig = {
  id: FeatureId;
  title: string;
  enTitle: string;
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  tech: string[];
};

const features: FeatureConfig[] = [
  {
    id: 'atlas',
    title: '全境智能图鉴',
    enTitle: 'Atlas',
    subtitle: '沉浸式地图探索',
    desc: '集成高德地图与AI叙事，提供城市POI浏览、实时天气与文化故事生成。',
    icon: <Map className="text-emerald-600" size={28} />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    tech: ['useAtlasMap', 'AIGC Story']
  },
  {
    id: 'diary',
    title: '视觉海报工作台',
    enTitle: 'Diary',
    subtitle: 'AIGC 多模态创作',
    desc: '上传照片自动生成文化主题海报。支持小红书/抖音多尺寸适配与智能图层编辑。',
    icon: <ImageIcon className="text-rose-600" size={28} />,
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    tech: ['Layer Composition', 'Style Transfer']
  },
  {
    id: 'itinerary',
    title: '智能行程规划',
    enTitle: 'Itinerary',
    subtitle: 'Agent Flow 实时生成',
    desc: '基于DeepSeek的动态行程规划。可视化Agent思考过程，生成包含交通、预算的详细方案。',
    icon: <Calendar className="text-amber-600" size={28} />,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    tech: ['DeepSeek API', 'RAG']
  },
  {
    id: 'studio',
    title: '文化识别工场',
    enTitle: 'Studio',
    subtitle: '万物皆可读',
    desc: '基于豆包Seed模型的图像识别。上传照片即可解读其背后的历史故事与文化符号。',
    icon: <Camera className="text-indigo-600" size={28} />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    tech: ['Image Recognition', 'Cultural DB']
  },
  {
    id: 'community',
    title: '无界社区',
    enTitle: 'Community',
    subtitle: '全球青年连接',
    desc: '基于地理位置的内容流。分享你的“视觉叙事”，连接南京、北京等地的全球旅行者。',
    icon: <Users className="text-cyan-600" size={28} />,
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    tech: ['Feed Stream', 'Social Graph']
  },
  {
    id: 'story',
    title: '叙事引擎',
    enTitle: 'Story Arc',
    subtitle: '场景化叙事生成',
    desc: '基于用户行为与城市图鉴，自动编排故事弧与拍摄脚本，生成沉浸式路线体验。',
    icon: <BookOpen className="text-violet-600" size={28} />,
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    tech: ['Story Arc', 'Scene Planner']
  }
];

type FeatureMatrixProps = {
  onEnterFeature?: (featureId: FeatureId) => void;
};

export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({ onEnterFeature }) => {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-2 block">
            System Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-ink-900 mb-6 font-serif">
            已构建的核心能力矩阵
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-ink-500 text-lg font-light leading-relaxed">
            基于 Feature-first 架构开发，深度集成豆包与 DeepSeek 多模态能力，打造无缝的文化体验闭环。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
              className="glass-panel p-8 rounded-2xl bg-white/60 transition-all duration-300 group cursor-default relative overflow-hidden"
            >
              {/* Decorative Gradient Blob */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl ${feature.bg.replace('bg-', 'bg-gradient-to-br from-white to-')}`}></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${feature.bg} group-hover:scale-105 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <div className="flex items-center gap-1 text-ink-400 group-hover:text-indigo-600 transition-colors">
                  <span className="text-xs font-mono font-bold tracking-wider opacity-50">{feature.enTitle}</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-ink-900 mb-1 font-serif group-hover:text-indigo-700 transition-colors">{feature.title}</h3>
              <p className="text-xs font-bold text-indigo-500 mb-4 tracking-wide uppercase">{feature.subtitle}</p>
              <p className="text-ink-500 text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {feature.tech.map((t) => (
                  <span key={t} className="text-[10px] font-medium tracking-wide bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {t}
                  </span>
                ))}
              </div>

              {onEnterFeature && (
                <button
                  type="button"
                  onClick={() => onEnterFeature(feature.id)}
                  className="mt-5 w-full px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  立即体验 <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
