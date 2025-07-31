import apiClient from '../config/api';

// 인증 관련 API
export const authAPI = {
    // 로그인
    login: (credentials) => apiClient.post('/auth/login', credentials),

    // 회원가입
    signup: (userData) => apiClient.post('/auth/signup', userData),

    // 로그아웃
    logout: () => apiClient.post('/auth/logout'),

    // 토큰 갱신
    refreshToken: () => apiClient.post('/auth/refresh'),

    // 사용자 정보 조회
    getProfile: () => apiClient.get('/auth/profile'),
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