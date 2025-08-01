import React from 'react';

export default function ScratchDemo({
    scratchProgress,
    onScratchStart,
    onScratchMove,
    onScratchEnd
}) {
    return (
        <div className="p-8 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                스크래치 캡차 체험
            </h2>

            <div className="mb-6">
                <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {/* Scratch Area */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                        style={{
                            clipPath: `polygon(0 0, ${scratchProgress}% 0, ${scratchProgress}% 100%, 0 100%)`,
                            transition: 'clip-path 0.1s ease-out'
                        }}
                    >
                        <div className="text-white text-center">
                            <div className="text-4xl mb-2">🎯</div>
                            <div className="text-lg font-bold">스크래치 영역</div>
                            <div className="text-sm opacity-80">마우스로 이 영역을 스크래치하세요</div>
                        </div>
                    </div>

                    {/* Scratch Overlay */}
                    <div
                        className="absolute inset-0 bg-gray-800 dark:bg-gray-900 cursor-crosshair"
                        onMouseDown={onScratchStart}
                        onMouseMove={onScratchMove}
                        onMouseUp={onScratchEnd}
                        onMouseLeave={onScratchEnd}
                        style={{
                            clipPath: `polygon(${scratchProgress}% 0, 100% 0, 100% 100%, ${scratchProgress}% 100%)`,
                            transition: 'clip-path 0.1s ease-out'
                        }}
                    />
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>진행률</span>
                    <span>{scratchProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scratchProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
} 