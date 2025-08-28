import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function UserInfo() {
    const { getUserDisplayName, user } = useAuth();

    // 사용자 이름/이메일: 서버 필드 우선순위 적용
    const primaryName = user?.userName ?? user?.username ?? user?.name ?? user?.email ?? '사용자';
    const userName = primaryName || getUserDisplayName();
    const userEmail = user?.email ?? user?.username ?? '';

    // 사용 요금제: 서버의 plan 필드 사용
    const userPlan = user?.plan || null;

    return (
        <div className="mb-8">
            <div className="font-semibold theme-text-primary break-all">{userEmail}</div>
            <div className="theme-text-secondary text-sm">
                {userPlan ? `${userPlan} · ${userName}` : userName}
            </div>
        </div>
    );
} 