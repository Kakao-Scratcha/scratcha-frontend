import React, { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import UsageChart from '../ui/UsageChart';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import { paymentAPI } from '../../services/api';
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

    const { user } = useAuthStore();
    const {
        selectedPeriod,
        usageData: chartUsageData,
        isLoading,
        setPeriod,
        planUsageData,
        requestsStats,
        loadAllRequestsStats,
        loadStatisticsSummary,
    } = useDashboardStore();

    // 결제 내역 확인을 위한 상태
    const [hasPaymentHistory, setHasPaymentHistory] = useState(false);

    // 주기적으로 사용자 정보 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            const { getProfile } = useAuthStore.getState();
            getProfile({ showLoading: false });
        }, 30000); // 30초마다 갱신

        return () => clearInterval(interval);
    }, []);

    // 결제 내역 확인 함수
    const checkPaymentHistory = async () => {
        try {
            const response = await paymentAPI.getPaymentHistory(1, 1);
            const hasHistory = response.data.total > 0;
            setHasPaymentHistory(hasHistory);
        } catch {
            setHasPaymentHistory(false);
        }
    };

    // 결제 내역을 기반으로 요금제 정보 생성 (Free/Premium)
    const getCurrentPlanInfo = () => {
        const planName = hasPaymentHistory ? 'premium' : 'free';

        const planConfigs = {
            'free': {
                name: 'Free',
                icon: '🟦',
                description: '기본 기능을 무료로 이용하세요',
                features: ['기본 API 통계', '커뮤니티 지원']
            },
            'premium': {
                name: 'Premium',
                icon: '⭐',
                description: '결제한 사용자 전용 혜택',
                features: ['우선 지원', '고급 분석']
            }
        };

        return planConfigs[planName] || planConfigs['free'];
    };

    // 현재 요금제 정보 (authStore 기반)
    const currentPlanInfo = getCurrentPlanInfo();

    const safePlanUsageData = planUsageData || {
        current: {
            tokens: { used: 0, limit: 1000, percentage: 0 },
            requests: { count: 0, avgTokensPerRequest: 20 }
        }
    };

    // 초기 로드 여부를 추적하는 ref
    const isInitialLoad = useRef(true);

    // 컴포넌트 마운트 시 통계 데이터 로드 (초기에는 항상 '전체' 기간으로)
    useEffect(() => {
        loadAllRequestsStats();
        loadStatisticsSummary(null, '전체'); // 초기 로드 시에는 항상 '전체'로 고정
        // 최근 활동용 7일 통계 데이터 로드
        loadStatisticsSummary(null, '7일');
        // 결제 내역 확인
        checkPaymentHistory();
        // 사용자 정보 새로고침
        const { getProfile } = useAuthStore.getState();
        getProfile({ showLoading: false });
        isInitialLoad.current = false;
    }, [loadAllRequestsStats, loadStatisticsSummary]);

    // 기간 변경 시 데이터 로드 (초기 로드가 아닌 경우에만)
    useEffect(() => {
        if (!isInitialLoad.current) {
            loadStatisticsSummary(null, selectedPeriod);
        }
    }, [selectedPeriod, loadStatisticsSummary]);

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

        return {
            totalRequests,   // 전체 API 호출 수
            totalSuccess,    // 성공한 호출 수
            totalFail,       // 실패한 호출 수
        };
    }, [requestsStats.weekly]);

    // 기간 선택 옵션
    const periodOptions = ['전체', '당일', '7일', '30일'];

    // 기간 라벨
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
                {/* 현재 요금제 */}
                <div className="p-5 rounded-lg theme-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{currentPlanInfo.icon}</span>
                                <p className="text-2xl md:text-3xl font-bold theme-text-primary">{currentPlanInfo.name}</p>
                            </div>
                            <p className="text-base theme-text-secondary mb-3">{currentPlanInfo.description}</p>

                            {/* 기능 목록 */}
                            <div className="space-y-1">
                                {currentPlanInfo.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm theme-text-secondary">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm theme-text-secondary">보유 토큰</p>
                            <p className="text-3xl md:text-4xl font-bold theme-blue-accent">
                                {user?.token ? user.token.toLocaleString() : '0'}
                            </p>
                            <p className="text-sm theme-text-secondary">토큰</p>
                        </div>
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
                                    {requestsStats.daily.rate > 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-success">+{Math.ceil(requestsStats.daily.rate)}%</span>
                                        </>
                                    ) : requestsStats.daily.rate < 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-error">{Math.ceil(requestsStats.daily.rate)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="2" rx="1" /></svg>
                                            <span className="text-lg md:text-xl font-bold text-yellow-500">0%</span>
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
                                    {requestsStats.weekly.rate > 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-success">+{Math.ceil(requestsStats.weekly.rate)}%</span>
                                        </>
                                    ) : requestsStats.weekly.rate < 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-error">{Math.ceil(requestsStats.weekly.rate)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="2" rx="1" /></svg>
                                            <span className="text-lg md:text-xl font-bold text-yellow-500">0%</span>
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
                                    {requestsStats.monthly.rate > 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 16H4L12 4z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-success">+{Math.ceil(requestsStats.monthly.rate)}%</span>
                                        </>
                                    ) : requestsStats.monthly.rate < 0 ? (
                                        <>
                                            <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l-8-16h16l-8 16z" /></svg>
                                            <span className="text-lg md:text-xl font-bold theme-error">{Math.ceil(requestsStats.monthly.rate)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="2" rx="1" /></svg>
                                            <span className="text-lg md:text-xl font-bold text-yellow-500">0%</span>
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
                                <img src={ICONS.info} alt="전체호출" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">API 호출 성공</p>
                                    <p className="text-sm theme-text-secondary">최근 7일</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.totalRequests.toLocaleString()}회 ({(activity.totalRequests * avgTokens).toLocaleString()} 토큰)</div>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={ICONS.success} alt="성공" className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold theme-text-primary">CAPTCHA 검증 성공</p>
                                    <p className="text-sm theme-text-secondary">최근 7일</p>
                                </div>
                            </div>
                            <div className="text-sm theme-text-secondary">총 {activity.totalSuccess.toLocaleString()}회 ({(activity.totalSuccess * avgTokens).toLocaleString()} 토큰)</div>
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

            </div>
        </DashboardLayout>
    );
}
