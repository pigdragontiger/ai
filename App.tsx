
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ROLES, ENGINEER_LEVELS, AGENCY_SIZES, LOCATIONS, EDUCATION_LEVELS, YEARLY_EXPERIENCE_TIERS } from './constants';
// FIX: Renamed imported type to avoid name collision with the component.
import type { Role, AgencySize, Location, EducationLevelId, EngineerLevelId, SalaryResultData, CareerInputMode, ActiveTab, CompanySalaryTableData, SalaryEvaluation, RoleEvaluationDetails, ApplicantProfile } from './types';
import { Header } from './components/Header';
import RoleSelector from './components/RoleSelector';
import EvaluationMatrix from './components/EvaluationMatrix';
import { CompanyInfoSelector } from './components/CompanyInfoSelector';
import CareerInfoSelector from './components/CareerInfoSelector';
import { AnalysisResult } from './components/SalaryResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchSalaryGuidance } from './services/geminiService';
import { calculateEngineerLevel } from './logic';
import { CompanySalaryTable, JOB_STRUCTURE } from './components/CompanySalaryTable';
import { BACHELOR_DEGREE_SALARY_TABLE, MASTER_DEGREE_SALARY_TABLE, ASSOCIATE_DEGREE_SALARY_TABLE, HIGH_SCHOOL_DEGREE_SALARY_TABLE } from './data/salaryData';
import { SARAMIN_SALARY_DATA_2025, WANTED_SALARY_DATA_2025, JOBKOREA_SALARY_DATA_2025 } from './data/platformSalaryData';
import { UsageGuide } from './components/UsageGuide';
import { SalaryInfoInput } from './components/SalaryInfoInput';
import { HiringProposalPage } from './components/HiringProposalPage';


// --- Tab Icon Components ---
const PersonalIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        {isActive ? (
            <path stroke="none" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        )}
    </svg>
);
const CompanyIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      {isActive 
        ? <path stroke="none" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      }
    </svg>
);
const GuideIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      {isActive
        ? <path stroke="none" d="M20 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-14 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm7 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.955 8.955 0 003 10.518V19.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5V10.518a8.955 8.955 0 00-9-4.476zM12 6.042L12 18.75" />
      }
    </svg>
);
const ProposalIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        {isActive
            ? <path stroke="none" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            : <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3h7.5m3-11.25V21a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 21V5.25A2.25 2.25 0 015.25 3h4.5" />
        }
    </svg>
);


const SALARY_DATA_MAP: Record<EducationLevelId, Record<string, SalaryEvaluation>> = {
    'master': MASTER_DEGREE_SALARY_TABLE,
    'bachelor': BACHELOR_DEGREE_SALARY_TABLE,
    'associate': ASSOCIATE_DEGREE_SALARY_TABLE,
    'highschool': HIGH_SCHOOL_DEGREE_SALARY_TABLE,
};

const PLATFORM_DATA: Record<'saramin' | 'wanted' | 'jobkorea', { name: string; data: CompanySalaryTableData }> = {
    saramin: { name: 'Saramin', data: SARAMIN_SALARY_DATA_2025 },
    wanted: { name: 'Wanted', data: WANTED_SALARY_DATA_2025 },
    jobkorea: { name: 'JobKorea', data: JOBKOREA_SALARY_DATA_2025 },
};

const COMPANY_SALARY_TABLE_STORAGE_KEY = 'companySalaryTableData';

// Function to generate the initial state for the company salary table
const initializeCompanySalaryTable = (): CompanySalaryTableData => {
    const initialTable: CompanySalaryTableData = {} as CompanySalaryTableData;
    for (const eduLevel of EDUCATION_LEVELS) {
        initialTable[eduLevel.id] = {};
        const salaryData = SALARY_DATA_MAP[eduLevel.id] ?? BACHELOR_DEGREE_SALARY_TABLE; // Fallback
        for (let i = 1; i <= 20; i++) {
            const yearId = i.toString();
            initialTable[eduLevel.id][yearId] = salaryData[yearId] ?? { low: null, middle: null, high: null };
        }
    }
    return initialTable;
};


