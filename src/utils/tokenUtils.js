// JWT 토큰 유틸리티 함수들
export const tokenUtils = {
    // JWT 토큰에서 payload 추출
    decodeToken: (token) => {
        try {
            const cleanToken = token.replace('Bearer ', '');
            const payload = cleanToken.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload;
        } catch (error) {
            console.error('토큰 디코딩 실패:', error);
            return null;
        }
    },

    // 토큰 만료 시간 확인
    getTokenExpiry: (token) => {
        const payload = tokenUtils.decodeToken(token);
        if (!payload || !payload.exp) return null;
        return new Date(payload.exp * 1000);
    },

    // 토큰 발급 시간 확인
    getTokenIssuedAt: (token) => {
        const payload = tokenUtils.decodeToken(token);
        if (!payload || !payload.iat) return null;
        return new Date(payload.iat * 1000);
    },

    // 토큰 만료까지 남은 시간 (분)
    getTimeUntilExpiry: (token) => {
        const expiryDate = tokenUtils.getTokenExpiry(token);
        if (!expiryDate) return null;

        const now = new Date();
        const diffInMinutes = Math.floor((expiryDate - now) / (1000 * 60));

        return diffInMinutes;
    },

    // 토큰이 만료되었는지 확인
    isTokenExpired: (token) => {
        const timeUntilExpiry = tokenUtils.getTimeUntilExpiry(token);
        return timeUntilExpiry === null || timeUntilExpiry <= 0;
    },

    // 토큰 정보 전체 출력
    getTokenInfo: (token) => {
        const payload = tokenUtils.decodeToken(token);
        const expiryDate = tokenUtils.getTokenExpiry(token);
        const issuedAt = tokenUtils.getTokenIssuedAt(token);
        const timeUntilExpiry = tokenUtils.getTimeUntilExpiry(token);
        const isExpired = tokenUtils.isTokenExpired(token);

        return {
            payload,
            expiryDate,
            issuedAt,
            timeUntilExpiry,
            isExpired,
            formattedExpiry: expiryDate ? expiryDate.toLocaleString('ko-KR') : '알 수 없음',
            formattedIssuedAt: issuedAt ? issuedAt.toLocaleString('ko-KR') : '알 수 없음',
            formattedTimeUntilExpiry: timeUntilExpiry !== null ?
                `${Math.floor(timeUntilExpiry / 60)}시간 ${timeUntilExpiry % 60}분` : '알 수 없음'
        };
    }
};
