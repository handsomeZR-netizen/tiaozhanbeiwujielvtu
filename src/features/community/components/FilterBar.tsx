import React from 'react';
import { FILTER_TAGS } from '../community.data';

interface FilterBarProps {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ selectedTag, onTagSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
      {/* 全部 */}
      <button
        onClick={() => onTagSelect(null)}
        className={`px-4 py-2 bg-white border rounded-sm font-serif text-sm shadow-sm whitespace-nowrap transition-all cursor-pointer ${
          selectedTag === null
            ? 'border-stamp text-stamp bg-red-50'
            : 'border-stone-200 text-stone-600 hover:border-stone-400'
        }`}
      >
        全部
      </button>

      {/* 标签 */}
      {FILTER_TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag)}
          className={`px-4 py-2 bg-white border rounded-sm font-serif text-sm shadow-sm whitespace-nowrap transition-all cursor-pointer ${
            selectedTag === tag
              ? 'border-stamp text-stamp bg-red-50'
              : 'border-stone-200 text-stone-600 hover:border-stone-400'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
