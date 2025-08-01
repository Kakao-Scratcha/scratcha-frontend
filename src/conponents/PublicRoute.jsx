import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    // 로딩 중일 때는 로딩 표시
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-gray-900 dark:text-white">
                        인증 확인 중...
                    </p>
                </div>
            </div>
        );
    }

    // 로그인된 경우 메인 페이지로 리다이렉트
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // 로그인하지 않은 경우 자식 컴포넌트 렌더링
    return children;
} 