import React from 'react';
import type { EvaluationCriterion } from '../types';

interface EvaluationMatrixProps {
  criteria: EvaluationCriterion[];
  evaluation: Record<string, number | null>;
  onEvaluationChange: (criterionId: string, score: number) => void;
  disabled: boolean;
}

const evaluationLevels = [
  { score: 1, title: '미흡' },
  { score: 2, title: '보통' },
  { score: 3, title: '우수' },
  { score: 4, title: '탁월' },
];

const EvaluationMatrix: React.FC<EvaluationMatrixProps> = ({ criteria, evaluation, onEvaluationChange, disabled }) => {
  return (
    <section className={disabled ? 'opacity-40' : ''}>
      <h2 className="text-2xl font-bold mb-2">5. 역량 평가</h2>
      <p className="text-slate-500 mb-6">
        {disabled 
          ? '먼저 직무를 선택해주세요.'
          : '선택한 직무의 5가지 핵심 역량에 대한 현재 수준을 선택해주세요.'}
      </p>
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 font-semibold w-1/5">평가 항목</th>
              {evaluationLevels.map(level => (
                <th key={level.score} className="p-4 font-semibold w-1/5">{level.title} ({level.score}점)</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, index) => (
              <tr key={criterion.id} className={index > 0 ? "border-t border-slate-200" : ""}>
                <td className="p-4 font-semibold text-slate-800 align-top">{criterion.name}</td>
                {evaluationLevels.map(level => (
                  <td key={level.score} className={`p-4 align-top border-l border-slate-200 hover:bg-slate-50 ${evaluation[criterion.id] === level.score ? 'bg-indigo-50' : ''}`}>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name={criterion.id}
                        value={level.score}
                        checked={evaluation[criterion.id] === level.score}
                        onChange={() => onEvaluationChange(criterion.id, level.score)}
                        className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        disabled={disabled}
                      />
                      <span className="text-slate-700">{criterion.levels[level.score as keyof typeof criterion.levels]}</span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default EvaluationMatrix;