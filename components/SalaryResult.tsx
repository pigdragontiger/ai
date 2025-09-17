

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SalaryResultData, ApplicantProfile, HiringProposalContent } from '../types';
import { HiringProposalModal } from './HiringProposalModal';
import { generateHiringProposalText } from '../services/geminiService';

interface SalaryResultProps {
  data: SalaryResultData;
  applicantProfile: ApplicantProfile;
  onReset: () => void;
}


// --- Infographic Modal and its dependencies ---

const SalaryStoryGraph: React.FC<{ data: SalaryResultData }> = ({ data }) => {
    const { 
      avgSalary,
      baselineMinSalary, baselineAvgSalary, baselineMaxSalary, 
      competencyPremium,
      companyStandard, desiredSalary, previousSalary
    } = data;
    
    // 1. Determine the unified scale for the chart
    const allValues = [
        baselineMinSalary, baselineAvgSalary, baselineMaxSalary,
        avgSalary, desiredSalary, previousSalary,
        (companyStandard && typeof companyStandard !== 'string') ? companyStandard.middle : null
    ].filter(v => typeof v === 'number' && v > 0) as number[];
    
    // NEW: Improved scale calculation to better utilize horizontal space
    const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
    const dataMax = allValues.length > 0 ? Math.max(...allValues) : 10000;
    const dataRange = dataMax - dataMin;
    // Add more padding to utilize horizontal space and reduce cramping.
    const padding = Math.max(500, dataRange * 0.2); // Ensure at least 500 padding, or 20% of range.

    const chartMin = allValues.length > 0 ? Math.max(0, Math.floor((dataMin - padding) / 500) * 500) : 0;
    const chartMax = allValues.length > 0 ? Math.ceil((dataMax + padding) / 500) * 500 : 10000;
    const chartRange = chartMax - chartMin;
    
    const getPositionPercent = (value: number | undefined | null) => {
        if (value === null || value === undefined || chartRange <= 0) return 0;
        return ((value - chartMin) / chartRange) * 100;
    };

    // 2. Calculate values for the waterfall chart
    const actualMarketValue = (baselineAvgSalary ?? 0) + (competencyPremium ?? 0);
    const policyAdjustment = avgSalary - actualMarketValue;

    // 3. Prepare data points for markers using a collision-avoidance algorithm
    const companyMiddle = (companyStandard && typeof companyStandard !== 'string') ? companyStandard.middle : null;
    
    const dataPoints = useMemo(() => {
        const points = [
          // NEW: Added baseline market value as a data point
          { id: 'baseline', value: baselineAvgSalary, label: '기초 시장 가치', color: 'slate' },
          { id: 'previous', value: previousSalary, label: '이전 연봉', color: 'slate' },
          { id: 'company', value: companyMiddle, label: '내부 기준', color: 'emerald' },
          { id: 'final', value: avgSalary, label: '최종 추천', color: 'indigo', isPrimary: true },
          { id: 'desired', value: desiredSalary, label: '희망 연봉', color: 'sky' },
        ].filter(p => typeof p.value === 'number' && p.value > 0) as { id: string; value: number; label: string; color: string; isPrimary?: boolean }[];
        
        if (points.length === 0) return [];
        
        let pointsWithLayout = points.map(p => ({
            ...p,
            pos: getPositionPercent(p.value),
            yLevel: 1, // Start all points in the middle level
        }));

        pointsWithLayout.sort((a, b) => a.pos - b.pos);
        
        // Dynamic layout algorithm to prevent label overlaps
        if (pointsWithLayout.length > 1) {
            const COLLISION_THRESHOLD = 12; // Percentage of chart width that labels should not overlap within.
            const levels = [1, 0, 2]; // Preferred levels: 1 (middle), 0 (top), 2 (bottom).

            pointsWithLayout.forEach((point, i) => {
                if (i === 0) { // First point can stay in the middle
                    point.yLevel = 1;
                    return;
                }

                let placed = false;
                // Try to place the current point in an available vertical level
                for (const level of levels) {
                    let hasCollision = false;
                    // Check against all previously placed points
                    for (let j = 0; j < i; j++) {
                        const prevPoint = pointsWithLayout[j];
                        // If a previous point is on the same level and too close horizontally
                        if (prevPoint.yLevel === level && Math.abs(point.pos - prevPoint.pos) < COLLISION_THRESHOLD) {
                            hasCollision = true;
                            break;
                        }
                    }

                    if (!hasCollision) {
                        point.yLevel = level;
                        placed = true;
                        break;
                    }
                }
                 // Fallback if all preferred levels collide (unlikely with 3 levels and 4 points)
                if (!placed) {
                    point.yLevel = (pointsWithLayout[i-1].yLevel + 1) % 3;
                }
            });
        }
        
        return pointsWithLayout;

    }, [baselineAvgSalary, previousSalary, companyMiddle, avgSalary, desiredSalary, chartMin, chartRange]);
    
    // NEW: Check for collisions between waterfall bar labels and bottom-tier data point labels.
    const bottomTierPoints = dataPoints.filter(p => p.yLevel === 2);
    const LABEL_HALF_WIDTH_PERCENT = 6; // Half of COLLISION_THRESHOLD

    const doesBarCollideWithBottomTier = (barStartPercent: number, barEndPercent: number) => {
        const barMin = Math.min(barStartPercent, barEndPercent);
        const barMax = Math.max(barStartPercent, barEndPercent);

        for (const point of bottomTierPoints) {
            const pointLabelMin = point.pos - LABEL_HALF_WIDTH_PERCENT;
            const pointLabelMax = point.pos + LABEL_HALF_WIDTH_PERCENT;
            // Check for horizontal overlap
            if (barMax > pointLabelMin && barMin < pointLabelMax) {
                return true;
            }
        }
        return false;
    };

    const competencyLabelClass = doesBarCollideWithBottomTier(
        getPositionPercent(baselineAvgSalary),
        getPositionPercent(actualMarketValue)
    ) ? '-top-14' : '-top-6';

    const colors: Record<string, { text: string; bg: string; border: string }> = {
        slate: { text: 'text-slate-600', bg: 'bg-slate-500', border: 'border-slate-500' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-500' },
        indigo: { text: 'text-indigo-700 font-bold', bg: 'bg-indigo-600', border: 'border-indigo-600' },
        sky: { text: 'text-sky-600', bg: 'bg-sky-500', border: 'border-sky-500' },
    };
    
    // Constants for marker positioning
    const AXIS_Y = 180;
    const LABEL_BLOCK_HEIGHT = 40;
    // Y positions for the TOP of the label block
    const yLevelTops = [35, 80, 125]; // Corresponds to yLevel 0, 1, 2


    return (
        <div className="h-[280px] w-full relative pt-20 pb-8">
            {/* Main Axis Line */}
            <div className="absolute top-[180px] w-full h-1.5 bg-slate-200 rounded-full"></div>
            
            {/* Baseline Market Value Range Bar */}
            <div className="absolute top-[180px] h-4 -translate-y-1/2 rounded-md bg-slate-100 border border-slate-200"
                style={{
                    left: `${getPositionPercent(baselineMinSalary)}%`,
                    width: `${getPositionPercent(baselineMaxSalary) - getPositionPercent(baselineMinSalary)}%`
                }}>
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    기초 시장 가치 범위{policyAdjustment !== 0 && `, 보수적 정책 조정 (${policyAdjustment.toLocaleString()}만)`}
                </span>
            </div>

            {/* Waterfall Blocks */}
            <>
                {/* Competency Premium */}
                {competencyPremium !== undefined && competencyPremium !== 0 && (
                    <div className={`absolute top-[180px] h-4 -translate-y-1/2 rounded-sm text-white flex items-center justify-center ${competencyPremium > 0 ? 'bg-blue-500' : 'bg-rose-500'}`}
                        style={{
                            left: `${getPositionPercent(competencyPremium > 0 ? baselineAvgSalary : actualMarketValue)}%`,
                            width: `${Math.abs(getPositionPercent(actualMarketValue) - getPositionPercent(baselineAvgSalary))}%`
                        }}>
                         <span className={`absolute ${competencyLabelClass} text-xs font-semibold text-slate-500 whitespace-nowrap`}>
                            역량 프리미엄 ({competencyPremium > 0 ? '+' : ''}{competencyPremium.toLocaleString()}만)
                        </span>
                    </div>
                )}
                 {/* Policy Adjustment */}
                {policyAdjustment !== 0 && (
                    <div className="absolute top-[180px] h-4 -translate-y-1/2 rounded-sm bg-rose-500 text-white flex items-center justify-center"
                        style={{
                            left: `${getPositionPercent(policyAdjustment > 0 ? actualMarketValue : avgSalary)}%`,
                            width: `${Math.abs(getPositionPercent(avgSalary) - getPositionPercent(actualMarketValue))}%`
                        }}>
                    </div>
                )}
            </>

            {/* Data Point Markers */}
            {dataPoints.map(p => {
                const labelTop = yLevelTops[p.yLevel];
                const lineStartY = labelTop + LABEL_BLOCK_HEIGHT;
                const dotCenterY = AXIS_Y;
                const lineLength = dotCenterY - lineStartY - 6; // -6 for half dot height
                
                return(
                    <div key={p.id} className="absolute" style={{ left: `${p.pos}%`, top: `${labelTop}px`, transform: 'translateX(-50%)' }}>
                        <div className="flex flex-col items-center">
                            {/* Label */}
                            <div className={`text-center p-1 rounded-md ${p.isPrimary ? 'bg-indigo-100' : ''}`} style={{ height: `${LABEL_BLOCK_HEIGHT}px` }}>
                                <p className={`text-sm font-bold whitespace-nowrap ${colors[p.color].text}`}>{p.value.toLocaleString()}만</p>
                                <p className={`text-xs font-semibold whitespace-nowrap -mt-1 ${colors[p.color].text}`}>{p.label}</p>
                            </div>
                            {/* Line */}
                            <div className="w-0.5 bg-slate-300" style={{ height: `${lineLength}px` }}></div>
                            {/* Dot */}
                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${colors[p.color].bg}`}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const InfographicModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: SalaryResultData;
}> = ({ isOpen, onClose, data }) => {
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
            onClose();
           }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
          window.removeEventListener('keydown', handleEsc);
          document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const { 
      avgSalary, minSalary, maxSalary, reasoning 
    } = data;
    
    return (
        <div 
          className="infographic-modal-printable-area fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
            <div 
              className="infographic-modal-content bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
                <header className="infographic-no-print p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">AI 채용 적정성 분석 리포트</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="p-6 sm:p-8 overflow-y-auto space-y-8">
                    {/* Hero Section */}
                    <section className="text-center p-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold opacity-80">AI 최종 추천 연봉</h3>
                        <p className="text-7xl font-extrabold my-2 tracking-tight">
                            {avgSalary.toLocaleString()}<span className="text-4xl font-bold ml-1">만원</span>
                        </p>
                        <p className="font-semibold opacity-80">
                            (범위: {minSalary.toLocaleString()}만원 ~ {maxSalary.toLocaleString()}만원)
                        </p>
                    </section>
                    
                    {/* Salary Story Graph Section */}
                    <section className="p-6 bg-white rounded-xl border border-slate-200">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="text-indigo-500">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">연봉 분석 스토리 그래프</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            지원자의 '기초 시장 가치'에서 시작하여 '역량 프리미엄'과 '정책 조정'을 거쳐 '최종 추천 연봉'이 산출되는 과정과, 다른 주요 연봉 지표와의 관계를 보여줍니다.
                        </p>
                        <SalaryStoryGraph data={data} />
                    </section>

                    {/* AI Summary */}
                    <section className="p-6 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-indigo-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">AI 총평</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{reasoning.summary}</p>
                    </section>
                </main>

                <footer className="infographic-no-print p-4 border-t border-slate-200 mt-auto flex justify-end gap-3 bg-white/50 rounded-b-2xl">
                    <button onClick={handlePrint} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h10a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        인쇄하기
                    </button>
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        닫기
                    </button>
                </footer>
            </div>
        </div>
    );
};


// --- Calculation Logic Modal ---
const CalculationLogicModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: SalaryResultData;
}> = ({ isOpen, onClose, data }) => {
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
            onClose();
           }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
          window.removeEventListener('keydown', handleEsc);
          document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const { 
      avgSalary, previousSalary, desiredSalary, companyStandard,
      baselineAvgSalary, competencyPremium, competencyGrade,
    } = data;

    const formatKRW = (value?: number | null) => value ? `${value.toLocaleString()}만원` : '-';
    
    const actualMarketValue = (baselineAvgSalary ?? 0) + (competencyPremium ?? 0);
    const companyMiddle = (companyStandard && typeof companyStandard !== 'string') ? companyStandard.middle : null;
    let negotiationFloor = null;
    if (previousSalary && companyMiddle) {
      negotiationFloor = Math.max(previousSalary, companyMiddle);
    } else {
      negotiationFloor = previousSalary || companyMiddle;
    }
    const negotiationCeiling = desiredSalary;

    const getCompetencyWeight = (grade?: string): [number, string] => {
        switch(grade) {
            case '핵심 인재': return [0.8, "최고 수준의 역량을 고려하여 희망 연봉에 가깝게 책정"];
            case '우수 역량 보유': return [0.6, "우수한 역량을 고려하여 합리적인 수준으로 책정"];
            case '기본 역량 보유': return [0.25, "기본 역량 보유로 판단, 보수적인 수준으로 책정"];
            case '추가 검토 필요': return [0.1, "역량 보완이 필요하므로, 시작점에 가깝게 책정"];
            default: return [0.6, "역량 등급 미입력으로, '우수' 등급 기준으로 책정"];
        }
    };
    const [competencyWeight, competencyWeightReason] = getCompetencyWeight(competencyGrade);
    
    // FIX: Corrected the typo in the strategic offer calculation.
    const strategicOffer = (negotiationFloor && negotiationCeiling && negotiationCeiling > negotiationFloor)
        ? Math.round(negotiationFloor + (negotiationCeiling - negotiationFloor) * competencyWeight)
        : null;
    
    const finalOfferBeforeCap = strategicOffer ? Math.min(strategicOffer, actualMarketValue) : actualMarketValue;
    
    const wasStrategicLogicApplied = !!strategicOffer;

    const Step: React.FC<{ num: number; title: string; description: string; children: React.ReactNode }> = ({ num, title, description, children }) => (
      <div className="relative pl-10 pb-8 border-l-2 border-slate-200">
        <div className="absolute -left-5 top-0 w-9 h-9 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg">{num}</div>
        <div className="ml-4">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-slate-600 mt-1 mb-4">{description}</p>
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
              {children}
            </div>
        </div>
      </div>
    );

    const CalcRow: React.FC<{ label: string; value: string; operator?: '+' | '-' | '=' | '~' }> = ({ label, value, operator }) => (
        <div className="flex items-center gap-4 text-sm">
            {operator && <div className="font-bold text-slate-500 text-xl w-4 text-center">{operator}</div>}
            <div className="flex-1 text-slate-700">{label}</div>
            <div className="font-bold text-slate-900 text-base text-right">{value}</div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">AI 최종 추천 연봉 산출 과정</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-8 overflow-y-auto">
                    <div className="flow-root">
                        <Step num={1} title="실제 시장 가치 평가" description="지원자의 객관적인 프로필과 주관적인 역량을 종합하여, 시장에서 받을 수 있는 절대적인 가치를 평가합니다.">
                            <CalcRow label="기초 시장 가치 (프로필 기준)" value={formatKRW(baselineAvgSalary)} />
                            <CalcRow label="역량 프리미엄 (역량 평가)" value={formatKRW(competencyPremium)} operator="+" />
                            <hr className="my-2 border-slate-200" />
                            <CalcRow label="지원자의 실제 시장 가치" value={formatKRW(actualMarketValue)} operator="="/>
                        </Step>
                        
                        <Step num={2} title="현실적인 협상 범위 설정" description="회사의 HR 매니저 입장에서, 지원자의 이전/희망 연봉과 회사 내부 기준을 바탕으로 현실적인 협상 범위를 설정합니다.">
                           <CalcRow label="협상 시작점 (max(내부 기준, 이전 연봉))" value={formatKRW(negotiationFloor)} />
                           <CalcRow label="협상 상한선 (지원자 희망 연봉)" value={formatKRW(negotiationCeiling)} />
                        </Step>

                        <Step num={3} title="전략적 제안가 계산" description="설정된 협상 범위 내에서, 지원자의 역량 등급에 따라 가중치를 두어 가장 비용 효율적인 제안 금액을 계산합니다.">
                           {wasStrategicLogicApplied ? (
                              <>
                                <p className="text-xs text-center text-slate-500 p-2 bg-slate-100 rounded-md">
                                  <strong>'{competencyGrade}'</strong> 등급으로 평가되어, <strong>{competencyWeight * 100}%</strong>의 가중치가 적용되었습니다.<br/>({competencyWeightReason})
                                </p>
                                <CalcRow label="협상 시작점" value={formatKRW(negotiationFloor)} />
                                {/* FIX: Corrected calculation for display */}
                                <CalcRow label="협상 범위 × 역량 가중치" value={`${formatKRW((negotiationCeiling! - negotiationFloor!) * competencyWeight)}`} operator="+" />
                                <hr className="my-2 border-slate-200" />
                                <CalcRow label="전략적 제안가" value={formatKRW(strategicOffer)} operator="=" />
                              </>
                           ) : (
                                // FIX: Improved message for why calculation was skipped.
                                <p className="text-sm text-center text-slate-600 py-4">
                                  {
                                    (!negotiationFloor || !negotiationCeiling)
                                    ? '희망 연봉 또는 내부 기준/이전 연봉 데이터가 없어, 전략적 제안가 계산을 생략하고'
                                    : (negotiationCeiling <= negotiationFloor)
                                    ? `희망 연봉(${formatKRW(negotiationCeiling)})이 협상 시작점(${formatKRW(negotiationFloor)})보다 낮거나 같아, 전략적 제안가 계산을 생략하고`
                                    : '희망 연봉 또는 내부 기준이 없어, 전략적 제안가 계산을 생략하고'
                                  }
                                  <br/>
                                  <span className="font-bold">'1단계: 실제 시장 가치'</span>를 기준으로 최종 연봉을 결정합니다.
                                </p>
                           )}
                        </Step>
                        
                        <div className="relative pl-10">
                           <div className="absolute -left-5 top-0 w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                           <div className="ml-4">
                                <h3 className="text-xl font-bold text-slate-800">최종 추천 연봉 결정</h3>
                                <p className="text-slate-600 mt-1 mb-4">회사의 이익을 고려하여, '실제 시장 가치'와 '전략적 제안가' 중 더 낮은 금액을 선택하고, 마지막으로 지원자의 희망 연봉을 넘지 않도록 조정합니다.</p>
                                <div className="bg-indigo-100 p-4 rounded-lg border border-indigo-200 space-y-3">
                                  <CalcRow label="min(실제 시장 가치, 전략적 제안가)" value={formatKRW(finalOfferBeforeCap)} />
                                  {desiredSalary && finalOfferBeforeCap > desiredSalary && (
                                    <p className="text-xs text-center text-indigo-700 p-2 bg-indigo-200 rounded-md">
                                        산출된 금액이 희망 연봉({formatKRW(desiredSalary)})을 초과하여, 희망 연봉으로 최종 조정되었습니다.
                                    </p>
                                  )}
                                  <hr className="my-2 border-indigo-200" />
                                  <div className="flex items-center gap-4">
                                    <div className="font-bold text-indigo-800 flex-1">최종 추천 연봉 (반올림 적용)</div>
                                    <div className="font-extrabold text-indigo-800 text-2xl text-right">{formatKRW(avgSalary)}</div>
                                  </div>
                                </div>
                           </div>
                        </div>

                    </div>
                </main>
                 <footer className="p-4 border-t border-slate-200 mt-auto flex justify-end gap-3 bg-white/50 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        닫기
                    </button>
                </footer>
            </div>
        </div>
    );
};


// New Reusable Chart Component
interface SingleSalaryChartProps {
    title: string;
    description: string;
    min: number;
    avg: number;
    max: number;
    avgLabel: string;
    colorClasses: {
        gradient: string; // e.g., 'from-slate-300 to-slate-400'
        accent: string;   // e.g., 'text-slate-700'
        bg: string;       // e.g., 'bg-slate-500'
    };
    chartMin: number;
    chartMax: number;
    desiredSalary?: number | null;
    previousSalary?: number | null;
    competencyPremium?: number;
    showInfoButton?: boolean;
    onInfoClick?: () => void;
}

const SingleSalaryChart: React.FC<SingleSalaryChartProps> = ({
    title,
    description,
    min,
    avg,
    max,
    avgLabel,
    colorClasses,
    chartMin,
    chartMax,
    desiredSalary,
    previousSalary,
    competencyPremium,
    showInfoButton,
    onInfoClick
}) => {
    const chartRange = chartMax - chartMin;

    const getPositionPercent = (value: number) => {
        if (chartRange <= 0) return 50;
        return ((value - chartMin) / chartRange) * 100;
    };
    
    const labelLayout = useMemo(() => {
        const points: { id: string; value: number; label: string; textClass: string; dotClass: string; yLevel?: number; pos?: number}[] = [];

        // 1. Collect all potential points
        if (avg !== null && avg !== undefined) {
            points.push({ id: 'avg', value: avg, label: avgLabel, textClass: colorClasses.accent, dotClass: colorClasses.bg });
        }
        if (previousSalary !== null && previousSalary !== undefined) {
            points.push({ id: 'previous', value: previousSalary, label: '이전 연봉', textClass: 'text-slate-600', dotClass: 'bg-slate-600' });
        }
        if (desiredSalary !== null && desiredSalary !== undefined) {
            let colorClass = 'text-indigo-600';
            if (competencyPremium !== undefined) {
                if (desiredSalary > max * 1.05) colorClass = 'text-red-500';
                else if (desiredSalary < avg * 0.95) colorClass = 'text-amber-500';
            }
            points.push({ id: 'desired', value: desiredSalary, label: '희망연봉', textClass: colorClass, dotClass: colorClass.replace('text-', 'bg-') });
        }
        
        // 2. Assign horizontal position
        points.forEach(p => p.pos = getPositionPercent(p.value));
        
        // 3. Assign vertical position (yLevel)
        const isFinalChart = competencyPremium !== undefined;

        if (!isFinalChart) {
            // For simple charts, all points go to the middle level.
            return points.map(p => ({ ...p, yLevel: 1 }));
        }

        // For the final chart, use a staggered layout
        points.sort((a, b) => a.value - b.value);

        // Use top/bottom for 2 points, all 3 levels for 3 points.
        const assignedLevels = points.length === 2 ? [0, 2] : [0, 1, 2];
        
        return points.map((p, index) => ({
            ...p,
            yLevel: assignedLevels[index], // 0: top, 1: middle, 2: bottom
        }));

    }, [avg, previousSalary, desiredSalary, chartMin, chartMax, competencyPremium, avgLabel, colorClasses, max]);


    if (chartRange <= 0) return null;

    const barLeftPercent = getPositionPercent(min);
    const barWidthPercent = getPositionPercent(max) - barLeftPercent;
    
    // Constants for vertical layout calculations (all in pixels)
    const CONTAINER_HEIGHT = 160; // h-40 is 160px
    const BAR_Y_CENTER = CONTAINER_HEIGHT * 0.7; // Position bar 70% from the top
    
    // Corrected estimated height of the label text block for accurate line calculation.
    // p.text-sm (line-height: 20px) + p.text-xs (line-height: 16px) + -mt-1 (-4px) = 32px.
    const TEXT_BLOCK_HEIGHT = 32;

    // Define the top positions for the 3 vertical label slots, moved up to prevent overlap.
    const yLevelTops = [
        0, // Top slot (yLevel 0)
        34, // Middle slot (yLevel 1)
        68, // Bottom slot (yLevel 2)
    ];


    return (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                         <h3 className={`text-lg font-bold ${colorClasses.accent}`}>{title}</h3>
                         {showInfoButton && (
                            <button
                                onClick={onInfoClick}
                                className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full"
                                aria-label="AI 추천 연봉 산출 과정 보기"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 mb-6 flex-grow">{description}</p>
                </div>
                {competencyPremium !== undefined && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full self-start whitespace-nowrap ${
                        competencyPremium > 0 ? 'bg-blue-100 text-blue-800' :
                        competencyPremium < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                        {competencyPremium > 0 ? `+${competencyPremium.toLocaleString()}` : competencyPremium.toLocaleString()}만
                    </span>
                )}
            </div>
            
            <div className="relative h-40 w-full mt-auto">
                 {/* Full dynamic axis background */}
                 <div
                    className="absolute h-2.5 w-full bg-slate-200 rounded-full"
                    style={{ top: `${BAR_Y_CENTER}px`, transform: 'translateY(-50%)' }}
                 ></div>
                 
                 {/* Salary Range Bar */}
                 <div
                    className={`absolute h-2.5 bg-gradient-to-r ${colorClasses.gradient} rounded-full`}
                    style={{
                        top: `${BAR_Y_CENTER}px`,
                        transform: 'translateY(-50%)',
                        left: `${barLeftPercent}%`,
                        width: `${barWidthPercent}%`,
                    }}
                 ></div>

                {/* Render all data point labels */}
                {labelLayout.map(({ id, value, pos, yLevel, label, textClass, dotClass }) => {
                    const yPos = yLevelTops[yLevel!];
                    
                    const lineStartY = yPos + TEXT_BLOCK_HEIGHT;
                    const dotTopY = BAR_Y_CENTER - 6; 
                    const lineHeight = dotTopY - lineStartY;

                    return (
                        <React.Fragment key={id}>
                            {/* Data Point Dot on the bar */}
                            <div
                                className={`absolute w-3 h-3 rounded-full border-2 border-white shadow ${dotClass}`}
                                style={{
                                    top: `${BAR_Y_CENTER}px`,
                                    left: `${pos}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                aria-hidden="true"
                            ></div>

                            {/* Label & Line Group */}
                            <div 
                                className="absolute w-max"
                                style={{ 
                                    top: `${yPos}px`,
                                    left: `${pos}%`,
                                    transform: `translateX(-50%)`
                                }}
                                aria-label={`${label}: ${value}만원`}
                            >
                                <div className="flex flex-col items-center">
                                    {/* Label Text */}
                                    <div className="text-center">
                                        <p className={`text-sm font-bold whitespace-nowrap ${textClass}`}>{value.toLocaleString()}만</p>
                                        <p className={`text-xs font-semibold whitespace-nowrap -mt-1 ${textClass}`}>{label}</p>
                                    </div>
                                    {/* Leader Line */}
                                    {lineHeight > 4 && (
                                        <div 
                                            className="w-0.5 bg-slate-400"
                                            style={{ height: `${lineHeight}px` }}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="flex justify-between text-sm font-semibold text-slate-600 mt-4">
                <span>{min.toLocaleString()}만</span>
                <span>{max.toLocaleString()}만</span>
            </div>
        </div>
    );
};


const SummaryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const MarketAnalysisIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CompetencyAnalysisIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ComparisonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const DataSourceIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

const DesiredSalaryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const TrajectoryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const LogicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1m6-7h1m-18 0h1M5.636 5.636l-.707-.707M19.071 19.071l-.707-.707M18.364 5.636l.707-.707M4.929 19.071l.707-.707M12 12a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
);


const ReasoningItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    content: string;
    highlight?: boolean;
    premium?: number;
    children?: React.ReactNode;
}> = ({ icon, title, content, highlight = false, premium, children }) => (
    <div className={highlight ? "p-4 bg-indigo-50 rounded-lg" : ""}>
        <div className="flex items-start">
            <div className="flex-shrink-0 mr-4 text-indigo-500">
                {icon}
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <h4 className={`font-bold ${highlight ? 'text-indigo-800' : 'text-slate-800'}`}>{title}</h4>
                    {premium !== undefined && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            premium > 0 ? 'bg-blue-100 text-blue-800' : 
                            premium < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                            {premium > 0 ? `+${premium.toLocaleString()}` : premium.toLocaleString()} 만원
                        </span>
                    )}
                </div>
                <p className={`mt-1 text-sm leading-relaxed whitespace-pre-wrap ${highlight ? 'text-indigo-700' : 'text-slate-600'}`}>
                    {content}
                </p>
                {children}
            </div>
        </div>
    </div>
);


const EditableProposalSection: React.FC<{
    title: string;
    content: string;
    onChange: (newContent: string) => void;
}> = ({ title, content, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{title}</label>
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md resize-none overflow-hidden bg-white text-black focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
            />
        </div>
    );
};


export const AnalysisResult: React.FC<SalaryResultProps> = ({ data, applicantProfile, onReset }) => {
    const { minSalary, avgSalary, maxSalary, reasoning, desiredSalary, previousSalary, companyStandard, baselineMinSalary, baselineAvgSalary, baselineMaxSalary, competencyPremium, competencyGrade } = data;
    
    // Calculation logic for the breakdown section
    const formatKRW = (value?: number | null) => value ? `${value.toLocaleString()}만원` : '-';
    
    const actualMarketValue = (baselineAvgSalary ?? 0) + (competencyPremium ?? 0);
    const companyMiddle = (companyStandard && typeof companyStandard !== 'string') ? companyStandard.middle : null;
    let negotiationFloor = null;
    if (previousSalary && companyMiddle) {
      negotiationFloor = Math.max(previousSalary, companyMiddle);
    } else {
      negotiationFloor = previousSalary || companyMiddle;
    }
    const negotiationCeiling = desiredSalary;

    const getCompetencyWeight = (grade?: string): [number, string] => {
        switch(grade) {
            case '핵심 인재': return [0.8, "최고 수준의 역량을 고려하여 희망 연봉에 가깝게 책정"];
            case '우수 역량 보유': return [0.6, "우수한 역량을 고려하여 합리적인 수준으로 책정"];
            case '기본 역량 보유': return [0.25, "기본 역량 보유로 판단, 보수적인 수준으로 책정"];
            case '추가 검토 필요': return [0.1, "역량 보완이 필요하므로, 시작점에 가깝게 책정"];
            default: return [0.6, "역량 등급 미입력으로, '우수' 등급 기준으로 책정"];
        }
    };
    const [competencyWeight, competencyWeightReason] = getCompetencyWeight(competencyGrade);
    
    const strategicOffer = (negotiationFloor && negotiationCeiling && negotiationCeiling > negotiationFloor)
        ? Math.round(negotiationFloor + (negotiationCeiling - negotiationFloor) * competencyWeight)
        : null;
    
    const finalOfferBeforeCap = strategicOffer ? Math.min(strategicOffer, actualMarketValue) : actualMarketValue;
    
    const wasStrategicLogicApplied = !!strategicOffer;

    const Step: React.FC<{ num: number; title: string; description: string; children: React.ReactNode }> = ({ num, title, description, children }) => (
      <div className="relative pl-10 pb-8 border-l-2 border-slate-200 last:pb-0">
        <div className="absolute -left-5 top-0 w-9 h-9 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg">{num}</div>
        <div className="ml-4">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-slate-600 mt-1 mb-4">{description}</p>
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
              {children}
            </div>
        </div>
      </div>
    );

    const CalcRow: React.FC<{ label: string; value: string; operator?: '+' | '-' | '=' | '~' }> = ({ label, value, operator }) => (
        <div className="flex items-center gap-4 text-sm">
            {operator && <div className="font-bold text-slate-500 text-xl w-4 text-center">{operator}</div>}
            <div className="flex-1 text-slate-700">{label}</div>
            <div className="font-bold text-slate-900 text-base text-right">{value}</div>
        </div>
    );


    const [isInfographicModalOpen, setInfographicModalOpen] = useState(false);
    const [isProposalModalOpen, setProposalModalOpen] = useState(false);
    const [isCalcLogicModalOpen, setCalcLogicModalOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const [proposalContent, setProposalContent] = useState<HiringProposalContent | null>(null);
    const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
    const [proposalError, setProposalError] = useState<string | null>(null);

    const handleGenerateProposal = async () => {
        if (!reasoning.competencyAnalysis) {
            setProposalError("역량 분석 데이터가 없어 품의서 내용을 생성할 수 없습니다.");
            return;
        }
        setIsGeneratingProposal(true);
        setProposalError(null);
        setProposalContent(null);
        try {
            const result = await generateHiringProposalText(reasoning.competencyAnalysis, applicantProfile, avgSalary);
            setProposalContent(result);
        } catch (err) {
            if (err instanceof Error) {
                setProposalError(err.message);
            } else {
                setProposalError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsGeneratingProposal(false);
        }
    };
    
    const interviewTextForProposal = useMemo(() => {
        if (proposalContent) {
            return `1. 면접 총평\n${proposalContent.summary}\n\n2. 주요 강점\n${proposalContent.strengths}\n\n3. 보완점 및 성장 계획\n${proposalContent.improvements}\n\n4. 채용 추천 근거\n${proposalContent.rationale}`;
        }
        if (data.reasoning.competencyAnalysis) {
            return `[역량 기반 가치 분석]\n${data.reasoning.competencyAnalysis}`;
        }
        return '';
    }, [proposalContent, data.reasoning.competencyAnalysis]);


    const handleDownloadPdf = async () => {
        if (!reportRef.current) {
            alert('PDF로 저장할 콘텐츠를 찾을 수 없습니다.');
            return;
        }
         if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
            alert('PDF 다운로드 라이브러리를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
    
        setIsDownloadingPdf(true);
    
        try {
            const canvas = await window.html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc', // bg-slate-50
                onclone: (clonedDoc) => {
                    const content = clonedDoc.querySelector('.report-content-wrapper');
                    if (content) {
                      // Remove shadows from all elements within the cloned report for a cleaner PDF
                      content.querySelectorAll('.shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl').forEach(el => {
                        if (el instanceof HTMLElement) {
                            el.style.boxShadow = 'none';
                        }
                      });
                    }
                }
            });
    
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
    
            const ratio = canvasHeight / canvasWidth;
            const imgWidth = pdfWidth;
            const imgHeight = imgWidth * ratio;
    
            let heightLeft = imgHeight;
            let position = 0;
    
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
    
            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
    
            const today = new Date().toISOString().slice(0, 10);
            const { applicantName, roleName } = applicantProfile;
            const fileName = `채용적정성 분석 리포트_${applicantName || '지원자'}_${roleName || '직무'}_${today}.pdf`;
            
            pdf.save(fileName);
        } catch (error) {
            console.error("PDF 생성 중 오류 발생:", error);
            alert('PDF를 생성하는 중 오류가 발생했습니다.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };


    // 1. Collect all values to determine a unified scale for all charts
    const allValues: (number | null | undefined)[] = [
        minSalary, avgSalary, maxSalary,
        baselineMinSalary, baselineAvgSalary, baselineMaxSalary,
        desiredSalary, previousSalary
    ];
    if (companyStandard && typeof companyStandard !== 'string') {
        allValues.push(companyStandard.low, companyStandard.middle, companyStandard.high);
    }
    const validValues = allValues.filter(v => typeof v === 'number') as number[];
    if (validValues.length === 0) {
        return (
            <div className="mt-12 p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-700">분석 데이터 부족</h2>
                    <p className="mt-2 text-slate-500">연봉 범위를 계산할 수 없습니다.</p>
                        <button
                        onClick={onReset}
                        className="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        >
                        다시 예측하기
                    </button>
                </div>
            </div>
        )
    }
  
    // 2. Calculate chart boundaries
    const absoluteMin = Math.min(...validValues);
    const absoluteMax = Math.max(...validValues);
    const padding = (absoluteMax - absoluteMin) === 0 ? 1000 : (absoluteMax - absoluteMin) * 0.1;
    const chartMin = Math.floor((absoluteMin - padding) / 100) * 100;
    const chartMax = Math.ceil((absoluteMax + padding) / 100) * 100;

    const hasCompanyData = companyStandard && typeof companyStandard !== 'string' && companyStandard.middle !== null;
    const hasBaselineData = baselineMinSalary !== undefined && baselineAvgSalary !== undefined && baselineMaxSalary !== undefined;


    return (
        <>
            <InfographicModal 
                isOpen={isInfographicModalOpen}
                onClose={() => setInfographicModalOpen(false)}
                data={data}
            />
            <CalculationLogicModal
                isOpen={isCalcLogicModalOpen}
                onClose={() => setCalcLogicModalOpen(false)}
                data={data}
            />
            <HiringProposalModal
                isOpen={isProposalModalOpen}
                onClose={() => setProposalModalOpen(false)}
                data={data}
                applicantProfile={applicantProfile}
                interviewText={interviewTextForProposal}
            />
            <div ref={reportRef} className="mt-12 p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200 report-content-wrapper">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-800">AI 채용 적정성 분석 리포트</h2>
                    <p className="text-slate-600 mt-2">지원자 프로필을 바탕으로 시장 가치, 내부 기준, 희망 연봉을 종합 분석한 내부 검토용 리포트입니다.</p>
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                        <button
                            onClick={() => setInfographicModalOpen(true)}
                            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full border-2 border-indigo-500 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 11a1 1 0 100-2h10a1 1 0 100 2H5zM3 7a1 1 0 100-2h14a1 1 0 100 2H3zM7 15a1 1 0 100-2h6a1 1 0 100 2H7z" /></svg>
                            결과 요약 인포그래픽 보기
                        </button>
                         <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-full border-2 border-rose-500 hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-rose-300 flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                        >
                            {isDownloadingPdf ? (
                                <>
                                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   저장 중...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                    </svg>
                                    PDF로 저장하기
                                </>
                            )}
                        </button>
                         <button
                            onClick={() => setProposalModalOpen(true)}
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full border-2 border-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                            채용 품의서 생성
                        </button>
                    </div>
                </div>

                {/* Chart Grid */}
                <div className={`grid grid-cols-1 ${hasCompanyData ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
                    {/* Chart 1: Baseline Market Value */}
                    {hasBaselineData && (
                        <SingleSalaryChart
                            title="기초 시장 가치"
                            description="지원자의 프로필 기준, 시장의 보편적인 연봉 수준입니다."
                            min={baselineMinSalary!}
                            avg={baselineAvgSalary!}
                            max={baselineMaxSalary!}
                            avgLabel="중위값"
                            colorClasses={{ gradient: 'from-slate-300 to-slate-400', accent: 'text-slate-700', bg: 'bg-slate-500' }}
                            chartMin={chartMin}
                            chartMax={chartMax}
                        />
                    )}
                    
                    {/* Chart 2: Company Standard */}
                    {hasCompanyData && (
                        <SingleSalaryChart
                            title="우리 회사 내부 기준"
                            description="동일 연차/등급에 대한 당사의 내부 연봉 테이블 기준입니다."
                            min={companyStandard.low!}
                            avg={companyStandard.middle!}
                            max={companyStandard.high!}
                            avgLabel="중위값"
                            colorClasses={{ gradient: 'from-emerald-300 to-emerald-400', accent: 'text-emerald-700', bg: 'bg-emerald-500' }}
                            chartMin={chartMin}
                            chartMax={chartMax}
                        />
                    )}

                    {/* Chart 3: Final Recommended Value */}
                    <SingleSalaryChart
                        title="역량 반영 최종 추천 연봉"
                        description="시장 가치에 개인 역량 평가를 반영한 최종 추천 연봉입니다."
                        min={minSalary}
                        avg={avgSalary}
                        max={maxSalary}
                        avgLabel="AI 추천"
                        colorClasses={{ gradient: 'from-blue-400 to-indigo-500', accent: 'text-indigo-700', bg: 'bg-indigo-600' }}
                        chartMin={chartMin}
                        chartMax={chartMax}
                        desiredSalary={desiredSalary}
                        previousSalary={previousSalary}
                        competencyPremium={competencyPremium}
                        showInfoButton={true}
                        onInfoClick={() => setCalcLogicModalOpen(true)}
                    />
                </div>

                <div className="mt-10 max-w-3xl mx-auto">
                    <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        AI 채용 리포트
                    </h3>
                    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm space-y-5">
                        <ReasoningItem
                            icon={<SummaryIcon />}
                            title="HR 총평"
                            content={reasoning.summary}
                            highlight={true}
                        />

                        <div className="border-t border-slate-200"></div>
                        <ReasoningItem
                            icon={<LogicIcon />}
                            title="AI 최종 추천 연봉 산출 과정"
                            content="AI가 시장 가치, 회사 정책, 개인 역량 등을 종합하여 최종 연봉을 도출하는 상세 과정입니다."
                        >
                            <div className="mt-4 flow-root">
                                <Step num={1} title="실제 시장 가치 평가" description="지원자의 객관적인 프로필과 주관적인 역량을 종합하여, 시장에서 받을 수 있는 절대적인 가치를 평가합니다.">
                                    <CalcRow label="기초 시장 가치 (프로필 기준)" value={formatKRW(baselineAvgSalary)} />
                                    <CalcRow label="역량 프리미엄 (역량 평가)" value={formatKRW(competencyPremium)} operator="+" />
                                    <hr className="my-2 border-slate-200" />
                                    <CalcRow label="지원자의 실제 시장 가치" value={formatKRW(actualMarketValue)} operator="="/>
                                </Step>
                                
                                <Step num={2} title="현실적인 협상 범위 설정" description="회사의 HR 매니저 입장에서, 지원자의 이전/희망 연봉과 회사 내부 기준을 바탕으로 현실적인 협상 범위를 설정합니다.">
                                   <CalcRow label="협상 시작점 (max(내부 기준, 이전 연봉))" value={formatKRW(negotiationFloor)} />
                                   <CalcRow label="협상 상한선 (지원자 희망 연봉)" value={formatKRW(negotiationCeiling)} />
                                </Step>

                                <Step num={3} title="전략적 제안가 계산" description="설정된 협상 범위 내에서, 지원자의 역량 등급에 따라 가중치를 두어 가장 비용 효율적인 제안 금액을 계산합니다.">
                                   {wasStrategicLogicApplied && negotiationFloor && negotiationCeiling ? (
                                      <>
                                        <p className="text-xs text-center text-slate-500 p-2 bg-slate-100 rounded-md">
                                          <strong>'{competencyGrade}'</strong> 등급으로 평가되어, <strong>{competencyWeight * 100}%</strong>의 가중치가 적용되었습니다.<br/>({competencyWeightReason})
                                        </p>
                                        <CalcRow label="협상 시작점" value={formatKRW(negotiationFloor)} />
                                        <CalcRow label="협상 범위 × 역량 가중치" value={`${formatKRW((negotiationCeiling - negotiationFloor) * competencyWeight)}`} operator="+" />
                                        <hr className="my-2 border-slate-200" />
                                        <CalcRow label="전략적 제안가" value={formatKRW(strategicOffer)} operator="=" />
                                      </>
                                   ) : (
                                        <p className="text-sm text-center text-slate-600 py-4">
                                          {
                                            (!negotiationFloor || !negotiationCeiling)
                                            ? '희망 연봉 또는 내부 기준/이전 연봉 데이터가 없어, 전략적 제안가 계산을 생략하고'
                                            : (negotiationCeiling <= negotiationFloor)
                                            ? `희망 연봉(${formatKRW(negotiationCeiling)})이 협상 시작점(${formatKRW(negotiationFloor)})보다 낮거나 같아, 전략적 제안가 계산을 생략하고`
                                            : '희망 연봉 또는 내부 기준이 없어, 전략적 제안가 계산을 생략하고'
                                          }
                                          <br/>
                                          <span className="font-bold">'1단계: 실제 시장 가치'</span>를 기준으로 최종 연봉을 결정합니다.
                                        </p>
                                   )}
                                </Step>
                                
                                <div className="relative pl-10">
                                   <div className="absolute -left-5 top-0 w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                                   <div className="ml-4">
                                        <h3 className="text-xl font-bold text-slate-800">최종 추천 연봉 결정</h3>
                                        <p className="text-slate-600 mt-1 mb-4">회사의 이익을 고려하여, '실제 시장 가치'와 '전략적 제안가' 중 더 낮은 금액을 선택하고, 마지막으로 지원자의 희망 연봉을 넘지 않도록 조정합니다.</p>
                                        <div className="bg-indigo-100 p-4 rounded-lg border border-indigo-200 space-y-3">
                                          <CalcRow label="min(실제 시장 가치, 전략적 제안가)" value={formatKRW(finalOfferBeforeCap)} />
                                          {desiredSalary && finalOfferBeforeCap > desiredSalary && (
                                            <p className="text-xs text-center text-indigo-700 p-2 bg-indigo-200 rounded-md">
                                                산출된 금액이 희망 연봉({formatKRW(desiredSalary)})을 초과하여, 희망 연봉으로 최종 조정되었습니다.
                                            </p>
                                          )}
                                          <hr className="my-2 border-indigo-200" />
                                          <div className="flex items-center gap-4">
                                            <div className="font-bold text-indigo-800 flex-1">최종 추천 연봉 (반올림 적용)</div>
                                            <div className="font-extrabold text-indigo-800 text-2xl text-right">{formatKRW(avgSalary)}</div>
                                          </div>
                                        </div>
                                   </div>
                                </div>
                            </div>
                        </ReasoningItem>

                        {reasoning.previousSalaryAnalysis && (
                            <>
                                <div className="border-t border-slate-200"></div>
                                 <ReasoningItem
                                    icon={<TrajectoryIcon />}
                                    title="이전 연봉 및 희망 인상률 분석"
                                    content={reasoning.previousSalaryAnalysis}
                                />
                            </>
                        )}
                        {reasoning.desiredSalaryAnalysis && (
                            <>
                                <div className="border-t border-slate-200"></div>
                                <ReasoningItem
                                    icon={<DesiredSalaryIcon />}
                                    title="희망 연봉 검토 및 협상 전략"
                                    content={reasoning.desiredSalaryAnalysis}
                                />
                            </>
                        )}
                        {reasoning.competencyAnalysis && (
                            <>
                                <div className="border-t border-slate-200"></div>
                                <ReasoningItem
                                    icon={<CompetencyAnalysisIcon />}
                                    title="역량 기반 가치 분석"
                                    content={reasoning.competencyAnalysis}
                                    premium={competencyPremium}
                                >
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        {!proposalContent && (
                                            <div className="text-center">
                                                <button
                                                    onClick={handleGenerateProposal}
                                                    disabled={isGeneratingProposal}
                                                    className="px-5 py-2.5 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 mx-auto disabled:bg-slate-400"
                                                >
                                                    {isGeneratingProposal ? (
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {isGeneratingProposal ? '생성 중...' : '채용 품의서용 총평 생성하기'}
                                                </button>
                                                {proposalError && <p className="text-red-500 text-sm mt-2">{proposalError}</p>}
                                            </div>
                                        )}
                                        
                                        {proposalContent && (
                                            <div className="space-y-4 animate-fade-in">
                                                <h4 className="font-bold text-lg text-indigo-700">채용 품의서용 총평 (AI 초안)</h4>
                                                <p className="text-sm text-slate-500 -mt-3">아래 내용은 자유롭게 수정할 수 있습니다. 수정된 내용은 '채용 품의서 생성' 시 자동으로 반영됩니다.</p>
                                                <EditableProposalSection
                                                    title="1. 면접 총평"
                                                    content={proposalContent.summary}
                                                    onChange={(newContent) => setProposalContent(p => p ? { ...p, summary: newContent } : null)}
                                                />
                                                <EditableProposalSection
                                                    title="2. 주요 강점"
                                                    content={proposalContent.strengths}
                                                    onChange={(newContent) => setProposalContent(p => p ? { ...p, strengths: newContent } : null)}
                                                />
                                                <EditableProposalSection
                                                    title="3. 보완점 및 성장 계획"
                                                    content={proposalContent.improvements}
                                                    onChange={(newContent) => setProposalContent(p => p ? { ...p, improvements: newContent } : null)}
                                                />
                                                <EditableProposalSection
                                                    title="4. 채용 추천 근거"
                                                    content={proposalContent.rationale}
                                                    onChange={(newContent) => setProposalContent(p => p ? { ...p, rationale: newContent } : null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </ReasoningItem>
                            </>
                        )}
                        <div className="border-t border-slate-200"></div>
                        <ReasoningItem
                            icon={<MarketAnalysisIcon />}
                            title="기초 시장 가치 분석"
                            content={reasoning.marketAnalysis}
                        />
                        <div className="border-t border-slate-200"></div>
                        <ReasoningItem
                            icon={<ComparisonIcon />}
                            title="내부 기준 비교 및 처우 제안"
                            content={reasoning.comparison}
                        />
                        <div className="border-t border-slate-200"></div>
                        <ReasoningItem
                            icon={<DataSourceIcon />}
                            title="데이터 출처"
                            content={reasoning.dataSource}
                        />
                    </div>
                </div>
          
                <div className="text-center mt-12">
                    <button
                    onClick={onReset}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                    >
                    다시 예측하기
                    </button>
                </div>

                <p className="text-xs text-slate-400 mt-8 text-center">* 본 결과는 AI 모델을 통해 생성된 정보로, 실제 시장 데이터와 다소 차이가 있을 수 있습니다.</p>
            </div>
        </>
    );
};