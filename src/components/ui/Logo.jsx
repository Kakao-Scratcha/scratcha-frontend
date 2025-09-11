import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import logo from '@/assets/images/scratchalogo.svg?w=200&h=60&format=webp&quality=90';

export default function Logo({ className = "" }) {
    return (
        <Link
            to="/"
            className={`flex items-center px-4 py-2 transition-opacity duration-200 bg-transparent hover:opacity-80 ${className}`}
        >
            <OptimizedImage
                src={logo}
                alt="Scratcha"
                className="h-12 w-auto dark:brightness-0 dark:invert"
                width={200}
                height={60}
            />
        </Link>
    );
} 