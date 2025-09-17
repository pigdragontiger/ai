import type { EducationLevelId, CompanySalaryTableData, SalaryEvaluation } from '../types';


// --- Data Curation Rationale ---
// The following data sets are manually curated based on 2025 market predictions for web agencies in South Korea.
// - Saramin: Represents a general, broad market average.
// - Wanted: Represents a more tech-focused, slightly higher salary range, common in venture-backed companies and startups.
// - JobKorea: Represents a more traditional and conservative salary range, often seen in more established, non-tech-focused companies.

// --- 1. Saramin 2025 Data (General Market) ---
const SARAMIN_MASTER_2025: Record<string, SalaryEvaluation> = {
  '1': { low: 3350, middle: 3400, high: 3450 }, '2': { low: 3400, middle: 3500, high: 3600 }, '3': { low: 3600, middle: 3700, high: 3800 }, '4': { low: 3800, middle: 3900, high: 4000 }, '5': { low: 4100, middle: 4250, high: 4300 }, '6': { low: 4300, middle: 4400, high: 4500 }, '7': { low: 4600, middle: 4700, high: 4900 }, '8': { low: 5000, middle: 5200, high: 5400 }, '9': { low: 5500, middle: 5650, high: 5800 }, '10': { low: 5900, middle: 6050, high: 6250 }, '11': { low: 6350, middle: 6500, high: 6650 }, '12': { low: 6750, middle: 6900, high: 7050 }, '13': { low: 7100, middle: 7250, high: 7400 }, '14': { low: 7300, middle: 7450, high: 7600 }, '15': { low: 7450, middle: 7600, high: 7750 }, '16': { low: 7600, middle: 7750, high: 7900 }, '17': { low: 7750, middle: 7900, high: 8050 }, '18': { low: 7900, middle: 8050, high: 8200 }, '19': { low: 8000, middle: 8150, high: 8300 }, '20': { low: 8100, middle: 8250, high: 8400 },
};
const SARAMIN_BACHELOR_2025: Record<string, SalaryEvaluation> = {
  '1': { low: 3150, middle: 3150, high: 3150 }, '2': { low: 3150, middle: 3250, high: 3350 }, '3': { low: 3350, middle: 3450, high: 3550 }, '4': { low: 3550, middle: 3650, high: 3750 }, '5': { low: 3850, middle: 4000, high: 4100 }, '6': { low: 4150, middle: 4250, high: 4350 }, '7': { low: 4350, middle: 4500, high: 4650 }, '8': { low: 4700, middle: 4850, high: 5000 }, '9': { low: 5000, middle: 5150, high: 5300 }, '10': { low: 5300, middle: 5450, high: 5600 }, '11': { low: 5600, middle: 5750, high: 5900 }, '12': { low: 5900, middle: 6050, high: 6200 }, '13': { low: 6200, middle: 6350, high: 6500 }, '14': { low: 6400, middle: 6550, high: 6700 }, '15': { low: 6600, middle: 6750, high: 6900 }, '16': { low: 6800, middle: 6950, high: 7100 }, '17': { low: 6950, middle: 7100, high: 7250 }, '18': { low: 7100, middle: 7250, high: 7400 }, '19': { low: 7200, middle: 7350, high: 7500 }, '20': { low: 7300, middle: 7450, high: 7600 },
};
const SARAMIN_ASSOCIATE_2025: Record<string, SalaryEvaluation> = {
  '1': { low: 2950, middle: 2950, high: 2950 }, '2': { low: 2950, middle: 3050, high: 3150 }, '3': { low: 3150, middle: 3250, high: 3350 }, '4': { low: 3350, middle: 3450, high: 3550 }, '5': { low: 3600, middle: 3700, high: 3800 }, '6': { low: 3850, middle: 3950, high: 4050 }, '7': { low: 3850, middle: 4150, high: 4450 }, '8': { low: 4200, middle: 4500, high: 4800 }, '9': { low: 4550, middle: 4850, high: 5150 }, '10': { low: 4950, middle: 5250, high: 5550 }, '11': { low: 5300, middle: 5600, high: 5900 }, '12': { low: 5650, middle: 5950, high: 6250 }, '13': { low: 6050, middle: 6350, high: 6650 }, '14': { low: 6350, middle: 6650, high: 6950 }, '15': { low: 6550, middle: 6850, high: 7150 }, '16': { low: 6650, middle: 6950, high: 7250 }, '17': { low: 6750, middle: 7050, high: 7350 }, '18': { low: 6850, middle: 7150, high: 7450 }, '19': { low: 6950, middle: 7250, high: 7550 }, '20': { low: 7050, middle: 7350, high: 7650 },
};
const SARAMIN_HIGHSCHOOL_2025: Record<string, SalaryEvaluation> = {
  '1': { low: 2750, middle: 2750, high: 2750 }, '2': { low: 2750, middle: 2850, high: 2950 }, '3': { low: 2950, middle: 3050, high: 3150 }, '4': { low: 3150, middle: 3250, high: 3350 }, '5': { low: 3350, middle: 3450, high: 3550 }, '6': { low: 3550, middle: 3650, high: 3750 }, '7': { low: 3750, middle: 3900, high: 4050 }, '8': { low: 4050, middle: 4200, high: 4350 }, '9': { low: 4350, middle: 4500, high: 4650 }, '10': { low: 4650, middle: 4800, high: 4950 }, '11': { low: 4950, middle: 5100, high: 5250 }, '12': { low: 5250, middle: 5400, high: 5550 }, '13': { low: 5600, middle: 5750, high: 5900 }, '14': { low: 5850, middle: 6000, high: 6150 }, '15': { low: 6050, middle: 6200, high: 6350 }, '16': { low: 6350, middle: 6500, high: 6650 }, '17': { low: 6550, middle: 6700, high: 6850 }, '18': { low: 6650, middle: 6800, high: 6950 }, '19': { low: 6750, middle: 6900, high: 7050 }, '20': { low: 6850, middle: 7000, high: 7150 },
};

