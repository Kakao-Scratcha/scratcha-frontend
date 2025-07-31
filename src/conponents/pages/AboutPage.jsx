import React from 'react';

export default function AboutPage() {
    return (
        <div className="min-h-screen font-[Noto_Sans_KR] bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                        About Scratcha
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
                        AI가 해결할 수 없는 스크래치 캡차로 웹사이트를 안전하게 보호하는 혁신적인 솔루션입니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="p-8 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            우리의 미션
                        </h2>
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                            봇 공격으로부터 웹사이트를 보호하면서도 실제 사용자의 경험을 해치지 않는
                            스마트한 캡차 솔루션을 제공합니다. AI 기술이 발전함에 따라 기존 캡차의
                            한계를 극복하고, 사용자 친화적이면서도 강력한 보안을 구현합니다.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            핵심 가치
                        </h2>
                        <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                <span>사용자 경험 우선</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                <span>최신 보안 기술 적용</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                <span>지속적인 혁신</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                <span>고객 중심 서비스</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                        팀 소개
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-600 dark:bg-blue-500">
                                <span className="text-2xl font-bold text-white">
                                    👨‍💻
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                개발팀
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                최신 기술을 활용한 혁신적인 솔루션 개발
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-600 dark:bg-blue-500">
                                <span className="text-2xl font-bold text-white">
                                    🔒
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                보안팀
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                강력한 보안 시스템 구축 및 유지보수
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-600 dark:bg-blue-500">
                                <span className="text-2xl font-bold text-white">
                                    🎨
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                디자인팀
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                사용자 친화적인 인터페이스 설계
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 