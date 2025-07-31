// 더미 데이터 관리 파일
// 개발 모드에서 사용되는 모든 더미 데이터를 중앙에서 관리

// ===== 사용자 관련 더미 데이터 =====
export const DUMMY_USERS = {
    admin: {
        id: 1,
        name: 'dummyname',
        email: 'admin@dev.com',
        roles: ['admin', 'user'],
        permissions: ['manage_apps', 'view_billing', 'manage_users', 'admin_access'],
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
    },
    default: {
        id: 2,
        name: '개발자',
        email: 'dev@dev.com',
        roles: ['user'],
        permissions: ['manage_apps', 'view_billing'],
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
    }
};

// ===== APP 관련 더미 데이터 =====
export const DUMMY_APPS = [
    {
        id: 1,
        name: 'My Website',
        description: '메인 웹사이트 캡차 서비스',
        status: 'active',
        createdAt: '2024-01-15',
        settings: {
            model: 'gpt-4',
            noiseLevel: '중',
            heuristicLevel: '중'
        },
        usage: {
            today: 450,
            week: 3200,
            month: 12500
        }
    },
    {
        id: 2,
        name: 'Mobile App',
        description: '모바일 애플리케이션 캡차',
        status: 'active',
        createdAt: '2024-01-20',
        settings: {
            model: 'gpt-3.5-turbo',
            noiseLevel: '하',
            heuristicLevel: '상'
        },
        usage: {
            today: 320,
            week: 2100,
            month: 8500
        }
    },
    {
        id: 3,
        name: 'Admin Panel',
        description: '관리자 패널 보안 캡차',
        status: 'inactive',
        createdAt: '2024-01-10',
        settings: {
            model: 'claude-3',
            noiseLevel: '상',
            heuristicLevel: '없음'
        },
        usage: {
            today: 0,
            week: 150,
            month: 3500
        }
    },
    {
        id: 4,
        name: 'API Gateway',
        description: 'API 게이트웨이 캡차 서비스',
        status: 'active',
        createdAt: '2024-01-25',
        settings: {
            model: 'gpt-4',
            noiseLevel: '중',
            heuristicLevel: '중'
        },
        usage: {
            today: 680,
            week: 4800,
            month: 18500
        }
    }
];

// ===== API 키 관련 더미 데이터 =====
export const DUMMY_API_KEYS = [
    {
        id: 1,
        name: 'Production Key',
        key: 'sk-prod-1234567890abcdef',
        appId: 1,
        status: 'active',
        createdAt: '2024-01-15',
        lastUsed: '2024-01-25T10:30:00.000Z',
        usage: {
            today: 450,
            week: 3200,
            month: 12500
        }
    },
    {
        id: 2,
        name: 'Development Key',
        key: 'sk-dev-abcdef1234567890',
        appId: 1,
        status: 'active',
        createdAt: '2024-01-16',
        lastUsed: '2024-01-25T09:15:00.000Z',
        usage: {
            today: 120,
            week: 800,
            month: 3200
        }
    },
    {
        id: 3,
        name: 'Mobile App Key',
        key: 'sk-mobile-9876543210fedcba',
        appId: 2,
        status: 'active',
        createdAt: '2024-01-20',
        lastUsed: '2024-01-25T11:45:00.000Z',
        usage: {
            today: 320,
            week: 2100,
            month: 8500
        }
    },
    {
        id: 4,
        name: 'Admin Panel Key',
        key: 'sk-admin-fedcba0987654321',
        appId: 3,
        status: 'inactive',
        createdAt: '2024-01-10',
        lastUsed: '2024-01-20T15:20:00.000Z',
        usage: {
            today: 0,
            week: 150,
            month: 3500
        }
    },
    {
        id: 5,
        name: 'Gateway Key',
        key: 'sk-gateway-abcdef1234567890',
        appId: 4,
        status: 'active',
        createdAt: '2024-01-25',
        lastUsed: '2024-01-25T12:00:00.000Z',
        usage: {
            today: 680,
            week: 4800,
            month: 18500
        }
    }
];

// ===== 사용량 통계 더미 데이터 =====
export const DUMMY_STATS = {
    '1일': { today: 2450, week: 15200, month: 24500 },
    '7일': { today: 1800, week: 15200, month: 24500 },
    '30일': { today: 2100, week: 16800, month: 24500 },
    '전체': { today: 2450, week: 15200, month: 24500 }
};

// ===== 요금제 더미 데이터 =====
export const DUMMY_PLANS = {
    basic: {
        name: 'Basic Plan',
        description: '소규모 프로젝트용',
        price: '₩29,900/월',
        limit: 10000,
        used: 8500,
        overageRate: 0.5
    },
    pro: {
        name: 'Pro Plan',
        description: '중간 규모 프로젝트용',
        price: '₩99,900/월',
        limit: 50000,
        used: 42000,
        overageRate: 0.3
    },
    enterprise: {
        name: 'Enterprise Plan',
        description: '대규모 프로젝트용',
        price: '₩299,900/월',
        limit: 200000,
        used: 185000,
        overageRate: 0.2
    }
};

// ===== 최근 활동 더미 데이터 =====
export const DUMMY_ACTIVITIES = [
    {
        id: 1,
        title: 'API 호출 성공',
        time: '2분 전',
        count: '1,234회',
        type: 'success',
        icon: 'check-circle'
    },
    {
        id: 2,
        title: '새로운 APP 등록',
        time: '5분 전',
        count: 'Mobile App',
        type: 'info',
        icon: 'plus-circle'
    },
    {
        id: 3,
        title: '사용량 한도 경고',
        time: '10분 전',
        count: '90% 도달',
        type: 'warning',
        icon: 'exclamation-triangle'
    },
    {
        id: 4,
        title: 'API 키 생성',
        time: '15분 전',
        count: 'Gateway Key',
        type: 'info',
        icon: 'key'
    },
    {
        id: 5,
        title: '인증 실패',
        time: '20분 전',
        count: '3회',
        type: 'error',
        icon: 'x-circle'
    }
];

