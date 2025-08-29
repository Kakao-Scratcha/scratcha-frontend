// 차트 데이터 포맷팅 및 빈 날짜 채우기 유틸리티

// 기간별 periodType 매핑
export const PERIOD_TYPE_MAP = {
    '전체': 'yearly',
    '30일': 'monthly',
    '7일': 'weekly',
    '1일': 'daily'
};

// API 응답 데이터를 차트 형식으로 변환
export const formatStatisticsData = (apiData, selectedPeriod) => {
    if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
        return [];
    }

    const periodType = PERIOD_TYPE_MAP[selectedPeriod] || 'yearly';

    return apiData.data.map(item => ({
        date: formatDateForChart(item.date, periodType),
        usage: item.totalRequests || 0,
        successCount: item.successCount || 0,
        failCount: item.failCount || 0,
        timeoutCount: item.timeoutCount || 0
    }));
};

// 날짜를 차트용 형식으로 변환
const formatDateForChart = (dateString, periodType) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    switch (periodType) {
        case 'daily': {
            // 시간 형식: "HH:00" → "H시"
            const hours = date.getHours();
            return `${hours}:00`;
        }
        case 'weekly':
        case 'monthly': {
            // 날짜 형식: "M월 D일"
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}월 ${day}일`;
        }
        case 'yearly':
        default: {
            // 월 형식: "YYYY년 M월"
            const year = date.getFullYear();
            const monthYear = date.getMonth() + 1;
            return `${year}년 ${monthYear}월`;
        }
    }
};

// 빈 날짜를 0으로 채우는 함수
export const fillEmptyDates = (data, selectedPeriod) => {
    if (!Array.isArray(data) || data.length === 0) {
        return generateEmptyData(selectedPeriod);
    }

    const dataMap = new Map();

    // 기존 데이터를 Map에 저장
    data.forEach(item => {
        dataMap.set(item.date, item);
    });

    // 기간별로 빈 날짜 생성
    const emptyData = generateEmptyData(selectedPeriod);

    // 빈 날짜에 기존 데이터가 있으면 사용, 없으면 0으로 채움
    return emptyData.map(item => {
        const existingData = dataMap.get(item.date);
        return existingData || {
            date: item.date,
            usage: 0,
            successCount: 0,
            failCount: 0,
            timeoutCount: 0
        };
    });
};

// 기간별 빈 데이터 생성
const generateEmptyData = (selectedPeriod) => {
    const now = new Date();
    const data = [];

    switch (selectedPeriod) {
        case '1일': {
            // 오늘 00시부터 현재 시간까지
            const currentHour = now.getHours();
            for (let i = 0; i <= currentHour; i++) {
                data.push({
                    date: `${i.toString().padStart(2, '0')}:00`,
                    usage: 0,
                    successCount: 0,
                    failCount: 0,
                    timeoutCount: 0
                });
            }
            break;
        }
        case '7일': {
            // 최근 7일
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({
                    date: `${date.getMonth() + 1}월 ${date.getDate()}일`,
                    usage: 0,
                    successCount: 0,
                    failCount: 0,
                    timeoutCount: 0
                });
            }
            break;
        }
        case '30일': {
            // 최근 30일
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({
                    date: `${date.getMonth() + 1}월 ${date.getDate()}일`,
                    usage: 0,
                    successCount: 0,
                    failCount: 0,
                    timeoutCount: 0
                });
            }
            break;
        }
        case '전체':
        default: {
            // 최근 12개월
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(now.getMonth() - i);
                data.push({
                    date: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
                    usage: 0,
                    successCount: 0,
                    failCount: 0,
                    timeoutCount: 0
                });
            }
            break;
        }
    }

    return data;
};

// 통합 데이터 처리 함수
export const processChartData = (apiData, selectedPeriod) => {
    const formattedData = formatStatisticsData(apiData, selectedPeriod);
    return fillEmptyDates(formattedData, selectedPeriod);
};
