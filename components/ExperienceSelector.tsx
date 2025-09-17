import React from 'react';
import type { EngineerLevelId, SelectOption } from '../types';

interface ExperienceSelectorProps {
  levels: SelectOption<EngineerLevelId>[];
  selectedLevel: EngineerLevelId | null;
  onSelect: (level: EngineerLevelId) => void;
}

export const ExperienceSelector: React.FC<ExperienceSelectorProps> = ({ levels, selectedLevel, onSelect }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">2. SW기술자 등급 선택</h2>
      <p className="text-slate-500 mb-6">정부 고시 기준의 SW기술자 등급을 선택해주세요.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`p-5 border-2 rounded-xl text-left cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-slate-200 bg-slate-50 hover:border-indigo-400'
                }`}
            >
              <h3 className="font-bold text-lg text-slate-800">{level.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{level.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};