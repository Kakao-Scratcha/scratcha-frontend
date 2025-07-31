import React from 'react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Contact Us</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        문의사항이 있으시면 언제든 연락주세요. 빠른 응답을 약속드립니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* 연락처 정보 */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">연락처 정보</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">이메일</h3>
                                        <p className="text-gray-600 dark:text-gray-400">support@scratcha.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">전화번호</h3>
                                        <p className="text-gray-600 dark:text-gray-400">02-1234-5678</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">주소</h3>
                                        <p className="text-gray-600 dark:text-gray-400">서울특별시 강남구 테헤란로 123</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">업무 시간</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-white">평일</span>
                                    <span className="text-gray-600 dark:text-gray-400">09:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-white">토요일</span>
                                    <span className="text-gray-600 dark:text-gray-400">09:00 - 13:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-white">일요일</span>
                                    <span className="text-gray-600 dark:text-gray-400">휴무</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 문의 폼 */}
                    <div className="p-8 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">문의하기</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">이름</label>
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
                                    placeholder="이름을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">이메일</label>
                                <input
                                    type="email"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
                                    placeholder="이메일을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">문의 유형</label>
                                <select className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded">
                                    <option>일반 문의</option>
                                    <option>기술 지원</option>
                                    <option>비즈니스 제휴</option>
                                    <option>버그 리포트</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">메시지</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
                                    placeholder="문의사항을 자세히 입력해주세요"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                            >
                                문의하기
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 