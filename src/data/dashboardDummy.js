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

// 로그 기반 차트 시리즈 생성 (기간별 버킷팅)
export const bucketUsageSeries = (period, logs, anchorNow) => {
    const counts = new Map();
    const pad2 = (n) => String(n).padStart(2, '0');
    const now = anchorNow ? new Date(anchorNow) : new Date();

    // 범위 계산
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

    let rangeStart;
    let rangeEnd = now; // 기본적으로 지금까지

    if (period === '1일') {
        rangeStart = startOfDay(now); // 오늘 00:00 ~ 지금
    } else if (period === '7일') {
        const d = new Date(startOfDay(now));
        d.setDate(d.getDate() - 6); // 7일 전 00:00 ~ 지금
        rangeStart = d;
    } else if (period === '30일') {
        const d = new Date(startOfDay(now));
        d.setDate(d.getDate() - 29); // 30일 전 00:00 ~ 지금
        rangeStart = d;
    } else {
        // 전체: 1년 전 월의 1일 00:00 ~ 이번달까지
        const d = new Date(startOfMonth(now));
        d.setMonth(d.getMonth() - 11); // 최근 12개월 포함
        rangeStart = d;
    }

    // 카운트 적재 (범위 내 데이터만)
    for (const log of logs) {
        const d = new Date(log.callAt || log.callTime);
        if (Number.isNaN(d.getTime())) continue;
        if (d < rangeStart || d > rangeEnd) continue;

        let key;
        if (period === '1일') {
            key = `${pad2(d.getHours())}:00`;
        } else if (period === '7일' || period === '30일') {
            key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        } else {
            key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; // 전체: 월
        }

        counts.set(key, (counts.get(key) || 0) + 1);
    }

    // 키 시퀀스 생성 (빈 구간 0 채우기)
    const keys = [];
    if (period === '1일') {
        // 현재 시간까지만 라벨 생성 (미래시간 라벨 미생성) → null 핸들링 불필요
        const endHour = now.getHours();
        for (let h = 0; h <= endHour; h++) keys.push(`${pad2(h)}:00`);
    } else if (period === '7일') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(startOfDay(now));
            d.setDate(d.getDate() - i);
            keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
        }
    } else if (period === '30일') {
        // 30일 전부터 오늘까지
        for (let i = 29; i >= 0; i--) {
            const d = new Date(startOfDay(now));
            d.setDate(d.getDate() - i);
            keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
        }
    } else {
        // 전체: 최근 12개월 (현재 포함)
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            keys.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`);
        }
    }

    // 라벨 변환
    const toLabel = (key) => {
        if (period === '1일') return key; // HH:00
        if (period === '7일' || period === '30일') {
            const [, m, d] = key.split('-').map(Number);
            return `${m}월 ${d}일`;
        }
        const [y, m] = key.split('-').map(Number);
        return `${y}년 ${m}월`;
    };

    // 미래 구간은 표시하되 값은 null로 처리하여 점/선이 그려지지 않도록 함
    const isFutureKey = (key) => {
        if (period === '1일') {
            const hour = parseInt(String(key).split(':')[0], 10);
            return Number.isFinite(hour) && hour > now.getHours();
        }
        if (period === '30일') {
            // 30일 전부터 오늘까지이므로 미래 키는 없음
            return false;
        }
        return false; // 7일/전체는 미래 키 생성 안 함
    };

    return keys.map((key) => ({
        date: toLabel(key),
        usage: isFutureKey(key) ? null : (counts.get(key) || 0),
    }));
};

// 로그 기반 카드 통계 생성 (오늘/7일/30일)
export const computeStatsFromLogs = (logs, anchorNow) => {
    const now = anchorNow ? new Date(anchorNow) : new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);

    const currentWeekStart = new Date(startOfDay(now));
    currentWeekStart.setDate(currentWeekStart.getDate() - 6); // 오늘 포함 7일간
    const prevWeekEnd = new Date(currentWeekStart.getTime() - 1);
    const prevWeekStart = new Date(prevWeekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);

    const currentMonthStart = startOfMonth(now);
    const prevMonthEnd = new Date(currentMonthStart.getTime() - 1);
    const prevMonthStart = startOfMonth(prevMonthEnd);

    const toDate = (log) => {
        const d = new Date(log.callAt || log.callTime);
        return Number.isNaN(d.getTime()) ? null : d;
    };
    const dates = logs.map(toDate).filter(Boolean);

    const between = (s, e) => (d) => d >= s && d <= e;

    // 현재 구간 값
    const todayValue = dates.filter(between(todayStart, now)).length;
    const weekValue = dates.filter(between(currentWeekStart, now)).length;
    const monthValue = dates.filter(between(currentMonthStart, now)).length;

    // 이전 구간 값
    const yesterdayValue = dates.filter(between(yesterdayStart, yesterdayEnd)).length;
    const prevWeekValue = dates.filter(between(prevWeekStart, prevWeekEnd)).length;
    const prevMonthValue = dates.filter(between(prevMonthStart, prevMonthEnd)).length;

    const pct = (cur, prev) => {
        if (prev === 0) return cur > 0 ? 100 : 0;
        return Math.round(((cur - prev) / prev) * 100);
    };

    return {
        today: { value: todayValue, change: pct(todayValue, yesterdayValue) },
        week: { value: weekValue, change: pct(weekValue, prevWeekValue) },
        month: { value: monthValue, change: pct(monthValue, prevMonthValue) },
    };
};


