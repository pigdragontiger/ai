
import type { Role, SelectOption, AgencySize, Location, EducationLevelId, EngineerLevelId, ExperienceTier, EvaluationCriterion } from './types';
import { DesignIcon } from './components/icons/DesignIcon';
import { CodeIcon } from './components/icons/CodeIcon';
import { ProjectIcon } from './components/icons/ProjectIcon';
import { MarketingIcon } from './components/icons/MarketingIcon';

export const PLANNER_EVALUATION_CRITERIA: EvaluationCriterion[] = [
  {
    id: 'problem_definition',
    name: '문제 정의 및 분석',
    levels: {
      1: '문제의 핵심, 문제점을 파악하지 못하거나 단편적으로만 이해함',
      2: '주어진 문제를 분석하고 해결책을 제시함',
      3: '복잡한 문제의 본질을 파악하고 데이터 기반으로 해결 방안을 도출함',
      4: '사용자의 잠재적 니즈까지 발견하고 비즈니스 성장에 기여하는 솔루션을 제시함',
    },
  },
  {
    id: 'documentation',
    name: '문서화 및 설계',
    levels: {
      1: '문서 작성에 어려움을 느끼거나 비논리적으로 구성함',
      2: '기본적인 와이어프레임과 화면 정의서를 작성함',
      3: '명확하고 상세한 스토리보드로 개발/디자인 효율을 높임',
      4: '인터랙션과 예외 상황까지 고려한 완벽한 문서를 통해 프로젝트를 주도함',
    },
  },
  {
    id: 'tool_proficiency',
    name: '툴 활용 능력',
    levels: {
      1: '툴 사용법을 잘 알지 못하거나 활용도가 낮음',
      2: '주요 툴(Figma, Jira 등)의 기본 기능을 활용해 업무를 수행함',
      3: '툴의 고급 기능과 플러그인, 연동 기능을 활용해 생산성을 높임',
      4: '새로운 툴을 적극적으로 탐색하고 팀에 도입하여 작업 환경을 혁신함',
    },
  },
  {
    id: 'collaboration',
    name: '협업 및 소통',
    levels: {
      1: '의견을 제대로 전달하지 못하거나 소극적으로 참여함',
      2: '프로젝트 관련 내용을 공유하고 협업 요청에 응함',
      3: '자신의 기획 의도를 논리적으로 설득하고, 타 직군과 능동적으로 소통함',
      4: '팀 전체의 시너지를 창출하고, 갈등을 원만하게 조율하며 긍정적인 영향을 미침',
    },
  },
  {
    id: 'responsibility',
    name: '책임감 및 태도',
    levels: {
      1: '주어진 업무에만 소극적으로 임하며 개선 의지가 부족함',
      2: '자신의 역할을 충실히 수행하고 책임감을 가짐',
      3: '맡은 프로젝트를 주도적으로 이끌고, 서비스에 대한 애정과 열정을 보임',
      4: '실패를 두려워하지 않고 새로운 시도를 하며, 팀 전체의 성장을 이끌어냄',
    },
  },
];

