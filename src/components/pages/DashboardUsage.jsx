import React, { useState, useEffect, useRef, useMemo } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import UsageChart from '../ui/UsageChart';
import MultiAppUsageChart from '../ui/MultiAppUsageChart';
import LoadingSpinner from '../ui/LoadingSpinner';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import ErrorModal from '../ui/ErrorModal';
import { useDashboardStore } from '../../stores/dashboardStore';
import useErrorHandler from '../../hooks/useErrorHandler';

export default function DashboardUsage() {
    // Typography scale for consistency with Overview
    const T = {
        sectionTitle: 'text-lg font-semibold',
        label: 'text-sm'
    };

    // 에러 처리 훅 (투트랙 시스템)
    const { errorState, closeError, handleRetry, executeAllWithErrorHandling } = useErrorHandler();

    // 액션별 에러 모달 상태 (개별 에러 처리용)
    const [_errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    const {
        apps,
        apiKeys,
        setPeriod: setGlobalPeriod,
        // API 로그 관련 상태 추가
        logs,
        loadAllLogs,
        loadLogsByKeyId,
        changeLogPage,
        refreshApplications,
        loadStatisticsSummary,
        loadMultiAppStatistics,
        isLoading
    } = useDashboardStore();

    const [selectedAppId, setSelectedAppId] = useState('all');
    const [selectedApiKeyId, setSelectedApiKeyId] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 초기 로드 여부를 추적하는 ref
    const isInitialLoad = useRef(true);

    // 선택된 APP의 API 키들 (전체 선택 시 모든 API 키)
    const appApiKeys = useMemo(() => {
        return selectedAppId === 'all' ? (apiKeys || []) : (apiKeys || []).filter(key => String(key.appId) === String(selectedAppId));
    }, [selectedAppId, apiKeys]);

    // 액션별 에러 처리 함수
    const handleApiError = (error, operation) => {
        console.error(`❌ ${operation} 실패:`, error);
        let errorMessage = '데이터를 불러오는데 실패했습니다.';

        if (error.response?.status === 404) {
            errorMessage = '요청한 데이터를 찾을 수 없습니다.';
        } else if (error.response?.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response?.status === 401) {
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        }

        setErrorModal({
            isOpen: true,
            message: errorMessage
        });
    };



    // 현재 선택된 API 키가 유효한지 확인하고 필요시 조정
    useEffect(() => {
        if (selectedApiKeyId !== 'all' && selectedAppId !== 'all') {
            const isValidKey = appApiKeys.some(key => String(key.id) === String(selectedApiKeyId));
            if (!isValidKey && appApiKeys.length > 0) {
                // 현재 선택된 키가 유효하지 않으면 첫 번째 키로 변경
                setSelectedApiKeyId(appApiKeys[0].id);
            } else if (!isValidKey && appApiKeys.length === 0) {
                // 해당 앱에 키가 없으면 'all'로 변경
                setSelectedApiKeyId('all');
            }
        }
    }, [selectedAppId, appApiKeys, selectedApiKeyId]);

    // 기간 옵션 (새로운 API 구조에 맞게 수정)
    const periodOptions = ['전체', '당일', '7일', '30일'];

    // 기간을 periodType으로 변환하는 함수
    const getPeriodType = (period) => {
        switch (period) {
            case '당일': return 'daily';
            case '7일': return 'weekly';
            case '30일': return 'monthly';
            case '전체':
            default: return 'yearly';
        }
    };

    // 기간 라벨 (개요 페이지와 동일한 구조)
    const fmtMD = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const now = new Date();
    const rangeLabel = (() => {
        if (selectedPeriod === '당일') {
            return `${fmtMD(now)} 00:00 ~ 현재`;
        }
        if (selectedPeriod === '7일') {
            const s = startOfDay(now);
            s.setDate(s.getDate() - 6);
            return `${fmtMD(s)} ~ ${fmtMD(now)}`;
        }
        if (selectedPeriod === '30일') {
            const s = startOfDay(now);
            s.setDate(s.getDate() - 29);
            return `${fmtMD(s)} ~ ${fmtMD(now)}`;
        }
        const s = new Date(startOfMonth(now));
        s.setMonth(s.getMonth() - 11);
        return `${s.getFullYear()}년 ${s.getMonth() + 1}월 ~ ${now.getFullYear()}년 ${now.getMonth() + 1}월`;
    })();

    // 컴포넌트 마운트 시 필수 데이터 로드 (투트랙 시스템 - 페이지 로드 에러)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 모든 API 호출을 에러 처리와 함께 실행 (모든 API가 성공해야만 완료)
                const allSuccessful = await executeAllWithErrorHandling([
                    {
                        apiCall: () => refreshApplications(),
                        operation: '앱 목록 로드',
                        onSuccess: () => console.log('✅ 앱 목록 로드 완료')
                    },
                    {
                        apiCall: () => loadMultiAppStatistics('전체'),
                        operation: '전체 앱 통계 로드',
                        onSuccess: () => console.log('✅ 전체 앱 통계 로드 완료')
                    }
                ]);

                if (allSuccessful) {
                    console.log('✅ 모든 초기 데이터 로드 완료');
                    isInitialLoad.current = false; // 성공한 경우에만 로딩 완료
                } else {
                    console.log('❌ 일부 API 호출이 실패했습니다. 에러 모달이 표시됩니다.');
                    // 실패한 경우에는 로딩 상태 유지 (isInitialLoad.current = true)
                }
            } catch (error) {
                console.error('❌ 초기 데이터 로드 중 예상치 못한 오류:', error);
                // 예상치 못한 오류의 경우에도 초기 로드 상태 유지
            }
        };

        loadInitialData();
    }, [refreshApplications, loadMultiAppStatistics, executeAllWithErrorHandling]);



    // 필터 변경 시 데이터 업데이트 (투트랙 시스템 - 액션별 에러)
    useEffect(() => {
        const updateData = async () => {
            // 초기 로드가 완료된 후에만 실행
            if (isInitialLoad.current) return;

            const periodType = getPeriodType(selectedPeriod);

            // 테이블 뷰일 때 로그 데이터 로드 (액션별 에러 처리)
            if (viewMode === 'table') {
                if (selectedApiKeyId === 'all') {
                    try {
                        await loadAllLogs(1, itemsPerPage, periodType);
                    } catch (error) {
                        handleApiError(error, '전체 로그 로드');
                    }
                } else {
                    try {
                        await loadLogsByKeyId(selectedApiKeyId, 1, itemsPerPage, periodType);
                    } catch (error) {
                        handleApiError(error, '특정 키 로그 로드');
                    }
                }
            }

            // 그래프 뷰일 때 통계 요약 데이터 로드 (액션별 에러 처리)
            if (viewMode === 'graph') {
                if (selectedAppId === 'all') {
                    // 전체 앱 선택 시 (기간에 관계없이)
                    try {
                        await loadMultiAppStatistics(selectedPeriod);
                    } catch (error) {
                        handleApiError(error, '전체 앱 통계 로드');
                    }
                } else {
                    // 특정 앱 선택 시
                    const keyId = selectedApiKeyId === 'all' ? null : selectedApiKeyId;
                    try {
                        await loadStatisticsSummary(keyId, selectedPeriod);
                    } catch (error) {
                        handleApiError(error, '특정 앱 통계 로드');
                    }
                }
            }
        };

        updateData();
    }, [itemsPerPage, selectedPeriod, viewMode, selectedApiKeyId, selectedAppId, loadAllLogs, loadLogsByKeyId, loadStatisticsSummary, loadMultiAppStatistics]);

    // 스토어 기간 동기화
    useEffect(() => {
        setGlobalPeriod(selectedPeriod);
    }, [selectedPeriod, setGlobalPeriod]);


    // 앱 선택 핸들러 (API 키 자동 필터링)
    const handleAppChange = (appId) => {
        // 앱이 변경되면 해당 앱의 API 키들만 필터링
        if (appId === 'all') {
            // 모든 앱 선택 시 API 키도 'all'로 설정
            setSelectedAppId(appId);
            setSelectedApiKeyId('all');
        } else {
            // 특정 앱 선택 시 해당 앱의 첫 번째 API 키 자동 선택
            const appKeys = apiKeys.filter(key => String(key.appId) === String(appId));

            setSelectedAppId(appId);
            if (appKeys.length > 0) {
                setSelectedApiKeyId(appKeys[0].id);
            } else {
                setSelectedApiKeyId('all');
            }
        }
    };


    // 페이지 변경 핸들러 (액션별 에러 처리)
    const handlePageChange = async (page) => {
        setCurrentPage(page);
        const periodType = getPeriodType(selectedPeriod);

        try {
            await changeLogPage(page, itemsPerPage, periodType);
        } catch (error) {
            handleApiError(error, '페이지 변경');
        }
    };

    // 페이징 계산 (API 로그만 사용)
    const totalPages = Math.ceil((logs.total || 0) / itemsPerPage);

    // 현재 페이지 상태와 API 응답 페이지 동기화
    useEffect(() => {
        if (logs.page && logs.page !== currentPage) {
            setCurrentPage(logs.page);
        }
    }, [logs.page, currentPage]);

    // 현재 표시할 로그 데이터
    const currentLogs = logs.items || [];

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';

            const isDateOnly = date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

            if (isDateOnly) {
                // 날짜만 표시
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const result = `${month}월 ${day}일`;
                return result;
            } else {
                // 시간 포함 표시
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const result = `${month}월 ${day}일 ${hours}:${minutes}`;
                return result;
            }
        } catch {
            return 'N/A';
        }
    };

    // 결과 상태별 색상
    const getResultColor = (result) => {
        switch (result) {
            case '성공':
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case '실패':
            case 'fail':
            case 'error':
                return 'text-red-600 dark:text-red-400';
            case '타임아웃':
            case 'timeout':
                return 'text-yellow-600 dark:text-yellow-400';
            case '인증오류':
                return 'text-orange-600 dark:text-orange-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    // API 키 표시 (마스킹)
    const maskApiKey = (key) => {
        if (!key) return '';
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };

    // 테이블 컬럼 정의
    const logColumns = [
        {
            key: 'index',
            title: '번호',
            align: 'left',
            minWidth: '60px',
            render: (log, index) => (currentPage - 1) * itemsPerPage + index + 1
        },
        {
            key: 'id',
            title: 'ID',
            align: 'left',
            minWidth: '80px'
        },
        {
            key: 'appName',
            title: '앱',
            align: 'left',
            minWidth: '100px'
        },
        {
            key: 'key',
            title: 'API 키',
            align: 'left',
            className: 'font-mono text-sm',
            minWidth: '120px',
            render: (log) => maskApiKey(log.key)
        },
        {
            key: 'date',
            title: '시간 (KST)',
            align: 'left',
            className: 'text-sm',
            minWidth: '140px',
            render: (log) => formatDate(log.date)
        },
        {
            key: 'result',
            title: '결과',
            align: 'left',
            minWidth: '80px',
            render: (log) => (
                <span className={getResultColor(log.result)}>
                    {log.result}
                </span>
            )
        },
        {
            key: 'ratency',
            title: '응답시간',
            align: 'left',
            minWidth: '100px',
            render: (log) => `${log.ratency}ms`
        }
    ];

    // 모든 데이터가 로드될 때까지 로딩 표시 (투트랙 시스템)
    const isDataLoading = isLoading || !apps || apps.length === 0 || isInitialLoad.current;

    return (
        <DashboardLayout
            title="사용량"
            subtitle="API 사용 현황을 한눈에 확인해보세요"
        >
            {isDataLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4 bg-transparent">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        사용량 데이터를 불러오는 중...
                    </p>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* 필터 */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            {/* 좌측: 앱과 기간 선택 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* 앱 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">앱</label>
                                    <select
                                        value={selectedAppId}
                                        onChange={(e) => handleAppChange(e.target.value)}
                                        className="w-full sm:w-36 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="all">전체</option>
                                        {(apps || []).map(app => (
                                            <option
                                                key={app.id}
                                                value={app.id}
                                                title={app.name}
                                            >
                                                {app.name.length > 15 ? `${app.name.substring(0, 15)}...` : app.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 기간 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">기간</label>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="w-full sm:w-36 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {periodOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 우측: 보기 모드 */}
                            <div className="md:ml-auto">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">보기</label>
                                <div className="flex w-full sm:w-36">
                                    <button
                                        onClick={() => setViewMode('graph')}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'graph'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        그래프
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'table'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        테이블
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="space-y-6">
                        {/* 그래프 뷰 */}
                        {viewMode === 'graph' && (
                            <div className="p-6 rounded-lg theme-card">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <h2 className={`${T.sectionTitle} theme-text-primary`}>사용량</h2>
                                        {!isLoading && (
                                            <span className={`${T.label} theme-text-secondary`}>{rangeLabel}</span>
                                        )}
                                    </div>
                                    <div className="text-sm theme-text-secondary">
                                        총 {logs.total || 0}개 로그
                                    </div>
                                </div>

                                {(() => {
                                    const { usageData } = useDashboardStore.getState();
                                    return usageData && usageData.length > 0 ? (
                                        selectedAppId === 'all' ? (
                                            <div className="h-80 min-w-0">
                                                <MultiAppUsageChart
                                                    data={usageData}
                                                    selectedPeriod={selectedPeriod}
                                                    height="h-80"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-80 min-w-0">
                                                <UsageChart
                                                    data={usageData}
                                                    selectedPeriod={selectedPeriod}
                                                    height="h-80"
                                                    appName={apps?.find(app => String(app.id) === String(selectedAppId))?.name || '알 수 없음'}
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                                            <svg className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">사용량 데이터가 없습니다</h2>
                                            <p className="text-gray-600 dark:text-gray-400 text-center">
                                                선택한 기간에 사용량 데이터가 없습니다.<br />
                                                다른 기간을 선택하거나 APP을 확인해보세요.
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* 테이블 뷰 */}
                        {viewMode === 'table' && (
                            <div className="p-6 rounded-lg theme-card">
                                <DataTable
                                    title="로그 상세"
                                    subtitle={(() => {
                                        const total = logs.total || 0;
                                        const page = logs.page || 1;

                                        if (total === 0) {
                                            return '0개';
                                        }

                                        // 프론트엔드 페이지 크기(itemsPerPage) 기준으로 계산
                                        const start = (page - 1) * itemsPerPage + 1;
                                        const end = Math.min(page * itemsPerPage, total);

                                        return `${start}-${end} / ${total}개`;
                                    })()}
                                    columns={logColumns}
                                    data={currentLogs}
                                    loading={logs.loading}
                                    error={logs.error}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    emptyMessage="로그 데이터가 없습니다."
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 액션별 에러 모달 (필터 변경, 페이지 변경 등) */}
            <Modal
                isOpen={_errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                title="오류 발생"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="font-medium text-red-800">오류</span>
                        </div>
                        <p className="text-red-700 mt-2">{_errorModal.message}</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setErrorModal({ isOpen: false, message: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 페이지 로드 에러 모달 (통합 ErrorModal) */}
            <ErrorModal
                isOpen={errorState.isOpen}
                onClose={closeError}
                onRetry={handleRetry}
                message={errorState.message}
                title={errorState.title || "데이터 로드 실패"}
            />
        </DashboardLayout>
    );
} 