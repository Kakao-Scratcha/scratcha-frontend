import React from 'react';

export default function MainPage() {
    return (
        <div className="min-h-screen font-[Noto_Sans_KR] bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* 히어로 섹션 */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
                            스크래치 캡차
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
                            AI가 해결할 수 없는 스크래치 캡차로 봇을 차단하고,
                            실제 사용자만 접근할 수 있도록 보호하세요.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 font-bold rounded-lg text-lg hover:opacity-90 transition bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
                                무료로 시작하기
                            </button>
                            <button className="px-8 py-4 border font-bold rounded-lg text-lg hover:opacity-90 transition border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                데모 보기
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 특징 섹션 */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
                        왜 스크래치 캡차인가요?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-600 dark:bg-blue-500">
                                <svg 
                                    className="w-8 h-8 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                AI 방지
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                최신 AI 기술로도 해결할 수 없는 고급 스크래치 캡차
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-600 dark:bg-blue-500">
                                <svg 
                                    className="w-8 h-8 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                빠른 속도
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                평균 1.2초의 빠른 응답 시간으로 사용자 경험 향상
                            </p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-600 dark:bg-blue-500">
                                <svg 
                                    className="w-8 h-8 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                보안 강화
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                99.8%의 정확도로 봇을 차단하고 실제 사용자만 허용
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
} 