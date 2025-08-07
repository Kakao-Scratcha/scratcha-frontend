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
    apps: [], // 더미 데이터 제거 - 빈 배열로 시작
    selectedAppId: null,
    apiKeys: [], // 더미 데이터 제거 - 빈 배열로 시작
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

            // 시간순으로 정렬 (최신순)하고 최대 100개만 표시
            const sortedLogs = allLogs
                .sort((a, b) => new Date(b.callTime) - new Date(a.callTime))
                .slice(0, 100);

            set({ usageLogs: sortedLogs });
        } else {
            set({
                usageLogs: generateUsageLogs(appId, apiKeyId, period)
            });
        }
    },

    // 현재 요금제 정보 (메인페이지 Pricing과 동일)
    currentPlan: {
        name: 'Starter',
        limit: 50000,
        used: 24500,
        price: '₩29,900',
        description: '월 50,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
        overageRate: 2.0, // 초과분 요금 (1,000 토큰당 ₩2.0)
        features: [
            '기본 API & 통계',
            '광고 제거',
            '이메일 지원'
        ]
    },

    // 통합 요금제 사용량 데이터 (모든 대시보드 페이지에서 공통 사용)
    planUsageData: {
        // 이번 달 실시간 사용량
        current: {
            tokens: {
                used: 24500, // 사용된 토큰
                limit: 50000, // 토큰 한도
                percentage: Math.round((24500 / 50000) * 100)
            },
            requests: {
                count: 1225, // API 호출 횟수 (24500 토큰 ÷ 20 토큰/회 = 1225회)
                avgTokensPerRequest: 20 // 1회당 평균 토큰 사용량
            }
        },
        // 지난달 사용량
        lastMonth: {
            tokens: {
                used: 18900, // 사용된 토큰
                limit: 50000 // 토큰 한도 (Starter 기준)
            },
            requests: {
                count: 945, // API 호출 횟수 (18900 토큰 ÷ 20 토큰/회 = 945회)
                avgTokensPerRequest: 20 // 1회당 평균 토큰 사용량
            },
            billing: {
                overageRate: 2.0, // Starter 기준 (1,000 토큰당 ₩2.0)
                basePrice: 29900, // Starter 기준
                overageCost: 0, // 18900 < 50000이므로 초과분 없음
                totalCost: 29900 // 기본 요금만
            }
        }
    },

    // 요금제 변경 (메인페이지 Pricing과 동일)
    changePlan: (newPlan) => {
        const planConfigs = {
            'Free': {
                name: 'Free',
                limit: 1000,
                price: '₩0',
                description: '월 1,000 토큰 무료제공',
                overageRate: 0,
                features: [
                    '기본 API 통계',
                    '광고 포함'
                ]
            },
            'Starter': {
                name: 'Starter',
                limit: 50000,
                price: '₩29,900',
                description: '월 50,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
                overageRate: 2.0,
                features: [
                    '기본 API & 통계',
                    '광고 제거',
                    '이메일 지원'
                ]
            },
            'Pro': {
                name: 'Pro',
                limit: 200000,
                price: '₩79,900',
                description: '월 200,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
                overageRate: 2.0,
                features: [
                    'Starter의 모든 혜택',
                    '커스텀 UI 스킨 지원',
                    '고급 분석 리포트'
                ]
            },
            'Enterprise': {
                name: 'Enterprise',
                limit: 999999999,
                price: '맞춤 견적',
                description: '월 무제한 또는 대규모 토큰 패키지',
                overageRate: 0,
                features: [
                    'Pro의 모든 혜택',
                    '전용 인프라/보안 강화',
                    'SLA 보장',
                    '24/7 모니터링'
                ]
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

    // 데이터 클리어 액션
    clearApps: () => set({ apps: [] }),
    clearApiKeys: () => set({ apiKeys: [] }),

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