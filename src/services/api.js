import apiClient from '../config/api';

// 인증 관련 API
export const authAPI = {
    // 로그인 (OAuth2 형식)
    login: (credentials) => {
        console.log('📤 로그인 API 요청 데이터:', credentials);

        const formData = new URLSearchParams();
        formData.append('grant_type', '');
        formData.append('username', credentials.email); // email을 username으로 전송
        formData.append('password', credentials.password);
        formData.append('scope', '');
        formData.append('client_id', '');
        formData.append('client_secret', '');

        console.log('📋 OAuth2 형식으로 변환된 데이터:', formData.toString());

        return apiClient.post('/api/dashboard/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    },

    // 회원가입
    signup: (userData) => apiClient.post('/api/dashboard/users/signup', userData),

    // 로그아웃
    logout: () => apiClient.post('/api/dashboard/auth/logout'),

    // 토큰 갱신
    refreshToken: () => apiClient.post('/api/dashboard/auth/refresh'),

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

// 관리자 사용자 관련 API
export const adminUserAPI = {
    // 모든 사용자 조회
    getAllUsers: () => apiClient.get('/api/dashboard/users/admin/all'),

    // 특정 사용자 조회
    getUserById: (userId, includeDeleted = false) =>
        apiClient.get(`/api/dashboard/users/admin/${userId}?include_deleted=${includeDeleted}`),

    // 사용자 삭제
    deleteUserById: (userId) => apiClient.delete(`/api/dashboard/users/admin/${userId}`),

    // 사용자 복원
    restoreUser: (userId) => apiClient.post(`/api/dashboard/users/admin/${userId}/restore`),
};

// 애플리케이션 관련 API
export const applicationAPI = {
    // 모든 애플리케이션 조회
    getAllApplications: () => apiClient.get('/api/dashboard/applications/'),

    // 애플리케이션 생성
    createApplication: (data) => apiClient.post('/api/dashboard/applications/', data),

    // 특정 애플리케이션 조회
    getApplicationById: (appId) => apiClient.get(`/api/dashboard/applications/${appId}`),

    // 애플리케이션 업데이트
    updateApplication: (appId, data) => apiClient.put(`/api/dashboard/applications/${appId}`, data),

    // 애플리케이션 삭제
    deleteApplication: (appId) => apiClient.delete(`/api/dashboard/applications/${appId}`),
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