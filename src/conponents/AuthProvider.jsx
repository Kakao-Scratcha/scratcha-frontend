import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthProvider({ children }) {
    // useAuth 훅에서 이미 초기화를 처리하므로 여기서는 제거
    return <>{children}</>;
} 