import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const { checkTokenValidity, autoLogoutIfExpired } = useAuthStore();

    // 페이지 이동 시 토큰 유효성 체크
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            const validity = checkTokenValidity();

            if (!validity.isValid) {
                const wasLoggedOut = autoLogoutIfExpired();
                if (wasLoggedOut) {
                    // 자동 로그아웃 완료
                }
            }
        }
    }, [isAuthenticated, isLoading, location.pathname, checkTokenValidity, autoLogoutIfExpired]);

    // 로딩 중일 때는 로딩 표시
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center theme-layout-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-blue-600 dark:border-blue-400"></div>
                    <p className="theme-text-primary">
                        인증 확인 중...
                    </p>
                </div>
            </div>
        );
    }

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // 로그인된 경우 자식 컴포넌트 렌더링
    return children;
} 