export const DESIGNER_EVALUATION_CRITERIA: EvaluationCriterion[] = [
    {
        id: 'visual_design',
        name: '시각 디자인',
        levels: {
            1: '디자인 원칙에 대한 이해가 부족하고, 결과물의 심미성 및 일관성이 낮음',
            2: '주어진 가이드라인 내에서 일관된 시각적 결과물을 만들어냄',
            3: '타이포그래피, 컬러, 레이아웃 등 시각 디자인 요소를 능숙하게 활용하여 사용자 친화적인 UI를 구성함',
            4: '독창적인 아트워크와 시각적 컨셉을 제시하여 서비스의 브랜드 가치를 높임',
        },
    },
    {
        id: 'interaction_design',
        name: '인터랙션 디자인',
        levels: {
            1: '단순한 정적 페이지 디자인만 가능하며, 동적 요소에 대한 이해가 부족함',
            2: '기본적인 사용자 인터랙션을 고려하여 프로토타입을 제작할 수 있음',
            3: '마이크로 인터랙션, 애니메이션 등을 효과적으로 사용하여 사용성을 극대화함',
            4: '복잡한 사용자 플로우를 직관적으로 설계하고, 사용자의 감성까지 고려한 인터랙션을 구현함',
        },
    },
    {
        id: 'user_research',
        name: '사용자 리서치',
        levels: {
            1: '사용자 데이터의 중요성을 인지하지 못하고, 개인의 감에 의존하여 디자인함',
            2: '주어진 데이터를 해석하고 디자인에 일부 반영함',
            3: '사용자 테스트, 설문조사 등을 직접 설계하고 수행하여 유의미한 인사이트를 도출함',
            4: '정성/정량 데이터를 종합적으로 분석하여 잠재된 사용자 니즈를 발견하고, 이를 통해 새로운 기회를 창출함',
        },
    },
    {
        id: 'tool_proficiency_design',
        name: '툴 활용 능력',
        levels: {
            1: '주요 디자인 툴(Figma 등)의 기본 기능 숙지가 미흡함',
            2: '디자인 툴을 활용하여 필요한 UI 디자인을 문제없이 수행함',
            3: '컴포넌트, 오토레이아웃 등 툴의 고급 기능을 활용하여 디자인 시스템을 구축하고 생산성을 높임',
            4: '최신 디자인 툴과 플러그인을 적극적으로 도입하고, 팀의 디자인 프로세스를 혁신함',
        },
    },
    {
        id: 'collaboration_design',
        name: '협업 및 소통',
        levels: {
            1: '자신의 디자인을 설명하는 데 어려움을 느끼며, 피드백 수용에 소극적임',
            2: '기획, 개발 직군과 소통하며 디자인 의도를 전달하고, 개발 가능한 디자인을 구현함',
            3: '디자인 결정을 논리적으로 설득하고, 다양한 의견을 조율하여 더 나은 결과물을 만들어냄',
            4: '프로젝트의 목표를 깊이 이해하고, 타 직군에 영감을 주며 팀 전체의 결과물 품질을 향상시킴',
        },
    },
];

export const PUBLISHER_EVALUATION_CRITERIA: EvaluationCriterion[] = [
    {
        id: 'html_css',
        name: 'HTML/CSS 숙련도',
        levels: {
            1: '시맨틱 마크업, 웹 표준에 대한 이해가 부족하며, 레이아웃 구현에 어려움을 겪음',
            2: '디자인 시안을 보고 HTML 구조를 설계하고 CSS로 스타일을 입힐 수 있음',
            3: 'SCSS 등 CSS 전처리기와 BEM 같은 방법론을 사용해 유지보수성이 높은 코드를 작성함',
            4: '복잡한 반응형 레이아웃과 애니메이션을 CSS만으로 구현하며, 웹 접근성을 완벽하게 준수함',
        },
    },
    {
        id: 'cross_browsing',
        name: '크로스 브라우징',
        levels: {
            1: '특정 브라우저에서만 동작하는 코드를 작성하며, 호환성 문제에 대한 인식이 부족함',
            2: '주요 브라우저(Chrome, Safari, Edge)에서의 호환성을 기본적인 수준에서 확보함',
            3: '다양한 브라우저와 디바이스 환경을 고려하여 일관된 사용자 경험을 제공함',
            4: '오래된 브라우저(IE)나 특수한 환경까지 대응하는 안정적인 코드를 작성하고, 자동화된 테스트를 도입함',
        },
    },
    {
        id: 'javascript_dom',
        name: 'JavaScript(DOM)',
        levels: {
            1: 'JavaScript 기본 문법에 대한 이해가 부족하여 동적 기능 구현이 어려움',
            2: 'jQuery나 간단한 Vanilla JS로 DOM을 조작하고 이벤트를 처리할 수 있음',
            3: '복잡한 UI 인터랙션을 Vanilla JS로 구현하고, 코드의 성능을 고려함',
            4: '이벤트 위임, 모듈화 등 고급 JavaScript 개념을 활용하여 효율적이고 확장성 있는 코드를 작성함',
        },
    },
    {
        id: 'performance',
        name: '웹 성능 최적화',
        levels: {
            1: '성능 최적화의 개념을 알지 못하며, 이미지나 리소스 관리를 하지 않음',
            2: '이미지 압축, 코드 최소화 등 기본적인 성능 최적화 작업을 수행함',
            3: '브라우저 렌더링 과정을 이해하고, 로딩 속도 개선을 위한 다양한 기법(Lazy Loading 등)을 적용함',
            4: 'Lighthouse 등 성능 측정 도구를 사용하여 병목 현상을 분석하고, Core Web Vitals 지표를 체계적으로 관리함',
        },
    },
    {
        id: 'build_tools',
        name: '빌드 도구/Git',
        levels: {
            1: '버전 관리나 빌드 도구의 필요성을 이해하지 못함',
            2: 'Git의 기본적인 명령어(clone, commit, push)를 사용하여 협업함',
            3: 'Webpack, Vite 등 번들러를 설정하고, SCSS 컴파일 등 개발 자동화 환경을 구축함',
            4: 'Git-flow 등 협업 전략을 이해하고 능숙하게 사용하며, CI/CD 파이프라인 구축에 기여함',
        },
    },
];