// ===== 사용 로그 더미 데이터 =====
export const DUMMY_USAGE_LOGS = [
    {
        id: 1,
        appName: 'My Website',
        apiKey: 'sk-prod-1234567890abcdef',
        callTime: '2024-01-25 12:30:45',
        result: '성공',
        responseTime: 245
    },
    {
        id: 2,
        appName: 'Mobile App',
        apiKey: 'sk-mobile-9876543210fedcba',
        callTime: '2024-01-25 12:29:32',
        result: '성공',
        responseTime: 189
    },
    {
        id: 3,
        appName: 'API Gateway',
        apiKey: 'sk-gateway-abcdef1234567890',
        callTime: '2024-01-25 12:28:15',
        result: '타임아웃',
        responseTime: 5000
    },
    {
        id: 4,
        appName: 'My Website',
        apiKey: 'sk-dev-abcdef1234567890',
        callTime: '2024-01-25 12:27:48',
        result: '성공',
        responseTime: 312
    },
    {
        id: 5,
        appName: 'Mobile App',
        apiKey: 'sk-mobile-9876543210fedcba',
        callTime: '2024-01-25 12:26:22',
        result: '인증오류',
        responseTime: 156
    }
];

// ===== 유틸리티 함수들 =====

// 사용량 데이터 생성 함수
export const generateUsageData = (period) => {
    const data = [];
    const now = new Date();

    switch (period) {
        case '1일':
            // 24시간 데이터
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now);
                time.setHours(now.getHours() - i);
                data.push({
                    date: `${time.getHours()}:00`,
                    usage: Math.floor(Math.random() * 200) + 50
                });
            }
            break;

        case '7일':
            // 7일 데이터
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({
                    date: `${date.getMonth() + 1}월 ${date.getDate()}일`,
                    usage: Math.floor(Math.random() * 1000) + 500
                });
            }
            break;

        case '30일':
            // 30일 데이터
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({
                    date: `${date.getMonth() + 1}월 ${date.getDate()}일`,
                    usage: Math.floor(Math.random() * 2000) + 800
                });
            }
            break;

        default: // '전체'
            // 14일 데이터 (기본)
            for (let i = 13; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                data.push({
                    date: `${date.getMonth() + 1}월 ${date.getDate()}일`,
                    usage: Math.floor(Math.random() * 1500) + 600
                });
            }
            break;
    }

    return data;
};

// 통계 데이터 생성 함수
export const generateStats = (period) => {
    const usage = DUMMY_STATS[period] || DUMMY_STATS['전체'];
    return {
        today: {
            value: usage.today,
            change: Math.floor(Math.random() * 20) + 5
        },
        week: {
            value: usage.week,
            change: Math.floor(Math.random() * 15) + 3
        },
        month: {
            value: usage.month,
            change: Math.floor(Math.random() * 25) + 10
        }
    };
};

// 사용 로그 생성 함수
export const generateUsageLogs = (appId, apiKeyId, period, startId = 1) => {
    const logs = [];
    const now = new Date();
    let count = 0;

    // 기간에 따른 로그 개수 결정
    switch (period) {
        case '1일':
            count = 50;
            break;
        case '7일':
            count = 200;
            break;
        case '30일':
            count = 800;
            break;
        default:
            count = 100;
            break;
    }

    for (let i = 0; i < count; i++) {
        const logTime = new Date(now);
        logTime.setMinutes(now.getMinutes() - Math.floor(Math.random() * 1440)); // 최대 24시간 전

        const results = ['성공', '실패', '타임아웃', '인증오류'];
        const result = results[Math.floor(Math.random() * results.length)];

        const app = DUMMY_APPS.find(app => appId === 'all' || app.id === appId) || DUMMY_APPS[0];
        const apiKey = DUMMY_API_KEYS.find(key => apiKeyId === 'all' || key.id === apiKeyId) || DUMMY_API_KEYS[0];

        logs.push({
            id: startId + i,
            appName: app.name,
            apiKey: apiKey.key,
            callTime: logTime.toLocaleString('ko-KR'),
            result,
            responseTime: Math.floor(Math.random() * 500) + 100
        });
    }

    return logs.sort((a, b) => new Date(b.callTime) - new Date(a.callTime));
};

// 더미 사용자 생성 함수
export const createDummyUser = (id, name, isAdmin = false) => {
    if (isAdmin) {
        return {
            ...DUMMY_USERS.admin,
            id,
            name: name || DUMMY_USERS.admin.name,
            lastLogin: new Date().toISOString()
        };
    } else {
        return {
            ...DUMMY_USERS.default,
            id,
            name: name || DUMMY_USERS.default.name,
            lastLogin: new Date().toISOString()
        };
    }
};

// 더미 토큰 생성 함수
export const createDummyToken = (isAdmin = false) => {
    const prefix = isAdmin ? 'dev_token_admin_' : 'dev_token_';
    return prefix + Date.now();
};

// 현재 요금제 가져오기 함수
export const getCurrentPlan = () => {
    return DUMMY_PLANS.pro; // 기본적으로 Pro 플랜 반환
};

// 최근 활동 가져오기 함수
export const getRecentActivities = () => {
    return DUMMY_ACTIVITIES;
}; 