import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
  X,
  Settings,
  Download,
  Share2,
  Award,
  TrendingUp,
  Book,
  Bookmark,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

type AtlasEntry = {
  id: string;
  name: string;
  address?: string;
  tags?: string[];
  createdAt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';
const FAVORITES_KEY = 'atlas_favorites';
const CHECKINS_KEY = 'atlas_checkins';

const readLocal = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

interface ProfileProps {
  user: UserProfile | null;
  onClose: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onClose }) => {
  const [favorites, setFavorites] = useState<AtlasEntry[]>(() => readLocal(FAVORITES_KEY, []));
  const [checkins, setCheckins] = useState<AtlasEntry[]>(() => readLocal(CHECKINS_KEY, []));

  useEffect(() => {
    const load = async () => {
      try {
        const favoritesRes = await fetch(`${API_BASE}/atlas/favorites`);
        if (favoritesRes.ok) {
          const data = await favoritesRes.json();
          if (Array.isArray(data?.data)) setFavorites(data.data);
        }
      } catch {
        // ignore
      }
      try {
        const checkinsRes = await fetch(`${API_BASE}/atlas/checkins`);
        if (checkinsRes.ok) {
          const data = await checkinsRes.json();
          if (Array.isArray(data?.data)) setCheckins(data.data);
        }
      } catch {
        // ignore
      }
    };

    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-paper w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative animate-slide-up bg-texture border border-stone-200">
        {/* Header */}
        <div className="bg-ink text-paper p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award size={120} />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-stone-600 bg-stone-800 overflow-hidden">
              <img src="https://picsum.photos/200/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold tracking-wide">{user?.name || 'Traveler'}</h2>
              <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Level 2 · 探索者</p>
              <div className="flex gap-2 mt-3">
                <span className="bg-stamp text-white text-[10px] px-2 py-0.5 rounded-sm">北京 Day 02</span>
                <span className="bg-stone-700 text-stone-300 text-[10px] px-2 py-0.5 rounded-sm">XP 450</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Stats: Bias Reduction Curve */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={16} /> 认知转变 (Insight Curve)
            </h3>
            <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-end h-32 px-2 relative z-10">
                {[20, 35, 45, 30, 60, 75, 85].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div
                      className="w-2 sm:w-3 bg-stamp/20 border-t-2 border-stamp rounded-t-sm transition-all duration-500 group-hover:bg-stamp/40"
                      style={{ height: `${h}%` }}
                    ></div>
                    <span className="text-[9px] text-stone-400 font-serif">D{i + 1}</span>
                  </div>
                ))}

                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <path
                    d="M 20 80 Q 60 70, 100 60 T 180 50 T 260 20"
                    fill="none"
                    stroke="#8b1a10"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="opacity-30"
                  />
                </svg>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-xs text-sub">
                <span>初始刻板印象</span>
                <span className="text-stamp font-bold">深度文化理解</span>
              </div>
            </div>
          </section>

          {/* Memory Book */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Book size={16} /> 记忆册 (Memory Book)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-stone-100 rounded-r-lg border-l-4 border-l-ink border-y border-r border-stone-200 shadow-md relative group cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/300/400')] bg-cover opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                  <span className="text-white font-serif font-bold text-lg">Vol.01</span>
                  <span className="text-stone-300 text-xs">北京 · 初见</span>
                </div>
              </div>

              <div className="aspect-[3/4] bg-white rounded-r-lg border-l-4 border-l-stone-300 border-y border-r border-stone-200 shadow-sm flex items-center justify-center flex-col gap-2 border-dashed">
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300">
                  <Download size={20} />
                </div>
                <span className="text-xs text-stone-400 font-serif">生成中...</span>
              </div>
            </div>
          </section>

          {/* Atlas Favorites */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bookmark size={16} /> 图鉴收藏
            </h3>
            <div className="bg-white rounded-sm border border-stone-200 p-4 space-y-3">
              {favorites.length === 0 && (
                <div className="text-xs text-stone-400">暂无收藏，挑一个喜欢的地点收藏吧。</div>
              )}
              {favorites.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Bookmark size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-serif font-bold text-ink">{item.name}</div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                      <MapPin size={10} /> {item.address || '图鉴地点'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Atlas Check-ins */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> 打卡足迹
            </h3>
            <div className="bg-white rounded-sm border border-stone-200 p-4 space-y-3">
              {checkins.length === 0 && (
                <div className="text-xs text-stone-400">暂无打卡，去图鉴里打个卡吧。</div>
              )}
              {checkins.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-serif font-bold text-ink">{item.name}</div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                      <MapPin size={10} /> {item.address || '图鉴地点'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Settings Menu */}
          <section>
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2">设置</h3>
            <div className="bg-white rounded-sm border border-stone-200 divide-y divide-stone-100">
              <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left">
                <span className="text-ink font-serif text-sm">语言 (Language)</span>
                <span className="text-xs text-stone-400">中文 / EN</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left">
                <span className="text-ink font-serif text-sm">隐私与数据 (Privacy)</span>
                <Settings size={14} className="text-stone-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left">
                <span className="text-red-700 font-serif text-sm">退出登录</span>
              </button>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-white/50 backdrop-blur flex gap-3">
          <button className="flex-1 bg-ink text-paper py-3 rounded-sm font-serif font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors">
            <Share2 size={16} /> 分享我的名片
          </button>
        </div>
      </div>
    </div>
  );
};