export const FRONTEND_EVALUATION_CRITERIA: EvaluationCriterion[] = [
    {
        id: 'framework_proficiency',
        name: '프레임워크 숙련도',
        levels: {
            1: '프레임워크(React, Vue 등)의 기본 개념과 생명주기에 대한 이해가 부족함',
            2: '프레임워크를 사용하여 컴포넌트를 만들고 데이터를 화면에 렌더링할 수 있음',
            3: 'Hooks, Composition API 등 프레임워크의 핵심 기능을 깊이 있게 이해하고 최적화된 코드를 작성함',
            4: '프레임워크의 내부 동작 원리를 이해하고, 대규모 애플리케이션의 아키텍처를 설계하고 성능을 개선함',
        },
    },
    {
        id: 'state_management',
        name: '상태 관리',
        levels: {
            1: '상태 관리의 필요성을 이해하지 못하고, 데이터 흐름이 복잡하게 얽힌 코드를 작성함',
            2: '컴포넌트의 로컬 상태(useState)나 간단한 전역 상태 관리가 가능함',
            3: 'Redux, MobX, Recoil 등 상태 관리 라이브러리를 사용하여 예측 가능하고 확장성 있는 상태 관리를 구현함',
            4: '애플리케이션의 특성에 맞는 최적의 상태 관리 전략을 수립하고, 비동기 상태 및 서버 상태까지 효율적으로 관리함',
        },
    },
    {
        id: 'api_integration',
        name: 'API 연동',
        levels: {
            1: '비동기 통신에 대한 이해가 부족하여 API 연동에 어려움을 겪음',
            2: 'RESTful API를 호출하고 응답 데이터를 화면에 표시할 수 있음',
            3: 'React-Query, SWR 등 데이터 페칭 라이브러리를 활용하여 로딩, 에러 상태를 처리하고 캐싱 전략을 구현함',
            4: 'GraphQL, gRPC 등 다양한 API 통신 방식을 이해하고, 복잡한 데이터 요구사항을 효율적으로 처리함',
        },
    },
    {
        id: 'code_quality',
        name: '코드 품질/테스팅',
        levels: {
            1: '가독성이 낮고 중복이 많은 코드를 작성하며, 타입 시스템이나 테스트의 필요성을 느끼지 못함',
            2: 'TypeScript를 사용하여 기본적인 타입 안정성을 확보하고, 재사용 가능한 컴포넌트를 작성하려고 노력함',
            3: 'Jest, React Testing Library 등을 사용하여 단위/통합 테스트를 작성하고, 코드 리뷰를 통해 품질을 개선함',
            4: '클린 아키텍처, 디자인 패턴을 적용하여 유지보수성이 뛰어난 코드를 작성하고, 테스트 자동화 환경을 구축함',
        },
    },
    {
        id: 'problem_solving_fe',
        name: '문제 해결 능력',
        levels: {
            1: '에러 발생 시 원인을 파악하지 못하고, 해결에 오랜 시간이 걸림',
            2: '개발자 도구를 사용하여 에러를 디버깅하고, 검색을 통해 문제를 해결함',
            3: '복잡한 비즈니스 로직을 효율적인 알고리즘으로 구현하고, 기술적인 난제를 주도적으로 해결함',
            4: '기존 코드의 구조적인 문제를 파악하고 리팩토링을 통해 개선하며, 시스템 전반의 안정성을 높임',
        },
    },
];

