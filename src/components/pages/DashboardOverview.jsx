import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import UsageChart from '../ui/UsageChart';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
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
        requestsStats,
        loadAllRequestsStats,
        loadStatisticsSummary,
        apps,
        refreshApplications,
        isAppsLoading,
    } = useDashboardStore();

    // 결제 내역 확인을 위한 상태
    const [hasPaymentHistory, setHasPaymentHistory] = useState(false);
    const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(true);

    // 사용량 경고 설정 상태
    const [usageWarningEnabled, setUsageWarningEnabled] = useState(false);
    const [usageWarningThreshold, setUsageWarningThreshold] = useState(1000);

    // 앱 생성 모달 상태
    const [showAppCreateModal, setShowAppCreateModal] = useState(false);
    const [hasShownAppModal, setHasShownAppModal] = useState(false);

    // 주기적으로 사용자 정보 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            const { getProfile } = useAuthStore.getState();
            getProfile({ showLoading: false });
        }, 30000); // 30초마다 갱신

        return () => clearInterval(interval);
    }, []);

    // 결제 내역 확인 함수
    const checkPaymentHistory = useCallback(async () => {
        try {
            setIsPaymentHistoryLoading(true);
            const response = await paymentAPI.getPaymentHistory(1, 1);
            const hasHistory = response.data.total > 0;
            setHasPaymentHistory(hasHistory);
        } catch {
            setHasPaymentHistory(false);
        } finally {
            setIsPaymentHistoryLoading(false);
        }
    }, []);


    // 사용량 경고를 표시할지 결정하는 함수
    const shouldShowUsageWarning = () => {
        return hasPaymentHistory && usageWarningEnabled && user?.token && user.token <= usageWarningThreshold;
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

    // 초기 로드 여부를 추적하는 ref
    const isInitialLoad = useRef(true);

    // 컴포넌트 마운트 시 통계 데이터 로드 (초기에는 항상 '전체' 기간으로)
    useEffect(() => {
        loadAllRequestsStats();
        loadStatisticsSummary(null, '전체'); // 초기 로드 시에는 항상 '전체'로 고정
        // 최근 활동용 7일 통계 데이터 로드
        loadStatisticsSummary(null, '7일');
        // 사용자 정보 새로고침
        const { getProfile } = useAuthStore.getState();
        getProfile({ showLoading: false });
        // 앱 목록 새로고침
        refreshApplications();
        isInitialLoad.current = false;
    }, [loadAllRequestsStats, loadStatisticsSummary, refreshApplications]);

    // 기간 변경 시 데이터 로드 (초기 로드가 아닌 경우에만)
    useEffect(() => {
        if (!isInitialLoad.current) {
            loadStatisticsSummary(null, selectedPeriod);
        }
    }, [selectedPeriod, loadStatisticsSummary]);

    // 사용자 정보가 변경될 때마다 설정 불러오기
    useEffect(() => {
        if (user?.id) {
            try {
                const saved = localStorage.getItem(`usageWarning_${user.id}`);
                if (saved) {
                    const settings = JSON.parse(saved);
                    setUsageWarningEnabled(settings.enabled || false);
                    setUsageWarningThreshold(settings.threshold || 1000);
                }
            } catch (error) {
                console.error('사용량 경고 설정 불러오기 실패:', error);
            }
        }
    }, [user?.id]);

    // 결제 내역 확인
    useEffect(() => {
        checkPaymentHistory();
    }, [checkPaymentHistory]);

    // 앱이 0개일 때 모달 표시 (화면이 뜬 후에 체크)
    useEffect(() => {
        // 화면이 뜬 후에만 모달 체크 (초기 로드 완료 후)
        if (!isInitialLoad.current) {
            console.log('앱 모달 체크 (화면 로드 후):', {
                isAppsLoading,
                appsLength: apps.length,
                isInitialLoad: isInitialLoad.current,
                apps: apps,
                showAppCreateModal,
                hasShownAppModal
            });

            // 앱 목록이 로드 완료되고, 앱이 0개이고, 아직 모달을 표시하지 않은 경우에만 모달 표시
            if (!isAppsLoading && Array.isArray(apps) && apps.length === 0 && !hasShownAppModal) {
                console.log('모달 표시 조건 만족 - 모달 표시');
                setShowAppCreateModal(true);
                setHasShownAppModal(true);
            } else if (apps.length > 0) {
                // 앱이 있으면 모달 상태 초기화
                console.log('앱이 있음 - 모달 상태 초기화');
                setShowAppCreateModal(false);
                setHasShownAppModal(false);
            }
        }
    }, [apps.length, isAppsLoading, isInitialLoad, hasShownAppModal]);

    // 앱 생성 모달 닫기
    const handleCloseAppCreateModal = () => {
        setShowAppCreateModal(false);
    };

    // 앱 페이지로 이동
    const handleGoToAppPage = () => {
        setShowAppCreateModal(false);
        window.location.href = '/dashboard/app';
    };

    // 최근 활동 데이터 (7일 통계 데이터 기반으로 변경)
    const avgTokens = 1; // 1호출당 1토큰
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

    // 모든 데이터가 로드될 때까지 로딩 표시
    const isDataLoading = isLoading || isAppsLoading || isPaymentHistoryLoading || !user || isInitialLoad.current;

    if (isDataLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        데이터를 불러오는 중...
                    </p>
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
                {/* 토큰 사용량 경고 */}
                {shouldShowUsageWarning() && (
                    <div className="p-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                    토큰 사용량 경고
                                </h3>
                                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                                    보유 토큰이 설정한 경고 임계값({usageWarningThreshold.toLocaleString()} 토큰) 이하로 떨어졌습니다.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                        현재 보유: <span className="font-semibold">{user?.token?.toLocaleString() || 0} 토큰</span>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = '/dashboard/billing'}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        토큰 충전하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                    </ul>
                </div>


            </div>

            {/* 앱 생성 모달 */}
            <Modal
                isOpen={showAppCreateModal}
                onClose={handleCloseAppCreateModal}
                title="앱을 만들어보세요!"
                className="max-w-md"
            >
                <div className="text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            아직 생성된 앱이 없습니다
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            scratCHA 서비스를 사용하기 위해 먼저 앱을 생성해주세요.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleCloseAppCreateModal}
                            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                        >
                            나중에
                        </button>
                        <button
                            onClick={handleGoToAppPage}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            앱 만들기
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
