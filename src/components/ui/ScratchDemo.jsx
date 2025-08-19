import React from 'react';

export default function ScratchDemo({
    scratchProgress,
    onScratchStart,
    onScratchMove,
    onScratchEnd
}) {
    return (
        <div className="p-8 rounded-2xl theme-card">
            <h2 className="text-2xl font-bold theme-text-primary mb-6 text-center">
                스크래치 캡차 체험
            </h2>

            <div className="mb-6">
                <div className="relative w-full h-64 theme-layout-secondary rounded-lg overflow-hidden">
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
                        className="absolute inset-0 theme-layout-dark cursor-crosshair"
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
                <div className="flex justify-between text-sm theme-text-secondary mb-2">
                    <span>진행률</span>
                    <span>{scratchProgress}%</span>
                </div>
                <div className="w-full theme-layout-secondary rounded-full h-2">
                    <div
                        className="theme-blue-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scratchProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
} 