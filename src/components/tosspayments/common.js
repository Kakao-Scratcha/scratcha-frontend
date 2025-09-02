// 공통 유틸리티 함수들

/**
 * 사용자 ID와 현재 시간을 조합한 주문번호 생성
 * @param {string|number} userId - 사용자 ID
 * @returns {string} 고유한 주문번호
 */
export function generateOrderId(userId) {
    const timestamp = Date.now();
    const date = new Date(timestamp);

    // 날짜 형식: YYYYMMDD_HHMMSS
    const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0') + '_' +
        date.getHours().toString().padStart(2, '0') +
        date.getMinutes().toString().padStart(2, '0') +
        date.getSeconds().toString().padStart(2, '0');

    // 밀리초 (3자리)
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    // 사용자 ID에서 숫자만 추출 (안전성을 위해)
    let userIdNumeric = '0000';

    if (userId !== undefined && userId !== null) {
        // userId를 문자열로 변환
        const userIdStr = String(userId);
        // 숫자만 추출하고 마지막 4자리 사용
        const numericMatch = userIdStr.match(/\d/g);
        if (numericMatch && numericMatch.length > 0) {
            userIdNumeric = numericMatch.slice(-4).join('').padStart(4, '0');
        }
    }

    // 주문번호 형식: USER_YYYYMMDD_HHMMSS_MMM
    return `USER_${userIdNumeric}_${dateStr}_${milliseconds}`;
}

/**
 * 기존 랜덤 문자열 생성 (하위 호환성 유지)
 * @returns {string} 20자리 랜덤 문자열
 */
export function generateRandomString() {
    return window.btoa(Math.random().toString()).slice(0, 20);
}

/**
 * 금액을 한국어 형식으로 포맷팅
 * @param {number} amount - 금액
 * @returns {string} 포맷팅된 금액 문자열
 */
export function formatCurrency(amount) {
    return amount.toLocaleString() + '원';
}
