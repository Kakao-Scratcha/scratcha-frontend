import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// 쿠버네티스 환경에서 동적 API URL 설정
const getApiBaseUrl = () => {
    // 1. 환경 변수 우선 (배포 시 설정)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. 개발 환경에서 동적 감지
    if (import.meta.env.DEV) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = '8001';
        return `${protocol}//${hostname}:${port}`;
    }

    // 3. 프로덕션에서 상대 경로 사용
    return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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
        // Zustand store에서 토큰 가져오기
        const token = useAuthStore.getState().token;
        console.log('🔍 API 요청 토큰 확인:', {
            hasToken: !!token,
            tokenType: token ? (token.startsWith('Bearer ') ? 'Bearer' : 'Raw') : 'None',
            tokenPreview: token ? token.substring(0, 50) + '...' : 'None',
            url: config.url,
            method: config.method
        });

        if (token) {
            // 토큰이 이미 "Bearer " 형식인지 확인 (HTTP 표준)
            let authHeader;
            if (token.startsWith('Bearer ')) {
                authHeader = token;
            } else {
                authHeader = `Bearer ${token}`;
            }

            config.headers.Authorization = authHeader;
            console.log('✅ Authorization 헤더 설정:', authHeader.substring(0, 50) + '...');
            console.log('🔍 전체 Authorization 헤더:', authHeader);
        } else {
            console.log('⚠️ 토큰이 없어 Authorization 헤더를 설정하지 않음');
        }

        console.log('📤 API 요청 전송:', {
            url: config.url,
            fullUrl: `${config.baseURL}${config.url}`,
            method: config.method,
            headers: {
                ...config.headers,
                Authorization: config.headers.Authorization ?
                    config.headers.Authorization.substring(0, 50) + '...' : 'None'
            }
        });

        return config;
    },
    (error) => {
        console.error('❌ API 요청 인터셉터 오류:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API 응답 성공:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ API 응답 오류:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });

        return Promise.reject(error);
    }
);

export default apiClient; 