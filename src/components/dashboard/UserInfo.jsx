import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStore } from '../../stores/dashboardStore';

export default function UserInfo() {
    const { getUserDisplayName, user } = useAuth();
    const { currentPlan } = useDashboardStore();

    // 사용자 이름/이메일: 서버 필드 우선순위 적용
    const primaryName = user?.userName ?? user?.username ?? user?.name ?? user?.email ?? '사용자';
    const userName = primaryName || getUserDisplayName();
    const userEmail = user?.email ?? user?.username ?? '';

    // 사용 요금제: 대시보드 스토어의 현재 플랜 우선
    const userPlan = currentPlan?.name || user?.planName || user?.subscription?.planName || null;

    return (
        <div className="mb-8">
            <div className="font-semibold text-gray-900 dark:text-gray-100 break-all">{userEmail}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
                {userPlan ? `${userPlan} · ${userName}` : userName}
            </div>
        </div>
    );
} 