// --- 2. Wanted 2025 Data (Tech-Focused, Higher Range) ---
const WANTED_MASTER_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 3500, middle: 3600, high: 3700 }, '2': { low: 3650, middle: 3750, high: 3850 }, '3': { low: 3850, middle: 3950, high: 4050 }, '4': { low: 4100, middle: 4200, high: 4300 }, '5': { low: 4400, middle: 4550, high: 4700 }, '6': { low: 4650, middle: 4800, high: 4950 }, '7': { low: 4950, middle: 5100, high: 5300 }, '8': { low: 5400, middle: 5600, high: 5800 }, '9': { low: 5900, middle: 6100, high: 6300 }, '10': { low: 6350, middle: 6550, high: 6750 }, '11': { low: 6800, middle: 7000, high: 7200 }, '12': { low: 7200, middle: 7400, high: 7600 }, '13': { low: 7550, middle: 7750, high: 7950 }, '14': { low: 7800, middle: 8000, high: 8200 }, '15': { low: 8000, middle: 8200, high: 8400 }, '16': { low: 8150, middle: 8350, high: 8550 }, '17': { low: 8300, middle: 8500, high: 8700 }, '18': { low: 8450, middle: 8650, high: 8850 }, '19': { low: 8550, middle: 8750, high: 8950 }, '20': { low: 8650, middle: 8850, high: 9050 },
};
const WANTED_BACHELOR_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 3300, middle: 3300, high: 3300 }, '2': { low: 3350, middle: 3450, high: 3550 }, '3': { low: 3550, middle: 3650, high: 3750 }, '4': { low: 3800, middle: 3900, high: 4000 }, '5': { low: 4050, middle: 4200, high: 4350 }, '6': { low: 4400, middle: 4550, high: 4700 }, '7': { low: 4650, middle: 4800, high: 5000 }, '8': { low: 5000, middle: 5200, high: 5400 }, '9': { low: 5350, middle: 5550, high: 5750 }, '10': { low: 5700, middle: 5900, high: 6100 }, '11': { low: 6000, middle: 6200, high: 6400 }, '12': { low: 6300, middle: 6500, high: 6700 }, '13': { low: 6600, middle: 6800, high: 7000 }, '14': { low: 6850, middle: 7050, high: 7250 }, '15': { low: 7100, middle: 7300, high: 7500 }, '16': { low: 7300, middle: 7500, high: 7700 }, '17': { low: 7450, middle: 7650, high: 7850 }, '18': { low: 7600, middle: 7800, high: 8000 }, '19': { low: 7700, middle: 7900, high: 8100 }, '20': { low: 7800, middle: 8000, high: 8200 },
};
const WANTED_ASSOCIATE_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 3100, middle: 3100, high: 3100 }, '2': { low: 3100, middle: 3200, high: 3300 }, '3': { low: 3300, middle: 3400, high: 3500 }, '4': { low: 3500, middle: 3600, high: 3700 }, '5': { low: 3750, middle: 3850, high: 3950 }, '6': { low: 4050, middle: 4150, high: 4250 }, '7': { low: 4100, middle: 4350, high: 4650 }, '8': { low: 4450, middle: 4750, high: 5050 }, '9': { low: 4800, middle: 5100, high: 5400 }, '10': { low: 5200, middle: 5500, high: 5800 }, '11': { low: 5550, middle: 5850, high: 6150 }, '12': { low: 5900, middle: 6200, high: 6500 }, '13': { low: 6300, middle: 6600, high: 6900 }, '14': { low: 6600, middle: 6900, high: 7200 }, '15': { low: 6800, middle: 7100, high: 7400 }, '16': { low: 6900, middle: 7200, high: 7500 }, '17': { low: 7000, middle: 7300, high: 7600 }, '18': { low: 7100, middle: 7400, high: 7700 }, '19': { low: 7200, middle: 7500, high: 7800 }, '20': { low: 7300, middle: 7600, high: 7900 },
};
const WANTED_HIGHSCHOOL_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 2900, middle: 2900, high: 2900 }, '2': { low: 2900, middle: 3000, high: 3100 }, '3': { low: 3100, middle: 3200, high: 3300 }, '4': { low: 3300, middle: 3400, high: 3500 }, '5': { low: 3500, middle: 3600, high: 3700 }, '6': { low: 3700, middle: 3800, high: 3900 }, '7': { low: 3900, middle: 4050, high: 4200 }, '8': { low: 4200, middle: 4350, high: 4500 }, '9': { low: 4500, middle: 4650, high: 4800 }, '10': { low: 4800, middle: 4950, high: 5100 }, '11': { low: 5100, middle: 5250, high: 5400 }, '12': { low: 5400, middle: 5550, high: 5700 }, '13': { low: 5750, middle: 5900, high: 6050 }, '14': { low: 6000, middle: 6150, high: 6300 }, '15': { low: 6200, middle: 6350, high: 6500 }, '16': { low: 6500, middle: 6650, high: 6800 }, '17': { low: 6700, middle: 6850, high: 7000 }, '18': { low: 6800, middle: 6950, high: 7100 }, '19': { low: 6900, middle: 7050, high: 7200 }, '20': { low: 7000, middle: 7150, high: 7300 },
};

