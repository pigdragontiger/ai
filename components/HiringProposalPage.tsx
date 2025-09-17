import React, { useRef } from 'react';
import type { SalaryResultData, ApplicantProfile } from '../types';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const defaultApplicantProfile: ApplicantProfile = {
    roleName: '',
    educationName: '',
    experienceYears: 0,
    engineerLevelName: '',
};

const defaultSalaryResultData: SalaryResultData = {
    minSalary: 0,
    avgSalary: 0,
    maxSalary: 0,
    reasoning: {
        summary: '',
        marketAnalysis: '',
        comparison: '',
        dataSource: '',
        competencyAnalysis: '',
    },
    previousSalary: 0,
    desiredSalary: 0
};


export const HiringProposalPage: React.FC = () => {
    const proposalContentRef = useRef<HTMLDivElement>(null);
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const data = defaultSalaryResultData;
    const applicantProfile = defaultApplicantProfile;
    
    const today = new Date().toISOString().slice(0, 10);
    const handlePrint = () => window.print();
    
    const handleDownloadPdf = async () => {
        const page1El = page1Ref.current;
        const page2El = page2Ref.current;

        if (!page1El || !page2El) {
            alert('콘텐츠를 찾을 수 없습니다.');
            return;
        }
        if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
            alert('PDF 다운로드 라이브러리를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
    
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        let isFirstCapture = true;
    
        const renderElementToPdf = async (element: HTMLElement) => {
            if (!isFirstCapture) {
                pdf.addPage();
            }
            isFirstCapture = false;
        
            const canvas = await window.html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const marginX = 15;
            const marginY = 20;
            const contentWidth = pdfWidth - (marginX * 2);
            const contentHeightOnPage = pdfHeight - (marginY * 2);
            
            const imgProps = pdf.getImageProperties(canvas);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(canvas, 'PNG', marginX, marginY, contentWidth, imgHeight);
            heightLeft -= contentHeightOnPage;

            while (heightLeft > 0) {
                position -= contentHeightOnPage;
                pdf.addPage();
                pdf.addImage(canvas, 'PNG', marginX, position + marginY, contentWidth, imgHeight);
                heightLeft -= contentHeightOnPage;
            }
        };
    
        await renderElementToPdf(page1El);
        await renderElementToPdf(page2El);
    
        pdf.save(`채용품의서_${today}.pdf`);
    };

    const formatSalary = (value?: number) => (value && value > 0) ? `${value.toLocaleString()}만원` : '-';

    const TdHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
      <td className={`px-3 pt-4 pb-6 font-semibold text-center align-middle bg-slate-100 text-black border-b-2 border-slate-300 ${className}`}>{children}</td>
    );

    const TdContent: React.FC<{ children: React.ReactNode; colSpan?: number; className?: string; isEditable?: boolean; isSalary?: boolean; }> = ({ children, colSpan = 1, className, isEditable = false, isSalary = false }) => {
    
        const handleSalaryBlur = (e: React.FocusEvent<HTMLTableCellElement>) => {
            const text = e.currentTarget.textContent || '';
            const num = parseInt(text.replace(/,|만원/g, ''), 10);
            if (!isNaN(num) && num > 0) {
                e.currentTarget.textContent = `${num.toLocaleString()}만원`;
            } else {
                e.currentTarget.textContent = '-';
            }
        };
    
        const handleSalaryFocus = (e: React.FocusEvent<HTMLTableCellElement>) => {
            const text = e.currentTarget.textContent || '';
            if (text === '-') {
                e.currentTarget.textContent = '';
                return;
            }
            const num = parseInt(text.replace(/,|만원/g, ''), 10);
            if (!isNaN(num)) {
                e.currentTarget.textContent = String(num);
            }
        };
    
        return (
            <td
                onBlur={isSalary && isEditable ? handleSalaryBlur : undefined}
                onFocus={isSalary && isEditable ? handleSalaryFocus : undefined}
                colSpan={colSpan}
                className={`px-3 pt-4 pb-6 text-center align-middle border-l border-slate-200 text-black ${isEditable ? 'editable-cell' : ''} ${className ?? ''}`}
                contentEditable={isEditable}
                suppressContentEditableWarning={isEditable}
            >
                {children}
            </td>
        );
    };

    return (
        <div className="bg-white p-6 sm:p-10 rounded-2xl rounded-tl-none shadow-lg hiring-proposal-printable-area">
                <div ref={proposalContentRef} className="text-sm" style={{ color: '#000' }}>
                    <div ref={page1Ref}>
                        <h1 className="text-3xl font-bold text-center mb-4">채용품의서</h1>
                        <p className="text-center mb-[50px]">인사_002_10</p>
                        
                        <table className="w-full border-collapse border-2 border-slate-400 mb-6">
                            <tbody>
                                <tr className="border-b border-slate-300">
                                    <TdHeader>작성일</TdHeader>
                                    <TdContent isEditable>{today}</TdContent>
                                    <TdHeader>면접일</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                <tr>
                                    <TdHeader>그룹명</TdHeader>
                                    <TdContent isEditable>SC 그룹</TdContent>
                                    <TdHeader>작성자</TdHeader>
                                    <TdContent isEditable>홍길동 그룹장</TdContent>
                                </tr>
                            </tbody>
                        </table>

                        <h3 className="font-bold text-lg p-2 bg-slate-800 text-white mb-0">지원자정보</h3>
                        <table className="w-full border-collapse border-2 border-slate-400 mb-6">
                             <tbody>
                                <tr className="border-b border-slate-300">
                                    <TdHeader>성명</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                    <TdHeader>생년월일</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                 <tr className="border-b border-slate-300">
                                    <TdHeader>휴대폰</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                    <TdHeader>이메일주소</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                 <tr className="border-b border-slate-300">
                                    <TdHeader>학력</TdHeader>
                                    <TdContent isEditable>{applicantProfile.educationName || '-'}</TdContent>
                                    <TdHeader>해당학과</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                 <tr className="border-b border-slate-300">
                                    <TdHeader>자격증</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                    <TdHeader>취득일자</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                 <tr>
                                    <TdHeader>경력환산</TdHeader>
                                    <TdContent isEditable>{applicantProfile.experienceYears > 0 ? `${applicantProfile.experienceYears}년` : '-'}</TdContent>
                                    <TdHeader>기술등급</TdHeader>
                                    <TdContent isEditable>{applicantProfile.engineerLevelName || '-'}</TdContent>
                                </tr>
                            </tbody>
                        </table>

                        <h3 className="font-bold text-lg p-2 bg-slate-800 text-white mb-0">면접평가</h3>
                        <table className="w-full border-collapse border-2 border-slate-400 mb-6">
                             <tbody>
                                <tr className="border-b border-slate-300">
                                    <TdHeader className="w-1/4">인터뷰</TdHeader>
                                    <TdContent colSpan={3} className="min-h-[210px] align-top text-left multiline-cell" isEditable>
                                      {data.reasoning.competencyAnalysis ? `[역량 기반 가치 분석]\n${data.reasoning.competencyAnalysis}` : ''}
                                    </TdContent>
                                </tr>
                                 <tr>
                                    <TdHeader>레퍼런스 체크</TdHeader>
                                    <TdContent colSpan={3} className="min-h-16 align-top text-left multiline-cell" isEditable>{'-'}</TdContent>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div ref={page2Ref} className="print-page-break-before">
                        <h3 className="font-bold text-lg p-2 bg-slate-800 text-white mb-0">품의내용</h3>
                        <table className="w-full border-collapse border-2 border-slate-400 mb-6">
                             <tbody>
                                <tr className="border-b border-slate-300">
                                    <TdHeader>출근일</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                    <TdHeader>면접일</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                <tr className="border-b border-slate-300">
                                    <TdHeader>수습기간</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                    <TdHeader>발령그룹</TdHeader>
                                    <TdContent isEditable>SC 그룹</TdContent>
                                </tr>
                                 <tr className="border-b border-slate-300">
                                    <TdHeader>가이드연봉</TdHeader>
                                    <TdContent isEditable isSalary>{'-'}</TdContent>
                                    <TdHeader>직급</TdHeader>
                                    <TdContent isEditable>{'-'}</TdContent>
                                </tr>
                                 <tr className="border-b border-slate-300">
                                    <TdHeader>전직장연봉</TdHeader>
                                    <TdContent isEditable isSalary>{formatSalary(data.previousSalary)}</TdContent>
                                    <TdHeader>희망연봉</TdHeader>
                                    <TdContent isEditable isSalary>{formatSalary(data.desiredSalary)}</TdContent>
                                </tr>
                                 <tr className="border-b border-slate-300">
                                    <TdHeader>확정연봉</TdHeader>
                                    <TdContent className="font-bold" isEditable isSalary>{formatSalary(data.avgSalary)}</TdContent>
                                    <TdHeader>퇴직금</TdHeader>
                                    <TdContent isEditable>별도</TdContent>
                                </tr>
                                 <tr>
                                    <TdHeader>기타</TdHeader>
                                    <TdContent colSpan={3} className="h-12 align-middle text-left" isEditable>{'-'}</TdContent>
                                </tr>
                            </tbody>
                        </table>
                        <div className="print-break-inside-avoid">
                            <h3 className="font-bold text-lg p-2 bg-slate-800 text-white mb-0">업무가이드</h3>
                             <div 
                                className="p-4 border-2 border-slate-400 border-t-0 text-lg space-y-1.5 editable-cell multiline-cell text-left"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                             >
                                <p>1. 채용품의서는 최소 입사예정일 일주일 전에 제출하셔야 합니다.</p>
                                <p>2. 메일의 제목은 '[채용품의](작성자,대상자) 신규 채용의 건'으로 작성하십시오.</p>
                                <p>3. 메일의 '받는 이'는 CRO(김영선 이사), '참조인'은 천소희 과장, 조은진 대리 입니다.</p>
                                <p>4. 연봉 4000만원 이상 또는 과장급 이상의 경우 CRO가 CEO(박원식 대표)에게 최종 승인을 요청합니다.</p>
                                <p>5. 운영그룹(ISG1, ISG2)은 '본부장' 승인 후 '그룹장'이 CRO에게 승인 요청해주세요.</p>
                                <p>6. 최종 승인 시 CRO가 담당자(그룹장, 천소희 과장, 조은진 대리)에게 메일로 회신합니다.</p>
                                <p>7. 이력서, 채용품의서 외 품의에 필요한 기타 서류가 있을 경우 파일 첨부하여 주십시오.</p>
                             </div>
                        </div>
                    </div>
                </div>

                <footer className="hiring-proposal-no-print p-4 border-t border-slate-200 mt-8 flex justify-center gap-3">
                     <button onClick={handleDownloadPdf} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <DownloadIcon />
                        PDF 다운로드
                    </button>
                    <button onClick={handlePrint} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h10a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        인쇄하기
                    </button>
                </footer>
        </div>
    );
};