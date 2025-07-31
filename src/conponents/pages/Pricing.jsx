import React from 'react';

// 요금제 데이터 JSON
const PRICING_DATA = {
    title: "요금제",
    subtitle: "비즈니스 규모에 맞는 최적의 플랜을 선택하세요",
    plans: [
        {
            name: "Starter",
            price: "무료",
            period: "월",
            description: "개인 프로젝트를 위한 기본 기능",
            features: [
                "월 1,000회 캡차 검증",
                "기본 보안 기능",
                "이메일 지원",
                "API 액세스",
                "기본 통계"
            ],
            buttonText: "무료 시작",
            popular: false
        },
        {
            name: "Professional",
            price: "₩29,900",
            period: "월",
            description: "성장하는 비즈니스를 위한 완전한 솔루션",
            features: [
                "월 100,000회 캡차 검증",
                "고급 보안 기능",
                "우선 지원",
                "고급 API",
                "상세한 분석",
                "커스텀 브랜딩",
                "웹훅 지원"
            ],
            buttonText: "시작하기",
            popular: true
        },
        {
            name: "Professional2",
            price: "₩39,900",
            period: "월",
            description: "성장하는 비즈니스를 위한 완전한 솔루션",
            features: [
                "월 100,000회 캡차 검증",
                "고급 보안 기능",
                "우선 지원",
                "고급 API",
                "상세한 분석",
                "커스텀 브랜딩",
                "웹훅 지원"
            ],
            buttonText: "시작하기",
            popular: true
        },
        {
            name: "Enterprise",
            price: "문의",
            period: "",
            description: "대규모 조직을 위한 맞춤형 솔루션",
            features: [
                "무제한 캡차 검증",
                "최고 수준 보안",
                "전담 지원팀",
                "맞춤형 API",
                "실시간 모니터링",
                "SLA 보장",
                "온프레미스 옵션",
                "맞춤형 통합"
            ],
            buttonText: "문의하기",
            popular: false
        }
    ],
    faq: {
        title: "자주 묻는 질문",
        questions: [
            {
                question: "언제든지 플랜을 변경할 수 있나요?",
                answer: "네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경사항은 다음 결제 주기부터 적용됩니다."
            },
            {
                question: "무료 플랜의 제한사항은 무엇인가요?",
                answer: "무료 플랜은 월 1,000회 캡차 검증과 기본 기능을 제공합니다. 더 많은 기능이 필요하시면 유료 플랜으로 업그레이드하세요."
            },
            {
                question: "환불 정책은 어떻게 되나요?",
                answer: "30일 이내에 서비스에 만족하지 못하시면 전액 환불해드립니다. 언제든지 문의해주세요."
            },
            {
                question: "기술 지원은 어떻게 받을 수 있나요?",
                answer: "모든 플랜에서 이메일 지원을 제공하며, Professional 플랜 이상에서는 우선 지원을 받으실 수 있습니다."
            }
        ]
    }
};

export default function Pricing() {
    const { title, subtitle, plans, faq } = PRICING_DATA;

    // 그리드 컬럼 수 자동 계산
    const gridCols = plans.length === 1 ? 'grid-cols-1' :
        plans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            plans.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto px-4 py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className={`grid ${gridCols} gap-8 mb-16`}>
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl flex flex-col bg-white dark:bg-gray-800 ${plan.popular
                                ? 'border-blue-600 dark:border-blue-500 relative'
                                : 'border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    인기
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className="text-lg text-gray-600 dark:text-gray-400">
                                            /{plan.period}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-900 dark:text-white">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition mt-auto ${plan.popular
                                ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                                : 'border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white'
                                }`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
                        {faq.title}
                    </h2>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto`}>
                        {faq.questions.map((item, index) => (
                            <div key={index} className="text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {item.question}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 