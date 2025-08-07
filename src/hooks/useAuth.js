import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

// 전역 초기화 상태 관리 (모든 useAuth 인스턴스가 공유)
let globalInitializationPromise = null;
let globalInitializationCompleted = false;

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

    // persist 상태 복원 후 초기화 (전역 상태로 관리)
    const isInitializedRef = useRef(false);

    useEffect(() => {
        // 이미 전역적으로 초기화가 완료되었으면 스킵
        if (globalInitializationCompleted) {
            console.log('✅ 전역 초기화 완료 상태 - 스킵');
            return;
        }

        // 이미 초기화가 진행 중인지 확인
        if (globalInitializationPromise) {
            console.log('⏳ 전역 초기화 진행 중 - 대기');
            return;
        }

        // 이미 이 컴포넌트에서 초기화했는지 확인
        if (isInitializedRef.current) {
            console.log('✅ 로컬 초기화 완료 - 스킵');
            return;
        }

        isInitializedRef.current = true;

        // persist 상태가 복원된 후에만 초기화 실행
        const timer = setTimeout(async () => {
            console.log('🚀 useAuth 전역 초기화 시작');

            // 전역 초기화 진행 중임을 표시
            globalInitializationPromise = initialize();

            try {
                await globalInitializationPromise;

                // 초기화 후 토큰 유효성 체크
                const { checkTokenValidity, autoLogoutIfExpired } = useAuthStore.getState();
                const validity = checkTokenValidity();

                if (!validity.isValid) {
                    console.log('⚠️ 초기화 중 토큰 무효화 감지:', validity.reason);
                    const wasLoggedOut = autoLogoutIfExpired();
                    if (wasLoggedOut) {
                        console.log('🔄 초기화 중 자동 로그아웃 완료');
                    }
                } else {
                    console.log('✅ 초기화 시 토큰 유효함');
                }

                console.log('✅ useAuth 전역 초기화 완료');
                globalInitializationCompleted = true;
            } catch (error) {
                console.error('❌ useAuth 전역 초기화 실패:', error);
            } finally {
                // 초기화 완료 후 참조 정리
                globalInitializationPromise = null;
            }
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 활동 시간 자동 업데이트 (5분마다)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            updateActivity();
        }, 5 * 60 * 1000); // 5분

        return () => clearInterval(interval);
    }, [isAuthenticated, updateActivity]); // updateActivity 의존성 추가

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
    }, [isAuthenticated, checkSessionExpiry]); // checkSessionExpiry 의존성 추가

    // 토큰 유효성 주기적 체크 (5분마다)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            const { checkTokenValidity, autoLogoutIfExpired } = useAuthStore.getState();
            const validity = checkTokenValidity();

            if (!validity.isValid) {
                console.log('⚠️ 주기적 체크 중 토큰 무효화 감지:', validity.reason);
                const wasLoggedOut = autoLogoutIfExpired();
                if (wasLoggedOut) {
                    console.log('🔄 주기적 체크 중 자동 로그아웃 완료');
                }
            }
        }, 5 * 60 * 1000); // 5분마다

        return () => clearInterval(interval);
    }, [isAuthenticated]);

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
    }, [isAuthenticated, token, refreshToken]);

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