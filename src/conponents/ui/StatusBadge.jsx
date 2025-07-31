import React from 'react';

export default function StatusBadge({
    status,
    size = "sm",
    showIcon = false
}) {
    const statusConfig = {
        active: {
            label: '활성',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: '●'
        },
        inactive: {
            label: '비활성',
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: '○'
        },
        pending: {
            label: '대기중',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: '◐'
        },
        error: {
            label: '오류',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: '✕'
        },
        success: {
            label: '성공',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: '✓'
        }
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
        <span className={`inline-flex items-center gap-1 border rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
            {showIcon && <span className="text-xs">{config.icon}</span>}
            {config.label}
        </span>
    );
} 