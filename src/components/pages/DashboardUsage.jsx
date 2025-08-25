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
        usageLogs,
        usageData,
        setPeriod: setGlobalPeriod,
    } = useDashboardStore();

    const [selectedAppId, setSelectedAppId] = useState('all');
    const [selectedApiKeyId, setSelectedApiKeyId] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // 선택된 APP의 API 키들 (전체 선택 시 모든 API 키)
    const appApiKeys = selectedAppId === 'all' ? apiKeys : apiKeys.filter(key => key.appId === selectedAppId);

    // 기간 옵션
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 필터 변경 시 데이터 업데이트
    useEffect(() => {
        setIsLoading(true);

        // 스토어 기간 동기화
        setGlobalPeriod(selectedPeriod);

        // 실제 API에서 로그 데이터를 가져와야 함
        // TODO: API 호출 구현

        // 로딩 시뮬레이션
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, [selectedAppId, selectedApiKeyId, selectedPeriod, setGlobalPeriod]);

    // 페이징 계산
    const totalPages = Math.ceil(usageLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = usageLogs.slice(startIndex, endIndex);

    // 페이지 변경 시 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedAppId, selectedApiKeyId, selectedPeriod]);

    // 결과 상태별 색상
    const getResultColor = (result) => {
        switch (result) {
            case '성공': return 'text-green-600 dark:text-green-400';
            case '실패': return 'text-red-600 dark:text-red-400';
            case '타임아웃': return 'text-yellow-600 dark:text-yellow-400';
            case '인증오류': return 'text-orange-600 dark:text-orange-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    // API 키 표시 (마스킹)
    const maskApiKey = (key) => {
        if (!key) return '';
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
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
                                onChange={(e) => setSelectedAppId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">모든 앱</option>
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
                                onChange={(e) => setSelectedApiKeyId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">모든 키</option>
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
                    {isLoading ? (
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
                                            총 {usageLogs.length.toLocaleString()}개 로그
                                        </div>
                                    </div>

                                    {Array.isArray(usageData) && usageData.length > 0 ? (
                                        <Chart
                                            data={usageData}
                                            type="line"
                                            height={400}
                                            xKey="date"
                                            yKey="usage"
                                            color="#3B82F6"
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-64 text-gray-500">
                                            데이터가 없습니다.
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
                                            {startIndex + 1}-{Math.min(endIndex, usageLogs.length)} / {usageLogs.length}개
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
                                                    <TableRow key={`${log.id}-${log.callAt}-${log.apiKey}`} className="theme-table-row hover:theme-hover-bg">
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary">{log.id}</TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary">{log.appName}</TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary font-mono text-sm">
                                                            {maskApiKey(log.apiKey)}
                                                        </TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary text-sm">{log.callTime}</TableCell>
                                                        <TableCell className={`text-left py-3 px-4 font-medium ${getResultColor(log.result)}`}>
                                                            {log.result}
                                                        </TableCell>
                                                        <TableCell className="text-left py-3 px-4 theme-text-primary">{log.responseTime}ms</TableCell>
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
                                        <div className="flex justify-center items-center space-x-2 mt-6">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                이전
                                            </button>

                                            <span className="px-3 py-2 text-sm text-gray-700">
                                                {currentPage} / {totalPages}
                                            </span>

                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                다음
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