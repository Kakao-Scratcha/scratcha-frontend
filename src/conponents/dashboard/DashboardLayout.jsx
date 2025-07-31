import React from 'react';

export default function DashboardLayout({
    title,
    subtitle,
    children,
    headerRight = null
}) {
    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">{subtitle}</p>
                </div>
                {headerRight}
            </div>

            {/* 컨텐츠 */}
            {children}
        </div>
    );
} 