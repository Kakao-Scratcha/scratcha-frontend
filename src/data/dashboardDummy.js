// 대시보드 공용 더미 데이터/유틸

// 차트용 더미 생성
export const generateUsageData = (period) => {
    const data = [];
    const now = new Date();
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (period) {
        case '1일': {
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now);
                time.setHours(now.getHours() - i);
                data.push({ date: `${time.getHours()}:00`, usage: rand(50, 250) });
            }
            break;
        }
        case '7일': {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({ date: `${date.getMonth() + 1}월 ${date.getDate()}일`, usage: rand(500, 1500) });
            }
            break;
        }
        case '30일': {
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({ date: `${date.getMonth() + 1}월 ${date.getDate()}일`, usage: rand(800, 2800) });
            }
            break;
        }
        default: {
            for (let i = 13; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({ date: `${date.getMonth() + 1}월 ${date.getDate()}일`, usage: rand(600, 2100) });
            }
        }
    }

    return data;
};

// 카드 통계 더미
export const generateStats = (period) => {
    const base = {
        전체: { today: 2450, week: 15200, month: 24500 },
        '1일': { today: 2100, week: 15200, month: 24500 },
        '7일': { today: 1800, week: 15200, month: 24500 },
        '30일': { today: 2300, week: 16800, month: 24500 },
    };
    const pick = base[period] || base['전체'];
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    return {
        today: { value: pick.today, change: rand(5, 20) },
        week: { value: pick.week, change: rand(3, 15) },
        month: { value: pick.month, change: rand(10, 25) },
    };
};

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

// 최근 활동 더미
export const getRecentActivities = () => [
    { id: 1, type: 'success', title: '캡차 검증 성공', time: '2분 전', count: '+1', icon: 'check' },
    { id: 2, type: 'info', title: 'API 키 생성', time: '1시간 전', count: '새 키', icon: 'settings' },
    { id: 3, type: 'warning', title: '웹훅 전송', time: '3시간 전', count: '성공', icon: 'zap' },
    { id: 4, type: 'error', title: '캡차 검증 실패', time: '5시간 전', count: '-1', icon: 'x' },
];




