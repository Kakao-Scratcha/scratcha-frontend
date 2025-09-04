import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';

export default function DataTable({
    title,
    subtitle,
    columns = [],
    data = [],
    loading = false,
    error = null,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    emptyMessage = "데이터가 없습니다.",
    showPagination = true,
    className = ""
}) {
    // 페이지네이션 핸들러
    const handlePageChange = (page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    // 페이지네이션 버튼 렌더링
    const renderPagination = () => {
        if (!showPagination || totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center space-x-1 mt-6 mb-6">
                {/* 첫 페이지로 이동 */}
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    &lt;&lt;
                </button>

                {/* 이전 10페이지 */}
                <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 10))}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                        >
                            {page}
                        </button>
                    ));
                })()}

                {/* 다음 10페이지 */}
                <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 10))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    &gt;
                </button>

                {/* 마지막 페이지로 이동 */}
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    &gt;&gt;
                </button>
            </div>
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* 헤더 */}
            {(title || subtitle) && (
                <div className="flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold theme-text-primary">{title}</h3>}
                        {subtitle && <p className="text-sm theme-text-secondary">{subtitle}</p>}
                    </div>
                </div>
            )}

            {/* 테이블 */}
            <div className="theme-card rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-600 dark:text-red-400">
                        오류: {error}
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                        {emptyMessage}
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column, index) => (
                                        <TableHeader key={index} align={column.align || 'left'}>
                                            {column.title}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, rowIndex) => (
                                    <TableRow key={rowIndex} className="theme-table-row hover:theme-hover-bg">
                                        {columns.map((column, colIndex) => (
                                            <TableCell
                                                key={colIndex}
                                                className={`py-3 px-4 theme-text-primary whitespace-nowrap ${column.className || ''}`}
                                                align={column.align || 'left'}
                                                style={{ minWidth: column.minWidth || 'auto' }}
                                            >
                                                <div className="truncate max-w-xs">
                                                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* 페이지네이션 */}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
}
