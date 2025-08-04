import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function UserInfo() {
    const { getUserDisplayName, isAdmin, user } = useAuth();

    const userName = getUserDisplayName();
    const userDisplayName = user?.username || '사용자';
    const userPlan = 'Pro';
    const isUserAdmin = isAdmin();

    return (
        <div className="mb-8">
            <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {userName}
                {isUserAdmin && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                        관리자
                    </span>
                )}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
                {userPlan} · {userDisplayName}
            </div>
        </div>
    );
} 