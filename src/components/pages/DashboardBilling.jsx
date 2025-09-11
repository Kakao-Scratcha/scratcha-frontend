import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import ErrorModal from '../ui/ErrorModal';
import PaymentHistoryTable from '../ui/PaymentHistoryTable';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useLocation } from 'react-router-dom';
import useErrorHandler from '../../hooks/useErrorHandler';


export default function DashboardBilling() {
    // Typography scale for consistency
    const T = {
        sectionTitle: 'text-xl font-semibold',
        label: 'text-sm'
    };

    const { user } = useAuthStore();
    const { requestsStats, loadAllRequestsStats } = useDashboardStore();

    // 에러 처리 훅 (투트랙 시스템)
    const { errorState, closeError, handleRetry, executeAllWithErrorHandling, isRetrying } = useErrorHandler();

    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false);

    // 결제 결과 모달 상태
    const [showPaymentResultModal, setShowPaymentResultModal] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);


    const location = useLocation();

    // 결제 결과 확인 및 모달 표시
    useEffect(() => {
        if (location.state?.paymentResult) {
            console.log("🎯 결제 결과 수신:", location.state);
            setPaymentResult(location.state);
            setShowPaymentResultModal(true);
            // 상태 초기화 (모달이 한 번만 표시되도록)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);


    // 토큰 충전 선택 처리 - 바로 checkout 페이지로 이동
    const handleTokenSelect = (tokenPackage) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 주문 정보 생성
        const orderData = {
            orderId: `order_${user.id}_${Date.now()}`,
            amount: getTokenPrice(tokenPackage.productName), // productName 사용
            productName: tokenPackage.productName,           // productName 사용
            productDescription: tokenPackage.description,
            userId: user.id,
            timestamp: Date.now()
        };

        console.log("📦 토큰 패키지 정보:", tokenPackage);
        console.log("📦 패키지 정보:", {
            displayName: tokenPackage.name,
            productName: tokenPackage.productName
        });
        console.log("📦 생성된 주문 정보:", orderData);

        // localStorage에 주문 정보 저장
        localStorage.setItem('currentOrder', JSON.stringify(orderData));

        // checkout 페이지로 바로 이동
        window.location.href = `/checkout?product=${encodeURIComponent(tokenPackage.productName)}&amount=${orderData.amount}`;
    };





    // 토큰 충전 패키지별 가격 반환
    const getTokenPrice = (packageName) => {
        const tokenPrices = {
            'Starter': 5000,
            'Standard': 40000,
            'Enterprise': 300000,
            // 기존 API 호환성을 위한 매핑
            '1000 토큰': 5000,
            '10000 토큰': 40000,
            '100000 토큰': 300000
        };
        return tokenPrices[packageName] || 0;
    };

    // API 상품명을 UI 표시용 이름으로 변환
    const getDisplayName = (productName) => {
        const displayMapping = {
            '1000 토큰': 'Starter',
            '10000 토큰': 'Standard',
            '100000 토큰': 'Enterprise'
        };
        return displayMapping[productName] || productName;
    };


    // 토큰 충전 패키지 옵션 (3개)
    const tokenPackages = [
        {
            id: '1000',
            name: 'Starter',           // UI 표시용 이름
            productName: '1000 토큰',  // API 전송용 상품명
            price: '₩5,000',
            tokens: 1000,
            description: '1,000 토큰 제공 (토큰당 5원)',
            features: [
                '초기 부담 최소화',
                '신규 사용자 추천',
                '간편한 결제'
            ]
        },
        {
            id: '10k',
            name: 'Standard',          // UI 표시용 이름
            productName: '10000 토큰', // API 전송용 상품명
            price: '₩40,000',
            tokens: 10000,
            description: '10,000 토큰 제공 (토큰당 4원)',
            features: [
                '일반 사용자 최적화',
                '20% 할인 혜택',
                '안정적인 서비스'
            ]
        },
        {
            id: '100k',
            name: 'Enterprise',        // UI 표시용 이름
            productName: '100000 토큰', // API 전송용 상품명
            price: '₩300,000',
            tokens: 100000,
            description: '100,000 토큰 제공 (토큰당 3원)',
            features: [
                '대규모 트래픽 처리',
                '40% 할인 혜택',
                '기업용 최적화'
            ]
        }
    ];




    // 초기 로드 완료 여부 추적
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

    // 초기 데이터 로드 (투트랙 시스템 - 페이지 로드 에러)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 모든 API 호출을 에러 처리와 함께 실행 (모든 API가 성공해야만 완료)
                const allSuccessful = await executeAllWithErrorHandling([
                    {
                        apiCall: () => loadAllRequestsStats(),
                        operation: '결제 정보 로드',
                        onSuccess: () => console.log('✅ 결제 정보 로드 완료')
                    }
                ]);

                if (allSuccessful) {
                    console.log('✅ 모든 초기 데이터 로드 완료');
                    setIsInitialLoadComplete(true); // 성공한 경우에만 초기 로드 완료
                } else {
                    console.log('❌ 일부 API 호출이 실패했습니다. 에러 모달이 표시됩니다.');
                    // 실패한 경우에는 초기 로드 상태 유지 (isInitialLoadComplete = false)
                }
            } catch (error) {
                console.error('❌ 초기 데이터 로드 중 예상치 못한 오류:', error);
                // 에러는 executeAllWithErrorHandling에서 처리됨
            }
        };

        if (user && !isInitialLoadComplete) {
            loadInitialData();
        }
    }, [user, isInitialLoadComplete, loadAllRequestsStats, executeAllWithErrorHandling]);

    // 모든 데이터가 로드될 때까지 로딩 표시 (투트랙 시스템)
    const isDataLoading = !user || !isInitialLoadComplete;

    return (
        <DashboardLayout
            title="요금"
            subtitle="토큰을 충전하고 구매 내역을 확인하세요"
        >
            {isDataLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4 bg-transparent">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        결제 정보를 불러오는 중...
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 토큰 현황 및 사용량 통계 */}
                    <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`${T.sectionTitle} text-gray-900 dark:text-gray-100`}>토큰 현황 및 사용량 통계</h2>
                            <button
                                onClick={() => setIsPlanChangeModalOpen(true)}
                                className="px-6 py-2 bg-blue-700 dark:bg-blue-600 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                토큰 충전
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 현재 보유 토큰 현황 */}
                            <div className="lg:col-span-1 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800 flex flex-col justify-center">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-center">현재 보유 토큰 현황</h4>

                                <div className="text-center mb-5">
                                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                        {user?.token ? user.token.toLocaleString() : '0'}
                                    </div>
                                    <div className="text-base text-blue-800 dark:text-blue-200">보유 토큰</div>
                                </div>

                                {/* 예상 사용 가능 일수 */}
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-300 dark:border-blue-700">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                            {user?.token && requestsStats.weekly.currentCount > 0 ?
                                                Math.ceil(user.token / (requestsStats.weekly.currentCount / 7)) :
                                                '∞'
                                            }일
                                        </div>
                                        <div className="text-xs text-blue-800 dark:text-blue-200">
                                            예상 사용 가능 일수
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                            (일평균 {Math.round(requestsStats.weekly.currentCount / 7).toLocaleString()} 토큰 기준)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 토큰 사용량 통계 */}
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-2 gap-3 h-full">
                                    {/* 오늘 사용량 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full">
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">오늘 사용량</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {requestsStats.daily.currentCount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-500">토큰</div>
                                        </div>
                                        <div className="text-right">
                                            {requestsStats.daily.rate > 0 ? (
                                                <div className="flex items-center text-green-700 dark:text-green-300">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 4l8 16H4L12 4z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">+{Math.ceil(requestsStats.daily.rate)}%</span>
                                                </div>
                                            ) : requestsStats.daily.rate < 0 ? (
                                                <div className="flex items-center text-red-600 dark:text-red-400">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 20l-8-16h16l-8 16z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{Math.ceil(requestsStats.daily.rate)}%</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="3" y="11" width="18" height="2" rx="1" />
                                                    </svg>
                                                    <span className="text-sm font-medium">0%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 이번 주 사용량 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full">
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">이번 주 사용량</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {requestsStats.weekly.currentCount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-500">토큰</div>
                                        </div>
                                        <div className="text-right">
                                            {requestsStats.weekly.rate > 0 ? (
                                                <div className="flex items-center text-green-700 dark:text-green-300">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 4l8 16H4L12 4z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">+{Math.ceil(requestsStats.weekly.rate)}%</span>
                                                </div>
                                            ) : requestsStats.weekly.rate < 0 ? (
                                                <div className="flex items-center text-red-600 dark:text-red-400">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 20l-8-16h16l-8 16z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{Math.ceil(requestsStats.weekly.rate)}%</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="3" y="11" width="18" height="2" rx="1" />
                                                    </svg>
                                                    <span className="text-sm font-medium">0%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 이번 달 사용량 */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full">
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">이번 달 사용량</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {requestsStats.monthly.currentCount.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-500">토큰</div>
                                        </div>
                                        <div className="text-right">
                                            {requestsStats.monthly.rate > 0 ? (
                                                <div className="flex items-center text-green-700 dark:text-green-300">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 4l8 16H4L12 4z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">+{Math.ceil(requestsStats.monthly.rate)}%</span>
                                                </div>
                                            ) : requestsStats.monthly.rate < 0 ? (
                                                <div className="flex items-center text-red-600 dark:text-red-400">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 20l-8-16h16l-8 16z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{Math.ceil(requestsStats.monthly.rate)}%</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="3" y="11" width="18" height="2" rx="1" />
                                                    </svg>
                                                    <span className="text-sm font-medium">0%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 평균 일일 사용량 */}
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">평균 일일 사용량</div>
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {Math.round(requestsStats.weekly.currentCount / 7).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-blue-600 dark:text-blue-300">토큰/일</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* 최근 구매내역 */}
                    <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <PaymentHistoryTable />
                    </div>
                </div>
            )}

            {/* 토큰 충전 모달 */}
            <Modal
                isOpen={isPlanChangeModalOpen}
                onClose={() => setIsPlanChangeModalOpen(false)}
                title="토큰 충전"
                className="max-w-7xl"
            >
                <div className="space-y-4">
                    <p className="text-gray-900 dark:text-gray-100 text-center">
                        원하는 토큰 패키지를 선택하세요. 충전된 토큰은 즉시 사용 가능하며 유효기간이 없습니다.
                    </p>

                    {/* 토큰 패키지 선택 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tokenPackages.map((tokenPackage, index) => {
                            // 각 패키지별 고유 스타일 정의
                            const packageStyles = {
                                0: { // Starter
                                    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                                    borderColor: 'border-blue-200 dark:border-blue-700',
                                    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-300',
                                    accentColor: 'text-blue-600 dark:text-blue-400',
                                    badge: { text: '시작하기', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' },
                                    icon: '🚀'
                                },
                                1: { // Standard
                                    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                                    borderColor: 'border-green-200 dark:border-green-700',
                                    hoverBorder: 'hover:border-green-400 dark:hover:border-green-300',
                                    accentColor: 'text-green-600 dark:text-green-400',
                                    badge: { text: '인기', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
                                    icon: '⭐'
                                },
                                2: { // Enterprise
                                    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
                                    borderColor: 'border-purple-200 dark:border-purple-700',
                                    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-300',
                                    accentColor: 'text-purple-600 dark:text-purple-400',
                                    badge: { text: '프리미엄', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' },
                                    icon: '👑'
                                }
                            };

                            const style = packageStyles[index];

                            return (
                                <div
                                    key={tokenPackage.id}
                                    onClick={() => handleTokenSelect(tokenPackage)}
                                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${style.bgColor} ${style.borderColor} ${style.hoverBorder} hover:shadow-xl hover:scale-105`}
                                >
                                    {/* 배지 */}
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge.color}`}>
                                            {style.badge.text}
                                        </span>
                                    </div>

                                    {/* 아이콘 */}
                                    <div className="text-center mb-4">
                                        <div className="text-4xl mb-2">{style.icon}</div>
                                        <h4 className="font-bold theme-text-primary text-xl mb-2">{tokenPackage.name}</h4>
                                        <div className={`text-3xl font-bold ${style.accentColor} mb-1`}>{tokenPackage.price}</div>
                                        <div className="text-sm theme-text-secondary">일회성</div>
                                    </div>

                                    <p className="text-sm theme-text-secondary mb-4 text-center leading-relaxed">{tokenPackage.description}</p>

                                    <ul className="space-y-2">
                                        {tokenPackage.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center text-sm theme-text-secondary">
                                                <svg className={`w-4 h-4 mr-3 ${style.accentColor} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* 선택 버튼 */}
                                    <div className="mt-6 text-center">
                                        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${style.accentColor} bg-white dark:bg-gray-800 border-2 ${style.borderColor} font-semibold text-sm transition-all duration-300 hover:bg-opacity-10`}>
                                            선택하기
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 취소 버튼 */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setIsPlanChangeModalOpen(false)}
                            className="px-8 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </Modal>



            {/* 결제 결과 모달 */}
            <Modal
                isOpen={showPaymentResultModal}
                onClose={() => setShowPaymentResultModal(false)}
                title={paymentResult?.paymentResult === "success" ? "결제 완료" : "결제 실패"}
            >
                <div className="space-y-6">
                    {paymentResult?.paymentResult === "success" ? (
                        <>
                            <div className="text-center mb-4">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                                    결제가 완료되었습니다!
                                </h3>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">주문번호:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{paymentResult.orderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">상품명:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{getDisplayName(paymentResult.productName) || '토큰 충전'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">상품 내용:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{paymentResult.productDescription || '토큰 패키지 충전'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">결제금액:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{Number(paymentResult.amount).toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-green-600 dark:text-green-400 font-medium">
                                토큰이 즉시 충전되었습니다!
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <div className="text-6xl mb-4">❌</div>
                                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                                    결제에 실패했습니다
                                </h3>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">에러코드:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{paymentResult?.errorCode || 'UNKNOWN'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">에러메시지:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{paymentResult?.errorMessage || '알 수 없는 오류'}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-red-600 dark:text-red-400 font-medium">
                                다시 시도해주세요.
                            </p>
                        </>
                    )}

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setShowPaymentResultModal(false)}
                            className="px-6 py-2 bg-blue-700 dark:bg-blue-600 text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 에러 모달 */}
            <ErrorModal
                isOpen={errorState.isOpen}
                onClose={closeError}
                onRetry={handleRetry}
                message={errorState.message}
                isRetrying={isRetrying}
                title={errorState.title || "데이터 로드 실패"}
            />
        </DashboardLayout>
    );
}  