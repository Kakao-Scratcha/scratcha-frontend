import apiClient from '../config/api';
import { useAuthStore } from '../stores/authStore';

// 인증 관련 API
export const authAPI = {
    // 로그인
    login: (credentials) => {
        console.log('📤 로그인 API 요청 데이터:', credentials);
        return apiClient.post('/dashboard/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    // 회원가입
    signup: (userData) => apiClient.post('/dashboard/users/signup', userData),

    // 사용자 정보 조회
    getProfile: () => {
        console.log('📞 getProfile API 호출');
        return apiClient.get('/dashboard/users/me');
    },

    // 사용자 정보 업데이트
    updateProfile: (data) => {
        console.log('📞 updateProfile API 호출:', data);
        return apiClient.patch('/dashboard/users/me', data);
    },

    // 사용자 이름 변경
    updateUsername: (newUsername) => {
        console.log('📞 updateUsername API 호출:', { newUsername });
        return apiClient.patch('/dashboard/users/me', {
            userName: newUsername
        });
    },

    // 회원 탈퇴 (계정 소프트 삭제)
    deleteAccount: () => {
        console.log('📞 deleteAccount API 호출');
        return apiClient.delete('/dashboard/users/me');
    },

    // 사용자 삭제
    deleteUser: () => apiClient.delete('/dashboard/users/me'),
};

// 애플리케이션 관련 API
export const applicationAPI = {
    // 모든 애플리케이션 조회
    getAllApplications: () => {
        console.log('📱 애플리케이션 목록 조회 API 호출');
        return apiClient.get('/dashboard/applications/all');
    },

    // 애플리케이션 생성
    createApplication: (data) => {
        console.log('📱 애플리케이션 생성 API 호출:', data);
        return apiClient.post('/dashboard/applications/', data);
    },

    // 특정 애플리케이션 조회
    getApplicationById: (appId) => {
        console.log('📱 애플리케이션 조회 API 호출:', appId);
        return apiClient.get(`/dashboard/applications/${appId}`);
    },

    // 애플리케이션 업데이트
    updateApplication: (appId, data) => {
        console.log('📱 애플리케이션 업데이트 API 호출:', { appId, data });
        return apiClient.patch(`/dashboard/applications/${appId}`, data);
    },

    // 애플리케이션 삭제
    deleteApplication: (appId) => {
        console.log('📱 애플리케이션 삭제 API 호출:', appId);
        return apiClient.delete(`/dashboard/applications/${appId}`);
    },

    // API 키 생성
    createApiKey: (data) => {
        console.log('🔑 API 키 생성 API 호출:', data);
        return apiClient.post('/dashboard/api-keys/', data);
    },

    // API 키 난이도 업데이트
    updateApiKeyDifficulty: (keyId, difficulty) => {
        console.log('🔑 API 키 난이도 업데이트 API 호출:', { keyId, difficulty });
        return apiClient.patch(`/dashboard/api-keys/${keyId}`, {
            difficulty: difficulty
        });
    },

    // API 키 삭제
    deleteApiKey: (keyId) => {
        console.log('🔑 API 키 삭제 API 호출:', { keyId });
        return apiClient.delete(`/dashboard/api-keys/${keyId}`);
    },

    // API 키 활성화/비활성화
    toggleApiKeyStatus: (keyId, isActive) => {
        const action = isActive ? 'activate' : 'deactivate';
        const endpoint = `/dashboard/api-keys/${keyId}/${action}`;
        const baseURL = apiClient.defaults.baseURL || '';
        const token = useAuthStore.getState().token || '';
        const authHeader = token && token.startsWith('Bearer ') ? token : (token ? `Bearer ${token}` : '');

        console.log('🔑 API 키 상태 변경 API 호출:', { keyId, isActive, endpoint, fullUrl: `${baseURL}${endpoint}` });
        console.log('🧪 재현용 curl:', `curl -X 'PUT' '${baseURL}${endpoint}' -H 'accept: application/json'${authHeader ? ` -H 'Authorization: ${authHeader}'` : ''}`);

        return apiClient.put(endpoint, null, { headers: { Accept: 'application/json' } });
    },
};


// 사용자 관련 API
export const userAPI = {
    // 사용자 정보 업데이트
    updateProfile: (data) => apiClient.put('/user/profile', data),

};

// 대시보드 관련 API
export const dashboardAPI = {
    // 기존 API 유지
    getStats: () => apiClient.get('/dashboard/stats'),
    getUsage: (period) => apiClient.get(`/dashboard/usage?period=${period}`),
    getRecentActivity: () => apiClient.get('/dashboard/activity'),

    // 로그 관련 API
    getLogs: (params) => {
        const { keyId, periodType = 'yearly', skip = 0, limit = 10 } = params;
        const queryParams = new URLSearchParams();
        if (keyId) queryParams.append('keyId', keyId);
        queryParams.append('periodType', periodType);
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);

        console.log('📊 로그 조회 API 호출:', { keyId, periodType, skip, limit });
        return apiClient.get(`/dashboard/statistics/logs?${queryParams.toString()}`);
    },

    // 통계 요청 API
    getRequestsStats: (periodType) => {
        console.log('📊 통계 요청 API 호출:', { periodType });
        return apiClient.get(`/dashboard/statistics/requests?periodType=${periodType}`);
    },

    // 새로운 통계 요약 API
    getStatisticsSummary: (keyId = null, periodType = 'yearly') => {
        const queryParams = new URLSearchParams();
        if (keyId) queryParams.append('keyId', keyId);
        queryParams.append('periodType', periodType);

        console.log('📊 통계 요약 API 호출:', { keyId, periodType });
        return apiClient.get(`/dashboard/statistics/summary?${queryParams.toString()}`);
    },

};

// 요금제 관련 API
export const billingAPI = {
    // 요금제 변경 (실제 API 스펙에 맞게 수정)
    changePlan: (userId, planName) => {
        console.log('💰 요금제 변경 API 호출:', { userId, planName });
        return apiClient.patch(`/dashboard/users/${userId}/plan`, {
            plan: planName.toLowerCase()
        });
    },
};

// 설정 관련 API
export const settingsAPI = {
    // 설정 조회
    getSettings: () => apiClient.get('/settings'),

    // 설정 업데이트
    updateSettings: (settings) => apiClient.put('/settings', settings),

    // 통합 설정
    getIntegrations: () => apiClient.get('/settings/integrations'),
    updateIntegrations: (integrations) => apiClient.put('/settings/integrations', integrations),
};

// 결제 관련 API
export const paymentAPI = {
    // 결제 승인
    confirmPayment: (paymentData) => {
        console.log('💳 결제 승인 API 호출 시작');
        console.log('📤 요청 데이터:', paymentData);
        console.log('🌐 API 엔드포인트: /payments/confirm');

        const response = apiClient.post('/payments/confirm', paymentData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 API 요청 전송 완료');
        return response;
    },

    // 구매내역 조회 (페이지네이션)
    getPaymentHistory: (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        console.log('💳 구매내역 조회 API 호출:', { page, limit, skip });
        const queryParams = new URLSearchParams();
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);
        return apiClient.get(`/payments/history?${queryParams.toString()}`);
    },
};

// 문의하기 관련 API
export const contactAPI = {
    // 문의하기 전송
    submitContact: (contactData) => {
        console.log('📧 문의하기 API 호출:', contactData);
        return apiClient.post('/contacts/', contactData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    },
}; 