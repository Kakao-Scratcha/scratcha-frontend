import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { paymentAPI } from '../../services/api';
import DataTable from './DataTable';

const PaymentHistoryTable = forwardRef(({ onLoadingChange, skipInitialLoad = false, initialData = null }, ref) => {
    const [paymentHistory, setPaymentHistory] = useState({
        data: [],
        total: 0,
        page: 1,
        size: 5,
        loading: false,
        error: null
    });

    // 현재 페이지를 별도로 추적
    const [currentPage, setCurrentPage] = useState(1);

    // 구매내역 로드 함수
    const loadPaymentHistory = useCallback(async (page = 1, limit = 20) => {
        setPaymentHistory(prev => ({ ...prev, loading: true, error: null }));
        setCurrentPage(page); // 현재 페이지 업데이트
        onLoadingChange?.(true); // 부모 컴포넌트에 로딩 시작 알림

        try {
            const response = await paymentAPI.getPaymentHistory(page, limit);
            console.log('💳 API 응답 데이터:', response.data);
            const { data, total, size } = response.data;

            console.log('💳 파싱된 데이터:', { data: data.length, total, requestedPage: page, size });

            setPaymentHistory({
                data,
                total,
                page: page, // 요청한 페이지 번호 사용
                size,
                loading: false,
                error: null
            });
            onLoadingChange?.(false); // 부모 컴포넌트에 로딩 완료 알림
        } catch (error) {
            console.error('구매내역 로드 오류:', error);
            setPaymentHistory(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.detail || '구매내역을 불러오는데 실패했습니다.'
            }));
            onLoadingChange?.(false); // 부모 컴포넌트에 로딩 완료 알림
        }
    }, [onLoadingChange]);

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        console.log('💳 페이지 변경 요청:', { page, currentPage });
        loadPaymentHistory(page, paymentHistory.size);
    };

    // 부모 컴포넌트에서 호출할 수 있는 메서드들을 노출
    useImperativeHandle(ref, () => ({
        loadPaymentHistory
    }));

    // 초기 데이터 로드
    useEffect(() => {
        if (initialData) {
            // 외부에서 전달받은 데이터 사용
            console.log('💳 외부에서 전달받은 구매내역 데이터 사용:', initialData);
            setPaymentHistory({
                data: initialData.data || [],
                total: initialData.total || 0,
                page: 1,
                size: initialData.size || 20,
                loading: false,
                error: null
            });
        } else if (!skipInitialLoad) {
            loadPaymentHistory(1, 20);
        }
    }, [skipInitialLoad, loadPaymentHistory, initialData]);

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';

            return date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    // 금액 포맷팅 함수
    const formatAmount = (amount) => {
        if (!amount) return '0원';
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    };

    // 상태별 색상 클래스
    const getStatusClass = (status) => {
        switch (status) {
            case 'DONE':
                return 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300';
            case 'CANCELED':
                return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300';
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // 상태 한글 변환
    const getStatusText = (status) => {
        switch (status) {
            case 'DONE':
                return '완료';
            case 'CANCELED':
                return '취소';
            case 'PENDING':
                return '대기';
            default:
                return status;
        }
    };

    // 총 페이지 수 계산
    const totalPages = Math.ceil(paymentHistory.total / paymentHistory.size);

    // 테이블 컬럼 정의
    const paymentColumns = [
        {
            key: 'orderId',
            title: '주문번호',
            align: 'left',
            className: 'font-mono',
            minWidth: '200px'
        },
        {
            key: 'orderName',
            title: '상품명',
            align: 'left',
            minWidth: '120px'
        },
        {
            key: 'method',
            title: '결제방법',
            align: 'left',
            minWidth: '100px'
        },
        {
            key: 'amount',
            title: '금액',
            align: 'right',
            className: 'font-semibold',
            minWidth: '100px',
            render: (payment) => formatAmount(payment.amount)
        },
        {
            key: 'status',
            title: '상태',
            align: 'center',
            minWidth: '80px',
            render: (payment) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                    {getStatusText(payment.status)}
                </span>
            )
        },
        {
            key: 'createdAt',
            title: '주문일시',
            align: 'left',
            className: 'text-sm',
            minWidth: '140px',
            render: (payment) => formatDate(payment.createdAt)
        },
        {
            key: 'approvedAt',
            title: '승인일시',
            align: 'left',
            className: 'text-sm',
            minWidth: '140px',
            render: (payment) => formatDate(payment.approvedAt)
        }
    ];

    return (
        <DataTable
            title="구매 내역"
            subtitle={(() => {
                const total = paymentHistory.total || 0;
                const page = currentPage || 1;
                const size = paymentHistory.size || 20;

                if (total === 0) {
                    return '0개';
                }

                // 현재 페이지 기준으로 계산
                const start = (page - 1) * size + 1;
                const end = Math.min(page * size, total);

                return `${start}-${end} / ${total}개`;
            })()}
            columns={paymentColumns}
            data={paymentHistory.data}
            loading={paymentHistory.loading}
            error={paymentHistory.error}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            emptyMessage="구매내역이 없습니다."
        />
    );
});

export default PaymentHistoryTable;