export const PM_EVALUATION_CRITERIA: EvaluationCriterion[] = [
    {
        id: 'planning',
        name: '프로젝트 기획/설계',
        levels: {
            1: '요구사항을 명확히 정의하지 못하고, 프로젝트 범위(Scope) 설정에 어려움을 겪음',
            2: '주어진 요구사항을 바탕으로 WBS(작업 분해 구조)를 작성하고, 기본적인 일정을 수립함',
            3: '리스크를 사전에 식별하고 대응 계획을 수립하며, 자원(인력, 예산)을 효율적으로 산정하고 배분함',
            4: '프로젝트의 비즈니스 목표를 깊이 이해하고, 시장 분석을 통해 성공 가능성을 높이는 전략적인 기획을 함',
        },
    },
    {
        id: 'execution_monitoring',
        name: '실행 및 진척 관리',
        levels: {
            1: '프로젝트 진행 상황을 체계적으로 추적하지 못하고, 이슈 발생 시 즉각적인 대응이 미흡함',
            2: 'Jira 등 협업 툴을 사용하여 이슈를 관리하고, 정기적으로 팀의 진행 상황을 공유함',
            3: '핵심 성과 지표(KPI)를 설정하고 데이터를 기반으로 프로젝트 상태를 객관적으로 분석하며, 변경사항을 효과적으로 관리함',
            4: '프로젝트의 병목 현상을 미리 예측하고 해결 방안을 제시하며, 전체 프로세스를 최적화하여 효율을 극대화함',
        },
    },
    {
        id: 'communication_pm',
        name: '커뮤니케이션/협상',
        levels: {
            1: '내부 팀원 및 외부 고객과의 소통이 원활하지 않아 정보 전달에 오류가 잦음',
            2: '프로젝트 관련 이해관계자에게 필요한 정보를 명확하게 전달하고, 회의록 등을 통해 내용을 기록함',
            3: '고객의 숨은 니즈를 파악하고, 논리적인 근거를 바탕으로 고객 및 팀원을 설득하고 협상함',
            4: '복잡한 이해관계 속에서 갈등을 성공적으로 중재하고, 모든 관계자와의 신뢰를 구축하여 프로젝트를 성공으로 이끎',
        },
    },
    {
        id: 'team_leadership',
        name: '팀 리더십',
        levels: {
            1: '팀원에게 명확한 업무 지시를 내리지 못하고, 동기 부여에 어려움을 겪음',
            2: '팀원들의 역할을 명확히 분배하고, 목표 달성을 위해 팀을 독려함',
            3: '팀원 개개인의 강점을 파악하여 역할을 부여하고, 성장을 위한 건설적인 피드백을 제공함',
            4: '팀의 비전을 제시하고 긍정적인 팀 문화를 조성하여, 팀원들이 자발적으로 최고의 성과를 내도록 이끎',
        },
    },
    {
        id: 'methodology',
        name: '개발 방법론 이해',
        levels: {
            1: 'Agile, Waterfall 등 표준 개발 방법론에 대한 지식이 부족함',
            2: '프로젝트의 특성에 맞는 기본적인 개발 프로세스를 수립하고 따름',
            3: 'Agile/Scrum 방법론을 깊이 이해하고, 스프린트 계획, 리뷰, 회고 등 Scrum 이벤트를 효과적으로 운영함',
            4: '특정 방법론에 얽매이지 않고, 프로젝트와 팀의 상황에 맞게 프로세스를 유연하게 변형하고 최적화함',
        },
    },
];

