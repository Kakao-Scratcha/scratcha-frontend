import React, { useEffect } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import LoadingSpinner from './LoadingSpinner';

export default function LogsTable() {
    const {
        logs,
        selectedKeyId,
        apiKeys,
        setSelectedKeyId,
        loadAllLogs,
        loadLogsByKeyId,
        changeLogPage
    } = useDashboardStore();

    // 초기 로그 로드
    useEffect(() => {
        loadAllLogs(1, 10);
    }, []);

    // API 키 선택 핸들러
    const handleKeyChange = (keyId) => {
        setSelectedKeyId(keyId);
        if (keyId) {
            loadLogsByKeyId(keyId, 1, 10);
        } else {
            loadAllLogs(1, 10);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        changeLogPage(page, logs.size);
    };

    // 결과 상태에 따른 스타일 클래스
    const getResultClass = (result) => {
        switch (result) {
            case 'success':
                return 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300';
            case 'error':
                return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300';
            case 'timeout':
                return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300';
        }
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

    // 총 페이지 수 계산
    const totalPages = Math.ceil(logs.total / logs.size);

    return (
        <div className="space-y-4">
            {/* 필터 및 컨트롤 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        API 키 필터:
                    </label>
                    <select
                        value={selectedKeyId || ''}
                        onChange={(e) => handleKeyChange(e.target.value || null)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">전체 로그</option>
                        {apiKeys.map((key) => (
                            <option key={key.id} value={key.id}>
                                {key.name} ({key.key.substring(0, 8)}...)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                    총 {logs.total}개 로그
                </div>
            </div>

            {/* 로그 테이블 */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                {logs.loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : logs.error ? (
                    <div className="p-4 text-center text-red-600 dark:text-red-400">
                        오류: {logs.error}
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        앱 이름
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        API 키
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        날짜
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        결과
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        응답시간 (ms)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {logs.items.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {log.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {log.appName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                                            {log.key.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(log.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultClass(log.result)}`}>
                                                {log.result}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {log.ratency}ms
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(logs.page - 1)}
                                        disabled={logs.page <= 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        이전
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(logs.page + 1)}
                                        disabled={logs.page >= totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        다음
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">{(logs.page - 1) * logs.size + 1}</span> ~{' '}
                                            <span className="font-medium">
                                                {Math.min(logs.page * logs.size, logs.total)}
                                            </span>{' '}
                                            / <span className="font-medium">{logs.total}</span>개
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === logs.page
                                                            ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300'
                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
