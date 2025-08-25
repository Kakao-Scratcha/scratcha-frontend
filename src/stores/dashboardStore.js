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
import { applicationAPI, dashboardAPI } from '../services/api';

// 초기 상태 준비
const INITIAL_PERIOD = '전체';
const INITIAL_AVG_TOKENS = (PLAN_USAGE_DATA.current?.requests?.avgTokensPerRequest) || 20;
const INITIAL_LIMIT = (PLAN_USAGE_DATA.current?.tokens?.limit) || DEFAULT_PLAN.limit;

export const useDashboardStore = create((set, get) => ({
    // 기존 상태 유지
    chartType: 'line',
    selectedPeriod: INITIAL_PERIOD,
    usageData: [],
    stats: {
        today: { value: 0, change: 0 },
        week: { value: 0, change: 0 },
        month: { value: 0, change: 0 },
    },
    isLoading: false,
    sessionLogs: getStableSessionLogs(DEFAULT_DATASET),
    usageLogs: generateUsageLogs(DEFAULT_DATASET),
    datasetScenario: DEFAULT_DATASET,
    apps: [],
    selectedAppId: null,
    apiKeys: [],
    isAppsLoading: false,
    currentPlan: DEFAULT_PLAN,
    planUsageData: PLAN_USAGE_DATA,

    // 로그 관련 상태 추가
    logs: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        loading: false,
        error: null
    },
    selectedKeyId: null, // 선택된 API 키 ID

    // 기존 액션들 유지
    setApps: (apps) => set({ apps }),
    setApiKeys: (apiKeys) => set({ apiKeys }),
    selectApp: (appId) => set({ selectedAppId: appId }),
    updateAppSettings: (appId, settings) => set((state) => ({
        apps: state.apps.map(app =>
            app.id === appId
                ? { ...app, settings: { ...app.settings, ...settings } }
                : app
        )
    })),

    // 로그 관련 액션 추가
    setSelectedKeyId: (keyId) => set({ selectedKeyId: keyId }),

    // 로그 데이터 로드
    loadLogs: async (params = {}) => {
        const { keyId, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        console.log('📊 로그 로드 시작:', { keyId, page, limit, skip });

        set(state => ({
            logs: { ...state.logs, loading: true, error: null }
        }));

        try {
            const response = await dashboardAPI.getLogs({ keyId, skip, limit });
            console.log('📊 로그 API 응답:', response.data);

            set({
                logs: {
                    items: response.data.items || [],
                    total: response.data.total || 0,
                    page: response.data.page || 1,
                    size: response.data.size || limit,
                    loading: false,
                    error: null
                },
                selectedKeyId: keyId || null
            });
        } catch (error) {
            console.error('로그 데이터 로드 실패:', error);
            set(state => ({
                logs: {
                    ...state.logs,
                    loading: false,
                    error: error.message
                }
            }));
        }
    },

    // 전체 로그 로드
    loadAllLogs: async (page = 1, limit = 10) => {
        await get().loadLogs({ page, limit });
    },

    // 특정 API 키 로그 로드
    loadLogsByKeyId: async (keyId, page = 1, limit = 10) => {
        await get().loadLogs({ keyId, page, limit });
    },

    // 로그 페이지 변경
    changeLogPage: async (page, limit = 10) => {
        const { selectedKeyId } = get();
        console.log('📄 페이지 변경:', { page, limit, selectedKeyId });
        await get().loadLogs({ keyId: selectedKeyId, page, limit });
    },

    // 기존 액션들 수정 (로그 데이터 활용)
    refreshApplications: async () => {
        console.log('📱 애플리케이션 데이터 새로고침 시작');
        set({ isAppsLoading: true, apps: [], apiKeys: [] });
        try {
            const response = await applicationAPI.getAllApplications();
            console.log('📱 애플리케이션 API 응답:', response.data);

            const processedKeyIds = new Set();

            // 모든 키 수집 (배열/단일 모두 지원), 중복 제거
            const freshKeys = [];
            (response.data || []).forEach(app => {
                console.log('📱 앱 데이터 처리:', app);
                const keys = Array.isArray(app.keys) ? app.keys : (app.key ? [app.key] : []);
                console.log('🔑 앱의 키들:', keys);
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

            console.log('📱 처리된 앱들:', freshApps);
            console.log('🔑 처리된 키들:', freshKeys);
            set({ apps: freshApps, apiKeys: freshKeys });
        } catch (error) {
            console.error('📱 애플리케이션 데이터 로드 실패:', error);
        } finally {
            set({ isAppsLoading: false });
        }
    },

    // 기간 변경 (로그 데이터 활용)
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

    // 나머지 기존 액션들 유지...
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

    setChartType: (chartType) => set({ chartType }),
    setLoading: (isLoading) => set({ isLoading }),

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

    setUsageLogs: (logs) => set({ usageLogs: logs }),
    setSelectedAppId: (appId) => set({ selectedAppId: appId }),

    // 최근 활동
    recentActivities: [
        { id: 1, type: 'success', title: '캡차 검증 성공', time: '2분 전', count: '+1', icon: 'check' },
        { id: 2, type: 'info', title: 'API 키 생성', time: '1시간 전', count: '새 키', icon: 'settings' },
        { id: 3, type: 'warning', title: '웹훅 전송', time: '3시간 전', count: '성공', icon: 'zap' },
        { id: 4, type: 'error', title: '캡차 검증 실패', time: '5시간 전', count: '-1', icon: 'x' }
    ],

    // 기존 액션들 유지...
    addActivity: (activity) => {
        const newActivity = { id: Date.now(), ...activity };
        set(state => ({
            recentActivities: [newActivity, ...state.recentActivities.slice(0, 9)]
        }));
    },

    addApiKey: (apiKeyData) => {
        const nowIso = new Date().toISOString();
        const newApiKey = {
            ...apiKeyData,
            status: apiKeyData.status || 'active',
            createdAt: apiKeyData.createdAt || nowIso.split('T')[0],
            lastUsed: apiKeyData.lastUsed || nowIso.replace('T', ' ').substring(0, 19),
        };
        set(state => ({
            apiKeys: [...state.apiKeys.filter(k => k.id !== newApiKey.id), newApiKey]
        }));
    },

    deleteApiKey: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.filter(key => key.id !== apiKeyId)
        }));
    },

    toggleApiKeyStatus: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.map(key =>
                key.id === apiKeyId
                    ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
                    : key
            )
        }));
    },

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