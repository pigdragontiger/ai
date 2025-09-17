
import React, { useState } from 'react';
import { CompanySalaryTable } from './CompanySalaryTable';
import type { CompanySalaryTableData, EducationLevelId, SelectOption } from '../types';

// --- Local Icon Components ---
const GuideIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const LogicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1m6-7h1m-18 0h1M5.636 5.636l-.707-.707M19.071 19.071l-.707-.707M18.364 5.636l.707-.707M4.929 19.071l.707-.707M12 12a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
);
const MarketDataIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const DataIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);
const AlertIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

// --- Local Helper Components ---
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="py-8 border-b border-slate-200 last:border-b-0">
        <div className="flex items-center mb-6">
            {icon}
            <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="space-y-6 text-slate-700 leading-relaxed lg:pl-10">
            {children}
        </div>
    </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-xl font-bold text-slate-700 mb-3">{title}</h3>
        <div className="space-y-3 text-slate-600">{children}</div>
    </div>
);

type Platform = 'saramin' | 'wanted' | 'jobkorea';

interface UsageGuideProps {
    platformData: Record<Platform, { name: string; data: CompanySalaryTableData }>;
    educationLevels: SelectOption<EducationLevelId>[];
    selectedEducation: EducationLevelId;
    onEducationSelect: (levelId: EducationLevelId) => void;
    onPrintRequest: () => void;
}

