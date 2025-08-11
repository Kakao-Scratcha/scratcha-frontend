import React from 'react';

export default function Card({
    children,
    className = "",
    padding = "p-6",
    title,
    subtitle
}) {
    return (
        <div 
            className={`rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${padding} ${className} `}
        >
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
} 