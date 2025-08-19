import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, hideClose = false, centerTitle = false, borderless = false, titleClassName = 'text-xl', headerClassName = 'p-6', bodyClassName = 'p-6' }) {
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
                className="absolute inset-0 theme-modal-overlay"
                onClick={onClose}
            ></div>

            {/* 모달 컨텐츠 */}
            <div className={`relative rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border theme-modal-border ${borderless ? '' : 'border'}`}>
                {/* 헤더 */}
                <div className={`flex items-center ${centerTitle ? 'justify-center' : 'justify-between'} ${headerClassName} ${borderless ? '' : 'border-b theme-modal-border'}`}>
                    <h2 className={`${titleClassName} font-semibold text-gray-900 dark:text-white`}>{title}</h2>
                    {!hideClose && !centerTitle && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="닫기"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* 바디 */}
                <div className={`${bodyClassName}`}>
                    {children}
                </div>
            </div>
        </div>
    );
} 