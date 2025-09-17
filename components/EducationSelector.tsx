import React from 'react';
import type { EducationLevelId, SelectOption } from '../types';

interface EducationSelectorProps {
  levels: SelectOption<EducationLevelId>[];
  selectedLevel: EducationLevelId | null;
  onSelect: (level: EducationLevelId) => void;
}

export const EducationSelector: React.FC<EducationSelectorProps> = ({ levels, selectedLevel, onSelect }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">학력 선택 (선택 사항)</h2>
      <p className="text-slate-500 mb-6">최종 학력을 선택하면 더 정확한 연봉 정보를 얻을 수 있습니다.</p>
      <div className="flex flex-wrap gap-3">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`px-5 py-2 border-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-500 text-white shadow-md' 
                  : 'border-slate-300 bg-white hover:border-indigo-400'
                }`}
            >
              {level.name}
            </button>
          );
        })}
      </div>
    </section>
  );
};