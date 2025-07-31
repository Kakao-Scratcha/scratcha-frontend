import { create } from 'zustand';
import {
    generateUsageData,
    generateStats,
    DUMMY_APPS,
    DUMMY_API_KEYS,
    generateUsageLogs
} from '../data/dummyData';

// 더미 APP 데이터
const generateApps = () => DUMMY_APPS;

// 더미 API 키 데이터
const generateApiKeys = () => DUMMY_API_KEYS;

// 더미 사용량 로그 데이터 생성 - 중앙 데이터 파일에서 가져옴

export const useDashboardStore = create((set) => ({
    // 상태
    selectedPeriod: '전체',
    usageData: generateUsageData('전체'),
    stats: generateStats('전체'),
    isLoading: false,
    apps: generateApps(),
    selectedAppId: null,
    apiKeys: generateApiKeys(),
    usageLogs: generateUsageLogs(1, 1, '전체'),

    // 액션
    setPeriod: (period) => {
        set({
            selectedPeriod: period,
            usageData: generateUsageData(period),
            stats: generateStats(period),
            isLoading: true
        });

        // 로딩 시뮬레이션
        setTimeout(() => {
            set({ isLoading: false });
        }, 500);
    },

    // APP 선택
    selectApp: (appId) => {
        set({ selectedAppId: appId });
    },

    // APP 설정 업데이트
    updateAppSettings: (appId, settings) => {
        set(state => ({
            apps: state.apps.map(app =>
                app.id === appId
                    ? { ...app, settings: { ...app.settings, ...settings } }
                    : app
            )
        }));
    },

    // APP 상태 토글 (removed from settings, but logic might be here for APP menu)
    toggleAppStatus: (appId) => {
        set(state => {
            const newAppStatus = state.apps.find(app => app.id === appId)?.status === 'active' ? 'inactive' : 'active';

            return {
                apps: state.apps.map(app =>
                    app.id === appId
                        ? { ...app, status: newAppStatus }
                        : app
                ),
                // APP이 비활성화되면 해당 APP의 모든 API 키도 비활성화
                apiKeys: state.apiKeys.map(key =>
                    key.appId === appId
                        ? { ...key, status: newAppStatus }
                        : key
                )
            };
        });
    },

    // 새 APP 추가
    addApp: (appData) => {
        const newApp = {
            id: Date.now(),
            ...appData,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            settings: {
                model: 'gpt-4',
                noiseLevel: '중',
                heuristicLevel: '중'
            },
            usage: {
                today: 0,
                week: 0,
                month: 0
            }
        };

        set(state => ({
            apps: [...state.apps, newApp]
        }));
    },

    // APP 삭제
    deleteApp: (appId) => {
        set(state => ({
            apps: state.apps.filter(app => app.id !== appId),
            selectedAppId: state.selectedAppId === appId ? null : state.selectedAppId
        }));
    },

    // 사용량 로그 업데이트
    updateUsageLogs: (appId, apiKeyId, period) => {
        // 전체 선택 시 모든 로그 생성
        if (appId === 'all' || apiKeyId === 'all') {
            const allLogs = [];
            const apps = generateApps();
            const apiKeys = generateApiKeys();
            let currentId = 1;

            // 모든 APP과 API 키 조합으로 로그 생성
            apps.forEach(app => {
                const appKeys = apiKeys.filter(key => key.appId === app.id);
                appKeys.forEach(key => {
                    const logs = generateUsageLogs(app.id, key.id, period, currentId);
                    allLogs.push(...logs);
                    currentId += logs.length;
                });
            });

            // ID 순으로 정렬하고 최대 100개만 표시
            const sortedLogs = allLogs
                .sort((a, b) => a.id - b.id)
                .slice(0, 100);

            set({ usageLogs: sortedLogs });
        } else {
            set({
                usageLogs: generateUsageLogs(appId, apiKeyId, period)
            });
        }
    },

    // 현재 요금제 정보
    currentPlan: {
        name: 'Professional',
        limit: 100000,
        used: 24500,
        price: '₩29,900/월',
        description: '월 100,000회 캡차 검증',
        overageRate: 0.3 // 초과분 요금 (1회당 0.3원)
    },

    // 요금제 변경
    changePlan: (newPlan) => {
        const planConfigs = {
            'Basic': {
                name: 'Basic',
                limit: 10000,
                price: '₩9,900/월',
                description: '월 10,000회 캡차 검증',
                overageRate: 0.5 // 초과분 요금 (1회당 0.5원)
            },
            'Professional': {
                name: 'Professional',
                limit: 100000,
                price: '₩29,900/월',
                description: '월 100,000회 캡차 검증',
                overageRate: 0.3 // 초과분 요금 (1회당 0.3원)
            },
            'Enterprise': {
                name: 'Enterprise',
                limit: 500000,
                price: '₩99,900/월',
                description: '월 500,000회 캡차 검증',
                overageRate: 0.2 // 초과분 요금 (1회당 0.2원)
            }
        };

        const newPlanConfig = planConfigs[newPlan];
        if (newPlanConfig) {
            set(state => ({
                currentPlan: {
                    ...state.currentPlan,
                    ...newPlanConfig
                }
            }));
        }
    },

    // 초과분 요금 계산
    calculateOverageCost: (used, limit, overageRate) => {
        if (used <= limit) return 0;
        return Math.round((used - limit) * overageRate);
    },

    // 총 요금 계산 (기본 요금 + 초과분 요금)
    calculateTotalCost: (used, limit, basePrice, overageRate) => {
        const basePriceNumber = parseInt(basePrice.replace(/[^\d]/g, ''));
        const overageCost = (used > limit) ? Math.round((used - limit) * overageRate) : 0;
        return basePriceNumber + overageCost;
    },

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
        const newApiKey = {
            id: Date.now(),
            ...apiKeyData,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            lastUsed: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        set(state => ({
            apiKeys: [...state.apiKeys, newApiKey]
        }));
    },

    // API 키 삭제
    deleteApiKey: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.filter(key => key.id !== apiKeyId)
        }));
    },

    // API 키 상태 토글
    toggleApiKeyStatus: (apiKeyId) => {
        set(state => ({
            apiKeys: state.apiKeys.map(key =>
                key.id === apiKeyId
                    ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
                    : key
            )
        }));
    },

    // 사용량 업데이트
    updateUsage: (newUsage) => {
        set(state => ({
            currentPlan: {
                ...state.currentPlan,
                used: newUsage
            }
        }));
    }
})); 