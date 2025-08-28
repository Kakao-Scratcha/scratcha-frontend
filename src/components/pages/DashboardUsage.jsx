import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Chart from '../ui/Chart';
import LoadingSpinner from '../ui/LoadingSpinner';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '../../utils/chartImports';
import { useDashboardStore } from '../../stores/dashboardStore';

export default function DashboardUsage() {
    // Typography scale for consistency with Overview
    const T = {
        sectionTitle: 'text-lg font-semibold',
        label: 'text-sm'
    };
    const {
        apps,
        apiKeys,
        setPeriod: setGlobalPeriod,
        // API 로그 관련 상태 추가
        logs,
        loadAllLogs,
        loadLogsByKeyId,
        changeLogPage,
        refreshApplications
    } = useDashboardStore();

    const [selectedAppId, setSelectedAppId] = useState('all');
    const [selectedApiKeyId, setSelectedApiKeyId] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);

    // 선택된 APP의 API 키들 (전체 선택 시 모든 API 키)
    const appApiKeys = selectedAppId === 'all' ? apiKeys : apiKeys.filter(key => String(key.appId) === String(selectedAppId));



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
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 기간을 periodType으로 변환하는 함수
    const getPeriodType = (period) => {
        switch (period) {
            case '1일': return 'daily';
            case '7일': return 'weekly';
            case '30일': return 'monthly';
            case '전체':
            default: return 'yearly';
        }
    };

    // 컴포넌트 마운트 시 애플리케이션 데이터 로드
    useEffect(() => {
        refreshApplications();
    }, [refreshApplications]);



    // API 로그 초기 로드
    useEffect(() => {
        const periodType = getPeriodType(selectedPeriod);
        loadAllLogs(1, itemsPerPage, periodType);
    }, [itemsPerPage, selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

    // 필터 변경 시 데이터 업데이트 (기간 변경 시에만)
    useEffect(() => {
        setIsLoading(true);

        // 스토어 기간 동기화
        setGlobalPeriod(selectedPeriod);

        // periodType 변환
        const periodType = getPeriodType(selectedPeriod);

        // API 로그 로드
        if (selectedApiKeyId === 'all') {
            loadAllLogs(1, itemsPerPage, periodType);
        } else {
            loadLogsByKeyId(selectedApiKeyId, 1, itemsPerPage, periodType);
        }

        // 로딩 시뮬레이션
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, [selectedPeriod, selectedApiKeyId, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // 필터 변경 시 API 로그 업데이트 (디바운스 적용)
    useEffect(() => {
        // 디바운스로 중복 API 호출 방지
        const timeoutId = setTimeout(() => {
            setIsLoading(true);

            const periodType = getPeriodType(selectedPeriod);

            if (selectedApiKeyId === 'all') {
                loadAllLogs(1, itemsPerPage, periodType);
            } else {
                loadLogsByKeyId(selectedApiKeyId, 1, itemsPerPage, periodType);
            }

            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }, 300); // 300ms 디바운스

        return () => clearTimeout(timeoutId);
    }, [selectedApiKeyId, selectedPeriod, loadAllLogs, loadLogsByKeyId, itemsPerPage]);

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

    // API 키 선택 핸들러 (앱 자동 필터링)
    const handleApiKeyChange = (keyId) => {
        if (keyId === 'all') {
            // 모든 키 선택 시 앱도 'all'로 설정
            setSelectedApiKeyId(keyId);
            setSelectedAppId('all');
        } else {
            // 특정 키 선택 시 해당 키가 속한 앱 자동 선택
            const selectedKey = apiKeys.find(key => String(key.id) === String(keyId));
            if (selectedKey) {
                setSelectedApiKeyId(keyId);
                setSelectedAppId(selectedKey.appId);
            } else {
                setSelectedApiKeyId(keyId);
            }
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        setCurrentPage(page);
        const periodType = getPeriodType(selectedPeriod);
        changeLogPage(page, itemsPerPage, periodType);
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

    // 디버깅용 로그
    console.log('🔍 DashboardUsage 렌더링:', {
        logs,
        currentLogs,
        totalPages,
        itemsPerPage,
        selectedPeriod,
        selectedApiKeyId,
        selectedAppId
    });



    // 페이지 변경 시 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedAppId, selectedApiKeyId, selectedPeriod]);

    // 결과 상태별 색상
    const getResultColor = (result) => {
        switch (result) {
            case '성공':
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case '실패':
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

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`${T.sectionTitle} theme-text-primary`}>사용량 상세</h1>
                        <p className="text-sm theme-text-secondary">API 호출 로그 및 상세 통계를 확인하세요</p>
                    </div>
                </div>

                {/* 필터 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* 앱 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">앱</label>
                            <select
                                value={selectedAppId}
                                onChange={(e) => handleAppChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">전체</option>
                                {apps.map(app => (
                                    <option key={app.id} value={app.id}>{app.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* API 키 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API 키</label>
                            <select
                                value={selectedApiKeyId}
                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">전체</option>
                                {appApiKeys.map(key => (
                                    <option key={key.id} value={key.id}>{key.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 기간 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">기간</label>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {periodOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* 보기 모드 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">보기</label>
                            <div className="flex">
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border ${viewMode === 'graph'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    그래프
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border ${viewMode === 'table'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                    {isLoading || logs.loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            {/* 그래프 뷰 */}
                            {viewMode === 'graph' && (
                                <div className="p-6 rounded-lg theme-card">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className={`${T.sectionTitle} theme-text-primary`}>사용량 추이</h3>
                                        <div className="text-sm theme-text-secondary">
                                            총 {logs.total || 0}개 로그
                                        </div>
                                    </div>

                                    {logs.items && logs.items.length > 0 ? (
                                        <Chart
                                            data={logs.items.map(log => ({
                                                date: new Date(log.date).toLocaleDateString('ko-KR'),
                                                usage: 1, // 각 로그를 1로 카운트
                                                result: log.result
                                            }))}
                                            type="line"
                                            height={400}
                                            xKey="date"
                                            yKey="usage"
                                            color="#3B82F6"
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-64 text-gray-500">
                                            API 로그 데이터가 없습니다.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 테이블 뷰 */}
                            {viewMode === 'table' && (
                                <div className="p-6 rounded-lg theme-card">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className={`${T.sectionTitle} theme-text-primary`}>로그 상세</h3>
                                        <div className="text-sm theme-text-secondary">
                                            {(() => {
                                                const total = logs.total || 0;
                                                const page = logs.page || 1;
                                                const actualItemsCount = currentLogs.length;

                                                console.log('📊 페이지 정보 계산:', {
                                                    page,
                                                    itemsPerPage,
                                                    total,
                                                    actualItemsCount
                                                });

                                                if (total === 0) {
                                                    return '0개';
                                                }

                                                // 프론트엔드 페이지 크기(itemsPerPage) 기준으로 계산
                                                const start = (page - 1) * itemsPerPage + 1;
                                                const end = Math.min(page * itemsPerPage, total);

                                                return `${start}-${end} / ${total}개`;
                                            })()}
                                        </div>
                                    </div>

                                    {currentLogs.length > 0 ? (
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableHeader>ID</TableHeader>
                                                    <TableHeader>앱</TableHeader>
                                                    <TableHeader>API 키</TableHeader>
                                                    <TableHeader>시간</TableHeader>
                                                    <TableHeader>결과</TableHeader>
                                                    <TableHeader>응답시간</TableHeader>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {currentLogs.map((log) => (
                                                    <TableRow key={log.id} className="theme-table-row hover:theme-hover-bg">
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary">{log.id}</TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary">
                                                            {log.appName}
                                                        </TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary font-mono text-sm">
                                                            {maskApiKey(log.key)}
                                                        </TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary text-sm">
                                                            {formatDate(log.date)}
                                                        </TableCell>
                                                        <TableCell className={`text-left py-3 px-4 font-medium ${getResultColor(log.result)}`}>
                                                            {log.result}
                                                        </TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary">
                                                            {`${log.ratency}ms`}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="flex justify-center items-center h-64 text-gray-500">
                                            로그 데이터가 없습니다.
                                        </div>
                                    )}

                                    {/* 페이징 네비게이션 */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center space-x-1 mt-6">
                                            {/* 첫 페이지로 이동 */}
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                &lt;&lt;
                                            </button>

                                            {/* 이전 10페이지 */}
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 10))}
                                                disabled={currentPage <= 10}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                &lt;
                                            </button>

                                            {/* 페이지 번호들 */}
                                            {(() => {
                                                const pages = [];
                                                let start, end;

                                                // 총 10개 페이지를 보여주되, 현재 페이지를 중심으로 조정
                                                if (totalPages <= 10) {
                                                    // 총 페이지가 10개 이하면 모든 페이지 표시
                                                    start = 1;
                                                    end = totalPages;
                                                } else {
                                                    // 현재 페이지를 중심으로 좌우 4페이지씩 (총 9페이지)
                                                    start = Math.max(1, currentPage - 4);
                                                    end = Math.min(totalPages, currentPage + 4);

                                                    // 시작이나 끝에 가까우면 조정
                                                    if (start === 1) {
                                                        end = Math.min(totalPages, 9);
                                                    } else if (end === totalPages) {
                                                        start = Math.max(1, totalPages - 8);
                                                    }
                                                }

                                                for (let i = start; i <= end; i++) {
                                                    pages.push(i);
                                                }

                                                return pages.map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-md border ${page === currentPage
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ));
                                            })()}

                                            {/* 다음 10페이지 */}
                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 10))}
                                                disabled={currentPage >= totalPages - 9 || currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                &gt;
                                            </button>

                                            {/* 마지막 페이지로 이동 */}
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                &gt;&gt;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 