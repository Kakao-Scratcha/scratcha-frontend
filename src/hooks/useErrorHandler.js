import { useState, useCallback } from 'react';

/**
 * 재사용 가능한 에러 처리 훅
 * API 호출 실패 시 에러 모달을 표시하고 재시도 기능을 제공합니다.
 */
export const useErrorHandler = () => {
    const [errorState, setErrorState] = useState({
        isOpen: false,
        message: '',
        operation: '',
        onRetry: null
    });


    /**
     * 재시도 실행 (페이지 리로드)
     */
    const handleRetry = useCallback(async () => {
        // 즉시 페이지 리로드
        window.location.reload();
    }, []);

    /**
     * 에러 발생 시 호출하는 함수
     * @param {Error} error - 발생한 에러 객체
     * @param {string} operation - 수행하려던 작업명
     */
    const handleError = useCallback((error, operation) => {
        console.error(`❌ ${operation} 실패:`, error);

        // 이미 에러 모달이 열려있으면 새로운 에러는 무시 (통합 에러 모달)
        setErrorState(prevState => {
            if (prevState.isOpen) {
                console.log('이미 에러 모달이 표시 중입니다. 새로운 에러는 무시합니다.');
                return prevState;
            }

            // 통일된 사용자 친화적 에러 메시지 (2줄로 분리)
            const errorMessage = '데이터를 불러오는데 실패했습니다.\n잠시 후 다시 시도해주세요.';
            const errorTitle = '데이터 로드 실패';

            return {
                isOpen: true,
                message: errorMessage,
                title: errorTitle,
                operation,
                onRetry: handleRetry // 항상 페이지 리로드로 재시도
            };
        });
    }, [handleRetry]);

    /**
     * 에러 모달 닫기
     */
    const closeError = useCallback(() => {
        setErrorState({
            isOpen: false,
            message: '',
            operation: '',
            onRetry: null
        });
    }, []);

    /**
     * API 호출을 래핑하는 함수 (자동 에러 처리)
     * @param {Function} apiCall - API 호출 함수
     * @param {string} operation - 작업명
     * @param {Function} onSuccess - 성공 시 콜백
     * @param {boolean} throwError - 에러를 다시 throw할지 여부 (기본값: false)
     */
    const executeWithErrorHandling = useCallback(async (apiCall, operation, onSuccess = null, throwError = false) => {
        try {
            console.log(`🔍 API 호출 시작: ${operation}`);
            const result = await apiCall();
            console.log(`✅ API 호출 성공: ${operation}`, result);
            if (onSuccess) {
                onSuccess(result);
            }
            return result;
        } catch (error) {
            console.log(`❌ API 호출 실패: ${operation}`, error);
            handleError(error, operation); // 페이지 리로드로 재시도
            if (throwError) {
                throw error;
            }
            // 에러 발생 시 onSuccess 콜백을 호출하지 않고 null 반환
            return null;
        }
    }, [handleError]);

    /**
     * 여러 API 호출을 모두 성공해야만 완료되는 함수
     * @param {Array} apiCalls - API 호출 배열 [{apiCall, operation, onSuccess}]
     * @returns {Promise<boolean>} - 모든 API가 성공하면 true, 하나라도 실패하면 false
     */
    const executeAllWithErrorHandling = useCallback(async (apiCalls) => {
        const results = await Promise.allSettled(
            apiCalls.map(({ apiCall, operation, onSuccess }) =>
                executeWithErrorHandling(apiCall, operation, onSuccess, false)
            )
        );

        // 모든 API가 성공했는지 확인
        const allSuccessful = results.every(result =>
            result.status === 'fulfilled'
        );

        // 디버깅을 위한 로그 (쿠버네티스 환경 문제 해결용)
        console.log('🔍 executeAllWithErrorHandling 결과:', {
            allSuccessful,
            results: results.map((result, index) => ({
                index,
                status: result.status,
                value: result.value,
                reason: result.reason
            }))
        });

        // 하나라도 실패하면 에러 모달 표시 (페이지 리로드로 재시도)
        if (!allSuccessful) {
            handleError(new Error('일부 API 호출이 실패했습니다.'), '데이터 로드');
        }

        return allSuccessful;
    }, [executeWithErrorHandling, handleError]);

    return {
        errorState,
        handleError,
        closeError,
        handleRetry,
        executeWithErrorHandling,
        executeAllWithErrorHandling
    };
};

export default useErrorHandler;
