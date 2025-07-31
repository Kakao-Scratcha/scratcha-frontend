import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
    return (
        <nav className="hidden md:flex gap-6 font-medium  text-gray-900 dark:text-white">
            <Link
                to="/overview"
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
                개요
            </Link>
            <Link
                to="/pricing"
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
                요금제
            </Link>
            <Link
                to="/demo"
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
                데모
            </Link>
            <Link
                to="/about"
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
                회사소개
            </Link>
            <Link
                to="/contact"
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
                문의
            </Link>
        </nav>
    );
} 