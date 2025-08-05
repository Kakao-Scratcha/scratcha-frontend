import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../hooks/useAuth';
import { useDevModeStore } from '../../stores/devModeStore';

export default function DashboardHeader() {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userDropdownRef = useRef(null);
    const navigate = useNavigate();

    const isDevMode = useDevModeStore(state => state.isDevMode);
    const toggleDevMode = useDevModeStore(state => state.toggleDevMode);

    const {
        isAuthenticated,
        logout,
        getUserDisplayName,
        getUserInitial
    } = useAuth();

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setIsUserDropdownOpen(false);
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleMainPageClick = () => {
        setIsUserDropdownOpen(false);
        navigate('/');
    };

    return (
        <header className="w-full sticky z-40 transition-all duration-200 top-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 relative">
                {/* 좌측: 로고 */}
                <div className="flex items-center">
                    <Logo showText={true} />
                </div>

                {/* 중앙: 타이틀 */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                </div>

                {/* 우측 영역 */}
                <div className="flex gap-3 items-center">
                    {/* 모드 전환 UI */}
                    <button
                        onClick={toggleDevMode}
                        className={`px-4 py-2 rounded font-semibold border focus:outline-none flex items-center gap-2 min-w-[90px] ${isDevMode ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'} border-gray-200 dark:border-gray-600`}
                        aria-label="모드 전환"
                    >
                        {isDevMode ? '개발 모드' : '일반 모드'}
                    </button>

                    {/* 사용자 정보 */}
                    {isAuthenticated && (
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center gap-1 px-2 py-1 rounded font-semibold border transition bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-500 h-10"
                            >
                                <div className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {getUserInitial()}
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* 사용자 드롭다운 메뉴 */}
                            {isUserDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 border rounded-lg shadow-lg z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {getUserInitial()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {getUserDisplayName().split('@')[0]}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {getUserDisplayName()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={handleMainPageClick}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            메인화면
                                        </button>
                                        {/* 대시보드 버튼은 대시보드 페이지에서 숨김 */}

                                        <button
                                            onClick={() => {
                                                setIsUserDropdownOpen(false);
                                                navigate('/dashboard/app');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            APP 관리
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-red-50 hover:text-red-600 transition text-gray-900 dark:text-white"
                                            disabled={isLoggingOut}
                                        >
                                            {isLoggingOut ? (
                                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8 0 004.644 9m0 0H9m11 11v-5h-.581m-15.356 0A8.001 8 0 0019.356 9m0 0H14m-2-2V4.644M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            )}
                                            로그아웃
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
} 