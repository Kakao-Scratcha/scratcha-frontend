import React from 'react';

export default function StatCard({
    title,
    value,
    change,
    changeType = 'neutral', // 'positive', 'negative', 'neutral'
    icon,
    color = 'blue'
}) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500'
    };

    const changeColorClasses = {
        positive: 'text-green-400 dark:text-green-300',
        negative: 'text-red-400 dark:text-red-300',
        neutral: 'text-gray-400 dark:text-gray-500'
    };

    return (
        <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-[Noto_Sans_KR]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            {change && (
                <p className={`text-sm mt-2 ${changeColorClasses[changeType]}`}>
                    {change}
                </p>
            )}
        </div>
    );
} 