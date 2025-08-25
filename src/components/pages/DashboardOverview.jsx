import React, { useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Chart from '../ui/Chart';
import LoadingSpinner from '../ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '../../utils/chartImports';
import { useDashboardStore } from '../../stores/dashboardStore';
import greenCheckIcon from '@/assets/images/green_check_icon.png';
import blueCheckIcon from '@/assets/images/blue_check_icon.png';
import yellowAlertIcon from '@/assets/images/yellow_alert_icon.png';
import redFailIcon from '@/assets/images/red_fail_icon.png';

export default function DashboardOverview() {
    // Typography scale (dashboard-wide consistency)
    const T = {
        sectionTitle: 'text-xl font-semibold',
        cardTitle: 'text-base md:text-lg font-semibold',
        label: 'text-sm',
        caption: 'text-xs'
    };
    const {
        selectedPeriod,
        usageData: chartUsageData,
        stats,
        isLoading,
        setPeriod,
        currentPlan,
        planUsageData,
        calculateOverageCost,
        calculateTotalCost,
    } = useDashboardStore();

    const avgTokens = planUsageData.current?.requests?.avgTokensPerRequest || 20;
    const ICONS = {
        success: greenCheckIcon,
        info: blueCheckIcon,
        warning: yellowAlertIcon,
        error: redFailIcon,
    };

    // 기간 선택 옵션
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 사용률/요금 계산
    const usagePercent = typeof planUsageData.current.tokens.percentage === 'number'
        ? planUsageData.current.tokens.percentage
        : Math.round((planUsageData.current.tokens.used / planUsageData.current.tokens.limit) * 100);
    const getUsageColorClass = (p) => {
        if (p < 30) return 'green';
        if (p < 60) return 'yellow';
        return 'red';
    };
    const usageColor = getUsageColorClass(usagePercent);

    // 디버그 로그: 기간/차트타입/데이터 포인트 수
    useEffect(() => {
        // 너무 긴 데이터 출력 방지 위해 앞/뒤 2개만 미리보기
        const preview = Array.isArray(chartUsageData)
            ? { head: chartUsageData.slice(0, 2), tail: chartUsageData.slice(-2) }
            : null;
        console.log('[Overview] selectedPeriod:', selectedPeriod);
        console.log('[Overview] chartUsageData length:', Array.isArray(chartUsageData) ? chartUsageData.length : 'N/A');
        console.log('[Overview] chartUsageData preview:', preview);
    }, [selectedPeriod, chartUsageData]);

    // 초과분 요금 계산 (통합 사용량 데이터 사용)
    const overageCost = calculateOverageCost(planUsageData.current.tokens.used, currentPlan.limit, currentPlan.overageRate);
    const totalCost = calculateTotalCost(planUsageData.current.tokens.used, currentPlan.limit, currentPlan.price, currentPlan.overageRate);

    // 기간 라벨 및 X축 라벨 포맷터
    const fmtMD = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const now = new Date();
    const rangeLabel = (() => {
        if (selectedPeriod === '1일') {
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

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`${T.sectionTitle} theme-text-primary`}>대시보드 개요</h1>
                        <p className="text-sm theme-text-secondary">API 사용량 및 통계를 한눈에 확인하세요</p>
                    </div>
                </div>

                {/* 플랜 정보 */}
                <div className="p-6 rounded-lg theme-card">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`${T.cardTitle} theme-text-primary`}>{currentPlan.name} 플랜</h3>
                            <p className="text-sm theme-text-secondary">{currentPlan.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold theme-text-primary">{currentPlan.price}</div>
                            <div className="text-sm theme-text-secondary">월 요금</div>
                        </div>
                    </div>

                    {/* 사용량 바 */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="theme-text-secondary">사용량</span>
                            <span className="theme-text-primary">
                                {planUsageData.current.tokens.used.toLocaleString()} / {planUsageData.current.tokens.limit.toLocaleString()} 토큰
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${usageColor === 'green' ? 'bg-green-500' :
                                    usageColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(100, usagePercent)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="theme-text-secondary">{usagePercent}% 사용</span>
                            {overageCost > 0 && (
                                <span className="text-red-600">초과 요금: ₩{overageCost.toLocaleString()}</span>
                            )}
                        </div>
                    </div>

                    {/* 요청 통계 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-semibold theme-text-primary">
                                {planUsageData.current.requests.count.toLocaleString()}
                            </div>
                            <div className="text-sm theme-text-secondary">총 요청</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-lg font-semibold theme-text-primary">
                                {planUsageData.current.requests.avgTokensPerRequest}
                            </div>
                            <div className="text-sm theme-text-secondary">평균 토큰/요청</div>
                        </div>
                    </div>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-lg theme-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-secondary">오늘</p>
                                <p className="text-2xl font-bold theme-text-primary">{stats.today.value.toLocaleString()}</p>
                            </div>
                            <div className={`text-sm ${stats.today.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.today.change >= 0 ? '+' : ''}{stats.today.change}%
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-lg theme-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-secondary">이번 주</p>
                                <p className="text-2xl font-bold theme-text-primary">{stats.week.value.toLocaleString()}</p>
                            </div>
                            <div className={`text-sm ${stats.week.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.week.change >= 0 ? '+' : ''}{stats.week.change}%
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-lg theme-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-secondary">이번 달</p>
                                <p className="text-2xl font-bold theme-text-primary">{stats.month.value.toLocaleString()}</p>
                            </div>
                            <div className={`text-sm ${stats.month.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.month.change >= 0 ? '+' : ''}{stats.month.change}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* 사용량 차트 */}
                <div className="p-6 rounded-lg theme-card">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className={`${T.sectionTitle} theme-text-primary`}>사용량 추이</h3>
                            <p className="text-sm theme-text-secondary">{rangeLabel}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {periodOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {Array.isArray(chartUsageData) && chartUsageData.length > 0 ? (
                        <Chart
                            data={chartUsageData}
                            type="line"
                            height={300}
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

                {/* 최근 활동 */}
                <div className="p-6 rounded-lg theme-card">
                    <h3 className={`${T.sectionTitle} theme-text-primary mb-4`}>최근 활동</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                            <div className="flex items-center gap-3">
                                <img src={ICONS.success} alt="성공" className="w-8 h-8" />
                                <div>
                                    <p className="font-semibold theme-text-primary">API 호출 성공</p>
                                    <p className="text-sm theme-text-secondary">총 {stats.today.value.toLocaleString()}회</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">
                                {(stats.today.value * avgTokens).toLocaleString()} 토큰
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                            <div className="flex items-center gap-3">
                                <img src={ICONS.info} alt="정보" className="w-8 h-8" />
                                <div>
                                    <p className="font-semibold theme-text-primary">현재 플랜</p>
                                    <p className="text-sm theme-text-secondary">{currentPlan.name}</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">
                                {usagePercent}% 사용
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                            <div className="flex items-center gap-3">
                                <img src={ICONS.warning} alt="경고" className="w-8 h-8" />
                                <div>
                                    <p className="font-semibold theme-text-primary">월 요금</p>
                                    <p className="text-sm theme-text-secondary">기본 요금 + 초과분</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">
                                ₩{totalCost.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}