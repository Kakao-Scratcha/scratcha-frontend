import React, { useEffect, useMemo } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import UsageChart from '../ui/UsageChart';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import greenCheckIcon from '@/assets/images/green_check_icon.png';
import blueCheckIcon from '@/assets/images/blue_check_icon.png';
import yellowAlertIcon from '@/assets/images/yellow_alert_icon.png';
import redFailIcon from '@/assets/images/red_fail_icon.png';
// LogsTable import 제거

export default function DashboardOverview() {
    // Typography scale (dashboard-wide consistency)
    const T = {
        sectionTitle: 'text-xl font-semibold',
        cardTitle: 'text-base md:text-lg font-semibold',
        label: 'text-sm',
        caption: 'text-xs'
    };

    const { user } = useAuthStore();
    const {
        selectedPeriod,
        usageData: chartUsageData,
        isLoading,
        setPeriod,
        planUsageData,
        calculateOverageCost,
        calculateTotalCost,
        requestsStats,
        loadAllRequestsStats,
        loadStatisticsSummary,
    } = useDashboardStore();

    // authStore의 user.plan을 기반으로 요금제 정보 생성
    const getCurrentPlanInfo = () => {
        const planName = user?.plan || 'free';

        const planConfigs = {
            'free': {
                name: 'Free',
                limit: 1000,
                price: '₩0',
                description: '월 1,000 토큰 무료제공',
                overageRate: 0,
                features: ['기본 API 통계', '광고 포함']
            },
            'starter': {
                name: 'Starter',
                limit: 50000,
                price: '₩29,900',
                description: '월 50,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
                overageRate: 2.0,
                features: ['기본 API & 통계', '광고 제거', '이메일 지원']
            },
            'pro': {
                name: 'Pro',
                limit: 200000,
                price: '₩79,900',
                description: '월 200,000 토큰 무료제공 초과사용시 1,000 토큰당 ₩2.0',
                overageRate: 2.0,
                features: ['Starter의 모든 혜택', '커스텀 UI 스킨 지원', '고급 분석 리포트']
            },
            'enterprise': {
                name: 'Enterprise',
                limit: 999999999,
                price: '맞춤 견적',
                description: '월 무제한 또는 대규모 토큰 패키지',
                overageRate: 0,
                features: ['Pro의 모든 혜택', '전용 인프라/보안 강화', 'SLA 보장', '24/7 모니터링']
            }
        };

        return planConfigs[planName] || planConfigs['free'];
    };

    // 현재 요금제 정보 (authStore 기반)
    const currentPlanInfo = getCurrentPlanInfo();

    // 요금제 정보가 없는 경우 기본값 사용
    const safeCurrentPlan = currentPlanInfo || {
        name: 'Free',
        price: '₩0',
        description: '월 1,000 토큰 무료제공',
        limit: 1000,
        overageRate: 0,
        features: ['기본 API 통계', '광고 포함']
    };

    const safePlanUsageData = planUsageData || {
        current: {
            tokens: { used: 0, limit: 1000, percentage: 0 },
            requests: { count: 0, avgTokensPerRequest: 20 }
        }
    };

    // 컴포넌트 마운트 시 통계 데이터 로드
    useEffect(() => {
        loadAllRequestsStats();
        loadStatisticsSummary(null, selectedPeriod);
        // 최근 활동용 7일 통계 데이터 로드
        loadStatisticsSummary(null, '7일');
    }, [loadAllRequestsStats, loadStatisticsSummary, selectedPeriod]);

    // 최근 활동 데이터 (7일 통계 데이터 기반으로 변경)
    const avgTokens = safePlanUsageData.current?.requests?.avgTokensPerRequest || 20;
    const ICONS = {
        success: greenCheckIcon,
        info: blueCheckIcon,
        warning: yellowAlertIcon,
        error: redFailIcon,
    };

    // 7일 통계 데이터를 기반으로 최근 활동 계산
    const activity = useMemo(() => {
        // 7일 통계 데이터에서 합산된 값들 사용
        const weeklyStats = requestsStats.weekly;
        const totalRequests = weeklyStats.currentCount || 0;
        const successRate = weeklyStats.currentCount > 0 ?
            ((weeklyStats.currentCount - (weeklyStats.currentCount * 0.1)) / weeklyStats.currentCount) * 100 : 0; // 예상 성공률 90%

        const totalSuccess = Math.round(totalRequests * (successRate / 100));
        const totalFail = totalRequests - totalSuccess;

        // 최근 24시간 성공 (전체의 약 1/7)
        const succ24Count = Math.round(totalSuccess / 7);

        return {
            totalSuccess,
            lastSuccess: { date: new Date().toISOString() }, // 최신 날짜
            succ24Count,
            lastSucc24: { date: new Date().toISOString() }, // 최신 날짜
            totalFail,
            lastFail: { date: new Date().toISOString() }, // 최신 날짜
        };
    }, [requestsStats.weekly]);



    // 기간 선택 옵션
    const periodOptions = ['전체', '1일', '7일', '30일'];

    // 사용률/요금 계산
    const usagePercent = typeof safePlanUsageData.current.tokens.percentage === 'number'
        ? safePlanUsageData.current.tokens.percentage
        : Math.round((safePlanUsageData.current.tokens.used / safePlanUsageData.current.tokens.limit) * 100);
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
    const overageCost = calculateOverageCost(safePlanUsageData.current.tokens.used, safeCurrentPlan.limit, safeCurrentPlan.overageRate);
    const totalCost = calculateTotalCost(safePlanUsageData.current.tokens.used, safeCurrentPlan.limit, safeCurrentPlan.price, safeCurrentPlan.overageRate);

    // 기간 라벨
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
        <DashboardLayout
            title="대시보드 개요"
            subtitle="현재 플랜과 사용량을 확인하세요"
        >
            <div className="space-y-6">
                {/* 현재 요금제 (타이틀 제거, 스타일 업그레이드) */}
                <div className="p-5 rounded-lg theme-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl md:text-3xl font-bold theme-text-primary">{safeCurrentPlan.name}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${usageColor === 'green' ? 'theme-usage-green' : usageColor === 'yellow' ? 'theme-usage-yellow' : 'theme-usage-red'}`}>
                                    {usagePercent}%
                                </span>
                            </div>
                            <p className="text-base theme-text-secondary">{safeCurrentPlan.description}</p>
                            <p className="text-sm theme-text-secondary mt-1">{safeCurrentPlan.price}</p>
                            {overageCost > 0 && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-xs">
                                    <p className="text-red-700 dark:text-red-300 font-medium">초과분 요금: ₩{overageCost.toLocaleString()}</p>
                                    <p className="text-red-600 dark:text-red-400 text-[11px]">
                                        초과 사용량: {(safePlanUsageData.current.tokens.used - safePlanUsageData.current.tokens.limit).toLocaleString()} 토큰 × ₩{safeCurrentPlan.overageRate}/1,000토큰
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm theme-text-secondary">토큰 사용량</p>
                            <p className="text-3xl md:text-4xl font-bold theme-blue-accent">{safePlanUsageData.current.tokens.used.toLocaleString()}</p>
                            <p className="text-sm theme-text-secondary">/ {safePlanUsageData.current.tokens.limit.toLocaleString()} 토큰</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                API 호출: {safePlanUsageData.current.requests.count.toLocaleString()}회 (평균 {safePlanUsageData.current.requests.avgTokensPerRequest}토큰/회)
                            </p>
                            {overageCost > 0 && (
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                                    총 요금: ₩{totalCost.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 w-full theme-progress-bg rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-300 ${usageColor === 'green' ? 'theme-usage-green' : usageColor === 'yellow' ? 'theme-usage-yellow' : 'theme-usage-red'
                                }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                </div>

                {/* 전체 사용량 (API 데이터 연동) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-lg theme-card text-center">
                        <h3 className={`${T.cardTitle} theme-text-primary mb-1`}>오늘 사용량</h3>
                        {requestsStats.daily.loading ? (
                            <div className="flex justify-center items-center h-20">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                <p className="text-4xl md:text-5xl font-bold theme-blue-accent">{requestsStats.daily.currentCount.toLocaleString()}</p>
                                <div className="mt-2 inline-flex items-center gap-2 justify-center">
                                    {requestsStats.daily.rate >= 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-success">+{requestsStats.daily.rate.toFixed(2)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-error">{requestsStats.daily.rate.toFixed(2)}%</span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-5 rounded-lg theme-card text-center">
                        <h3 className={`${T.cardTitle} theme-text-primary mb-1`}>이번 주</h3>
                        {requestsStats.weekly.loading ? (
                            <div className="flex justify-center items-center h-20">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                <p className="text-4xl md:text-5xl font-bold theme-blue-accent">{requestsStats.weekly.currentCount.toLocaleString()}</p>
                                <div className="mt-2 inline-flex items-center gap-2 justify-center">
                                    {requestsStats.weekly.rate >= 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-success">+{requestsStats.weekly.rate.toFixed(2)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-error">{requestsStats.weekly.rate.toFixed(2)}%</span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-5 rounded-lg theme-card text-center">
                        <h3 className={`${T.cardTitle} theme-text-primary mb-1`}>이번 달</h3>
                        {requestsStats.monthly.loading ? (
                            <div className="flex justify-center items-center h-20">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                <p className="text-4xl md:text-5xl font-bold theme-blue-accent">{requestsStats.monthly.currentCount.toLocaleString()}</p>
                                <div className="mt-2 inline-flex items-center gap-2 justify-center">
                                    {requestsStats.monthly.rate >= 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-success">+{requestsStats.monthly.rate.toFixed(2)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-error">{requestsStats.monthly.rate.toFixed(2)}%</span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 사용량 그래프 */}
                <div className="p-6 rounded-lg theme-card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h3 className={`${T.sectionTitle} theme-text-primary`}>사용량 추이</h3>
                            {!isLoading && (
                                <span className={`${T.label} theme-text-secondary`}>{rangeLabel}</span>
                            )}

                        </div>
                        <div className="flex gap-2">
                            {periodOptions.map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setPeriod(period)}
                                    disabled={isLoading}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${selectedPeriod === period
                                        ? 'theme-button-primary'
                                        : 'theme-button-secondary'
                                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 min-w-0">
                        {isLoading ? (
                            <LoadingSpinner message="데이터를 불러오는 중..." className="h-full" />
                        ) : (
                            <UsageChart
                                data={chartUsageData}
                                selectedPeriod={selectedPeriod}
                                debugName="OverviewChart"
                            />
                        )}
                    </div>
                </div>

                {/* 최근 활동 */}
                <div className="p-6 rounded-lg theme-card">
                    <h3 className={`${T.sectionTitle} theme-text-primary mb-4`}>최근 7일 활동</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.success} alt="성공" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">API 호출 성공</p>
                                    <p className="text-sm theme-text-secondary">최근 7일</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.totalSuccess.toLocaleString()}회 ({(activity.totalSuccess * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.info} alt="검증성공" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">CAPTCHA 검증 성공</p>
                                    <p className="text-sm theme-text-secondary">최근 24시간</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.succ24Count.toLocaleString()}회 ({(activity.succ24Count * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.error} alt="실패" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">CAPTCHA 검증 실패</p>
                                    <p className="text-sm theme-text-secondary">최근 7일</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.totalFail.toLocaleString()}회 ({(activity.totalFail * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.warning} alt="경고" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">토큰 사용량 경고</p>
                                    <p className="text-sm theme-text-secondary">현재</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">{(safePlanUsageData.current?.tokens?.percentage || 0)}% 도달</div>
                        </li>
                    </ul>
                </div>

                {/* 로그 테이블 섹션 제거 */}
            </div>
        </DashboardLayout>
    );
}

