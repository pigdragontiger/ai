

import React, { useMemo } from 'react';
import type { YearlySalaryTable, EducationLevelId, SelectOption } from '../types';

interface CompanySalaryTableProps {
    title: string;
    description: string;
    isReadOnly?: boolean;
    data: YearlySalaryTable; // Data for one education level
    onUpdate: (tierId: string, field: 'low' | 'middle' | 'high', value: number | null) => void;
    educationLevels: SelectOption<EducationLevelId>[];
    selectedEducation: EducationLevelId;
    onEducationSelect: (levelId: EducationLevelId) => void;
    onPrintRequest: () => void;
    onSave?: () => void;
    onReset?: () => void;
}

const SalaryInput: React.FC<{
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder: string;
}> = ({ value, onChange, placeholder }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val === '' ? null : parseInt(val, 10));
    };

    return (
        <div className="relative">
            <input
                type="number"
                value={value ?? ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full p-2 text-sm bg-slate-100 border border-slate-300 rounded-md text-black text-right focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 pr-12"
                min="0"
                step="100"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">만원</span>
        </div>
    );
};

// Data for rendering engineer level and position headers, derived from the user-provided image.
// FIX: Export JOB_STRUCTURE to be used in App.tsx.
export const JOB_STRUCTURE: Record<EducationLevelId, {
    levels: { name: string, start: number, end: number, color: string }[];
    positions: { name: string, start: number, end: number }[];
}> = {
    master: {
        levels: [
            { name: '초급', start: 1, end: 3, color: 'bg-green-100 text-black' },
            { name: '중급', start: 4, end: 6, color: 'bg-blue-100 text-black' },
            { name: '고급', start: 7, end: 9, color: 'bg-yellow-100 text-black' },
            { name: '특급', start: 10, end: 20, color: 'bg-red-100 text-black' }
        ],
        positions: [
            { name: '사원', start: 1, end: 3 },
            { name: '대리', start: 4, end: 6 },
            { name: '과장', start: 7, end: 9 },
            { name: '차장', start: 10, end: 14 },
            { name: '부장', start: 15, end: 20 }
        ]
    },
    bachelor: {
        levels: [
            { name: '초급', start: 1, end: 6, color: 'bg-green-100 text-black' },
            { name: '중급', start: 7, end: 9, color: 'bg-blue-100 text-black' },
            { name: '고급', start: 10, end: 12, color: 'bg-yellow-100 text-black' },
            { name: '특급', start: 13, end: 20, color: 'bg-red-100 text-black' }
        ],
        positions: [
            { name: '사원', start: 1, end: 3 },
            { name: '대리', start: 4, end: 6 },
            { name: '과장', start: 7, end: 9 },
            { name: '차장', start: 10, end: 14 },
            { name: '부장', start: 15, end: 20 }
        ]
    },
    associate: {
        levels: [
            { name: '초급', start: 1, end: 9, color: 'bg-green-100 text-black' },
            { name: '중급', start: 10, end: 12, color: 'bg-blue-100 text-black' },
            { name: '고급', start: 13, end: 15, color: 'bg-yellow-100 text-black' },
            { name: '특급', start: 16, end: 20, color: 'bg-red-100 text-black' }
        ],
        positions: [
            { name: '사원', start: 1, end: 3 },
            { name: '대리', start: 4, end: 6 },
            { name: '과장', start: 7, end: 9 },
            { name: '차장', start: 10, end: 14 },
            { name: '부장', start: 15, end: 20 }
        ]
    },
    highschool: {
        levels: [
            { name: '초급', start: 1, end: 12, color: 'bg-green-100 text-black' },
            { name: '중급', start: 13, end: 15, color: 'bg-blue-100 text-black' },
            { name: '고급', start: 16, end: 18, color: 'bg-yellow-100 text-black' },
            { name: '특급', start: 19, end: 20, color: 'bg-red-100 text-black' }
        ],
        positions: [
            { name: '사원', start: 1, end: 3 },
            { name: '대리', start: 4, end: 6 },
            { name: '과장', start: 7, end: 9 },
            { name: '차장', start: 10, end: 14 },
            { name: '부장', start: 15, end: 20 }
        ]
    },
};


