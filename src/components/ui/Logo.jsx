import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ className = "" }) {
    return (
        <Link
            to="/"
            className={`flex items-center px-4 py-2 transition-opacity duration-200 bg-transparent hover:opacity-80 ${className}`}
        >
            <img
                src="/images/scratchalogo.svg"
                alt="Scratcha"
                className="h-12 w-auto dark:brightness-0 dark:invert"
            />
        </Link>
    );
} 