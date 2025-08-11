import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScratchDemo from '../ui/ScratchDemo';
import DemoInfo from '../ui/DemoInfo';

export default function Demo() {
    const [isScratching, setIsScratching] = useState(false);
    const [scratchProgress, setScratchProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleScratchStart = () => {
        setIsScratching(true);
        setScratchProgress(0);
        setIsCompleted(false);
    };

    const handleScratchMove = () => {
        if (isScratching && scratchProgress < 100) {
            setScratchProgress(prev => Math.min(prev + 10, 100));
        }
    };

    const handleScratchEnd = () => {
        setIsScratching(false);
        if (scratchProgress >= 100) {
            setIsCompleted(true);
        }
    };

    const resetDemo = () => {
        setIsScratching(false);
        setScratchProgress(0);
        setIsCompleted(false);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto px-4 py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        데모 체험
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Scratcha 캡차의 실제 동작을 직접 체험해보세요
                    </p>
                </div>

                {/* Demo Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Interactive Demo */}
                    <ScratchDemo
                        scratchProgress={scratchProgress}
                        onScratchStart={handleScratchStart}
                        onScratchMove={handleScratchMove}
                        onScratchEnd={handleScratchEnd}
                    />

                    {/* Info Section */}
                    <DemoInfo isCompleted={isCompleted} />
                </div>

                {/* Controls */}
                <div className="text-center">
                    <button
                        onClick={resetDemo}
                        className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition mr-4"
                    >
                        다시 시작
                    </button>
                    <Link
                        to="/signup"
                        className="inline-block bg-transparent border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white font-bold py-3 px-8 rounded-lg transition"
                    >
                        지금 시작하기
                    </Link>
                </div>

                {/* Features */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">주요 특징</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center">
                            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">정확한 검증</h3>
                            <p className="text-gray-600 dark:text-gray-400">AI가 해결할 수 없는 강력한 보안 시스템</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center">
                            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">📱</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">모바일 친화적</h3>
                            <p className="text-gray-600 dark:text-gray-400">터치 기반의 직관적인 사용자 경험</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center">
                            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">빠른 응답</h3>
                            <p className="text-gray-600 dark:text-gray-400">실시간 검증으로 즉시 결과 확인</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 