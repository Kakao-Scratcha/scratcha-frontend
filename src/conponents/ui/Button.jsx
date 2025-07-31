import React from 'react';

export default function Button({
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    className = "",
    onClick,
    type = "button"
}) {
    const baseClasses = "font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 font-[Noto_Sans_KR]";

    const getVariantClasses = (variant) => {
        switch (variant) {
            case "primary":
                return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600";
            case "secondary":
                return "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700";
            case "danger":
                return "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
            case "success":
                return "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500";
            default:
                return "";
        }
    };

    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${getVariantClasses(variant)} ${sizes[size]} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
} 