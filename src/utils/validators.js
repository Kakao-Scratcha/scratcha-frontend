// 이메일 검증: RFC 5321/5322 기반, 총 254자 이내, 로컬 파트 64자 이내, 도메인에 점 최소 1개
export function validateEmail(value) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$|^"[^"]*"@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
    const localPart = (value || '').split('@')[0] || '';
    const isValid = emailRegex.test(value || '') && (value || '').length <= 254 && localPart.length <= 64;
    return {
        isValid,
        error: isValid ? '' : '올바른 이메일 형식을 입력해주세요. (총 254자 이내, @ 앞 최대 64자)'
    };
}

// 비밀번호 검증: 8-64자, 숫자-only 불가(영문 또는 지정 특수문자 최소 1자), 허용: 영문/숫자/!@#$%^&*()_+-=[]{};:,.?/
export function validatePassword(value) {
    const passwordRegex = /^(?=.*[A-Za-z!@#$%^&*()_+\-=[\]{};:,.?/])[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:,.?/]{8,64}$/;
    const isValid = passwordRegex.test(value || '');
    return {
        isValid,
        error: isValid ? '' : '비밀번호는 8-64자이며, 숫자만 사용할 수 없습니다. (허용: 영문/숫자/!@#$%^&*()_+-=[]{};:,.?/)'
    };
}

// 유저네임 검증: 1-30자, 한글/영문/숫자 + ._- 허용, 시작/끝/연속 특수문자 금지, 숫자-only 금지
export function validateUserName(value) {
    const nameRegex = /^(?=.{1,30}$)(?=.*[가-힣A-Za-z])[가-힣A-Za-z0-9]+(?:[._-][가-힣A-Za-z0-9]+)*$/;
    const trimmed = (value || '').trim();
    const isValid = nameRegex.test(trimmed);
    return {
        isValid,
        error: isValid ? '' : '이름은 1-30자, 한글/영문/숫자 및 ._-만 허용합니다. (시작/끝/연속 특수문자 금지, 숫자-only 불가)'
    };
}


