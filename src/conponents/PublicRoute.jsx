import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();

    // PublicRoute에서는 리다이렉트하지 않고
    // 각 페이지 컴포넌트에서 자체적으로 처리하도록 함
    // (성공 모달 표시 후 navigate 처리)

    return children;
} 