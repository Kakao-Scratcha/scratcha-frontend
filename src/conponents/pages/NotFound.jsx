import React from 'react';
import { Link } from 'react-router-dom';
import useDarkModeStore from '../../stores/darkModeStore';

const NotFound = () => {
    const { isDark, toggle } = useDarkModeStore();

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* 다크모드 토글 버튼 */}
            <button
                onClick={toggle}
                className="absolute top-6 right-6 p-3 rounded-lg transition-all duration-200 hover:scale-110 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                title={isDark ? '라이트모드로 전환' : '다크모드로 전환'}
            >
                {isDark ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m6.01-6.01l.707-.707m12.728 12.728l.707.707M6.01 6.01l-.707-.707m12.728-12.728l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>

            <div className="text-center px-4">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                        404
                    </h1>
                    <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                        페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
                        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                    >
                        홈으로 돌아가기
                    </Link>

                    <div className="mt-6">
                        <Link
                            to="/about"
                            className="inline-block px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:underline mr-4 text-blue-600 dark:text-blue-400"
                        >
                            소개
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-block px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:underline text-blue-600 dark:text-blue-400"
                        >
                            문의하기
                        </Link>
                    </div>
                </div>
            </div>

            {/* 폰트 정보 UI */}
            <div className="absolute bottom-6 left-6 p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <div className="text-sm">
                    <div className="font-bold mb-2">현재 폰트 정보</div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div>폰트 패밀리: <span className="font-medium">Noto Sans KR</span></div>
                        <div>폰트 웨이트: <span className="font-medium">400 (Regular)</span></div>
                        <div>폰트 스타일: <span className="font-medium">Normal</span></div>
                        <div>폰트 디스플레이: <span className="font-medium">Swap</span></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            <div>사용 가능한 웨이트:</div>
                            <div className="font-light">Light (300)</div>
                            <div className="font-normal">Regular (400)</div>
                            <div className="font-medium">Medium (500)</div>
                            <div className="font-semibold">SemiBold (600)</div>
                            <div className="font-bold">Bold (700)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 