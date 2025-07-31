import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';

const THEMES = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
    { value: 'ocean', label: '오션' },
    { value: 'outline', label: '외곽선' },
];

export default function ThemeSelector() {
    const theme = useThemeStore(state => state.theme);
    const setTheme = useThemeStore(state => state.setTheme);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedTheme = THEMES.find(t => t.value === theme);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 rounded font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none flex items-center gap-2 min-w-[80px]"
                aria-label="테마 선택"
            >
                <span>{selectedTheme?.label}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[120px]">
                    <div className="py-1">
                        {THEMES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => {
                                    setTheme(t.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${t.value === theme
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'text-gray-900 dark:text-white'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 