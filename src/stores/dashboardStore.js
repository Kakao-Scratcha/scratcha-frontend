import { create } from 'zustand';
import { PLAN_USAGE_DATA, } from '../data/dashboardDummy';
import { applicationAPI, dashboardAPI, billingAPI } from '../services/api';
import { useAuthStore } from './authStore';
import { PERIOD_TYPE_MAP, processChartData, processMultiAppChartData } from '../utils/chartDataUtils';
import { devLog, devError } from '../utils/logger';

// 초기 상태 준비
const INITIAL_PERIOD = '전체';

export const useDashboardStore = create((set, get) => ({
    // 기존 상태 유지
    selectedPeriod: INITIAL_PERIOD,
    usageData: [],
    isLoading: false,
    apps: [],
    apiKeys: [],
    isAppsLoading: false,

    // 서버에서 가져온 사용자 정보의 요금제 데이터 사용
    planUsageData: PLAN_USAGE_DATA,  // 더미데이터로 초기화

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

    // 통계 데이터 상태 추가
    requestsStats: {
        daily: { currentCount: 0, previousCount: 0, rate: 0, loading: false, error: null },
        weekly: { currentCount: 0, previousCount: 0, rate: 0, loading: false, error: null },
        monthly: { currentCount: 0, previousCount: 0, rate: 0, loading: false, error: null }
    },

    // 기존 액션들 유지
    setApps: (apps) => set({ apps }),
    setApiKeys: (apiKeys) => set({ apiKeys }),

    // 통계 데이터 로드
    loadRequestsStats: async (periodType) => {
        devLog('📊 통계 데이터 로드 시작:', periodType);

        set(state => ({
            requestsStats: {
                ...state.requestsStats,
                [periodType]: {
                    ...state.requestsStats[periodType],
                    loading: true,
                    error: null
                }
            }
        }));

        try {
            const response = await dashboardAPI.getRequestsStats(periodType);
            devLog('📊 통계 API 응답:', response.data);

            const { currentCount, previousCount, rate } = response.data.data;

            set(state => ({
                requestsStats: {
                    ...state.requestsStats,
                    [periodType]: {
                        currentCount,
                        previousCount,
                        rate,
                        loading: false,
                        error: null
                    }
                }
            }));

            devLog('✅ 통계 데이터 로드 완료:', { periodType, currentCount, previousCount, rate });
        } catch (error) {
            devError('❌ 통계 데이터 로드 실패:', error);
            set(state => ({
                requestsStats: {
                    ...state.requestsStats,
                    [periodType]: {
                        ...state.requestsStats[periodType],
                        loading: false,
                        error: error.message
                    }
                }
            }));
        }
    },

    // 모든 통계 데이터 로드
    loadAllRequestsStats: async () => {
        devLog('📊 모든 통계 데이터 로드 시작');
        await Promise.all([
            get().loadRequestsStats('daily'),
            get().loadRequestsStats('weekly'),
            get().loadRequestsStats('monthly')
        ]);
    },

    // 로그 데이터 로드
    loadLogs: async (params = {}) => {
        const { keyId, periodType = 'yearly', page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        devLog('📊 로그 로드 시작:', { keyId, periodType, page, limit, skip });

        set(state => ({
            logs: { ...state.logs, loading: true, error: null }
        }));

        try {
            const response = await dashboardAPI.getLogs({ keyId, periodType, skip, limit });
            devLog('📊 로그 API 응답:', response.data);
            devLog('📊 응답 데이터 구조:', {
                data: response.data.data,
                total: response.data.total,
                page: response.data.page,
                size: response.data.size,
                dataLength: response.data.data?.length
            });

            // API 응답 구조에 따라 데이터 추출
            const responseData = response.data;
            const items = responseData.data || responseData.items || responseData || [];
            const total = responseData.total || 0;
            const page = responseData.page || 1;
            const size = responseData.size || limit;

            set({
                logs: {
                    items,
                    total,
                    page,
                    size,
                    loading: false,
                    error: null
                },
                selectedKeyId: keyId || null
            });

            devLog('📊 상태 업데이트 후 logs:', {
                items,
                total,
                page,
                size
            });
        } catch (error) {
            devError('로그 데이터 로드 실패:', error);
            set(state => ({
                logs: {
                    ...state.logs,
                    loading: false,
                    error: error.message
                }
            }));
            // 에러를 다시 throw하여 상위 컴포넌트에서 처리할 수 있도록 함
            throw error;
        }
    },

    // 전체 로그 로드
    loadAllLogs: async (page = 1, limit = 10, periodType = 'yearly') => {
        await get().loadLogs({ page, limit, periodType });
    },

    // 특정 API 키 로그 로드
    loadLogsByKeyId: async (keyId, page = 1, limit = 10, periodType = 'yearly') => {
        await get().loadLogs({ keyId, page, limit, periodType });
    },

    // 로그 페이지 변경
    changeLogPage: async (page, limit = 10, periodType = 'yearly') => {
        const { selectedKeyId } = get();
        devLog('📄 페이지 변경:', { page, limit, selectedKeyId, periodType });
        await get().loadLogs({ keyId: selectedKeyId, page, limit, periodType });
    },

    // 기존 액션들 수정 (로그 데이터 활용)
    refreshApplications: async () => {

        devLog('📱 애플리케이션 데이터 새로고침 시작');
        set({ isAppsLoading: true }); // apps, apiKeys 초기화 제거하여 에러 시 기존 데이터 유지
        try {
            const response = await applicationAPI.getAllApplications();
            devLog('📱 애플리케이션 API 응답:', response.data);

            const processedKeyIds = new Set();

            // 모든 키 수집 (배열/단일 모두 지원), 중복 제거
            const freshKeys = [];
            (response.data || []).forEach(app => {
                devLog('📱 앱 데이터 처리:', app);
                const keys = Array.isArray(app.keys) ? app.keys : (app.key ? [app.key] : []);
                devLog('🔑 앱의 키들:', keys);
                keys.forEach(k => {
                    if (k && !processedKeyIds.has(k.id)) {
                        processedKeyIds.add(k.id);
                        freshKeys.push({
                            id: k.id,
                            appId: app.id,
                            name: `API Key ${k.id}`,
                            key: k.key,
                            status: k.isActive ? 'active' : 'inactive',
                            difficulty: k.difficulty || 'low', // 난이도 정보 추가
                            lastUsed: '사용 기록 없음',
                        });
                    }
                });
            });

            // 앱 활성 여부: 해당 앱의 키 중 하나라도 active면 active, 키 없거나 모두 inactive면 inactive
            const freshApps = (response.data || []).map((app) => {
                const keys = freshKeys.filter(k => k.appId === app.id);
                const isActive = keys.length > 0 ? keys.some(k => k.status === 'active') : false;

                // 해당 앱의 키들에서 난이도 정보 가져오기 (첫 번째 키의 난이도 사용)
                const appDifficulty = keys.length > 0 ? (keys[0].difficulty || 'low') : 'low';

                return {
                    id: app.id,
                    name: app.appName,
                    description: app.description || '',
                    status: isActive ? 'active' : 'inactive',
                    settings: {
                        model: 'gpt-4',
                        noiseLevel: '중',
                        heuristicLevel: '중',
                        difficulty: appDifficulty, // 난이도 정보 추가
                    },
                    usage: { today: 0, week: 0, month: 0 },
                    createdAt: new Date().toISOString().split('T')[0],
                };
            });

            devLog('📱 처리된 앱들:', freshApps);
            devLog('🔑 처리된 키들:', freshKeys.map(key => ({
                id: key.id,
                appId: key.appId,
                name: key.name,
                status: key.status,
                difficulty: key.difficulty,
                hasKey: !!key.key
            })));
            set({ apps: freshApps, apiKeys: freshKeys, isAppsLoading: false });
        } catch (error) {
            devError('📱 애플리케이션 데이터 로드 실패:', error);
            // 에러 발생 시에도 기존 데이터 유지 (상태 초기화하지 않음)
            // isAppsLoading을 true로 유지하여 로딩 화면 계속 표시
            throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
        }
    },

    // 기간 변경
    setPeriod: (period) => {
        set({ selectedPeriod: period });
    },


    // 최근 활동
    recentActivities: [
        { id: 1, type: 'success', title: '캡차 검증 성공', time: '2분 전', count: '+1', icon: 'check' },
        { id: 2, type: 'info', title: 'API 키 생성', time: '1시간 전', count: '새 키', icon: 'settings' },
        { id: 3, type: 'warning', title: '웹훅 전송', time: '3시간 전', count: '성공', icon: 'zap' },
        { id: 4, type: 'error', title: '캡차 검증 실패', time: '5시간 전', count: '-1', icon: 'x' }
    ],

    // 새로운 통계 API 연동
    loadStatisticsSummary: async (keyId = null, selectedPeriod = '전체') => {
        const periodType = PERIOD_TYPE_MAP[selectedPeriod] || 'yearly';

        devLog('📊 통계 요약 로드 시작:', { keyId, selectedPeriod, periodType });

        set({ isLoading: true });

        try {
            const response = await dashboardAPI.getStatisticsSummary(keyId, periodType);
            devLog('📊 통계 요약 API 응답:', response.data);

            // API 응답 데이터를 차트 형식으로 변환
            const chartData = processChartData(response.data, selectedPeriod);

            set({
                usageData: chartData,
                isLoading: false
            });

            devLog('✅ 통계 요약 로드 완료:', { keyId, selectedPeriod, chartData });
        } catch (error) {
            devError('❌ 통계 요약 로드 실패:', error);
            set({
                usageData: [],
                isLoading: false
            });
            throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
        }
    },

    // 다중 앱 통계 로드 (전체 선택 시)
    loadMultiAppStatistics: async (selectedPeriod = '전체') => {
        const periodType = PERIOD_TYPE_MAP[selectedPeriod] || 'yearly';
        const { apps, apiKeys } = get();

        devLog('📊 다중 앱 통계 로드 시작:', { selectedPeriod, periodType, appsCount: apps.length });

        set({ isLoading: true });

        try {
            // 전체 통계 + 최대 5개 앱의 통계를 병렬로 가져오기
            const promises = [];
            const appKeyMapping = []; // 앱과 API 키 매핑 정보 저장

            // 1. 전체 통계 (keyId = null)
            promises.push(dashboardAPI.getStatisticsSummary(null, periodType));
            appKeyMapping.push({ appId: null, appName: '전체', keyId: null });

            // 2. 각 앱별 통계 (최대 5개)
            const targetApps = apps.slice(0, 5);
            targetApps.forEach(app => {
                // 각 앱의 첫 번째 API 키를 찾기
                const appApiKey = apiKeys.find(key => String(key.appId) === String(app.id));
                const keyId = appApiKey ? appApiKey.id : null;

                promises.push(dashboardAPI.getStatisticsSummary(keyId, periodType));
                appKeyMapping.push({
                    appId: app.id,
                    appName: app.name,
                    keyId: keyId
                });
            });

            const responses = await Promise.all(promises);
            devLog('📊 다중 앱 통계 API 응답들:', responses);

            // 응답 데이터를 합쳐서 다중 라인 차트 형식으로 변환
            const combinedData = {
                data: []
            };

            // 각 응답을 순서대로 처리
            responses.forEach((response, index) => {
                const mapping = appKeyMapping[index];
                if (response?.data?.data) {
                    response.data.data.forEach(item => {
                        combinedData.data.push({
                            ...item,
                            appId: mapping.appId,
                            appName: mapping.appName,
                            keyId: mapping.keyId
                        });
                    });
                }
            });

            // API 응답 데이터를 다중 라인 차트 형식으로 변환
            const multiAppData = processMultiAppChartData(combinedData, selectedPeriod, apps);

            set({
                usageData: multiAppData,
                isLoading: false
            });

            devLog('✅ 다중 앱 통계 로드 완료:', { selectedPeriod, multiAppData });
        } catch (error) {
            devError('❌ 다중 앱 통계 로드 실패:', error);
            set({
                usageData: [],
                isLoading: false
            });
            throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
        }
    },

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

    // 요금제 변경 함수 (API 연동)
    changePlan: async (newPlanName) => {
        devLog('🔄 요금제 변경 시도:', newPlanName);

        try {
            // 사용자 ID 가져오기
            const { user } = useAuthStore.getState();
            if (!user || !user.id) {
                devError('❌ 사용자 ID가 없습니다.');
                return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
            }

            // 1단계: 실제 API 호출
            const response = await billingAPI.changePlan(user.id, newPlanName);
            devLog('✅ API 요금제 변경 성공:', response.data);

            // 2단계: 서버 응답에서 요금제 정보 추출
            const serverPlanName = response.data.plan || 'free';
            devLog('📋 서버 응답 요금제명:', serverPlanName);

            // 3단계: 내정보 확인 API 호출하여 일치 여부 확인
            try {
                const { getProfile } = useAuthStore.getState();
                const profileResponse = await getProfile({ showLoading: false });
                devLog('✅ 내정보 확인 API 응답:', profileResponse);

                // profileResponse가 null이거나 user가 없는 경우 처리
                if (!profileResponse || !profileResponse.user) {
                    devError('❌ 내정보 확인 API 응답이 유효하지 않음:', profileResponse);
                    return {
                        success: false,
                        error: '사용자 정보를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.'
                    };
                }

                const userProfile = profileResponse.user;
                const profilePlanName = userProfile.plan || 'free';
                devLog('📋 내정보에서 가져온 요금제명:', profilePlanName);

                // 4단계: 서버 응답과 내정보 일치 여부 확인
                if (serverPlanName !== profilePlanName) {
                    devError('❌ 요금제 정보 불일치:', {
                        서버응답: serverPlanName,
                        내정보: profilePlanName
                    });
                    return {
                        success: false,
                        error: '요금제 변경이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.'
                    };
                }

                devLog('✅ 요금제 정보 일치 확인 완료:', serverPlanName);

                // 5단계: 더미데이터의 요금제 설정
                const planConfigs = {
                    'free': {
                        name: 'Free',
                        limit: 1000,
                        price: '₩0',
                        description: '월 1,000 토큰 무료제공',
                        overageRate: 0,
                        features: ['기본 API 통계', '광고 포함']
                    },
                    'starter': {
                        name: 'Starter',
                        limit: 50000,
                        price: '₩29,900',
                        description: '월 50,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
                        overageRate: 2.0,
                        features: ['기본 API & 통계', '광고 제거', '이메일 지원']
                    },
                    'pro': {
                        name: 'Pro',
                        limit: 200000,
                        price: '₩79,900',
                        description: '월 200,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
                        overageRate: 2.0,
                        features: ['Starter의 모든 혜택', '커스텀 UI 스킨 지원', '고급 분석 리포트']
                    },
                    'enterprise': {
                        name: 'Enterprise',
                        limit: 999999999,
                        price: '맞춤 견적',
                        description: '월 무제한 또는 대규모 토큰 패키지',
                        overageRate: 0,
                        features: ['Pro의 모든 혜택', '전용 인프라/보안 강화', 'SLA 보장', '24/7 모니터링']
                    }
                };

                const newPlanConfig = planConfigs[serverPlanName] || planConfigs['free'];

                // 6단계: 서버에서 가져온 사용량 정보 사용
                const serverUsage = userProfile.usage || userProfile.subscription?.usage;
                const serverTokensUsed = serverUsage?.tokensUsed || 0;
                const serverRequestsCount = serverUsage?.requestsCount || 0;
                const serverAvgTokensPerRequest = serverUsage?.avgTokensPerRequest || 20;

                devLog('📊 서버 사용량 정보:', {
                    tokensUsed: serverTokensUsed,
                    requestsCount: serverRequestsCount,
                    avgTokensPerRequest: serverAvgTokensPerRequest
                });

                // 7단계: 프론트엔드 상태 업데이트 (서버 데이터 기반)
                const limit = newPlanConfig.limit;
                const percentage = Math.min(100, Math.round((serverTokensUsed / limit) * 100));

                set(state => {
                    return {
                        planUsageData: {
                            ...state.planUsageData,
                            current: {
                                tokens: {
                                    used: serverTokensUsed,
                                    limit,
                                    percentage
                                },
                                requests: {
                                    count: serverRequestsCount,
                                    avgTokensPerRequest: serverAvgTokensPerRequest
                                }
                            },
                            lastMonth: {
                                ...state.planUsageData.lastMonth,
                                tokens: {
                                    ...state.planUsageData.lastMonth.tokens,
                                    limit, // lastMonth의 limit도 업데이트
                                },
                                billing: {
                                    ...state.planUsageData.lastMonth.billing,
                                    overageRate: newPlanConfig.overageRate, // 초과 요금률도 업데이트
                                }
                            }
                        }
                    };
                });

                devLog('✅ 요금제 변경 완료:', {
                    새요금제: newPlanConfig.name,
                    새한도: newPlanConfig.limit,
                    현재사용량: serverTokensUsed,
                    사용률: percentage + '%'
                });

                // 8단계: authStore 사용자 정보 업데이트
                const { updateUser } = useAuthStore.getState();
                updateUser({ plan: serverPlanName });
                devLog('✅ authStore 사용자 정보 plan 필드 업데이트:', serverPlanName);

                return { success: true };

            } catch (profileError) {
                devError('❌ 내정보 확인 API 호출 실패:', profileError);
                return {
                    success: false,
                    error: '요금제 변경 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                };
            }

        } catch (error) {
            devError('❌ 요금제 변경 실패:', error);
            return { success: false, error: error.message };
        }
    },
}));
