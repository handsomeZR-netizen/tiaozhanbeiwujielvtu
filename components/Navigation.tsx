import React from 'react';
import { Home, Map, BookOpen, Camera, Users } from 'lucide-react';
import { Tab } from '../types';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const getIcon = (tab: Tab) => {
    const size = 22;
    const strokeWidth = 1.5;
    switch (tab) {
      case Tab.HOME:
        return <Home size={size} strokeWidth={strokeWidth} />;
      case Tab.MAP:
        return <Map size={size} strokeWidth={strokeWidth} />;
      case Tab.DIARY:
        return <BookOpen size={size} strokeWidth={strokeWidth} />;
      case Tab.STUDIO:
        return <Camera size={size} strokeWidth={strokeWidth} />;
      case Tab.COMMUNITY:
        return <Users size={size} strokeWidth={strokeWidth} />;
    }
  };

  const getLabel = (tab: Tab) => {
    switch (tab) {
      case Tab.HOME:
        return '首页';
      case Tab.MAP:
        return '图鉴';
      case Tab.DIARY:
        return '海报';
      case Tab.STUDIO:
        return '工坊';
      case Tab.COMMUNITY:
        return '社区';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-stone-200 pb-safe pt-2 px-6 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-end pb-3 max-w-md mx-auto">
        {Object.values(Tab).map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex flex-col items-center justify-center transition-all duration-300 group ${
                isActive ? 'text-stamp -translate-y-1' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-red-50' : 'bg-transparent'
                }`}
              >
                {getIcon(tab)}
              </div>
              <span
                className={`text-[10px] tracking-widest mt-0.5 font-serif transition-all duration-300 ${
                  isActive ? 'font-bold opacity-100' : 'opacity-80'
                }`}
              >
                {getLabel(tab)}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-stamp mt-1 animate-fade-in" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
