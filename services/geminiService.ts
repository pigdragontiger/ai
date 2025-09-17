import { GoogleGenAI, Type } from "@google/genai";
import type { SalaryResultData, SalaryEvaluation, RoleEvaluationDetails, HiringProposalContent, ApplicantProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getGeminiErrorType = (error: unknown): 'RATE_LIMIT' | 'INVALID_KEY' | 'SERVER_ERROR' | 'UNKNOWN' => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('429') || message.includes('resource_exhausted') || message.includes('rate limit') || message.includes('quota')) {
            return 'RATE_LIMIT';
        }
        // "API key not valid" is a common message for invalid keys.
        // Also check for "permission denied" which can happen with restricted keys.
        if (message.includes('api key not valid') || message.includes('permission_denied') || message.includes('403')) {
            return 'INVALID_KEY';
        }
        // Check for general server-side issues.
        if (message.includes('500') || message.includes('503') || message.includes('internal error') || message.includes('server error') || message.includes('service unavailable')) {
            return 'SERVER_ERROR';
        }
    }
    return 'UNKNOWN';
};


// Schema for the first API call to get the objective market value.
const marketValueSchema = {
    type: Type.OBJECT,
    properties: {
        minSalary: {
            type: Type.INTEGER,
            description: "예상 최소 연봉 (만원 단위, 정수)",
        },
        avgSalary: {
            type: Type.INTEGER,
            description: "예상 평균 연봉 (만원 단위, 정수)",
        },
        maxSalary: {
            type: Type.INTEGER,
            description: "예상 최대 연봉 (만원 단위, 정수)",
        },
        reasoning: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "채용 관점에서 작성된 분석 결과 한 줄 요약입니다. (예: OOO만원의 시장 가치가 있으며, 당사 테이블 기준 '중상위'에 해당하여 채용 검토가 필요합니다.)" },
                marketAnalysis: { type: Type.STRING, description: "지원자의 프로필(경력, 직무, 지역 등)이 시장 가치에 미치는 일반적인 영향에 대해 기술해주세요. 개인의 역량 평가는 이 항목에서 제외합니다." },
                comparison: { type: Type.STRING, description: "AI 예측 연봉과 회사 내부 기준을 비교 분석한 내용입니다. 우수 인재 확보를 위한 연봉 조정이나 처우 개선 등 전략적 제안을 포함할 수 있습니다." },
                dataSource: { type: Type.STRING, description: "분석에 사용된 데이터 출처와 데이터 필터링 방법론에 대한 설명입니다." },
            },
            required: ["summary", "marketAnalysis", "comparison", "dataSource"]
        },
    },
    required: ["minSalary", "avgSalary", "maxSalary", "reasoning"],
};

// Schema for the second API call to get the competency premium.
const competencySchema = {
    type: Type.OBJECT,
    properties: {
        competencyPremium: {
            type: Type.INTEGER,
            description: "역량 평가 점수를 기반으로 기초 평균 연봉에 더하거나 뺄 '역량 프리미엄' 금액 (만원 단위, 정수, 양수 또는 음수).",
        },
        competencyAnalysisText: {
            type: Type.STRING,
            description: "5가지 역량 항목 각각이 프리미엄 산정에 어떻게 기여했는지 상세히 설명하는 '역량 분석 리포트'. (예: '문제 정의 능력(4점, 탁월)은 프로젝트 성공의 핵심 요소이므로 +200만원의 가치를 추가로 인정했습니다. 반면, 툴 활용 능력(2점, 보통)은 입사 후 성장이 필요한 부분으로 판단되어, 이 점이 프리미엄 산정에 일부 반영되었습니다.')"
        },
        competencyGrade: {
            type: Type.STRING,
            description: "역량 평가 점수 평균을 기반으로 산출된 종합 등급. (예: '핵심 인재', '우수 역량 보유', '기본 역량 보유', '추가 검토 필요')",
        }
    },
    required: ["competencyPremium", "competencyAnalysisText", "competencyGrade"],
};


interface SalaryGuidanceParams {
    role: string;
    level: string;
    agencySize: string;
    location: string;
    education?: string;
    experience?: number;
    companyStandard?: SalaryEvaluation | string | null;
    roleEvaluation?: RoleEvaluationDetails;
    previousSalary?: number;
    desiredSalary?: number;
}

