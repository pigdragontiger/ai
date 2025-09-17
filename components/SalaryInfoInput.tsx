
import React, { useId } from 'react';

// --- Icon components defined locally to avoid creating new files ---
const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075c0 1.313-.964 2.446-2.25 2.611a48.455 48.455 0 01-11.233 0c-1.286-.165-2.267-1.298-2.267-2.611v-4.075m15.75 0v-1.875a3.375 3.375 0 00-3.375-3.375h-9.75a3.375 3.375 0 00-3.375 3.375v1.875m16.5 0M4.5 14.15v-4.075a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v4.075" />
    </svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.25 18l1.188-.648a2.25 2.25 0 011.423-1.423L16.25 15l.648 1.188a2.25 2.25 0 011.423 1.423L19.75 18l-1.188.648a2.25 2.25 0 01-1.423 1.423z" />
    </svg>
);


interface SalaryCardProps {
    id: string;
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    icon: React.ReactNode;
}

const SalaryCard: React.FC<SalaryCardProps> = ({ id, label, value, onValueChange, icon }) => {
    
    const handleValueChange = (newValue: number) => {
        onValueChange(Math.max(0, newValue));
    };

    const handleButtonClick = (increment: number) => {
        handleValueChange(value + increment);
    };

    return (
        <div className="flex flex-col gap-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
                <div className="text-indigo-500">{icon}</div>
                <label htmlFor={id} className="font-bold text-lg text-slate-800">{label}</label>
            </div>
            
            <div className="relative flex items-baseline justify-center gap-2 p-4 bg-white rounded-lg border border-slate-200">
                 <button
                    type="button"
                    onClick={() => handleButtonClick(-100)}
                    className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrement by 100"
                    disabled={value < 100}
                >
                    -
                </button>
                <input
                    type="number"
                    id={id}
                    value={value}
                    onChange={e => handleValueChange(parseInt(e.target.value, 10) || 0)}
                    className="w-32 text-center text-4xl font-extrabold text-slate-800 bg-transparent border-none focus:ring-0 p-0 appearance-none [-moz-appearance:textfield]"
                    min="0"
                    step="100"
                />
                <span className="text-xl font-semibold text-slate-600">만원</span>
                 <button
                    type="button"
                    onClick={() => handleButtonClick(100)}
                    className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-xl font-bold flex items-center justify-center"
                    aria-label="Increment by 100"
                >
                    +
                </button>
            </div>
            
             <input
                type="range"
                min="0"
                max="15000" // 1억 5천만원
                step="100"
                value={value}
                onChange={e => handleValueChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                aria-label={`${label} slider`}
            />
        </div>
    );
};


interface SalaryInfoInputProps {
    previousSalary: number;
    onPreviousSalaryChange: (value: number) => void;
    desiredSalary: number;
    onDesiredSalaryChange: (value: number) => void;
}

export const SalaryInfoInput: React.FC<SalaryInfoInputProps> = ({ previousSalary, onPreviousSalaryChange, desiredSalary, onDesiredSalaryChange }) => {
    const prevId = useId();
    const desiredId = useId();

    return (
        <section>
            <h2 className="text-2xl font-bold mb-2">4. 연봉 정보 입력 (선택)</h2>
            <p className="text-slate-500 mb-6">AI가 이전 연봉과 희망 연봉을 비교하여 합리성을 분석해드립니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SalaryCard 
                    id={prevId}
                    label="이전 직장 연봉"
                    value={previousSalary}
                    onValueChange={onPreviousSalaryChange}
                    icon={<BriefcaseIcon className="w-7 h-7" />}
                />
                <SalaryCard 
                    id={desiredId}
                    label="희망 연봉"
                    value={desiredSalary}
                    onValueChange={onDesiredSalaryChange}
                    icon={<SparklesIcon className="w-7 h-7" />}
                />
            </div>
        </section>
    );
};
