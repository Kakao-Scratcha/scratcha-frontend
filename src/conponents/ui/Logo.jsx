import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ showText = true, className = "" }) {
    return (
        <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200  bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
        >
            <img
                src="/scratchalogo.png"
                alt="Scratcha"
                className="h-8 w-auto"
            />
            {showText && (
                <span className="font-bold text-lg hidden sm:block">
                    Scratcha
                </span>
            )}
        </Link>
    );
} 