export const fetchSalaryGuidance = async (
    params: SalaryGuidanceParams
): Promise<SalaryResultData> => {
    const { role, level, agencySize, location, education, experience, companyStandard, roleEvaluation, previousSalary, desiredSalary } = params;

    // --- PART 1: Baseline Market Value Prediction ---
    // Fetches the general market salary range based on objective profile data only.

    let companyStandardPrompt = '';
    if (companyStandard) {
        if (typeof companyStandard === 'string') {
            companyStandardPrompt = `
        [회사의 내부 연봉 기준 (선택 등급)]
        - ${companyStandard}
            `;
        } else if (companyStandard.low !== null || companyStandard.middle !== null || companyStandard.high !== null) {
            companyStandardPrompt = `
        [회사의 내부 연봉 기준 (동일 직무/연차)]
        - 하위: ${companyStandard.low?.toLocaleString() ?? '미설정'}만원
        - 중위: ${companyStandard.middle?.toLocaleString() ?? '미설정'}만원
        - 상위: ${companyStandard.high?.toLocaleString() ?? '미설정'}만원
            `;
        }
    }
    
    const marketValuePrompt = `
        **당신은 대한민국의 중소규모 '전통 웹 에이전시'의 현실적인 HR 매니저입니다.**
        당신의 회사는 주로 SI(시스템 통합) 프로젝트, 공공기관 웹사이트 구축, 유지보수 업무를 수행하며, **보수적이고 안정적인 연봉 정책**을 가지고 있습니다.
        당신의 연봉 데이터는 대한민국의 주요 IT 채용 플랫폼의 최신 데이터를 기반으로 하지만, 기술 스타트업 위주의 'Wanted'보다는, 보다 **보편적인 중소기업의 데이터가 많은 'Saramin'이나 'JobKorea'의 현실적인 데이터를 우선적으로 고려**하여 시장 가치를 산출해야 합니다.

        아래 지원자 프로필과 가이드라인을 바탕으로, 이 지원자의 객관적인 **'기초 시장 가치(Baseline Market Value)'**를 평가하고, 우리 회사 연봉 테이블과 비교하여 **내부 보고서**를 작성해주세요.

        **[매우 중요한 분석 제외 기준]**
        연봉을 분석할 때, 아래와 같은 고연봉 시장의 데이터는 **반드시 제외하거나 매우 낮은 가중치**를 두어야 합니다.
        - **IT 대기업 및 플랫폼 기업:** 네이버, 카카오, 쿠팡, 배달의민족, 토스 등 (소위 '네카라쿠배당토')
        - **고성장 스타트업:** 대규모 투자를 유치한 기술 중심의 스타트업
        - **금융권 IT 부서 및 대기업 SI 계열사**

        **[중요]** 이 단계에서는 [역량 상세 평가]와 [희망 연봉]은 **절대 고려하지 마세요.**
        오직 직무, 경력, 학력, 근무지, 회사 규모 등 객관적인 조건만을 사용하여 일반적인 시장 가치를 평가해야 합니다.

        모든 연봉 단위는 '만원'입니다.

        [지원자 프로필 (기초 정보)]
        - 직무: ${role}
        - SW기술자 등급: ${level}
        ${experience !== undefined ? `- 경력: ${experience}년` : ''}
        ${education ? `- 학력: ${education}` : ''}
        - 예상 근무지: ${location}
        - 예상 회사 규모: ${agencySize}
        ${companyStandardPrompt}

        [작성 가이드라인]
        1.  위에 주어진 [지원자 프로필]과 [분석 제외 기준]을 엄격히 준수하여 이 지원자의 객관적인 시장 가치를 평가하고 '최소', '평균', '최대' 연봉을 예측해주세요.
        2.  'reasoning' 객체에 아래 각 항목에 맞춰 내부 보고서 형식으로 구체적인 분석 내용을 작성해주세요.
            - summary: 채용 관점에서 작성된 한 줄 요약. (예: "해당 지원자는 전통 웹 에이전시 시장 기준, 약 4,900만원의 가치로 평가되어...")
            - marketAnalysis: 지원자의 프로필이 **'전통 웹 에이전시' 시장**에서 가치에 미치는 영향에 대해 기술해주세요. (개인의 역량 평가는 이 항목에서 제외합니다.)
            - comparison: AI 예측 연봉과 회사 내부 기준을 비교 분석합니다.
            - dataSource: 분석에 사용된 데이터 출처와 **분석 방법론**을 명확히 기술해주세요. Saramin, JobKorea 등 범용 채용 플랫폼 데이터를 중심으로 하되, 고연봉 시장(IT 대기업, 고성장 스타트업, 금융권) 데이터는 분석에서 제외하여 '전통 웹 에이전시' 시장의 현실적인 연봉을 추정했음을 반드시 명시해야 합니다.
        3.  결과는 반드시 지정된 JSON 스키마에 맞춰서, 다른 설명 없이 JSON 객체만 반환해주세요.
    `;
    
    let baselineData: Omit<SalaryResultData, 'reasoning'> & { reasoning: { summary: string, marketAnalysis: string, comparison: string, dataSource: string } };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: marketValuePrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: marketValueSchema,
                temperature: 0.2,
                seed: 42,
            },
        });
        
        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        baselineData = JSON.parse(cleanedJsonText);
    } catch (error) {
        console.error("Error fetching baseline market value:", error);
        const errorType = getGeminiErrorType(error);
        switch (errorType) {
            case 'RATE_LIMIT':
                throw new Error("API 요청 한도를 초과했습니다. 1분 후에 다시 시도해주세요.");
            case 'INVALID_KEY':
                throw new Error("AI 서버 인증에 실패했습니다. 관리자에게 문의하여 API 키 설정을 확인해주세요.");
            case 'SERVER_ERROR':
                throw new Error("AI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            default:
                throw new Error("시장 가치 분석 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
    
    let finalData: SalaryResultData = {
        minSalary: baselineData.minSalary,
        avgSalary: baselineData.avgSalary,
        maxSalary: baselineData.maxSalary,
        reasoning: { ...baselineData.reasoning },
        baselineMinSalary: baselineData.minSalary,
        baselineAvgSalary: baselineData.avgSalary,
        baselineMaxSalary: baselineData.maxSalary,
    };

    // --- Competency Grade Calculation ---
    let averageScore: number | undefined = undefined;
    let competencyGrade: string | undefined = undefined;

    if (roleEvaluation) {
        const scores = Object.values(roleEvaluation).map(e => e.score);
        if (scores.length > 0) {
            averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (averageScore < 2.0) {
                competencyGrade = '추가 검토 필요';
            } else if (averageScore <= 2.7) {
                competencyGrade = '기본 역량 보유';
            } else if (averageScore <= 3.5) {
                competencyGrade = '우수 역량 보유';
            } else {
                competencyGrade = '핵심 인재';
            }
        }
    }

    // --- PART 2: Competency Premium Calculation ---
    // If competency evaluation is provided, calculate the premium and adjust the salary.
    if (roleEvaluation && competencyGrade) {
        try {
            const roleEvaluationPrompt = `
        [${role} 역량 상세 평가]
${Object.values(roleEvaluation).map(evalItem => 
`        - ${evalItem.name}: ${evalItem.score}점 (${evalItem.description})`
).join('\n')}`;

            const competencyPrompt = `
                **당신은 보상 전문가입니다.**
                [상황]
                - 지원자의 기초 시장 평균 연봉은 **${baselineData.avgSalary.toLocaleString()}만원**으로 산정되었습니다.
                - 이제 이 지원자의 개별 역량을 평가하여 연봉을 조정해야 합니다.
                ${roleEvaluationPrompt}
                - 역량 평가 평균 점수에 따른 종합 등급은 **'${competencyGrade}'** 입니다.

                [요청]
                1.  위 역량 평가 점수를 기반으로, 기초 평균 연봉에 더하거나 뺄 **'역량 프리미엄(competencyPremium)'** 금액을 **정수(만원 단위)**로 계산해주세요.
                2.  5가지 역량 항목 각각이 프리미엄 산정에 어떻게 기여했는지 상세히 설명하는 **'역량 분석 리포트(competencyAnalysisText)'**를 작성해주세요.
                3.  산출된 **'역량 종합 등급(competencyGrade)'** 값인 '${competencyGrade}'을 그대로 반환해주세요.

                결과는 반드시 지정된 JSON 스키마에 맞춰서, 다른 설명 없이 JSON 객체만 반환해주세요.
            `;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: competencyPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: competencySchema,
                    temperature: 0.2,
                    seed: 42,
                },
            });

            const jsonText = response.text.trim();
            const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            const competencyResult = JSON.parse(cleanedJsonText);
            
            finalData.competencyPremium = competencyResult.competencyPremium;
            finalData.reasoning.competencyAnalysis = competencyResult.competencyAnalysisText;
            finalData.competencyGrade = competencyResult.competencyGrade;

            // Adjust final salary based on competency premium
            finalData.minSalary += competencyResult.competencyPremium;
            finalData.avgSalary += competencyResult.competencyPremium;
            finalData.maxSalary += competencyResult.competencyPremium;

        } catch (error) {
            console.error("Error fetching competency premium:", error);
            const errorType = getGeminiErrorType(error);
            if (errorType === 'RATE_LIMIT' || errorType === 'INVALID_KEY') {
                 throw new Error(errorType === 'RATE_LIMIT' 
                    ? "API 요청 한도를 초과했습니다. 1분 후에 다시 시도해주세요."
                    : "AI 서버 인증에 실패했습니다. 관리자에게 문의하여 API 키 설정을 확인해주세요."
                 );
            }
            finalData.reasoning.competencyAnalysis = "역량 프리미엄 분석 중 오류가 발생하여, 기초 시장 가치만 표시됩니다.";
        }
    }
    
    // --- PART 2.5: Final Salary Adjustment based on Conservative Policy ---
    // This logic adjusts the final recommendation to reflect a conservative negotiation strategy,
    // considering the company's standards, the candidate's salary history, their desired salary, and their competency level.
    const competencyAdjustedAvgSalary = finalData.avgSalary; // This is the AI's objective valuation of the candidate.

    // Determine the negotiation floor, which is the higher of the previous salary or the company's internal standard.
    // This represents the baseline from which the company would start a negotiation.
    let negotiationFloor: number | null = null;
    const companyMiddle = (companyStandard && typeof companyStandard !== 'string') ? companyStandard.middle : null;

    if (previousSalary && companyMiddle) {
        negotiationFloor = Math.max(previousSalary, companyMiddle);
    } else {
        negotiationFloor = previousSalary || companyMiddle;
    }

    // If we have a desired salary and a negotiation floor, we can calculate a more conservative offer.
    if (desiredSalary && negotiationFloor && desiredSalary > negotiationFloor) {
        let competencyWeight = 0.6; // Default for '우수 역량 보유' or unknown
        switch(finalData.competencyGrade) {
            case '핵심 인재':
                competencyWeight = 0.8; // Willing to go close to their desired salary for top talent
                break;
            case '우수 역량 보유':
                 competencyWeight = 0.6;
                 break;
            case '기본 역량 보유':
                competencyWeight = 0.25; // Offer a smaller raise for basic skills, anchoring closer to the floor
                break;
            case '추가 검토 필요':
                competencyWeight = 0.1; // Offer should be very close to the floor
                break;
        }

        // Calculate the recommended offer by interpolating between the floor and the desired salary, based on competency.
        const calculatedOffer = Math.round(negotiationFloor + (desiredSalary - negotiationFloor) * competencyWeight);
        
        // The final offer should not exceed the candidate's objective market value.
        // We recommend the lower of our calculated conservative offer and their actual market value.
        const finalOffer = Math.min(calculatedOffer, competencyAdjustedAvgSalary);
        
        // Calculate the potential value gap if we're hiring them for less than their market value.
        if (competencyAdjustedAvgSalary > finalOffer) {
             finalData.potentialValueGap = competencyAdjustedAvgSalary - finalOffer;
        } else {
            delete finalData.potentialValueGap;
        }

        // Apply the new, more conservative average salary.
        const adjustment = finalData.avgSalary - finalOffer;
        finalData.avgSalary = finalOffer;
        finalData.minSalary = Math.max((baselineData.minSalary || 0), finalData.minSalary - adjustment);
        finalData.maxSalary -= adjustment;

    } else if (companyMiddle && finalData.avgSalary > companyMiddle) {
        // Fallback case: If no desired salary is provided, but our valuation exceeds the company standard.
        // In this scenario, we still apply a conservative adjustment to bring the offer closer to the internal standard.
        const companyHigh = (companyStandard && typeof companyStandard !== 'string') ? companyStandard.high : null;
        const ceiling = companyHigh || (companyMiddle * 1.15); // Define a reasonable ceiling
        if (finalData.avgSalary > ceiling) {
             const adjustment = finalData.avgSalary - ceiling;
             finalData.avgSalary = ceiling;
             finalData.minSalary -= adjustment;
             finalData.maxSalary -= adjustment;
             if (competencyAdjustedAvgSalary > finalData.avgSalary) {
                finalData.potentialValueGap = competencyAdjustedAvgSalary - finalData.avgSalary;
             }
        }
    }

    // --- PART 2.6: 희망 연봉 상한선 적용 ---
    // 최종 추천 연봉은 지원자의 희망 연봉을 초과할 수 없다는 비즈니스 규칙을 적용합니다.
    if (desiredSalary && finalData.avgSalary > desiredSalary) {
        // AI가 산출한 연봉이 희망 연봉보다 높을 경우, 희망 연봉으로 값을 조정합니다.
        const adjustment = finalData.avgSalary - desiredSalary;
        finalData.avgSalary = desiredSalary;

        // 최소/최대 연봉도 비례하여 조정합니다.
        finalData.minSalary = Math.max(0, finalData.minSalary - adjustment);
        finalData.maxSalary -= adjustment;
        
        // 잠재 가치 갭을 새로운 추천 연봉 기준으로 다시 계산합니다.
        if (competencyAdjustedAvgSalary > finalData.avgSalary) {
            finalData.potentialValueGap = competencyAdjustedAvgSalary - finalData.avgSalary;
        } else {
            delete finalData.potentialValueGap;
        }
    }


    // Ensure final consistency after any adjustments and round to nearest 10 for clean display
    finalData.minSalary = Math.round(Math.min(finalData.minSalary, finalData.avgSalary) / 10) * 10;
    finalData.maxSalary = Math.round(Math.max(finalData.maxSalary, finalData.avgSalary) / 10) * 10;
    finalData.avgSalary = Math.round(finalData.avgSalary / 10) * 10;
    if (finalData.minSalary < 0) finalData.minSalary = 0;


    // --- PART 3: Previous Salary Analysis (Conditional) ---
    // Compares previous salary to baseline market value and analyzes the desired increase rate.
    if (previousSalary && previousSalary > 0 && desiredSalary) {
        try {
            const prevSalaryAnalysisPrompt = `
                **당신은 우리 회사의 HR 매니저입니다.**
                [상황]
                - 지원자의 기초 시장 평균 연봉은 약 ${finalData.baselineAvgSalary?.toLocaleString()}만원으로 평가되었습니다.
                - 지원자의 이전 직장 연봉은 ${previousSalary.toLocaleString()}만원이었습니다.
                - 지원자는 희망 연봉으로 ${desiredSalary.toLocaleString()}만원을 제시했습니다.
                ${finalData.competencyGrade ? `- 당사 역량 평가 결과: '${finalData.competencyGrade}' 등급` : ''}

                [요청]
                이 상황을 종합적으로 분석하여, 아래 두 가지 관점에 대한 내부 검토용 리포트를 1~2 문단으로 작성해주세요.
                1. **이전 대우 수준 (다면적 분석):** 지원자의 이전 연봉을 시장 가치와 비교하여, 이전 대우 수준에 대한 **두 가지 가능성**을 모두 분석해주세요.
                    - **긍정적 측면:** 시장 가치보다 낮은 연봉을 받았다면, '저평가된 인재'일 가능성을 제시해주세요.
                    - **부정적/현실적 측면:** 반대로, 이전 연봉이 '이전 직장에서의 실제 성과나 역량 수준을 반영'한 결과일 가능성도 함께 제시해주세요. 특히, 이 분석은 **당사 역량 평가 결과('${finalData.competencyGrade || '미평가'}')와 반드시 연결**하여 논리적인 추론을 제시해야 합니다. (예: 역량 평가 등급이 낮다면, 이전 연봉이 합당했을 가능성을 언급)
                2. **희망 인상률 분석:** 이전 연봉 대비 희망 연봉의 인상률(%)을 계산하고, 이 인상률이 합리적인 수준인지 평가해주세요.

                다른 설명 없이 분석 내용만 텍스트로 반환해주세요.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prevSalaryAnalysisPrompt,
                config: {
                    temperature: 0.2,
                    seed: 42,
                },
            });

            finalData.reasoning.previousSalaryAnalysis = response.text.trim();

        } catch (error) {
            console.error("Error fetching previous salary analysis:", error);
            const errorType = getGeminiErrorType(error);
            if (errorType === 'RATE_LIMIT' || errorType === 'INVALID_KEY') {
                 throw new Error(errorType === 'RATE_LIMIT' 
                    ? "API 요청 한도를 초과했습니다. 1분 후에 다시 시도해주세요."
                    : "AI 서버 인증에 실패했습니다. 관리자에게 문의하여 API 키 설정을 확인해주세요."
                 );
            }
            finalData.reasoning.previousSalaryAnalysis = "이전 연봉 및 희망 연봉 분석 중 오류가 발생했습니다.";
        }
    }


    // --- PART 4: Desired Salary Negotiation Strategy (Conditional) ---
    // Uses the final, competency-adjusted average salary for negotiation advice.
    if (desiredSalary) {
        try {
            let desiredSalaryAnalysisPrompt = '';
            const potentialValueGap = finalData.potentialValueGap;

            if (potentialValueGap !== undefined && potentialValueGap > 0) {
                // Case 1: The recommendation was capped. A value gap exists.
                desiredSalaryAnalysisPrompt = `
                    **당신은 우리 회사의 보수적이고 전략적인 HR 매니저입니다.**
                    [상황]
                    - 지원자의 역량을 반영한 시장 가치는 평균 **${competencyAdjustedAvgSalary.toLocaleString()}만원**으로 높게 평가되었습니다.
                    - 하지만 회사 정책 및 지원자의 합리적인 희망 연봉을 고려하여, 최종 추천 연봉은 **${finalData.avgSalary.toLocaleString()}만원**으로 조정되었습니다.
                    - 이는 약 **${potentialValueGap.toLocaleString()}만원**의 '잠재 가치 갭(Potential Value Gap)'이 존재함을 의미하며, 이는 지원자의 높은 성장 잠재력을 나타냅니다.
    
                    [요청]
                    이 상황을 바탕으로, 지원자의 희망 연봉(${desiredSalary.toLocaleString()}만원)이 합리적임을 확인하고, 우수 인재를 **비용 효율적으로** 채용하기 위한 **내부 협상 전략 가이드**를 1~2 문단으로 작성해주세요.
                    반드시 다음 내용을 포함해주세요:
                    1. 최종 추천 연봉(${finalData.avgSalary.toLocaleString()}만원)을 제안할 것을 권고.
                    2. '잠재 가치 갭'은 현재 연봉을 높여주는 근거가 아니라, '입사 후 빠른 성장과 기여에 따라 충분한 보상(인센티브, 조기 연봉 재협상 등)이 가능하다'는 점을 어필하여 입사 만족도를 높이는 **설득용 근거**로 활용하라고 조언해주세요.
    
                    다른 설명 없이 분석 내용만 텍스트로 반환해주세요.
                `;
            } else {
                // Case 2: Standard analysis (no capping, no value gap).
                desiredSalaryAnalysisPrompt = `
                    **당신은 우리 회사의 HR 매니저입니다.**
                    [상황]
                    - 지원자의 최종 시장 가치 평균 연봉을 약 ${finalData.avgSalary.toLocaleString()}만원으로 분석했습니다.
                    - 지원자는 희망 연봉으로 ${desiredSalary.toLocaleString()}만원을 제시했습니다.
    
                    [요청]
                    이 상황을 바탕으로, 지원자의 희망 연봉 적정성을 검토하고 채용 담당자를 위한 구체적인 협상 전략 가이드를 1~2 문단으로 작성해주세요. 다른 설명 없이 분석 내용만 텍스트로 반환해주세요.
                `;
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: desiredSalaryAnalysisPrompt,
                config: {
                    temperature: 0.2,
                    seed: 42,
                },
            });

            finalData.reasoning.desiredSalaryAnalysis = response.text.trim();

        } catch (error) {
            console.error("Error fetching desired salary analysis:", error);
            const errorType = getGeminiErrorType(error);
            if (errorType === 'RATE_LIMIT' || errorType === 'INVALID_KEY') {
                 throw new Error(errorType === 'RATE_LIMIT' 
                    ? "API 요청 한도를 초과했습니다. 1분 후에 다시 시도해주세요."
                    : "AI 서버 인증에 실패했습니다. 관리자에게 문의하여 API 키 설정을 확인해주세요."
                 );
            }
            finalData.reasoning.desiredSalaryAnalysis = "희망 연봉 분석 중 오류가 발생했습니다.";
        }
    }
    
     // --- PART 5: Final Summary Generation ---
    // Overwrite the initial summary with a holistic one based on all available data.
    try {
        let finalSummaryPrompt = '';
        const potentialValueGap = finalData.potentialValueGap;
        
        if (potentialValueGap !== undefined && potentialValueGap > 0) {
            finalSummaryPrompt = `
                **당신은 최고 HR 책임자(CHRO)입니다.** 아래 [데이터]와 [총평 작성 가이드라인]을 **반드시 준수하여**, HR 매니저가 경영진에게 보고할 **최종 요약 보고(Executive Summary)**를 1~2 문장으로 작성해주세요.

                [데이터]
                - 지원자의 역량을 반영한 실제 시장 가치 (평균): ${competencyAdjustedAvgSalary.toLocaleString()}만원
                - 최종 제안 추천 연봉 (보수적 정책 적용): ${finalData.avgSalary.toLocaleString()}만원
                - '잠재 가치 갭' (성장 잠재력): ${potentialValueGap.toLocaleString()}만원
                - 지원자 희망 연봉: ${desiredSalary?.toLocaleString()}만원
                ${finalData.competencyGrade ? `- 역량 종합 평가: '${finalData.competencyGrade}'` : ''}

                [총평 작성 가이드라인]
                1.  총평은 반드시 **'역량 종합 평가' 등급**을 기반으로 객관적으로 작성해야 합니다.
                2.  '잠재 가치 갭'이 존재한다는 것은 지원자의 역량이 높다는 것을 의미합니다. 이를 긍정적으로 언급하되, 표현 수위는 아래 기준을 따라주세요.
                    - **'핵심 인재' 등급:** '핵심 인재'라는 표현을 사용하여 채용을 강력하게 추천할 수 있습니다.
                    - **'우수 역량 보유' 등급:** '핵심 인재'라는 표현은 사용하지 마세요. 대신 '성장 잠재력이 높은 우수 인재', '비용 효율적으로 확보 가능한 우수 자원' 등 객관적인 표현을 사용하세요.
                3.  최종 추천 연봉(${finalData.avgSalary.toLocaleString()}만원)이 비용 효율적인 제안임을 강조하며 채용을 긍정적으로 검토하도록 요약해주세요.
                4.  예시 ('우수 역량 보유' 등급일 경우): "지원자는 '우수 역량 보유' 등급의 인재로, 희망 연봉을 고려한 최종 추천 연봉 ${finalData.avgSalary.toLocaleString()}만원에 채용 검토를 추천합니다. 시장 가치 대비 ${potentialValueGap.toLocaleString()}만원의 '잠재 가치 갭'이 있어, 비용 효율적으로 우수 인재를 확보할 좋은 기회입니다."
                5.  다른 설명 없이 보고 내용만 텍스트로 반환해주세요.
            `;
        } else {
             finalSummaryPrompt = `
                **당신은 최고 HR 책임자(CHRO)입니다.** 아래 [데이터]와 [총평 작성 가이드라인]을 **반드시 준수하여**, HR 매니저가 경영진에게 보고할 **최종 요약 보고(Executive Summary)**를 1~2 문장으로 작성해주세요.

                [데이터]
                - 기초 시장 가치 (평균): ${baselineData.avgSalary.toLocaleString()}만원
                - 역량 프리미엄: ${finalData.competencyPremium?.toLocaleString() ?? 0}만원
                - 최종 추천 연봉 (평균): ${finalData.avgSalary.toLocaleString()}만원
                - 회사 내부 기준 연봉 (중위): ${ (companyStandard && typeof companyStandard !== 'string' ? companyStandard.middle?.toLocaleString() : 'N/A')}만원
                - 지원자 희망 연봉: ${desiredSalary?.toLocaleString()}만원
                ${averageScore !== undefined ? `- **평균 역량 점수: ${averageScore.toFixed(2)}점**` : ''}
                ${finalData.competencyGrade ? `- **역량 종합 평가: '${finalData.competencyGrade}'**` : ''}

                [총평 작성 가이드라인]
                1.  총평은 반드시 **'역량 종합 평가' 등급**을 기반으로 작성해야 합니다.
                2.  '역량 종합 평가'가 **'추가 검토 필요'** 등급일 경우, '우수 인재', '뛰어난 역량'과 같은 긍정적인 표현을 **절대 사용해서는 안 됩니다.** 대신, 지원자의 현재 상태를 객관적으로 기술하고(예: '직무 수행에 필요한 일부 역량에 대한 보완이 필요해 보입니다.'), 연봉 수준이나 성장 가능성과 연결하여 결론을 맺어주세요.
                3.  '역량 종합 평가'가 **'기본 역량 보유'** 등급일 경우, '우수한' 같은 강한 긍정보다는 '준수한', '안정적인' 등의 객관적인 표현을 사용해주세요.
                4.  최종 추천 연봉, 희망 연봉, 회사 기준을 비교하여 채용 결정에 도움이 되는 핵심 인사이트를 제공해주세요.
                5.  다른 설명 없이 보고 내용만 텍스트로 반환해주세요.
            `;
        }

        if (finalSummaryPrompt) {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: finalSummaryPrompt,
                config: {
                    temperature: 0.2,
                    seed: 42,
                },
            });
            finalData.reasoning.summary = response.text.trim();
        }

    } catch(error) {
        console.error("Error generating final summary:", error);
        const errorType = getGeminiErrorType(error);
        if (errorType === 'RATE_LIMIT' || errorType === 'INVALID_KEY') {
            throw new Error(errorType === 'RATE_LIMIT' 
                ? "API 요청 한도를 초과했습니다. 1분 후에 다시 시도해주세요."
                : "AI 서버 인증에 실패했습니다. 관리자에게 문의하여 API 키 설정을 확인해주세요."
            );
        }
        // For other errors, we just log and use the summary from the first API call.
    }


    // Attach salary info to final data regardless of analysis success
    if (desiredSalary) finalData.desiredSalary = desiredSalary;
    if (previousSalary) finalData.previousSalary = previousSalary;

    return finalData;
};


const hiringProposalSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "결재권자를 설득하기 위한 '면접 총평' (Executive Summary)." },
        strengths: { type: Type.STRING, description: "지원자의 '주요 강점' (Key Strengths)을 실제 업무 기여도 중심으로 서술. 글머리 기호(-)를 사용." },
        improvements: { type: Type.STRING, description: "'보완점 및 성장 계획' (Areas for Improvement & Growth Plan). 단점을 리스크가 관리 가능하다는 인상을 주도록 서술." },
        rationale: { type: Type.STRING, description: "제안된 연봉의 합리성을 강조하며 채용을 적극 추천하는 '채용 추천 근거' (Hiring Recommendation Rationale)." },
    },
    required: ["summary", "strengths", "improvements", "rationale"],
};

export const generateHiringProposalText = async (
    competencyAnalysis: string,
    applicantProfile: ApplicantProfile,
    avgSalary: number
): Promise<HiringProposalContent> => {
    const prompt = `
        **당신은 회사의 경영진에게 제출할 공식 '채용 품의서'를 작성하는 HR 총괄 책임자입니다.**
        아래 [기존 AI 분석 결과]와 [지원자 정보]를 바탕으로, '인터뷰' 섹션에 들어갈 최종 평가 내용을 생성해주세요.

        **[매우 중요한 작성 가이드라인]**
        1.  **객관성:** "매우 뛰어남", "확신함" 등 주관적이거나 과장된 표현을 피하고, 면접에서 관찰된 사실이나 지원자의 발언에 근거하여 객관적으로 서술해주세요.
        2.  **간결성:** 각 항목(총평, 강점, 보완점, 추천 근거)은 **핵심 내용만 담아 1~2 문장**으로 매우 간결하게 작성해주세요. 강점 항목의 글머리 기호(-) 내용도 한 문장으로 짧게 유지해야 합니다.
        3.  **전문성:** 비즈니스 보고서에 어울리는 전문적이고 중립적인 어조를 사용해주세요.
        4.  **역량 중심 서술:** '프리미엄', '점수' 같은 내부 분석 용어는 제외하고, 역량이 실제 업무에 어떻게 기여할 수 있는지를 중심으로 서술해주세요.
        5.  **보완점 관리:** 보완점은 단점으로만 부각하지 말고, 회사가 지원할 수 있는 현실적인 성장 계획과 함께 제시하여 리스크가 관리 가능하다는 인상을 주어야 합니다.
        6.  결과는 반드시 지정된 JSON 스키마에 맞춰서, 다른 설명 없이 JSON 객체만 반환해주세요.

        **[기존 AI 분석 결과 (역량 평가)]**
        ${competencyAnalysis}

        **[지원자 정보]**
        - 지원자: ${applicantProfile.applicantName || '해당 지원자'}
        - 직무: ${applicantProfile.roleName}
        - 제안 연봉: ${avgSalary.toLocaleString()}만원

        위 내용을 바탕으로 최종 품의서 텍스트를 생성해주세요.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: hiringProposalSchema,
                temperature: 0.3,
            },
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(cleanedJsonText);
    } catch (error) {
        console.error("Error generating hiring proposal text:", error);
        const errorType = getGeminiErrorType(error);
        switch (errorType) {
            case 'RATE_LIMIT':
                throw new Error("API 요청 한도를 초과했습니다. 1분 후에 다시 시도해주세요.");
            case 'INVALID_KEY':
                throw new Error("AI 서버 인증에 실패했습니다. 관리자에게 문의하여 API 키 설정을 확인해주세요.");
            case 'SERVER_ERROR':
                throw new Error("AI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            default:
                throw new Error("채용 품의서 내용 생성 중 알 수 없는 오류가 발생했습니다.");
        }
    }
};