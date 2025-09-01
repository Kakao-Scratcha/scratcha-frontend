// 대시보드 공용 더미 데이터/유틸

// 플랜/사용량 더미
export const DEFAULT_PLAN = {
    name: 'Starter',
    limit: 50000,
    used: 24500,
    price: '₩29,900',
    description: '월 50,000 토큰 제공',
    overageRate: 2.0,
    features: ['기본 API & 통계', '광고 제거', '이메일 지원'],
};

export const PLAN_USAGE_DATA = {
    current: {
        tokens: { used: 24500, limit: 50000, percentage: Math.round((24500 / 50000) * 100) },
        requests: { count: 1225, avgTokensPerRequest: 20 },
    },
    lastMonth: {
        tokens: { used: 18900, limit: 50000 },
        requests: { count: 945, avgTokensPerRequest: 20 },
        billing: { overageRate: 2.0, basePrice: 29900, overageCost: 0, totalCost: 29900 },
    },
};