// --- 3. JobKorea 2025 Data (Traditional, Conservative Range) ---
const JOBKOREA_MASTER_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 3250, middle: 3300, high: 3350 }, '2': { low: 3300, middle: 3400, high: 3500 }, '3': { low: 3500, middle: 3600, high: 3700 }, '4': { low: 3700, middle: 3800, high: 3900 }, '5': { low: 4000, middle: 4150, high: 4200 }, '6': { low: 4200, middle: 4300, high: 4400 }, '7': { low: 4500, middle: 4600, high: 4800 }, '8': { low: 4900, middle: 5100, high: 5300 }, '9': { low: 5400, middle: 5550, high: 5700 }, '10': { low: 5800, middle: 5950, high: 6150 }, '11': { low: 6250, middle: 6400, high: 6550 }, '12': { low: 6650, middle: 6800, high: 6950 }, '13': { low: 7000, middle: 7150, high: 7300 }, '14': { low: 7200, middle: 7350, high: 7500 }, '15': { low: 7350, middle: 7500, high: 7650 }, '16': { low: 7500, middle: 7650, high: 7800 }, '17': { low: 7650, middle: 7800, high: 7950 }, '18': { low: 7800, middle: 7950, high: 8100 }, '19': { low: 7900, middle: 8050, high: 8200 }, '20': { low: 8000, middle: 8150, high: 8300 },
};
const JOBKOREA_BACHELOR_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 3050, middle: 3050, high: 3050 }, '2': { low: 3050, middle: 3150, high: 3250 }, '3': { low: 3250, middle: 3350, high: 3450 }, '4': { low: 3450, middle: 3550, high: 3650 }, '5': { low: 3750, middle: 3900, high: 4000 }, '6': { low: 4050, middle: 4150, high: 4250 }, '7': { low: 4250, middle: 4400, high: 4550 }, '8': { low: 4600, middle: 4750, high: 4900 }, '9': { low: 4900, middle: 5050, high: 5200 }, '10': { low: 5200, middle: 5350, high: 5500 }, '11': { low: 5500, middle: 5650, high: 5800 }, '12': { low: 5800, middle: 5950, high: 6100 }, '13': { low: 6100, middle: 6250, high: 6400 }, '14': { low: 6300, middle: 6450, high: 6600 }, '15': { low: 6500, middle: 6650, high: 6800 }, '16': { low: 6700, middle: 6850, high: 7000 }, '17': { low: 6850, middle: 7000, high: 7150 }, '18': { low: 7000, middle: 7150, high: 7300 }, '19': { low: 7100, middle: 7250, high: 7400 }, '20': { low: 7200, middle: 7350, high: 7500 },
};
const JOBKOREA_ASSOCIATE_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 2850, middle: 2850, high: 2850 }, '2': { low: 2850, middle: 2950, high: 3050 }, '3': { low: 3050, middle: 3150, high: 3250 }, '4': { low: 3250, middle: 3350, high: 3450 }, '5': { low: 3500, middle: 3600, high: 3700 }, '6': { low: 3750, middle: 3850, high: 3950 }, '7': { low: 3750, middle: 4050, high: 4350 }, '8': { low: 4100, middle: 4400, high: 4700 }, '9': { low: 4450, middle: 4750, high: 5050 }, '10': { low: 4850, middle: 5150, high: 5450 }, '11': { low: 5200, middle: 5500, high: 5800 }, '12': { low: 5550, middle: 5850, high: 6150 }, '13': { low: 5950, middle: 6250, high: 6550 }, '14': { low: 6250, middle: 6550, high: 6850 }, '15': { low: 6450, middle: 6750, high: 7050 }, '16': { low: 6550, middle: 6850, high: 7150 }, '17': { low: 6650, middle: 6950, high: 7250 }, '18': { low: 6750, middle: 7050, high: 7350 }, '19': { low: 6850, middle: 7150, high: 7450 }, '20': { low: 6950, middle: 7250, high: 7550 },
};
const JOBKOREA_HIGHSCHOOL_2025: Record<string, SalaryEvaluation> = {
    '1': { low: 2650, middle: 2650, high: 2650 }, '2': { low: 2650, middle: 2750, high: 2850 }, '3': { low: 2850, middle: 2950, high: 3050 }, '4': { low: 3050, middle: 3150, high: 3250 }, '5': { low: 3250, middle: 3350, high: 3450 }, '6': { low: 3450, middle: 3550, high: 3650 }, '7': { low: 3650, middle: 3800, high: 3950 }, '8': { low: 3950, middle: 4100, high: 4250 }, '9': { low: 4250, middle: 4400, high: 4550 }, '10': { low: 4550, middle: 4700, high: 4850 }, '11': { low: 4850, middle: 5000, high: 5150 }, '12': { low: 5150, middle: 5300, high: 5450 }, '13': { low: 5500, middle: 5650, high: 5800 }, '14': { low: 5750, middle: 5900, high: 6050 }, '15': { low: 5950, middle: 6100, high: 6250 }, '16': { low: 6250, middle: 6400, high: 6550 }, '17': { low: 6450, middle: 6600, high: 6750 }, '18': { low: 6550, middle: 6700, high: 6850 }, '19': { low: 6650, middle: 6800, high: 6950 }, '20': { low: 6750, middle: 6900, high: 7050 },
};


