import { create } from 'zustand';
import {
    DEFAULT_PLAN,
    PLAN_USAGE_DATA,
    bucketUsageSeries,
    computeStatsFromLogs,
    generateUsageLogs,
    getStableSessionLogs,
} from '../data/dashboardDummy';
import { LOG_DATASETS, DEFAULT_DATASET } from '../data/logDatasets';
import { applicationAPI } from '../services/api';

// 초기 상태 준비
const INITIAL_PERIOD = '전체';
const INITIAL_AVG_TOKENS = (PLAN_USAGE_DATA.current?.requests?.avgTokensPerRequest) || 20;
const INITIAL_LIMIT = (PLAN_USAGE_DATA.current?.tokens?.limit) || DEFAULT_PLAN.limit;

export const useDashboardStore = create((set) => ({
    // 상태
    chartType: 'line', // 'line' | 'area' | 'bar' | 'composed'
    selectedPeriod: INITIAL_PERIOD,
    usageData: [], // 실제 API 데이터로 대체 예정
    stats: {
        today: { value: 0, change: 0 },
        week: { value: 0, change: 0 },
        month: { value: 0, change: 0 },
    },
    isLoading: false,
    // 로그 관련 상태 (실제 API에서 가져올 예정)
    sessionLogs: getStableSessionLogs(DEFAULT_DATASET),
    usageLogs: generateUsageLogs(DEFAULT_DATASET),
    datasetScenario: DEFAULT_DATASET,
    apps: [], // 실제 API에서 가져올 예정
    selectedAppId: null,
    apiKeys: [], // 실제 API에서 가져올 예정
    isAppsLoading: false,

    // 액션
    setApps: (apps) => set({ apps }),
    setApiKeys: (apiKeys) => set({ apiKeys }),

    // 서버에서 최신 APP/API 키 목록을 가져와 스토어를 덮어씀
    refreshApplications: async () => {
        set({ isAppsLoading: true, apps: [], apiKeys: [] });
        try {
            const response = await applicationAPI.getAllApplications();
            const processedKeyIds = new Set();

            // 모든 키 수집 (배열/단일 모두 지원), 중복 제거
            const freshKeys = [];
            (response.data || []).forEach(app => {
                const keys = Array.isArray(app.keys) ? app.keys : (app.key ? [app.key] : []);
                keys.forEach(k => {
                    if (k && !processedKeyIds.has(k.id)) {
                        processedKeyIds.add(k.id);
                        freshKeys.push({
                            id: k.id,
                            appId: app.id,
                            name: `API Key ${k.id}`,
                            key: k.key,
                            status: k.isActive ? 'active' : 'inactive',
                            lastUsed: '사용 기록 없음',
                        });
                    }
                });
            });

            // 앱 활성 여부: 해당 앱의 키 중 하나라도 active면 active, 키 없거나 모두 inactive면 inactive
            const freshApps = (response.data || []).map((app) => {
                const keys = freshKeys.filter(k => k.appId === app.id);
                const isActive = keys.length > 0 ? keys.some(k => k.status === 'active') : false;
                return {
                    id: app.id,
                    name: app.appName,
                    description: app.description || '',
                    status: isActive ? 'active' : 'inactive',
                    settings: {
                        model: 'gpt-4',
                        noiseLevel: '중',
                        heuristicLevel: '중',
                    },
                    usage: { today: 0, week: 0, month: 0 },
                    createdAt: new Date().toISOString().split('T')[0],
                };
            });

            set({ apps: freshApps, apiKeys: freshKeys });
        } finally {
            set({ isAppsLoading: false });
        }
    },

    // 기간 변경
    setPeriod: (period) => {
        set((state) => {
            // 실제 API에서 해당 기간의 로그 데이터를 가져와야 함
            const newUsageData = bucketUsageSeries(period, state.sessionLogs);
            const newStats = computeStatsFromLogs(state.sessionLogs);

            return {
                selectedPeriod: period,
                usageData: newUsageData,
                stats: newStats,
            };
        });
    },

    // 데이터셋 시나리오 변경
    setDatasetScenario: (scenario) => {
        set((state) => {
            const dataset = LOG_DATASETS[scenario] || LOG_DATASETS[DEFAULT_DATASET];
            const newSessionLogs = dataset.sessionLogs;
            const newUsageLogs = dataset.usageLogs;
            const newUsageData = bucketUsageSeries(state.selectedPeriod, newSessionLogs);
            const newStats = computeStatsFromLogs(newSessionLogs);

            return {
                datasetScenario: scenario,
                sessionLogs: newSessionLogs,
                usageLogs: newUsageLogs,
                usageData: newUsageData,
                stats: newStats,
            };
        });
    },

    // 사용량 로그 업데이트
    updateUsageLogs: (logs) => {
        set((state) => {
            const newUsageData = bucketUsageSeries(state.selectedPeriod, logs);
            const newStats = computeStatsFromLogs(logs);

            return {
                usageLogs: logs,
                usageData: newUsageData,
                stats: newStats,
            };
        });
    },

    // 차트 타입 변경
    setChartType: (chartType) => set({ chartType }),

    // 로딩 상태 설정
    setLoading: (isLoading) => set({ isLoading }),

    // 로그 데이터 설정 (API에서 가져온 데이터)
    setSessionLogs: (logs) => {
        set((state) => {
            const newUsageData = bucketUsageSeries(state.selectedPeriod, logs);
            const newStats = computeStatsFromLogs(logs);

            return {
                sessionLogs: logs,
                usageData: newUsageData,
                stats: newStats,
            };
        });
    },

    // 사용량 로그 설정
    setUsageLogs: (logs) => set({ usageLogs: logs }),

    // 앱 선택
    setSelectedAppId: (appId) => set({ selectedAppId: appId }),

    // 최근 활동
    recentActivities: [
        {
            id: 1,
            type: 'success',
            title: '캡차 검증 성공',
            time: '2분 전',
            count: '+1',
            icon: 'check'
        },
        {
            id: 2,
            type: 'info',
            title: 'API 키 생성',
            time: '1시간 전',
            count: '새 키',
            icon: 'settings'
        },
        {
            id: 3,
            type: 'warning',
            title: '웹훅 전송',
            time: '3시간 전',
            count: '성공',
            icon: 'zap'
        },
        {
            id: 4,
            type: 'error',
            title: '캡차 검증 실패',
            time: '5시간 전',
            count: '-1',
            icon: 'x'
        }
    ],

    // 활동 추가
    addActivity: (activity) => {
        const newActivity = {
            id: Date.now(),
            ...activity
        };

        set(state => ({
            recentActivities: [newActivity, ...state.recentActivities.slice(0, 9)]
        }));
    },

    // API 키 추가
    addApiKey: (apiKeyData) => {
        const nowIso = new Date().toISOString();
        const newApiKey = {
            ...apiKeyData,
            // 기본값 보완만 하고, 서버 값은 덮어쓰지 않음
            status: apiKeyData.status || 'active',
            createdAt: apiKeyData.createdAt || nowIso.split('T')[0],
            lastUsed: apiKeyData.lastUsed || nowIso.replace('T', ' ').substring(0, 19),
        };

        set(state => ({
            apiKeys: [...state.apiKeys.filter(k => k.id !== newApiKey.id), newApiKey]
        }));
    },

    // API 키 삭제
    deleteApiKey: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.filter(key => key.id !== apiKeyId)
        }));
    },

    // API 키 상태 토글 (옵티미스틱 업데이트용)
    toggleApiKeyStatus: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.map(key =>
                key.id === apiKeyId
                    ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
                    : key
            )
        }));
    },

    // 플랜 정보
    currentPlan: DEFAULT_PLAN,
    planUsageData: PLAN_USAGE_DATA,

    // 요금 계산 함수
    calculateOverageCost: (used, limit, basePrice, overageRate) => {
        if (used <= limit) return 0;
        const overageTokens = used - limit;
        const overageCost = Math.ceil(overageTokens / 1000) * overageRate;
        return overageCost;
    },

    calculateTotalCost: (used, limit, basePrice, overageRate) => {
        const basePriceNumber = typeof basePrice === 'string' ? parseInt(basePrice.replace(/[^\d]/g, '')) : basePrice;
        const overageCost = useDashboardStore.getState().calculateOverageCost(used, limit, basePrice, overageRate);
        return basePriceNumber + overageCost;
    },
})); 