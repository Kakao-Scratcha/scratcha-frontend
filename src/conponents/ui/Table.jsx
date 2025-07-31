import React from 'react';

export default function Table({
    children,
    className = "",
    striped = false
}) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className={`w-full ${striped ? 'striped' : ''} font-[Noto_Sans_KR]`}>
                {children}
            </table>
        </div>
    );
}

export function TableHead({ children, className = "" }) {
    return (
        <thead className={className}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = "" }) {
    return (
        <tbody className={className}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = "", onClick }) {
    return (
        <tr
            className={`border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''} ${className} transition-colors`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

export function TableHeader({ children, className = "", align = "left" }) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return (
        <th 
            className={`py-3 px-4 font-medium text-gray-900 dark:text-white ${alignClasses[align]} ${className}`}
        >
            {children}
        </th>
    );
}

export function TableCell({ children, className = "", align = "left" }) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return (
        <td 
            className={`py-3 px-4 text-gray-900 dark:text-white ${alignClasses[align]} ${className}`}
        >
            {children}
        </td>
    );
} 