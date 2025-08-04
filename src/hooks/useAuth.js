import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        lastActivity,
        login,
        signup,
        logout,
        getProfile,
        updateUser,
        refreshToken,
        updateActivity,
        checkSessionExpiry,
        hasPermission,
        hasRole,
        clearError,
        initialize,
        getAuthInfo,
    } = useAuthStore();

    // persist 상태 복원 후 초기화 (한 번만 실행)
    useEffect(() => {
        let isInitialized = false;

        const initAuth = () => {
            if (isInitialized) return;
            isInitialized = true;

            // persist 상태가 복원된 후에만 초기화 실행
            const timer = setTimeout(() => {
                console.log('🚀 useAuth 초기화 시작');
                initialize();
            }, 200); // persist 복원 대기 시간 증가

            return () => clearTimeout(timer);
        };

        return initAuth();
    }, []); // initialize 의존성 제거

    // 활동 시간 자동 업데이트 (5분마다)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            updateActivity();
        }, 5 * 60 * 1000); // 5분

        return () => clearInterval(interval);
    }, [isAuthenticated, updateActivity]);

    // 세션 만료 체크 (1시간마다)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            const isExpired = checkSessionExpiry();
            if (isExpired) {
                // 세션이 만료되어 자동 로그아웃됩니다.
            }
        }, 60 * 60 * 1000); // 1시간

        return () => clearInterval(interval);
    }, [isAuthenticated, checkSessionExpiry]);

    // 토큰 자동 갱신 (토큰 만료 10분 전) - 백엔드 미구현으로 비활성화
    const autoRefreshToken = useCallback(async () => {
        if (!isAuthenticated || !token) return;

        try {
            // 토큰 만료 시간 확인 (JWT 토큰의 경우)
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = tokenPayload.exp * 1000; // 밀리초로 변환
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // 만료 10분 전에 갱신 (백엔드 미구현으로 주석 처리)
            if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
                console.log('⚠️ 토큰 만료 임박 (백엔드 갱신 API 미구현)');
                // await refreshToken(); // 백엔드 미구현으로 비활성화
            }
        } catch (error) {
            console.log('⚠️ 토큰 자동 갱신 실패 (백엔드 미구현):', error.message);
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // 백엔드 미구현으로 토큰 자동 갱신 비활성화
        // const interval = setInterval(autoRefreshToken, 5 * 60 * 1000); // 5분마다 체크
        // return () => clearInterval(interval);
    }, [isAuthenticated, autoRefreshToken]);

    return {
        // 상태
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        lastActivity,

        // 기본 액션
        login,
        signup,
        logout,
        getProfile,
        clearError,
        initialize,

        // 확장된 액션
        updateUser,
        refreshToken,
        updateActivity,
        checkSessionExpiry,
        hasPermission,
        hasRole,
        getAuthInfo,

        // 유틸리티 함수
        isAdmin: () => hasRole('admin'),
        isUser: () => hasRole('user'),
        canManageApps: () => hasPermission('manage_apps'),
        canViewBilling: () => hasPermission('view_billing'),
        canManageUsers: () => hasPermission('manage_users'),

        // 사용자 정보 헬퍼
        getUserDisplayName: () => {
            if (!user) return '사용자';
            return user.name || user.email || '사용자';
        },

        getUserInitial: () => {
            if (!user) return 'U';
            return (user.name || user.email || 'U').charAt(0).toUpperCase();
        },

        // 세션 정보
        getSessionInfo: () => {
            if (!lastActivity) return null;

            const lastActivityTime = new Date(lastActivity);
            const now = new Date();
            const diffInMinutes = Math.floor((now - lastActivityTime) / (1000 * 60));

            return {
                lastActivity: lastActivityTime,
                minutesSinceLastActivity: diffInMinutes,
                isActive: diffInMinutes < 30, // 30분 이내 활동이면 활성
            };
        },
    };
}; 