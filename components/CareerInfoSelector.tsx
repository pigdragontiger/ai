
import React, { useId } from 'react';
import type { CareerInputMode, EducationLevelId, EngineerLevelId, SelectOption } from '../types';

interface CareerInfoSelectorProps {
    mode: CareerInputMode;
    onModeChange: (mode: CareerInputMode) => void;
    
    applicantName: string;
    onApplicantNameChange: (name: string) => void;

    // Auto mode props
    experienceYears: number;
    onExperienceYearsChange: (years: number) => void;
    educationLevels: SelectOption<EducationLevelId>[];
    selectedEducation: EducationLevelId | null;
    onEducationSelect: (level: EducationLevelId) => void;
    calculatedLevel: EngineerLevelId;

    // Manual mode props
    engineerLevels: SelectOption<EngineerLevelId>[];
    selectedLevel: EngineerLevelId | null;
    onLevelSelect: (level: EngineerLevelId) => void;
}


const BadgeCheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const YearsInput: React.FC<{
    years: number;
    onYearsChange: (years: number) => void;
    id: string;
}> = ({ years, onYearsChange, id }) => {
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onYearsChange(parseInt(e.target.value, 10));
    };
    
    const handleButtonClick = (increment: number) => {
        const newYears = Math.max(0, years + increment);
        onYearsChange(newYears);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
                <button
                    type="button"
                    onClick={() => handleButtonClick(-1)}
                    className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-2xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrement years"
                    disabled={years === 0}
                >
                    -
                </button>
                <input
                    type="number"
                    id={id}
                    value={years}
                    onChange={e => onYearsChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-28 text-center text-5xl font-extrabold text-slate-800 bg-transparent border-none focus:ring-0 p-0"
                    min="0"
                />
                <button
                    type="button"
                    onClick={() => handleButtonClick(1)}
                    className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-2xl font-bold flex items-center justify-center"
                    aria-label="Increment years"
                >
                    +
                </button>
            </div>
            <input
                type="range"
                min="0"
                max="40"
                value={years}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                aria-label="Experience years slider"
            />
        </div>
    );
};

export const CareerInfoSelector: React.FC<CareerInfoSelectorProps> = (props) => {
    const { mode, onModeChange, applicantName, onApplicantNameChange, experienceYears, onExperienceYearsChange, educationLevels, selectedEducation, onEducationSelect, calculatedLevel, engineerLevels, selectedLevel, onLevelSelect } = props;

    const getLevelName = (levelId: EngineerLevelId | null) => {
        if (!levelId) return '계산 중...';
        return engineerLevels.find(l => l.id === levelId)?.name || '등급 없음';
    }
    
    const experienceId = useId();

    return (
        <section>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold">2. 지원자 정보 입력</h2>
                    <p className="text-slate-500 mt-1">지원자의 이름, 경력, 학력 또는 SW기술자 등급을 선택해주세요.</p>
                </div>
                <div className="flex items-center p-1 bg-slate-200 rounded-full self-start sm:self-center">
                    <button onClick={() => onModeChange('auto')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'auto' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}>자동 계산</button>
                    <button onClick={() => onModeChange('manual')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'manual' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}>수동 선택</button>
                </div>
            </div>

            {mode === 'auto' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="space-y-8">
                        <fieldset>
                            <legend className="text-lg font-bold mb-3 text-slate-800">이름</legend>
                            <input
                              type="text"
                              value={applicantName}
                              onChange={(e) => onApplicantNameChange(e.target.value)}
                              placeholder="예: 홍길동"
                              className="w-full max-w-sm px-4 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-black"
                            />
                        </fieldset>
                        <fieldset>
                            <legend className="text-lg font-bold mb-3 text-slate-800">경력 연차</legend>
                            <YearsInput id={experienceId} years={experienceYears} onYearsChange={onExperienceYearsChange} />
                        </fieldset>
                        <fieldset>
                            <legend className="text-lg font-bold mb-3 text-slate-800">최종 학력</legend>
                             <div className="flex flex-wrap gap-3">
                                {educationLevels.map((level) => {
                                  const isSelected = selectedEducation === level.id;
                                  return (
                                    <button
                                      key={level.id}
                                      type="button"
                                      onClick={() => onEducationSelect(level.id)}
                                      aria-pressed={isSelected}
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
                        </fieldset>
                    </div>
                    <div className="flex items-center justify-center">
                        {selectedEducation ? (
                            <div className="w-full h-full p-8 bg-white border-2 border-dashed border-slate-300 rounded-xl text-center flex flex-col items-center justify-center animate-fade-in">
                                <BadgeCheckIcon />
                                <p className="text-slate-600 mt-4">입력하신 경력과 학력 기준,</p>
                                <p className="text-3xl font-bold text-indigo-600 my-2">'{getLevelName(calculatedLevel)}'</p>
                                <p className="text-slate-600">등급에 해당합니다.</p>
                            </div>
                        ) : (
                             <div className="w-full h-full p-8 bg-white border-2 border-dashed border-slate-300 rounded-xl text-center flex flex-col items-center justify-center">
                                <p className="text-slate-500">경력과 학력을 입력하시면<br />예상 SW기술자 등급이 표시됩니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {mode === 'manual' && (
                 <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-8">
                     <fieldset>
                         <legend className="text-lg font-bold mb-3 text-slate-800">이름</legend>
                         <input
                           type="text"
                           value={applicantName}
                           onChange={(e) => onApplicantNameChange(e.target.value)}
                           placeholder="예: 홍길동"
                           className="w-full max-w-sm px-4 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-black"
                         />
                     </fieldset>
                     <fieldset>
                         <legend className="text-lg font-bold mb-3 text-slate-800">SW기술자 등급</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {engineerLevels.map((level) => {
                              const isSelected = selectedLevel === level.id;
                              return (
                                <button
                                  key={level.id}
                                  type="button"
                                  onClick={() => onLevelSelect(level.id)}
                                  aria-pressed={isSelected}
                                  className={`p-5 border-2 rounded-xl text-left cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300
                                    ${isSelected 
                                      ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                                      : 'border-white bg-white hover:border-indigo-400'
                                    }`}
                                >
                                  <h3 className="font-bold text-lg text-slate-800">{level.name}</h3>
                                </button>
                              );
                            })}
                         </div>
                     </fieldset>
                      <fieldset>
                        <legend className="text-lg font-bold mb-3 text-slate-800">최종 학력</legend>
                         <div className="flex flex-wrap gap-3">
                            {educationLevels.map((level) => {
                              const isSelected = selectedEducation === level.id;
                              return (
                                <button
                                  key={level.id}
                                  type="button"
                                  onClick={() => onEducationSelect(level.id)}
                                  aria-pressed={isSelected}
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
                     </fieldset>
                     <fieldset>
                        <legend className="text-lg font-bold mb-3 text-slate-800">참고 경력 연차</legend>
                         <p className="text-slate-500 mb-4 text-sm">선택하신 등급과 별개로, AI가 연봉을 분석할 때 참고할 실제 경력 연차를 입력해주세요.</p>
                         <YearsInput id={experienceId} years={experienceYears} onYearsChange={onExperienceYearsChange} />
                     </fieldset>
                </div>
            )}
        </section>
    );
};
export default CareerInfoSelector;