// --- Data Mapping by Education Level ---

const PLATFORM_YEARLY_DATA_MAP: Record<'saramin' | 'wanted' | 'jobkorea', Record<EducationLevelId, Record<string, SalaryEvaluation>>> = {
    saramin: {
        'master': SARAMIN_MASTER_2025,
        'bachelor': SARAMIN_BACHELOR_2025,
        'associate': SARAMIN_ASSOCIATE_2025,
        'highschool': SARAMIN_HIGHSCHOOL_2025,
    },
    wanted: {
        'master': WANTED_MASTER_2025,
        'bachelor': WANTED_BACHELOR_2025,
        'associate': WANTED_ASSOCIATE_2025,
        'highschool': WANTED_HIGHSCHOOL_2025,
    },
    jobkorea: {
        'master': JOBKOREA_MASTER_2025,
        'bachelor': JOBKOREA_BACHELOR_2025,
        'associate': JOBKOREA_ASSOCIATE_2025,
        'highschool': JOBKOREA_HIGHSCHOOL_2025,
    }
};

// --- Builder Function ---

const buildPlatformData = (platform: 'saramin' | 'wanted' | 'jobkorea'): CompanySalaryTableData => {
    const data: CompanySalaryTableData = {} as CompanySalaryTableData;
    const yearlyDataMapByEdu = PLATFORM_YEARLY_DATA_MAP[platform];

    for (const eduId in yearlyDataMapByEdu) {
        const eduLevel = eduId as EducationLevelId;
        if (Object.prototype.hasOwnProperty.call(yearlyDataMapByEdu, eduLevel)) {
            const yearlyData = yearlyDataMapByEdu[eduLevel];
            data[eduLevel] = yearlyData;
        }
    }
    return data;
};

// --- Final Exports ---

export const SARAMIN_SALARY_DATA_2025: CompanySalaryTableData = buildPlatformData('saramin');
export const WANTED_SALARY_DATA_2025: CompanySalaryTableData = buildPlatformData('wanted');
export const JOBKOREA_SALARY_DATA_2025: CompanySalaryTableData = buildPlatformData('jobkorea');