export const UsageGuide: React.FC<UsageGuideProps> = ({ platformData, educationLevels, selectedEducation, onEducationSelect, onPrintRequest }) => {
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
    const platforms: Platform[] = ['saramin', 'wanted', 'jobkorea'];

    return (
        <div className="bg-white p-6 sm:p-10 rounded-2xl rounded-tl-none shadow-lg">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-800">시스템 이용 가이드</h1>
                <p className="mt-4 text-lg text-slate-500 max-w-3xl mx-auto">
                    본 시스템은 AI를 활용하여 웹 에이전시 시장에 특화된 현실적인 연봉 데이터를 분석하고 예측합니다. <br />
                    정확한 예측을 위해 시스템의 작동 방식과 데이터 분석 로직을 숙지해주시기 바랍니다.
                </p>
            </header>

            <div className="max-w-4xl mx-auto">
                <Section title="1. 사용 방법" icon={<GuideIcon />}>
                    <p>이 시스템은 크게 두 가지 기능, '지원자 연봉 측정'과 '연봉 테이블 조회'로 구성되어 있습니다.</p>
                    <SubSection title="1.1. 지원자 연봉 측정 탭">
                        <p>지원자의 프로필을 단계별로 입력하여 AI 분석 리포트를 받아보는 핵심 기능입니다.</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>1. 직무 선택:</strong> 분석을 원하는 직무를 선택합니다. 선택된 직무에 따라 5단계 역량 평가 항목이 결정됩니다.</li>
                            <li><strong>2. 경력 정보 입력:</strong> '자동 계산' 또는 '수동 선택' 모드를 통해 경력 정보를 입력합니다.
                                <ul className="list-['-_'] list-inside ml-4 mt-1">
                                    <li><strong>자동 계산:</strong> 경력 연차와 최종 학력을 입력하면 정부 고시 기준의 SW기술자 등급이 자동 계산됩니다.</li>
                                    <li><strong>수동 선택:</strong> SW기술자 등급을 직접 선택하고, AI 분석의 참고 자료로 활용될 실제 경력 연차를 별도로 입력합니다.</li>
                                </ul>
                            </li>
                            <li><strong>3. 회사 정보 선택:</strong> 지원자가 근무할 회사의 규모와 지역을 선택합니다. 이는 지역별, 규모별 연봉 격차를 분석에 반영하는 데 사용됩니다.</li>
                            <li><strong>4. 연봉 정보 입력 (선택):</strong> 지원자의 이전 연봉과 희망 연봉을 입력하면, AI가 시장 가치와 비교하여 인상률의 합리성 및 협상 전략을 함께 분석해줍니다.</li>
                            <li><strong>5. 역량 평가:</strong> 선택한 직무의 5가지 핵심 역량에 대해 지원자의 현재 수준을 1~4점 척도로 평가합니다. 이 평가는 '역량 프리미엄'을 산출하는 데 결정적인 역할을 합니다.</li>
                        </ul>
                        <p>모든 필수 항목을 입력한 후 'AI로 내 연봉 분석하기' 버튼을 클릭하면, 잠시 후 상세 분석 리포트가 생성됩니다.</p>
                    </SubSection>
                    <SubSection title="1.2. 회사 기준 탭">
                        <p>'회사 기준' 테이블은 우리 회사의 내부 연봉 기준을 관리하는 곳입니다.</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>연차별/평가등급별 연봉을 직접 수정하고 '현재 기준 저장' 버튼으로 저장할 수 있습니다.</li>
                        </ul>
                    </SubSection>
                </Section>

                <Section title="2. 핵심 분석 로직" icon={<LogicIcon />}>
                    <p>본 시스템의 핵심은 AI가 '전통 웹 에이전시의 현실적인 HR 매니저' 역할을 수행하도록 설계되었다는 점입니다. 이를 위해 AI는 다음과 같은 다단계 분석 로직을 따릅니다.</p>
                    <SubSection title="2.1. '기초 시장 가치' 분석 (객관적 지표)">
                        <p>이 단계에서는 지원자의 역량 평가, 이전/희망 연봉 등 주관적 요소를 <strong>완전히 배제</strong>하고, 오직 직무, 경력, 학력, 회사 규모, 지역 등 객관적인 프로필만으로 시장의 보편적인 연봉 범위를 산출합니다.</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>AI 역할 부여:</strong> AI에게 "당신은 SI 프로젝트를 주로 수행하는 안정적이고 보수적인 연봉 정책을 가진 웹 에이전시의 HR 매니저"라는 명확한 역할을 부여합니다.</li>
                            <li><strong>데이터 필터링:</strong> AI는 일반적인 중소기업 데이터가 많은 'Saramin', 'JobKorea' 데이터를 우선 참고하도록 지시받습니다.</li>
                            <li><strong>분석 제외 기준:</strong> 가장 중요한 로직으로, 현실적인 데이터 산출을 위해 AI는 아래와 같은 고연봉 시장 데이터를 <strong>의도적으로 분석에서 제외</strong>합니다.
                                <ul className="list-['-_'] list-inside ml-4 mt-1 bg-slate-100 p-2 rounded">
                                    <li>IT 대기업 (네이버, 카카오 등)</li>
                                    <li>고성장 기술 스타트업 (대규모 투자 유치 기업)</li>
                                    <li>금융권 및 대기업 SI 계열사</li>
                                </ul>
                            </li>
                            <li><strong>결과의 일관성:</strong> 동일한 조건을 입력하면 항상 동일한 '기초 시장 가치'가 나오도록, AI의 무작위성을 제어하는 `temperature`와 `seed` 값을 고정하여 신뢰도를 확보했습니다.</li>
                        </ul>
                    </SubSection>
                    <SubSection title="2.2. '역량 프리미엄' 분석 (주관적 역량)">
                        <p>'기초 시장 가치'가 산출된 후, 사용자가 입력한 5가지 역량 평가 점수를 바탕으로 개인의 특수성을 연봉에 반영합니다.</p>
                         <p>AI는 '보상 전문가' 역할을 부여받아, 각 역량 항목의 점수가 연봉에 미치는 영향을 분석하고, 기초 연봉에 더하거나 뺄 '역량 프리미엄' 금액(만원 단위)을 계산합니다. 예를 들어, '문제 정의 능력'이 탁월하다면 플러스(+) 프리미엄이, '툴 활용 능력'이 미흡하다면 마이너스(-) 프리미엄이 붙을 수 있습니다. 이 프리미엄이 반영된 것이 '최종 추천 연봉'입니다.</p>
                    </SubSection>
                     <SubSection title="2.3. '이전/희망 연봉' 분석 (협상 전략)">
                        <p>선택적으로 입력된 이전/희망 연봉 정보는 AI가 채용 담당자를 위한 협상 전략을 제시하는 데 사용됩니다.</p>
                        <ul className="list-disc list-inside space-y-2">
                             <li><strong>다면적 분석:</strong> AI는 이전 연봉이 시장 가치보다 낮을 경우, '저평가된 인재'일 가능성과 '이전 직장에서의 성과가 반영된 결과'일 가능성을 모두 제시합니다. 특히, 이 분석은 저희가 입력한 '역량 평가' 결과와 연계하여 더 논리적인 추론을 제공합니다.</li>
                            <li><strong>협상 전략 제안:</strong> 희망 연봉이 AI가 분석한 최종 추천 연봉 범위와 어떤 관계에 있는지 분석하고, 합리적인 수용, 일부 조정, 또는 대안(인센티브 등) 제시와 같은 구체적인 협상 가이드를 제공합니다.</li>
                        </ul>
                    </SubSection>
                    <SubSection title="2.4. 연차별 연봉 상승률 둔화 로직">
                        <p>연차가 높아질수록 연봉 상승률이 둔화되는 시장 현실은 별도의 복잡한 공식 없이 AI의 학습 데이터와 역할 설정(페르소나)을 통해 자연스럽게 반영됩니다. AI는 '현실적인 HR 매니저'로서, 고연차 직원에게는 연차 자체보다 리더십이나 특별한 성과가 연봉에 더 큰 영향을 미친다는 점을 인지하고 값을 보정합니다.</p>
                    </SubSection>
                </Section>
                
                 <Section title="3. 시장 연봉 데이터 참고" icon={<MarketDataIcon />}>
                    <p>
                        아래 버튼을 클릭하여 주요 채용 플랫폼별 2025년 예상 연봉 테이블을 참고할 수 있습니다.
                        이 데이터는 AI가 '기초 시장 가치'를 분석할 때 참고하는 데이터와 유사하며, 각 플랫폼의 특성에 따라 연봉 수준에 차이가 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {platforms.map(platform => {
                            const isSelected = selectedPlatform === platform;
                            return (
                                <button
                                    key={platform}
                                    onClick={() => setSelectedPlatform(platform)}
                                    className={`px-5 py-2 border-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200
                                        ${isSelected 
                                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-md' 
                                        : 'border-slate-300 bg-white hover:border-indigo-400'
                                        }`}
                                >
                                    {platformData[platform].name}
                                </button>
                            );
                        })}
                    </div>

                    {selectedPlatform && (
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <CompanySalaryTable
                                title={`${platformData[selectedPlatform].name} 연봉 테이블`}
                                description={`2025년 예상 연봉 데이터입니다. (참고용, 단위: 만원)`}
                                isReadOnly={true}
                                data={platformData[selectedPlatform].data[selectedEducation]}
                                onUpdate={() => {}} // dummy function for read-only table
                                educationLevels={educationLevels}
                                selectedEducation={selectedEducation}
                                onEducationSelect={onEducationSelect}
                                onPrintRequest={onPrintRequest}
                            />
                        </div>
                    )}
                </Section>

                <Section title="4. 데이터 출처" icon={<DataIcon />}>
                    <p>본 시스템은 세 가지 종류의 데이터를 종합하여 분석 결과를 제공합니다.</p>
                    <ul className="list-disc list-inside space-y-3">
                        <li><strong>1. 사용자 관리 데이터:</strong> '회사 기준' 탭의 연봉 테이블 데이터입니다. 이 데이터는 사용자가 직접 입력하고 관리하며, AI는 '내부 기준 비교' 분석 시 이 데이터를 활용합니다.</li>
                        <li><strong>2. 시스템 제공 참고 데이터:</strong> 이 페이지의 '시장 연봉 데이터 참고' 섹션에서 제공되는 연봉 테이블입니다. 이는 2025년 시장 예측을 바탕으로 각 플랫폼의 특성을 반영하여 시스템에 미리 입력된 <strong>참고용 고정 데이터(Static Data)</strong>입니다.</li>
                        <li><strong>3. AI 모델의 학습 데이터:</strong> 분석의 핵심 엔진인 Google의 Gemini AI 모델이 학습한 방대한 웹 데이터(채용 공고, 연봉 통계 등)입니다. 시스템은 이 방대한 데이터에 위 '핵심 분석 로직'에서 설명한 **강력한 필터링과 역할 부여**를 적용하여, '전통 웹 에이전시'라는 특정 시장에 맞는 현실적인 결과값을 추출해냅니다.</li>
                    </ul>
                </Section>
                
                <Section title="5. 중요 안내사항" icon={<AlertIcon />}>
                    <p>시스템을 효과적으로 활용하기 위해 다음 사항을 반드시 유념해주시기 바랍니다.</p>
                     <ul className="list-disc list-inside space-y-3">
                         <li>본 시스템은 실제 채용 시장의 데이터를 바탕으로 AI가 추론한 결과를 제공하는 <strong>시뮬레이션 도구</strong>입니다.</li>
                         <li>분석 결과는 법적 효력을 갖지 않으며, 실제 연봉 책정 시에는 개별 협상 내용, 시장 상황의 급격한 변화, 회사의 재정 상태 등 다양한 추가 요인이 고려되어야 합니다.</li>
                         <li>AI가 제공하는 리포트는 절대적인 정답이 아니며, HR 담당자님의 합리적인 의사결정을 돕는 **강력한 참고 자료**로 활용해주시기 바랍니다.</li>
                    </ul>
                </Section>
            </div>
        </div>
    );
};