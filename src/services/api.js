import apiClient from '../config/api';
import { useAuthStore } from '../stores/authStore';

// 인증 관련 API
export const authAPI = {
    // 로그인
    login: (credentials) => {
        console.log('📤 로그인 API 요청 데이터:', credentials);

        return apiClient.post('/api/dashboard/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },


    // 회원가입
    signup: (userData) => apiClient.post('/api/dashboard/users/signup', userData),

    // 사용자 정보 조회
    getProfile: () => {
        console.log('📞 getProfile API 호출');
        return apiClient.get('/api/dashboard/users/me');
    },

    // 사용자 정보 업데이트
    updateProfile: (data) => apiClient.patch('/api/dashboard/users/me', data),

    // 사용자 이름 변경
    updateUsername: (newUsername) => {
        console.log('📞 updateUsername API 호출:', { newUsername });
        return apiClient.patch('/api/dashboard/users/me', {
            userName: newUsername
        });
    },

    // 회원 탈퇴 (계정 소프트 삭제)
    deleteAccount: () => {
        console.log('📞 deleteAccount API 호출');
        return apiClient.delete('/api/dashboard/users/me');
    },

    // 사용자 삭제
    deleteUser: () => apiClient.delete('/api/dashboard/users/me'),
};

// 애플리케이션 관련 API
export const applicationAPI = {
    // 모든 애플리케이션 조회
    getAllApplications: () => {
        console.log('📱 애플리케이션 목록 조회 API 호출');
        return apiClient.get('/api/dashboard/applications/all');
    },

    // 애플리케이션 생성
    createApplication: (data) => {
        console.log('📱 애플리케이션 생성 API 호출:', data);
        return apiClient.post('/api/dashboard/applications/', data);
    },

    // 특정 애플리케이션 조회
    getApplicationById: (appId) => {
        console.log('📱 애플리케이션 조회 API 호출:', appId);
        return apiClient.get(`/api/dashboard/applications/${appId}`);
    },

    // 애플리케이션 업데이트
    updateApplication: (appId, data) => {
        console.log('📱 애플리케이션 업데이트 API 호출:', { appId, data });
        return apiClient.put(`/api/dashboard/applications/${appId}`, data);
    },

    // 애플리케이션 삭제
    deleteApplication: (appId) => {
        console.log('📱 애플리케이션 삭제 API 호출:', appId);
        return apiClient.delete(`/api/dashboard/applications/${appId}`);
    },

    // API 키 생성
    createApiKey: (appId, data) => {
        console.log('🔑 API 키 생성 API 호출:', { appId, data });
        return apiClient.post(`/api/dashboard/api-keys/?appId=${appId}&expiresPolicy=0`, data);
    },

    // API 키 삭제
    deleteApiKey: (keyId) => {
        console.log('🔑 API 키 삭제 API 호출:', { keyId });
        return apiClient.delete(`/api/dashboard/api-keys/${keyId}`);
    },

    // API 키 활성화/비활성화
    toggleApiKeyStatus: (keyId, isActive) => {
        const action = isActive ? 'activate' : 'deactivate';
        const endpoint = `/api/dashboard/api-keys/${keyId}/${action}`;
        const baseURL = apiClient.defaults.baseURL || '';
        const token = useAuthStore.getState().token || '';
        const authHeader = token && token.startsWith('Bearer ') ? token : (token ? `Bearer ${token}` : '');

        console.log('🔑 API 키 상태 변경 API 호출:', { keyId, isActive, endpoint, fullUrl: `${baseURL}${endpoint}` });
        console.log('🧪 재현용 curl:', `curl -X 'PUT' '${baseURL}${endpoint}' -H 'accept: application/json'${authHeader ? ` -H 'Authorization: ${authHeader}'` : ''}`);

        return apiClient.put(endpoint, null, { headers: { Accept: 'application/json' } });
    },
};

// 캡차 관련 API
export const captchaAPI = {
    // 캡차 생성
    create: (data) => apiClient.post('/captcha/create', data),

    // 캡차 검증
    verify: (data) => apiClient.post('/captcha/verify', data),

    // 캡차 통계
    getStats: () => apiClient.get('/captcha/stats'),

    // 캡차 설정
    getSettings: () => apiClient.get('/captcha/settings'),
    updateSettings: (settings) => apiClient.put('/captcha/settings', settings),
};

// 사용자 관련 API
export const userAPI = {
    // 사용자 정보 업데이트
    updateProfile: (data) => apiClient.put('/user/profile', data),

    // 비밀번호 변경
    changePassword: (data) => apiClient.put('/user/password', data),

    // 계정 삭제
    deleteAccount: () => apiClient.delete('/user/account'),
};

// 대시보드 관련 API
export const dashboardAPI = {
    // 대시보드 통계
    getStats: () => apiClient.get('/dashboard/stats'),

    // 사용량 통계
    getUsage: (period) => apiClient.get(`/dashboard/usage?period=${period}`),

    // 최근 활동
    getRecentActivity: () => apiClient.get('/dashboard/activity'),
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