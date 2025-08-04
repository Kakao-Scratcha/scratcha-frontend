import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// API 기본 설정
const API_BASE_URL = import.meta.env.DEV
    ? '' // 개발 환경에서는 프록시 사용
    : (import.meta.env.VITE_API_URL || 'http://localhost:8001');

// Swagger 문서 경로
export const SWAGGER_URL = import.meta.env.DEV
    ? '/docs'
    : `${API_BASE_URL}/docs`;
export const REDOC_URL = import.meta.env.DEV
    ? '/redoc'
    : `${API_BASE_URL}/redoc`;

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

        // 401 에러는 로그인 실패일 수도 있으므로 자동 로그아웃하지 않음
        // 개별 함수에서 필요한 경우에만 로그아웃 처리
        if (error.response?.status === 401) {
            console.log('🔒 401 인증 오류 - 자동 로그아웃하지 않음 (로그인 실패일 수 있음)');
        } else if (error.response?.status === 403) {
            console.log('🔒 403 Forbidden - 토큰은 있지만 권한 없음');
        } else if (error.response?.status === 404) {
            console.log('🔍 404 Not Found - API 엔드포인트 미구현');
        }

        return Promise.reject(error);
    }
);

export default apiClient; 