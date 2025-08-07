import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import { useAuth } from '../../hooks/useAuth';
import { useDevModeStore } from '../../stores/devModeStore';
import { createDummyUser } from '../../data/dummyData';

// 배경 스타일 상수 (재렌더링 시 새 객체 생성 방지)
const backgroundStyle = { backgroundImage: 'url(/images/signin-background.png)' };

// SVG 아이콘들을 JSX 상수로 분리 (재렌더링 방지)
const CHECK_ICON = (
    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const EYE_ICON = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EYE_OFF_ICON = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
);

// 로고 링크 전체를 상수로 분리 (재렌더링 방지)
const LOGO_LINK = (
    <Link to="/" className="inline-block">
        <img
            src="/images/scratchalogo_big.png"
            alt="Scratcha"
            className="h-48 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
        />
    </Link>
);

// 가입하기 링크를 상수로 분리 (재렌더링 방지)
const SIGNUP_LINK = (
    <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
        가입하기
    </Link>
);

export default function Signin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { login, updateUser, isAuthenticated } = useAuth();
    const isDevMode = useDevModeStore(state => state.isDevMode);

    // 리다이렉트된 페이지 정보 가져오기
    const from = location.state?.from?.pathname || '/dashboard';

    // 이미 로그인된 상태로 페이지 접근 시 처리
    const [initialAuthCheck, setInitialAuthCheck] = useState(false);

    useEffect(() => {
        // 컴포넌트 마운트 시 초기 인증 상태 확인
        if (!initialAuthCheck) {
            setInitialAuthCheck(true);
            if (isAuthenticated) {
                // 이미 로그인된 상태로 접근한 경우 즉시 리다이렉트
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, navigate, initialAuthCheck]);







    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        // 현재 formData 값을 가져오기
        const currentFormData = {
            email: e.target.email?.value || '',
            password: e.target.password?.value || ''
        };


        // 클라이언트 사이드 유효성 검사
        const validationErrors = [];

        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!currentFormData.email) {
            validationErrors.push('이메일을 입력해주세요.');
        } else if (!emailRegex.test(currentFormData.email)) {
            validationErrors.push('올바른 이메일 형식을 입력해주세요.');
        }

        // 비밀번호 유효성 검사
        if (!currentFormData.password) {
            validationErrors.push('비밀번호를 입력해주세요.');
        } else if (currentFormData.password.length < 8) {
            validationErrors.push('비밀번호는 최소 8자 이상이어야 합니다.');
        }

        // 유효성 검사 실패 시
        if (validationErrors.length > 0) {
            setErrorMessage('입력하신 정보를 다시 확인해주세요.');
            setTimeout(() => {
                setIsErrorModalOpen(true);
            }, 10);
            return;
        }

        setIsLoading(true);

        if (isDevMode) {
            // 개발 모드: 더미 데이터로 로그인
            setTimeout(() => {
                setIsLoading(false);

                // admin 계정 검증
                if (currentFormData.email === 'admin@example.com' && currentFormData.password === '12345678') {
                    console.log('👑 Admin 계정 로그인 성공');
                    // admin 계정으로 로그인 성공
                    const adminUser = createDummyUser(1, 'dummyname', true);
                    // 전역 상태에 admin 사용자 정보 저장
                    updateUser(adminUser);

                    setIsSuccessModalOpen(true);
                } else {
                    console.log('👤 일반 계정 로그인 시도');
                    // 더미 데이터에 정의된 사용자인지 확인
                    const validUsers = {
                        'dev@example.com': { id: 2, name: '개발자', isAdmin: false },
                        'test@example.com': { id: 3, name: '테스터', isAdmin: false },
                        'user@example.com': { id: 4, name: '사용자', isAdmin: false }
                    };

                    const userKey = currentFormData.email.toLowerCase();
                    const validUser = validUsers[userKey];

                    if (validUser && currentFormData.password === '12345678') {
                        console.log('✅ 일반 계정 로그인 성공:', userKey);
                        // 유효한 사용자 계정으로 로그인 성공
                        const dummyUser = createDummyUser(validUser.id, validUser.name, validUser.isAdmin);
                        // 전역 상태에 더미 사용자 정보 저장
                        updateUser(dummyUser);
                        setIsSuccessModalOpen(true);
                    } else {
                        // 유효하지 않은 계정
                        setErrorMessage('로그인에 실패했습니다. 입력하신 정보를 다시 확인해주세요.');
                        setTimeout(() => {
                            setIsErrorModalOpen(true);
                        }, 10);
                    }
                }
            }, 1000);
        } else {
            // 일반 모드: 실제 API 호출
            try {
                const result = await login(currentFormData);

                if (result && result.success) {
                    setIsSuccessModalOpen(true);
                } else {
                    const errorMsg = '로그인에 실패했습니다. 입력하신 정보를 다시 확인해주세요.';
                    setErrorMessage(errorMsg);
                    setTimeout(() => {
                        setIsErrorModalOpen(true);
                    }, 10);
                }
            } catch {
                // 보안상 일관된 에러 메시지 사용
                const errorMsg = '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';

                setErrorMessage(errorMsg);
                setTimeout(() => {
                    setIsErrorModalOpen(true);
                }, 10);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isDevMode, login, updateUser]);

    const handleSuccess = useCallback(() => {
        setIsSuccessModalOpen(false);
        navigate(from, { replace: true });
    }, [navigate, from]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // 에러 모달 핸들러들 메모이제이션
    const handleErrorClose = useCallback(() => {
        setIsErrorModalOpen(false);
        setErrorMessage('');
    }, []);

    const handleErrorRetry = useCallback(() => {
        setIsErrorModalOpen(false);
        setErrorMessage('');
    }, []);

    // 성공 메시지 메모이제이션
    const successMessage = useMemo(() =>
        isDevMode
            ? "개발 모드로 로그인되었습니다. 더미 데이터를 사용합니다."
            : "로그인이 완료되었습니다. 대시보드로 이동합니다."
        , [isDevMode]);

    // 비밀번호 토글 핸들러 메모이제이션
    const handlePasswordToggle = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);

    // 이메일 변경 핸들러 메모이제이션
    const handleEmailChange = useCallback((e) => {
        handleInputChange('email', e.target.value);
    }, [handleInputChange]);

    // 비밀번호 변경 핸들러 메모이제이션
    const handlePasswordChange = useCallback((e) => {
        handleInputChange('password', e.target.value);
    }, [handleInputChange]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-contain bg-center bg-no-repeat bg-y-center"
            style={backgroundStyle}>
            {/* 배경 오버레이 - 필요시 주석 해제 */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-5"></div> */}

            {/* 로그인 모달 */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 min-h-[600px] flex flex-col justify-center">
                    {/* Scratcha 로고 */}
                    <div className="text-center mb-2">
                        {LOGO_LINK}
                    </div>

                    {/* 제목 */}
                    <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                        로그인
                    </h1>

                    {/* 환영 메시지 */}
                    <div className="text-center mb-8">
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            환영합니다! 🎉
                        </p>
                    </div>

                    {/* 개발 모드 표시 */}
                    {isDevMode && (
                        <div className="mb-6 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                            🔧 개발 모드: 더미 데이터로 로그인합니다
                        </div>
                    )}

                    {/* 개발 모드 계정 정보 */}
                    {isDevMode && (
                        <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-800 mb-2">개발용 계정 정보:</h3>
                            <div className="text-xs text-blue-700 space-y-1">
                                <div><strong>Admin 계정:</strong> Email: admin@example.com, PW: 12345678</div>
                                <div><strong>일반 계정:</strong> Email: dev@example.com/test@example.com/user@example.com, PW: 12345678</div>
                            </div>
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit}
                        noValidate
                        action="javascript:void(0)"
                    >
                        {/* 아이디 필드 */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {CHECK_ICON}
                                아이디(이메일)
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="아이디를 입력하세요"
                                value={formData.email}
                                onChange={handleEmailChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        {/* 비밀번호 필드 */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {CHECK_ICON}
                                비밀번호
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handlePasswordToggle}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? EYE_OFF_ICON : EYE_ICON}
                                </button>
                            </div>
                        </div>

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    {/* 회원가입 링크 */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            계정이 없으신가요?{' '}
                            {SIGNUP_LINK}
                        </p>
                    </div>
                </div>
            </div>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccess}
                title="로그인 성공!"
                message={successMessage}
            />
            <ErrorModal
                isOpen={isErrorModalOpen}
                onClose={handleErrorClose}
                title="로그인 실패"
                message={errorMessage || "로그인에 실패했습니다. 입력하신 정보를 다시 확인해주세요."}
                onRetry={handleErrorRetry}
            />
        </div>
    );
} 