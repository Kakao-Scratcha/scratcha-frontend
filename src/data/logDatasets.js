// 로그 데이터셋 - 다양한 시나리오별 미리 생성된 로그 데이터
import { generateUsageLogs, getMonthToDateLogs, getStableSessionLogs } from './dashboardDummy';

// 시나리오별 데이터셋
export const LOG_DATASETS = {
    low: {
        name: 'Low (~30%)',
        description: '낮은 사용량 시나리오',
        usageLogs: generateUsageLogs('low'),
        sessionLogs: getStableSessionLogs('low'),
        monthToDateLogs: getMonthToDateLogs('low')
    },
    mid: {
        name: 'Mid (30~60%)',
        description: '중간 사용량 시나리오',
        usageLogs: generateUsageLogs('mid'),
        sessionLogs: getStableSessionLogs('mid'),
        monthToDateLogs: getMonthToDateLogs('mid')
    },
    high: {
        name: 'High (60%+)',
        description: '높은 사용량 시나리오',
        usageLogs: generateUsageLogs('high'),
        sessionLogs: getStableSessionLogs('high'),
        monthToDateLogs: getMonthToDateLogs('high')
    }
};

// 기본 데이터셋 (mid)
export const DEFAULT_DATASET = 'mid';

// 데이터셋 변경 함수
export const changeDataset = (scenario) => {
    if (!LOG_DATASETS[scenario]) {
        console.warn(`Unknown dataset scenario: ${scenario}`);
        return LOG_DATASETS[DEFAULT_DATASET];
    }
    return LOG_DATASETS[scenario];
};
