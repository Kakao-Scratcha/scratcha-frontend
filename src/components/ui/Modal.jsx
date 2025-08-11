import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // 모달 열릴 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            // 모달 닫힐 때 body 스크롤 복원
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* 배경 오버레이 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* 모달 컨텐츠 */}
            <div className="relative rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        aria-label="닫기"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 바디 */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
} 