export const CompanySalaryTable: React.FC<CompanySalaryTableProps> = ({ title, description, isReadOnly = false, data, onUpdate, educationLevels, selectedEducation, onEducationSelect, onPrintRequest, onSave, onReset }) => {
    const selectedEducationName = educationLevels.find(l => l.id === selectedEducation)?.name || '';
    
    const formatFullCurrency = (value: number | null, prefix = '₩') => {
        if (value === null || typeof value !== 'number' || isNaN(value)) return '-';
        const amountInKRW = value * 10000;
        return `${prefix}${amountInKRW.toLocaleString('ko-KR')}`;
    };
    
    const positionAverageSalaries = useMemo(() => {
        const jobStructure = JOB_STRUCTURE[selectedEducation];
        if (!jobStructure || !data) return {};

        const averages: Record<string, { avgLow: number; avgMiddle: number; avgHigh: number } | null> = {};

        for (const position of jobStructure.positions) {
            const { name, start, end } = position;
            const lowSalaries: number[] = [];
            const middleSalaries: number[] = [];
            const highSalaries: number[] = [];

            for (let year = start; year <= end; year++) {
                const yearData = data[year.toString()];
                if (!yearData) continue;

                if (year === 1) { // Special case for year 1
                    if (yearData.middle !== null) {
                        lowSalaries.push(yearData.middle);
                        middleSalaries.push(yearData.middle);
                        highSalaries.push(yearData.middle);
                    }
                } else {
                    if (yearData.low !== null) lowSalaries.push(yearData.low);
                    if (yearData.middle !== null) middleSalaries.push(yearData.middle);
                    if (yearData.high !== null) highSalaries.push(yearData.high);
                }
            }

            if (lowSalaries.length > 0 && middleSalaries.length > 0 && highSalaries.length > 0) {
                const avgLow = Math.round(lowSalaries.reduce((a, b) => a + b, 0) / lowSalaries.length);
                const avgMiddle = Math.round(middleSalaries.reduce((a, b) => a + b, 0) / middleSalaries.length);
                const avgHigh = Math.round(highSalaries.reduce((a, b) => a + b, 0) / highSalaries.length);
                averages[name] = { avgLow, avgMiddle, avgHigh };
            } else {
                averages[name] = null;
            }
        }
        return averages;
    }, [data, selectedEducation]);


    const renderTableRows = () => {
        const jobStructure = JOB_STRUCTURE[selectedEducation];
        if (!jobStructure) return null;

        const rows: React.ReactNode[] = [];

        for (let year = 1; year <= 20; year++) {
            const yearId = year.toString();
            const yearText = year === 20 ? '20년차~' : `${year}년차`;

            const levelCell = (() => {
                const levelInfo = jobStructure.levels.find(l => l.start === year);
                if (!levelInfo) return null;
                let rowSpan = 0;
                for (let i = levelInfo.start; i <= levelInfo.end; i++) {
                    rowSpan += (i === 1) ? 1 : 3;
                }
                return <td rowSpan={rowSpan} className={`p-2 border border-slate-200 text-center align-middle font-bold ${levelInfo.color}`}>{levelInfo.name}</td>;
            })();

            const positionCell = (() => {
                const positionInfo = jobStructure.positions.find(p => p.start === year);
                if (!positionInfo) return null;
                let rowSpan = 0;
                for (let i = positionInfo.start; i <= positionInfo.end; i++) {
                    rowSpan += (i === 1) ? 1 : 3;
                }
                return <td rowSpan={rowSpan} className="p-2 border border-slate-200 text-center align-middle font-semibold text-black">{positionInfo.name}</td>;
            })();
            
            const positionAverageCell = (() => {
                const positionInfo = jobStructure.positions.find(p => p.start === year);
                if (!positionInfo) return null;
                let rowSpan = 0;
                for (let i = positionInfo.start; i <= positionInfo.end; i++) {
                    rowSpan += (i === 1) ? 1 : 3;
                }
                const averageData = positionAverageSalaries[positionInfo.name];
                
                const content = averageData ? (
                    <div className="text-xs text-left px-1 py-1 space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                            <span className="font-semibold text-red-800 bg-red-100 px-1.5 py-0.5 rounded-full">상</span>
                            <span className="font-bold text-black">{averageData.avgHigh.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="font-semibold text-green-800 bg-green-100 px-1.5 py-0.5 rounded-full">중</span>
                            <span className="font-bold text-black">{averageData.avgMiddle.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-full">하</span>
                            <span className="font-bold text-black">{averageData.avgLow.toLocaleString()}</span>
                        </div>
                    </div>
                ) : (
                    <span>-</span>
                );
                
                return (
                    <td rowSpan={rowSpan} className="p-1 border border-slate-200 align-middle bg-slate-50">
                        {content}
                    </td>
                );
            })();


            const salaryData = data[yearId] ?? { low: null, middle: null, high: null };

            let increaseAmount: number | null = null;
            let increaseRate: number | null = null;

            if (year > 1) {
                const currentYearHigh = salaryData.high;
                const prevYearData = data[(year - 1).toString()];

                // For year 2, base the increase on the previous year's (year 1) single 'middle' salary.
                // For all subsequent years (3+), base it on the previous year's 'high' salary, as per the user's request.
                const prevYearBaseSalary = year === 2 
                    ? (prevYearData?.middle ?? null)
                    : (prevYearData?.high ?? null);
                
                if (currentYearHigh !== null && prevYearBaseSalary !== null) {
                    increaseAmount = currentYearHigh - prevYearBaseSalary;
                    if (prevYearBaseSalary > 0) {
                        increaseRate = (increaseAmount / prevYearBaseSalary) * 100;
                    }
                }
            }
            
            const salaryCell = (field: 'low' | 'middle' | 'high') => {
                const value = salaryData[field];
                return (
                    <td className="p-1 border border-slate-200 align-middle text-right text-black">
                        {isReadOnly ? (
                            <span className="px-2">{formatFullCurrency(value)}</span>
                        ) : (
                            <SalaryInput value={value} onChange={val => onUpdate(yearId, field, val)} placeholder="-" />
                        )}
                    </td>
                );
            };

            if (year === 1) {
                rows.push(
                    <tr key={yearId}>
                        {levelCell}
                        {positionCell}
                        <td className="p-2 border border-slate-200 text-center align-middle text-black">{yearText}</td>
                        <td className="p-2 border border-slate-200 text-center align-middle bg-slate-50 text-black">-</td>
                        {salaryCell('middle')}
                        <td className="p-2 border border-slate-200 text-center align-middle bg-slate-50 text-black">-</td>
                        <td className="p-2 border border-slate-200 text-center align-middle bg-slate-50 text-black">-</td>
                        {positionAverageCell}
                    </tr>
                );
            } else {
                const yearCell = <td rowSpan={3} className="p-2 border border-slate-200 text-center align-middle text-black">{yearText}</td>;
                const increaseAmountCell = <td rowSpan={3} className="p-2 border border-slate-200 text-right align-middle bg-yellow-50 text-black">{formatFullCurrency(increaseAmount)}</td>;
                const increaseRateCell = <td rowSpan={3} className="p-2 border border-slate-200 text-right align-middle bg-slate-50 text-black">{increaseRate !== null ? `${increaseRate.toFixed(2)}%` : '-'}</td>;

                rows.push(
                    <tr key={`${yearId}-high`}>
                        {levelCell}
                        {positionCell}
                        {yearCell}
                        <td className="p-2 border border-slate-200 text-center align-middle text-black">상</td>
                        {salaryCell('high')}
                        {increaseAmountCell}
                        {increaseRateCell}
                        {positionAverageCell}
                    </tr>,
                    <tr key={`${yearId}-middle`}>
                        <td className="p-2 border border-slate-200 text-center align-middle text-black">중</td>
                        {salaryCell('middle')}
                    </tr>,
                    <tr key={`${yearId}-low`}>
                        <td className="p-2 border border-slate-200 text-center align-middle text-black">하</td>
                        {salaryCell('low')}
                    </tr>
                );
            }
        }
        return rows;
    };


    return (
        <section>
            <div className="print-header">
                <h2 className="text-2xl font-bold mb-2 text-black">{title} - {selectedEducationName}</h2>
                <p className="text-slate-500 mb-8 no-print">
                    {description}
                </p>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 no-print">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold self-center pr-2 text-slate-600">학력 기준:</span>
                    {educationLevels.map(level => {
                        const isSelected = selectedEducation === level.id;
                        return (
                            <button 
                                key={level.id} 
                                onClick={() => onEducationSelect(level.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
                                    isSelected ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {level.name}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="overflow-x-auto print:overflow-visible min-w-[800px]">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[10%]">급수</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[10%]">직급</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[10%]">연차</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[10%]">평가</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[20%]">연봉</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[15%]">인상액</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[10%]">%</th>
                            <th className="p-3 font-semibold text-black border border-slate-200 text-center w-[15%]">직급별 평균</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {renderTableRows()}
                    </tbody>
                </table>
            </div>

            <div className="text-center mt-8 no-print flex flex-wrap justify-center gap-4">
                 {!isReadOnly && onSave && (
                    <button
                        onClick={onSave}
                        className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                    >
                        현재 기준 저장
                    </button>
                 )}
                 {!isReadOnly && onReset && (
                     <button
                        onClick={onReset}
                        className="px-8 py-3 bg-white text-rose-600 border-2 border-rose-500 font-semibold rounded-full hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-200"
                    >
                        초기값으로 되돌리기
                    </button>
                 )}
                 <button
                    onClick={onPrintRequest}
                    className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-full hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-300"
                >
                    인쇄하기
                </button>
            </div>
        </section>
    );
};
