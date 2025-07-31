import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 (토큰 추가)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 401 에러 시 토큰 제거
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default apiClient; 