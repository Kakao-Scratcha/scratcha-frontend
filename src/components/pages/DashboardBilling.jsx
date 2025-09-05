import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import PaymentHistoryTable from '../ui/PaymentHistoryTable';
import { useAuthStore } from '../../stores/authStore';
import { useLocation } from 'react-router-dom';


export default function DashboardBilling() {
    // Typography scale for consistency
    const T = {
        sectionTitle: 'text-xl font-semibold',
        label: 'text-sm'
    };

    const { user } = useAuthStore();

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



    // authStore의 user.plan을 기반으로 현재 요금제 정보 생성
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

    // 현재 요금제 정보
    const currentPlanInfo = getCurrentPlanInfo();

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

    // 토큰 사용량 정보 (더미 데이터)
    const availableTokens = 1000;
    const usedTokens = 250;
    const remainingTokens = availableTokens - usedTokens;



    return (
        <DashboardLayout
            title="요금"
            subtitle="요금제 및 청구 내역을 관리하세요"
        >
            <div className="space-y-6">
                {/* 현재 요금제 */}
                <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={`${T.sectionTitle} text-gray-900 dark:text-gray-100`}>현재 요금제</h3>
                        <button
                            onClick={() => setIsPlanChangeModalOpen(true)}
                            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            토큰 충전
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 현재 요금제 정보 */}
                        <div className="lg:col-span-2">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                        {currentPlanInfo.name} 플랜
                                    </h4>
                                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                        {currentPlanInfo.price}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                    {currentPlanInfo.description}
                                </p>
                                <div className="space-y-2">
                                    {currentPlanInfo.features.map((feature, index) => (
                                        <div key={index} className="flex items-center text-sm text-blue-800 dark:text-blue-200">
                                            <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 토큰 잔액 및 구매내역 */}
                        <div className="space-y-4">
                            <div className="theme-card p-4 rounded-lg">
                                <h5 className="font-medium theme-text-primary mb-3">토큰 잔액</h5>
                                <div className="text-center mb-4">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {availableTokens.toLocaleString()}
                                    </div>
                                    <div className="text-sm theme-text-secondary">사용 가능한 토큰</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="theme-text-secondary">이번 달 사용</span>
                                        <span className="theme-text-primary font-medium">
                                            {usedTokens.toLocaleString()} 토큰
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="theme-text-secondary">남은 토큰</span>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                            {remainingTokens.toLocaleString()} 토큰
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setIsPlanChangeModalOpen(true)}
                                        className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        토큰 충전하기
                                    </button>
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

            {/* 토큰 충전 모달 */}
            <Modal
                isOpen={isPlanChangeModalOpen}
                onClose={() => setIsPlanChangeModalOpen(false)}
                title="토큰 충전"
            >
                <div className="space-y-6">
                    <p className="text-gray-900 dark:text-gray-100">
                        원하는 토큰 패키지를 선택하세요. 충전된 토큰은 즉시 사용 가능하며 유효기간이 없습니다.
                    </p>

                    {/* 토큰 패키지 선택 */}
                    <div className="space-y-4">
                        {tokenPackages.map((tokenPackage) => (
                            <div
                                key={tokenPackage.id}
                                onClick={() => handleTokenSelect(tokenPackage)}
                                className="p-4 rounded-lg border cursor-pointer transition-all theme-card hover:border-blue-400 dark:hover:border-blue-300"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold theme-text-primary">{tokenPackage.name}</h4>
                                    <div className="text-right">
                                        <div className="text-lg font-bold theme-text-primary">{tokenPackage.price}</div>
                                        <div className="text-sm theme-text-secondary">일회성</div>
                                    </div>
                                </div>
                                <p className="text-sm theme-text-secondary mb-3">{tokenPackage.description}</p>
                                <ul className="space-y-1">
                                    {tokenPackage.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm theme-text-secondary">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* 취소 버튼 */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsPlanChangeModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
                            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}  