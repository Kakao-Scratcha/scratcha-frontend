import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthProvider({ children }) {
    const { initialize } = useAuth();

    useEffect(() => {
        // 앱 시작 시 인증 상태 초기화
        initialize();
    }, [initialize]);

    return <>{children}</>;
} 