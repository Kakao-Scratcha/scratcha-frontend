import React, { useState } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import ProgressBar from '../ui/ProgressBar';
import { useDashboardStore } from '../../stores/dashboardStore';

export default function DashboardBilling() {
    const {
        currentPlan,
        changePlan,
        calculateOverageCost,
        calculateTotalCost
    } = useDashboardStore();
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('Professional');

    // 요금제 옵션
    const planOptions = [
        {
            id: 'basic',
            name: 'Basic',
            price: '₩9,900',
            period: '/월',
            limit: 10000,
            description: '월 10,000회 캡차 검증',
            overageRate: 0.5,
            features: [
                '기본 캡차 서비스',
                '이메일 지원',
                '기본 분석 리포트',
                '초과분 요금: 1회당 ₩0.5'
            ]
        },
        {
            id: 'professional',
            name: 'Professional',
            price: '₩29,900',
            period: '/월',
            limit: 100000,
            description: '월 100,000회 캡차 검증',
            overageRate: 0.3,
            features: [
                '고급 캡차 서비스',
                '우선 지원',
                '상세 분석 리포트',
                'API 우선 처리',
                '초과분 요금: 1회당 ₩0.3'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: '₩99,900',
            period: '/월',
            limit: 500000,
            description: '월 500,000회 캡차 검증',
            overageRate: 0.2,
            features: [
                '엔터프라이즈 캡차 서비스',
                '24/7 전담 지원',
                '맞춤형 분석 리포트',
                '최우선 API 처리',
                '전용 서버 리소스',
                '초과분 요금: 1회당 ₩0.2'
            ]
        }
    ];

    // 실시간 사용량 계산 (더미 데이터)
    const realtimeUsage = {
        current: 24500,
        limit: currentPlan.limit,
        percentage: Math.round((currentPlan.used / currentPlan.limit) * 100)
    };

    // 초과분 요금 계산
    const overageCost = calculateOverageCost(realtimeUsage.current, currentPlan.limit, currentPlan.overageRate);
    const totalCost = calculateTotalCost(realtimeUsage.current, currentPlan.limit, currentPlan.price, currentPlan.overageRate);

    // 지난달 사용량 (더미 데이터) - 고정값
    const lastMonthUsage = {
        used: 18900,
        limit: 100000, // Professional 기준 고정
        overageRate: 0.3, // Professional 기준 고정
        basePrice: 29900, // Professional 기준 고정
        overageCost: 0, // 18900 < 100000이므로 초과분 없음
        totalCost: 29900 // 기본 요금만
    };

    // 요금제 변경 처리
    const handlePlanChange = () => {
        changePlan(selectedPlan);
        setIsPlanChangeModalOpen(false);
        alert(`${selectedPlan} 요금제로 변경되었습니다!`);
    };

    return (
        <DashboardLayout
            title="요금"
            subtitle="요금제 및 청구 내역을 관리하세요"
        >
            <div className="space-y-6">
                {/* 현재 요금제 */}
                <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">현재 요금제</h3>
                        <button
                            onClick={() => setIsPlanChangeModalOpen(true)}
                            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            요금제 변경
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 요금제 정보 */}
                        <div className="lg:col-span-2">
                            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentPlan.name}</h4>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentPlan.price}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{currentPlan.description}</p>

                                {/* 사용량 진행률 */}
                                <div className="mb-4">
                                    <ProgressBar
                                        percentage={realtimeUsage.percentage}
                                        showLabel={true}
                                        showPercentage={true}
                                    />
                                    <div className="flex items-center justify-between text-xs mt-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {realtimeUsage.limit - realtimeUsage.current}회 남음
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 요금제 특징 */}
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">포함 기능</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    고급 캡차 서비스
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    우선 지원
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    상세 분석 리포트
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    API 우선 처리
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 요금 청구 내역 */}
                <div className="theme-card p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">요금 청구 내역</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 실시간 사용량 금액 */}
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">실시간 사용량</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">이번 달 현재</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">기본 요금</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{currentPlan.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">초과 사용량</span>
                                    <span className={`font-medium ${overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {overageCost > 0 ? `₩${overageCost.toLocaleString()}` : '₩0'}
                                    </span>
                                </div>
                                {overageCost > 0 && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 p-2 rounded">
                                        초과 사용량: {realtimeUsage.current - realtimeUsage.limit}회 × ₩{currentPlan.overageRate}/회
                                    </div>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">총 금액</span>
                                        <span className={`font-bold text-lg ${overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                            ₩{totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 지난달 사용량 금액 */}
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">지난달 사용량</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">2024년 12월</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">사용량</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{lastMonthUsage.used.toLocaleString()}회</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">기본 요금</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">₩{lastMonthUsage.basePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">초과 요금</span>
                                    <span className={`font-medium ${lastMonthUsage.overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {lastMonthUsage.overageCost > 0 ? `₩${lastMonthUsage.overageCost.toLocaleString()}` : '₩0'}
                                    </span>
                                </div>
                                {lastMonthUsage.overageCost > 0 && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 p-2 rounded">
                                        초과 사용량: {lastMonthUsage.used - lastMonthUsage.limit}회 × ₩{lastMonthUsage.overageRate}/회
                                    </div>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">총 청구액</span>
                                        <span className={`font-bold text-lg ${lastMonthUsage.overageCost > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                            ₩{lastMonthUsage.totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 요금제 변경 모달 */}
            <Modal
                isOpen={isPlanChangeModalOpen}
                onClose={() => setIsPlanChangeModalOpen(false)}
                title="요금제 변경"
            >
                <div className="space-y-6">
                    <p className="text-gray-900 dark:text-gray-100">
                        새로운 요금제를 선택하세요. 변경은 즉시 적용되며, 다음 청구 주기에 반영됩니다.
                    </p>

                    {/* 요금제 선택 */}
                    <div className="space-y-4">
                        {planOptions.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.name)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedPlan === plan.name
                                    ? 'border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h4>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.price}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{plan.period}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plan.description}</p>
                                <ul className="space-y-1">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* 변경 확인 */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsPlanChangeModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handlePlanChange}
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            요금제 변경
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
} 