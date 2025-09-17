

import React, { useState } from 'react';
import type { BulkEditFormState } from '../types';

interface BulkEditModalProps {
    onClose: () => void;
    onApply: (formData: BulkEditFormState) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({ onClose, onApply }) => {
    const [formData, setFormData] = useState<BulkEditFormState>({
        baseSalary: 3000,
        increaseRate: 5,
        lowSpread: 10,
        highSpread: 10,
    });

    const handleInputChange = (field: keyof BulkEditFormState, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApply(formData);
    };

    const FormRow: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
        <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor={id} className="font-semibold text-slate-700 col-span-1">{label}</label>
            <div className="col-span-2">{children}</div>
        </div>
    );
    
    const NumberInput: React.FC<{ id: keyof BulkEditFormState; unit: string; value: number }> = ({ id, unit, value }) => (
        <div className="relative">
            <input
                type="number"
                id={id}
                value={value}
                onChange={e => handleInputChange(id, e.target.value)}
                className="w-full p-2 bg-slate-100 border border-slate-300 rounded-md text-black focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{unit}</span>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-edit-title"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b border-slate-200">
                    <h2 id="bulk-edit-title" className="text-xl font-bold text-slate-800">연봉 테이블 일괄 조정</h2>
                    <p className="text-sm text-slate-500 mt-1">규칙을 설정하여 연봉 테이블을 자동으로 생성합니다.</p>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                         <h3 className="font-semibold text-slate-700">연봉 규칙 설정</h3>
                        <FormRow label="초임 연봉 (1년차, 중위 기준)" id="baseSalary">
                            <NumberInput id="baseSalary" unit="만원" value={formData.baseSalary} />
                        </FormRow>
                        <FormRow label="연간 인상률" id="increaseRate">
                           <NumberInput id="increaseRate" unit="%" value={formData.increaseRate} />
                        </FormRow>
                         <h3 className="font-semibold text-slate-700 pt-2">평가 등급별 차등률 (중위 기준)</h3>
                        <FormRow label="상위 평가(High) 차등률" id="highSpread">
                             <NumberInput id="highSpread" unit="% (증가)" value={formData.highSpread} />
                        </FormRow>
                        <FormRow label="하위 평가(Low) 차등률" id="lowSpread">
                             <NumberInput id="lowSpread" unit="% (감소)" value={formData.lowSpread} />
                        </FormRow>
                    </div>
                </form>

                <footer className="p-5 border-t border-slate-200 mt-auto flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors">
                        취소
                    </button>
                    <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
                        적용하기
                    </button>
                </footer>
            </div>
        </div>
    );
};