const App: React.FC = () => {
  // Common State
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);


  // Personal Prediction State
  const [applicantName, setApplicantName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [careerInputMode, setCareerInputMode] = useState<CareerInputMode>('auto');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [educationLevel, setEducationLevel] = useState<EducationLevelId | null>(null);
  const [manualEngineerLevel, setManualEngineerLevel] = useState<EngineerLevelId | null>(null);
  const [selectedAgencySize, setSelectedAgencySize] = useState<AgencySize>('large');
  const [selectedLocation, setSelectedLocation] = useState<Location>('seoul');
  const [roleEvaluation, setRoleEvaluation] = useState<Record<string, number | null>>({});
  const [previousSalary, setPreviousSalary] = useState<number>(4000);
  const [desiredSalary, setDesiredSalary] = useState<number>(5000);

  
  // Company Table State
  const [companySalaryTable, setCompanySalaryTable] = useState<CompanySalaryTableData>(() => {
    try {
        const savedData = localStorage.getItem(COMPANY_SALARY_TABLE_STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to load or parse company salary data from localStorage:", error);
        localStorage.removeItem(COMPANY_SALARY_TABLE_STORAGE_KEY);
    }
    return initializeCompanySalaryTable();
  });
  const [selectedCompanyEducation, setSelectedCompanyEducation] = useState<EducationLevelId>('bachelor');


  // Output State
  const [salaryResult, setSalaryResult] = useState<SalaryResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
    
  // Tab UI State
  // FIX: Initialize useRef with a complete object with null values to match the explicit type `Record<ActiveTab, HTMLButtonElement | null>`.
  const tabRefs = useRef<Record<ActiveTab, HTMLButtonElement | null>>({
    personal: null,
    company: null,
    guide: null,
    proposal: null,
  });
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeTabRef = tabRefs.current[activeTab];
    const indicator = indicatorRef.current;

    if (activeTabRef && indicator) {
        const { offsetLeft, offsetWidth } = activeTabRef;
        indicator.style.left = `${offsetLeft}px`;
        indicator.style.width = `${offsetWidth}px`;
    }
  }, [activeTab]);


  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      const messages = [
        "시장 데이터를 분석 중입니다...",
        "역량 프리미엄을 산출하고 있습니다...",
        "협상 전략을 수립 중입니다...",
        "최종 리포트를 생성하고 있습니다...",
      ];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);

      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2500); // Cycle every 2.5 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const competencySummary = useMemo(() => {
    if (!selectedRole || selectedRole.evaluationCriteria.length === 0) {
        return null;
    }

    const scores = Object.values(roleEvaluation).filter(score => score !== null) as number[];

    // Only show summary when all criteria are evaluated
    if (scores.length !== selectedRole.evaluationCriteria.length || scores.length === 0) {
        return null;
    }
    
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    let competencyGrade: string;

    if (averageScore < 2.0) {
        competencyGrade = '추가 검토 필요';
    } else if (averageScore <= 2.7) {
        competencyGrade = '기본 역량 보유';
    } else if (averageScore <= 3.5) {
        competencyGrade = '우수 역량 보유';
    } else {
        competencyGrade = '핵심 인재';
    }

    return {
        averageScore: averageScore.toFixed(2),
        competencyGrade,
    };
  }, [roleEvaluation, selectedRole]);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
    // Initialize evaluation state for the selected role
    const initialEvaluation = role.evaluationCriteria.reduce((acc, criterion) => {
        acc[criterion.id] = null;
        return acc;
    }, {} as Record<string, number | null>);
    setRoleEvaluation(initialEvaluation);
    setSalaryResult(null); // Reset result
  }, []);
  
  const handleRoleEvaluationChange = useCallback((criterionId: string, score: number) => {
    setRoleEvaluation(prev => ({
      ...prev,
      [criterionId]: score,
    }));
    setSalaryResult(null); // Reset result on change
  }, []);


  const resetAll = () => {
    setApplicantName('');
    setSelectedRole(null);
    setCareerInputMode('auto');
    setExperienceYears(0);
    setEducationLevel(null);
    setManualEngineerLevel(null);
    setSelectedAgencySize('large');
    setSelectedLocation('seoul');
    setRoleEvaluation({});
    setPreviousSalary(4000);
    setDesiredSalary(5000);
    setSalaryResult(null);
    setIsLoading(false);
    setError(null);
  };
  
  const handleCompanySalaryChange = useCallback((eduId: EducationLevelId, tierId: string, field: 'low' | 'middle' | 'high', value: number | null) => {
    setCompanySalaryTable(prev => {
        const newState = JSON.parse(JSON.stringify(prev));
        
        if (!newState[eduId]) newState[eduId] = {};
        if (!newState[eduId][tierId]) newState[eduId][tierId] = { low: null, middle: null, high: null };

        const currentTierData = newState[eduId][tierId];
        const previousTierData = prev[eduId]?.[tierId];

        if (field === 'high' && value !== null && previousTierData) {
            const previousHigh = previousTierData.high;

            if (previousHigh !== null && typeof previousHigh === 'number') {
                const delta = value - previousHigh;
                
                currentTierData.high = value;

                if (currentTierData.middle !== null && typeof currentTierData.middle === 'number') {
                    currentTierData.middle = Math.max(0, currentTierData.middle + delta);
                }
                if (currentTierData.low !== null && typeof currentTierData.low === 'number') {
                    currentTierData.low = Math.max(0, currentTierData.low + delta);
                }
            } else {
                currentTierData.high = value;
            }
        } else {
            currentTierData[field] = value;
        }

        return newState;
    });
  }, []);

  const handleSaveCompanyTable = useCallback(() => {
    try {
        localStorage.setItem(COMPANY_SALARY_TABLE_STORAGE_KEY, JSON.stringify(companySalaryTable));
        alert('연봉 기준이 성공적으로 저장되었습니다.');
    } catch (error) {
        console.error("Failed to save company salary data to localStorage", error);
        alert('저장에 실패했습니다. 브라우저의 저장 공간이 부족하거나, 비공개 모드(시크릿 모드)가 아닌지 확인해주세요.');
    }
  }, [companySalaryTable]);

  const handleResetCompanyTable = useCallback(() => {
    if (window.confirm("정말로 모든 데이터를 초기값으로 되돌리시겠습니까? 저장된 내용은 영구적으로 삭제됩니다.")) {
        try {
            localStorage.removeItem(COMPANY_SALARY_TABLE_STORAGE_KEY);
            setCompanySalaryTable(initializeCompanySalaryTable());
            alert('연봉 기준이 초기값으로 복원되었습니다.');
        } catch (error) {
            console.error("Failed to reset company salary data", error);
            alert('초기화에 실패했습니다.');
        }
    }
  }, []);

  const calculatedEngineerLevel = useMemo(
    () => calculateEngineerLevel(experienceYears, educationLevel),
    [experienceYears, educationLevel]
  );
  
  const finalEngineerLevel = careerInputMode === 'auto' ? calculatedEngineerLevel : manualEngineerLevel;
  
  const isSubmitDisabled = !applicantName || !selectedRole || !educationLevel || !finalEngineerLevel || isLoading || (selectedRole && selectedRole.evaluationCriteria.length > 0 && Object.values(roleEvaluation).some(v => v === null));

  const handleSubmit = async () => {
      if (isSubmitDisabled) return;

      setIsLoading(true);
      setError(null);
      setSalaryResult(null);

      const educationName = EDUCATION_LEVELS.find(e => e.id === educationLevel)?.name;
      
      let companyStandard: string | SalaryEvaluation | null = null;
      if (educationLevel) {
          if (careerInputMode === 'auto') {
              const yearKey = Math.max(1, Math.min(experienceYears, 20)).toString();
              companyStandard = companySalaryTable[educationLevel]?.[yearKey] ?? null;
          } else if (manualEngineerLevel) {
              const levelData = ENGINEER_LEVELS.find(el => el.id === manualEngineerLevel);
              const levelName = levelData?.name; // e.g., '중급 기술자'
              const levelLookupName = levelName?.replace(' 기술자', ''); // e.g., '중급'
              
              const levelInfo = JOB_STRUCTURE[educationLevel]?.levels.find(l => l.name === levelLookupName);

              if (levelInfo && levelName) {
                  const startYear = levelInfo.start;
                  const endYear = levelInfo.end;
                  
                  const startSalaryData = companySalaryTable[educationLevel]?.[startYear.toString()];
                  const endSalaryData = companySalaryTable[educationLevel]?.[endYear.toString()];

                  // Use 'middle' for year 1, and 'high' for all other start years, as per table logic.
                  const startValue = (startYear === 1 ? startSalaryData?.middle : startSalaryData?.high) ?? null;
                  const endValue = endSalaryData?.high ?? null;
                  
                  if (startValue !== null && endValue !== null) {
                       companyStandard = `해당 등급(${levelName})은 ${startYear}년차(약 ${startValue.toLocaleString()}만원)에서 ${endYear}년차(약 ${endValue.toLocaleString()}만원)까지의 범위를 가집니다.`;
                  }
              }
          }
      }
        
      let roleEvaluationDetails: RoleEvaluationDetails | undefined = undefined;

      if (selectedRole && Object.values(roleEvaluation).every(v => v !== null)) {
          roleEvaluationDetails = {};
          for (const criterion of selectedRole.evaluationCriteria) {
              const score = roleEvaluation[criterion.id]!;
              roleEvaluationDetails[criterion.id] = {
                  name: criterion.name,
                  score: score,
                  description: (criterion.levels as Record<number, string>)[score],
              };
          }
      }

      try {
          const result = await fetchSalaryGuidance({
              role: selectedRole!.name,
              level: ENGINEER_LEVELS.find(l => l.id === finalEngineerLevel)?.name || 'N/A',
              agencySize: AGENCY_SIZES.find(s => s.id === selectedAgencySize)?.name || 'N/A',
              location: LOCATIONS.find(l => l.id === selectedLocation)?.name || 'N/A',
              education: educationName,
              experience: experienceYears,
              companyStandard: companyStandard,
              roleEvaluation: roleEvaluationDetails,
              previousSalary: previousSalary,
              desiredSalary: desiredSalary,
          });
          
          // Attach company standard to result if it's plottable (i.e., not a string)
          if (companyStandard && typeof companyStandard !== 'string') {
              result.companyStandard = companyStandard;
          }

          setSalaryResult(result);
      } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('연봉 정보 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
          }
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  const TabButton: React.FC<{
    tabId: ActiveTab; 
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    buttonRef: (el: HTMLButtonElement | null) => void;
  }> = ({ tabId, children, isActive, onClick, buttonRef }) => (
    <button
        ref={buttonRef}
        onClick={() => {
            if (!isActive) { // Prevent resetting if clicking the same tab
              setSalaryResult(null);
              setError(null);
              onClick();
            }
        }}
        role="tab"
        aria-selected={isActive}
        className={`relative px-4 sm:px-6 py-3 text-base font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 whitespace-nowrap
        ${isActive
            ? 'text-indigo-600 font-semibold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
    >
        {children}
    </button>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner message={loadingMessage} />;
    
    if (salaryResult) {
        const applicantProfile: ApplicantProfile = {
            applicantName: applicantName,
            roleName: selectedRole!.name,
            educationName: EDUCATION_LEVELS.find(e => e.id === educationLevel)?.name,
            experienceYears: experienceYears,
            engineerLevelName: ENGINEER_LEVELS.find(l => l.id === finalEngineerLevel)!.name,
        };
        return <AnalysisResult data={salaryResult} applicantProfile={applicantProfile} onReset={resetAll} />;
    }

    if (activeTab === 'personal') {
        return (
            <>
                <div className="bg-white p-6 sm:p-10 rounded-b-2xl rounded-tr-2xl shadow-lg space-y-12">
                    <RoleSelector 
                        roles={ROLES}
                        selectedRole={selectedRole}
                        onSelect={handleRoleSelect}
                    />
                    
                    <CareerInfoSelector
                        mode={careerInputMode}
                        onModeChange={setCareerInputMode}
                        applicantName={applicantName}
                        onApplicantNameChange={setApplicantName}
                        experienceYears={experienceYears}
                        onExperienceYearsChange={setExperienceYears}
                        educationLevels={EDUCATION_LEVELS}
                        selectedEducation={educationLevel}
                        onEducationSelect={setEducationLevel}
                        calculatedLevel={calculatedEngineerLevel}
                        engineerLevels={ENGINEER_LEVELS}
                        selectedLevel={manualEngineerLevel}
                        onLevelSelect={setManualEngineerLevel}
                    />

                    <CompanyInfoSelector 
                        sizes={AGENCY_SIZES}
                        locations={LOCATIONS}
                        selectedSize={selectedAgencySize}
                        selectedLocation={selectedLocation}
                        onSelectSize={setSelectedAgencySize}
                        onSelectLocation={setSelectedLocation}
                    />

                    <SalaryInfoInput
                        previousSalary={previousSalary}
                        onPreviousSalaryChange={setPreviousSalary}
                        desiredSalary={desiredSalary}
                        onDesiredSalaryChange={setDesiredSalary}
                    />

                    <EvaluationMatrix 
                        criteria={selectedRole?.evaluationCriteria || []}
                        evaluation={roleEvaluation}
                        onEvaluationChange={handleRoleEvaluationChange}
                        disabled={!selectedRole}
                    />

                    {competencySummary && (
                        <div className="-mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center animate-fade-in">
                            <div className="flex items-center justify-center gap-6 flex-wrap">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">평균 점수</p>
                                    <p className="text-3xl font-bold text-indigo-600">{competencySummary.averageScore}점</p>
                                </div>
                                <div className="border-l border-slate-300 h-10 self-center"></div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">역량 종합 평가</p>
                                    <p className="text-3xl font-bold text-indigo-600">'{competencySummary.competencyGrade}'</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="text-center pt-6">
                        <button
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className="px-12 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg"
                        >
                        AI로 연봉 산출하기
                        </button>
                    </div>

                    {error && <p className="text-center text-red-500 mt-4 font-semibold">{error}</p>}
                </div>
            </>
        )
    }

    if (activeTab === 'guide') {
        return <UsageGuide 
            platformData={PLATFORM_DATA}
            educationLevels={EDUCATION_LEVELS}
            selectedEducation={selectedCompanyEducation}
            onEducationSelect={setSelectedCompanyEducation}
            onPrintRequest={() => setIsPrintPreview(true)}
        />;
    }

    if (activeTab === 'proposal') {
        return <HiringProposalPage />;
    }

    if (activeTab === 'company') {
        return (
             <div className="printable-area bg-white p-6 sm:p-10 rounded-b-2xl rounded-tr-2xl shadow-lg">
                <CompanySalaryTable 
                    title='회사 기준 연봉 테이블'
                    description='학력 기준을 선택하고, 연차 및 평가 등급에 따른 내부 연봉 기준표를 관리하세요. (단위: 만원)'
                    isReadOnly={false}
                    data={companySalaryTable[selectedCompanyEducation]}
                    onUpdate={(tierId, field, value) => handleCompanySalaryChange(selectedCompanyEducation, tierId, field, value)}
                    educationLevels={EDUCATION_LEVELS}
                    selectedEducation={selectedCompanyEducation}
                    onEducationSelect={setSelectedCompanyEducation}
                    onPrintRequest={() => setIsPrintPreview(true)}
                    onSave={handleSaveCompanyTable}
                    onReset={handleResetCompanyTable}
                />
            </div>
        )
    }
  }


  return (
    <div className={`bg-slate-50 min-h-screen text-slate-800 ${isPrintPreview ? 'print-preview-mode' : ''}`}>
       {isPrintPreview && (
            <div className="print-preview-controls no-print">
                <div className="content">
                    <p>인쇄 미리보기 모드입니다. 인쇄하시려면 <kbd>Ctrl</kbd> + <kbd>P</kbd> 를 누르세요.</p>
                    <button onClick={() => setIsPrintPreview(false)}>
                        미리보기 닫기
                    </button>
                </div>
            </div>
        )}
        <div className="no-print">
            <Header />
        </div>
      <main className={isPrintPreview ? "pt-24 px-4 sm:px-8 pb-8" : "max-w-6xl mx-auto p-4 sm:p-8"}>
        <div role="tablist" className="relative flex border-b border-slate-200 no-print overflow-x-auto no-scrollbar">
            <TabButton 
                tabId="personal"
                isActive={activeTab === 'personal'}
                onClick={() => setActiveTab('personal')}
                buttonRef={el => tabRefs.current['personal'] = el}
            >
                <span className="flex items-center gap-2">
                    <PersonalIcon isActive={activeTab === 'personal'} />
                    지원자 연봉 측정
                </span>
            </TabButton>
            <TabButton 
                tabId="company"
                isActive={activeTab === 'company'}
                onClick={() => setActiveTab('company')}
                buttonRef={el => tabRefs.current['company'] = el}
            >
                 <span className="flex items-center gap-2">
                    <CompanyIcon isActive={activeTab === 'company'} />
                    회사 기준
                </span>
            </TabButton>
            <TabButton 
                tabId="guide"
                isActive={activeTab === 'guide'}
                onClick={() => setActiveTab('guide')}
                buttonRef={el => tabRefs.current['guide'] = el}
            >
                 <span className="flex items-center gap-2">
                    <GuideIcon isActive={activeTab === 'guide'} />
                    이용 가이드
                </span>
            </TabButton>
            <TabButton 
                tabId="proposal"
                isActive={activeTab === 'proposal'}
                onClick={() => setActiveTab('proposal')}
                buttonRef={el => tabRefs.current['proposal'] = el}
            >
                 <span className="flex items-center gap-2">
                    <ProposalIcon isActive={activeTab === 'proposal'} />
                    채용 품의서
                </span>
            </TabButton>
             <div 
                ref={indicatorRef} 
                className="tab-indicator absolute bottom-[-1px] h-1 bg-indigo-600 rounded-t-sm" 
             />
        </div>

        <div key={activeTab} className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;