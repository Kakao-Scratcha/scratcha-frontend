import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Chart from '../ui/Chart';
import LoadingSpinner from '../ui/LoadingSpinner';
import ActivityIcon from '../ui/ActivityIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '../../utils/chartImports';
import { useDashboardStore } from '../../stores/dashboardStore';
import { getCurrentPlan, getRecentActivities } from '../../data/dummyData';

export default function DashboardOverview() {
    const {
        selectedPeriod,
        usageData,
        stats,
        isLoading,
        setPeriod,
        calculateOverageCost,
        calculateTotalCost
    } = useDashboardStore();

    // 더미 데이터에서 가져오기
    const currentPlan = getCurrentPlan();
    const recentActivities = getRecentActivities();

    // 기간 선택 옵션
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 초과분 요금 계산
    const overageCost = calculateOverageCost(currentPlan.used, currentPlan.limit, currentPlan.overageRate);
    const totalCost = calculateTotalCost(currentPlan.used, currentPlan.limit, currentPlan.price, currentPlan.overageRate);

    // 활동 타입별 배경색
    const getActivityColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'info': return 'bg-blue-500';
            case 'warning': return 'bg-purple-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <DashboardLayout
            title="대시보드 개요"
            subtitle="현재 플랜과 사용량을 확인하세요"
        >
            <div className="space-y-6">
                {/* 현재 요금제 */}
                <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">현재 요금제</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPlan.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">{currentPlan.description}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentPlan.price}</p>
                            {overageCost > 0 && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-sm">
                                    <p className="text-red-700 dark:text-red-300 font-medium">초과분 요금: ₩{overageCost.toLocaleString()}</p>
                                    <p className="text-red-600 dark:text-red-400 text-xs">
                                        초과 사용량: {currentPlan.used - currentPlan.limit}회 × ₩{currentPlan.overageRate}/회
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">사용량</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentPlan.used.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">/ {currentPlan.limit.toLocaleString()}회</p>
                            {overageCost > 0 && (
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                                    총 요금: ₩{totalCost.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${(currentPlan.used / currentPlan.limit) * 100 >= 90
                                ? 'bg-red-500'
                                : (currentPlan.used / currentPlan.limit) * 100 >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-600 dark:bg-blue-500'
                                }`}
                            style={{ width: `${Math.min((currentPlan.used / currentPlan.limit) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* 전체 사용량 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">오늘 사용량</h3>
                            <span className="text-sm text-gray-600 dark:text-gray-400">+{stats.today.change}%</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.today.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">캡차 검증</p>
                    </div>

                    <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">이번 주</h3>
                            <span className="text-sm text-gray-600 dark:text-gray-400">+{stats.week.change}%</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.week.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">캡차 검증</p>
                    </div>

                    <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">이번 달</h3>
                            <span className="text-sm text-gray-600 dark:text-gray-400">+{stats.month.change}%</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.month.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">캡차 검증</p>
                    </div>
                </div>

                {/* 사용량 그래프 */}
                <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">사용량 추이</h3>
                        <div className="flex gap-2">
                            {periodOptions.map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setPeriod(period)}
                                    disabled={isLoading}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${selectedPeriod === period
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                        : 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80">
                        {isLoading ? (
                            <LoadingSpinner message="데이터를 불러오는 중..." className="h-full" />
                        ) : (
                            <Chart>
                                <LineChart data={usageData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(156 163 175)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgb(156 163 175)"
                                        fontSize={12}
                                        tick={{ fill: 'rgb(156 163 175)' }}
                                    />
                                    <YAxis
                                        stroke="rgb(156 163 175)"
                                        fontSize={12}
                                        tick={{ fill: 'rgb(156 163 175)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgb(31 41 55)',
                                            border: '1px solid rgb(75 85 99)',
                                            borderRadius: '8px',
                                            color: 'rgb(243 244 246)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="usage"
                                        stroke="rgb(59 130 246)"
                                        strokeWidth={3}
                                        dot={{ fill: 'rgb(59 130 246)', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: 'rgb(59 130 246)', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </Chart>
                        )}
                    </div>
                </div>

                {/* 최근 활동 */}
                <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">최근 활동</h3>
                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                        <ActivityIcon icon={activity.icon} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{activity.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 