export const MARKETER_EVALUATION_CRITERIA: EvaluationCriterion[] = [
    {
        id: 'seo_sem',
        name: 'SEO/SEM',
        levels: {
            1: '검색엔진 최적화(SEO)의 기본 개념을 이해하지 못하며, 관련 활동 경험이 없음',
            2: '키워드 리서치를 통해 기본적인 On-page SEO를 적용하고, Google Ads 등 검색 광고를 운영할 수 있음',
            3: 'Technical SEO, 콘텐츠 SEO 전략을 수립하여 오가닉 트래픽을 의미 있게 증대시키고, 광고 캠페인 효율(ROAS)을 최적화함',
            4: '검색엔진 알고리즘 변화에 빠르게 대응하고, 데이터 기반으로 SEO/SEM 전략을 통합하여 비즈니스 성과를 극대화함',
        },
    },
    {
        id: 'data_analysis',
        name: '데이터 분석',
        levels: {
            1: '마케팅 성과를 측정할 지표를 설정하지 못하고, 데이터 분석의 중요성을 인지하지 못함',
            2: 'Google Analytics(GA) 등 분석 툴을 사용하여 웹사이트의 기본 트래픽 지표를 확인하고 보고함',
            3: 'UTM 설정, A/B 테스트 등을 통해 캠페인 성과를 정밀하게 측정하고, 유의미한 인사이트를 도출하여 마케팅 활동을 개선함',
            4: 'SQL, 데이터 시각화 툴 등을 활용하여 고객 행동 데이터를 심층적으로 분석하고, 마케팅 전략 전반에 적용하여 성장을 주도함',
        },
    },
    {
        id: 'content_marketing',
        name: '콘텐츠 마케팅',
        levels: {
            1: '타겟 고객에 대한 이해 없이, 제품/서비스의 기능 나열에 그치는 콘텐츠를 제작함',
            2: '타겟 고객의 관심사를 파악하여 블로그, 카드뉴스 등 기본적인 형식의 콘텐츠를 기획하고 제작함',
            3: '고객 여정(Customer Journey)에 맞춰 다양한 포맷(영상, 웨비나, 백서 등)의 콘텐츠를 전략적으로 기획하고 배포하여 잠재 고객을 발굴함',
            4: '차별화된 콘텐츠로 브랜드를 구축하고 커뮤니티를 활성화시키며, 콘텐츠를 통해 직접적인 매출 성과를 창출함',
        },
    },
    {
        id: 'sns_paid_ads',
        name: 'SNS 및 유료 광고',
        levels: {
            1: '주요 소셜 미디어 채널의 특성을 이해하지 못하고, 광고 플랫폼 사용 경험이 없음',
            2: '기업 SNS 계정을 운영하며 기본적인 콘텐츠를 포스팅하고, 간단한 타겟팅으로 광고를 집행함',
            3: '각 채널 특성에 맞는 콘텐츠 전략을 수립하여 오디언스의 참여를 유도하고, 퍼널 분석을 통해 광고 캠페인 효율을 최적화함',
            4: '다양한 매체를 통합적으로 운영하는 미디어 믹스 전략을 수립하고, 최소한의 비용으로 최대의 성과를 내는 캠페인을 설계함',
        },
    },
    {
        id: 'marketing_automation',
        name: '마케팅 자동화/CRM',
        levels: {
            1: 'CRM의 개념을 알지 못하며, 모든 마케팅 활동을 수동으로 처리함',
            2: '이메일 마케팅 툴을 사용하여 뉴스레터를 발송하는 등 기본적인 자동화 기능을 활용함',
            3: '고객 세분화(Segmentation)를 통해 개인화된 메시지를 보내는 시나리오를 설계하고, 마케팅 자동화 툴을 활용하여 리드를 육성함',
            4: '고객 데이터를 기반으로 LTV(고객 생애 가치)를 극대화하는 CRM 전략을 수립하고, 마케팅-세일즈 파이프라인 전체를 자동화함',
        },
    },
];


