// 환경별 로깅 관리 유틸리티

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// 개발 환경에서만 로그 출력
export const devLog = (...args) => {
    if (isDevelopment) {
        console.log(...args);
    }
};

export const devError = (...args) => {
    if (isDevelopment) {
        console.error(...args);
    }
};

export const devWarn = (...args) => {
    if (isDevelopment) {
        console.warn(...args);
    }
};

// 프로덕션에서도 중요한 에러는 로그
export const prodError = (...args) => {
    if (isProduction) {
        console.error(...args);
    }
};

// 조건부 로깅 (환경변수로 제어)
export const conditionalLog = (condition, ...args) => {
    if (condition && isDevelopment) {
        console.log(...args);
    }
};

// 로깅 레벨 설정
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'error';

export const log = {
    debug: (...args) => {
        if (isDevelopment && LOG_LEVEL === 'debug') {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (isDevelopment && ['debug', 'info'].includes(LOG_LEVEL)) {
            console.log('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        if (isDevelopment && ['debug', 'info', 'warn'].includes(LOG_LEVEL)) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args) => {
        if (['debug', 'info', 'warn', 'error'].includes(LOG_LEVEL)) {
            console.error('[ERROR]', ...args);
        }
    }
};
