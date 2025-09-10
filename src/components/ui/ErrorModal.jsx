import React from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

/**
 * 재사용 가능한 에러 모달 컴포넌트
 * API 호출 실패 시 에러 메시지와 재시도 버튼을 제공합니다.
 */
export default function ErrorModal({
    isOpen,
    onClose,
    onRetry,
    message,
    isRetrying = false,
    title = '오류 발생'
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            centerTitle
            hideClose
        >
            <div className="space-y-4">
                {/* 에러 아이콘 및 메시지 */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-red-700 text-sm leading-relaxed whitespace-pre-line">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isRetrying}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        닫기
                    </button>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            disabled={isRetrying}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isRetrying ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span>재시도 중...</span>
                                </>
                            ) : (
                                <span>다시 시도</span>
                            )}
                        </button>
                    )}
                </div>

                {/* 도움말 텍스트 */}
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        문제가 지속되면 잠시 후 다시 시도해주세요.
                    </p>
                </div>
            </div>
        </Modal>
    );
}