export const ROLES: Role[] = [
  {
    id: 'uiux_planner',
    name: 'UI/UX 기획자',
    description: '사용자 중심 서비스를 기획하고 기능 명세, 화면 설계를 담당합니다.',
    icon: ProjectIcon,
    evaluationCriteria: PLANNER_EVALUATION_CRITERIA,
  },
  {
    id: 'uiux',
    name: 'UI/UX 디자이너',
    description: '사용자 경험을 최적화하고 직관적인 인터페이스를 디자인합니다.',
    icon: DesignIcon,
    evaluationCriteria: DESIGNER_EVALUATION_CRITERIA,
  },
  {
    id: 'publisher',
    name: '퍼블리셔',
    description: '웹 표준을 준수하여 HTML, CSS, JavaScript로 웹 페이지를 제작합니다.',
    icon: CodeIcon,
    evaluationCriteria: PUBLISHER_EVALUATION_CRITERIA,
  },
  {
    id: 'frontend',
    name: '프론트엔드 개발자',
    description: '사용자 인터페이스와 웹사이트의 시각적 요소를 구현합니다.',
    icon: CodeIcon,
    evaluationCriteria: FRONTEND_EVALUATION_CRITERIA,
  },
  {
    id: 'pm',
    name: '프로젝트 매니저',
    description: '프로젝트의 기획, 실행, 마감까지 전 과정을 총괄합니다.',
    icon: ProjectIcon,
    evaluationCriteria: PM_EVALUATION_CRITERIA,
  },
  {
    id: 'marketer',
    name: '디지털 마케터',
    description: 'SEO, SEM, 콘텐츠 마케팅을 통해 고객 유입을 유도합니다.',
    icon: MarketingIcon,
    evaluationCriteria: MARKETER_EVALUATION_CRITERIA,
  }
];

export const ENGINEER_LEVELS: SelectOption<EngineerLevelId>[] = [
  { 
    id: 'beginner', 
    name: '초급 기술자', 
  },
  { 
    id: 'intermediate', 
    name: '중급 기술자', 
  },
  { 
    id: 'advanced', 
    name: '고급 기술자', 
  },
  { 
    id: 'expert', 
    name: '특급 기술자', 
  },
];


export const EDUCATION_LEVELS: SelectOption<EducationLevelId>[] = [
  { id: 'highschool', name: '고졸' },
  { id: 'associate', name: '전문학사' },
  { id: 'bachelor', name: '학사' },
  { id: 'master', name: '석사' },
];

export const AGENCY_SIZES: SelectOption<AgencySize>[] = [
  { id: 'small', name: '소규모', description: '1-20명' },
  { id: 'medium', name: '중규모', description: '21-100명' },
  { id: 'large', name: '대규모', description: '101명 이상' },
];

export const LOCATIONS: SelectOption<Location>[] = [
  { id: 'seoul', name: '수도권', description: '서울/경기/인천' },
  { id: 'other', name: '기타', description: '수도권 외 지역' },
];

export const YEARLY_EXPERIENCE_TIERS: ExperienceTier[] = Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `${i + 1}년차`,
}));
