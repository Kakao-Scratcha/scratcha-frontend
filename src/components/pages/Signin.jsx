import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import FormField from '../forms/FormField';
import { useAuth } from '../../hooks/useAuth';
import signinBackground from '@/assets/images/signin-background.png?format=webp&q=80';
import logo from '@/assets/images/scratchalogo.svg';


// 배경 스타일 상수 (재렌더링 시 새 객체 생성 방지)
const backgroundStyle = {
    backgroundImage: `url(${signinBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
};

// SVG 아이콘들을 JSX 상수로 분리 (재렌더링 방지)
const CHECK_ICON = (
    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);


// 로고 링크 전체를 상수로 분리 (재렌더링 방지)
const LOGO_LINK = (
    <Link to="/" className="inline-block">
        <img
            src={logo}
            alt="Scratcha"
            className="h-32 md:h-40 lg:h-48 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity dark:brightness-0 dark:invert"
            width={192}
            height={48}
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
    // 로그인 페이지는 비밀번호 표시 토글을 사용하지 않음
    // 네이티브 검증 사용: 커스텀 에러 상태는 사용하지 않음

    const { login, isAuthenticated } = useAuth();

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

        // 네이티브 검증 (required/type=email) 사용하여 말풍선 표시
        const formEl = e.currentTarget;
        if (!formEl.checkValidity()) {
            formEl.reportValidity();
            return;
        }

        setIsLoading(true);

        // 실제 API 호출
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
            const errorMsg = '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
            setErrorMessage(errorMsg);
            setTimeout(() => {
                setIsErrorModalOpen(true);
            }, 10);
        } finally {
            setIsLoading(false);
        }
    }, [login]);

    const handleSuccess = useCallback(() => {
        setIsSuccessModalOpen(false);
        navigate(from, { replace: true });
    }, [navigate, from]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
    const successMessage = useMemo(() => "로그인이 완료되었습니다. 대시보드로 이동합니다.", []);


    const isSubmitDisabled = isLoading;

    // 네이티브 검증 메시지 (빈칸만 경고)
    const handleEmailInvalid = useCallback((e) => {
        const t = e.target;
        if (t.validity.valueMissing) {
            t.setCustomValidity('이 입력란을 작성하세요.');
        } else {
            t.setCustomValidity('');
        }
    }, []);
    const clearCustomValidity = useCallback((e) => {
        e.target.setCustomValidity('');
    }, []);
    const handlePasswordInvalid = useCallback((e) => {
        const t = e.target;
        if (t.validity.valueMissing) {
            t.setCustomValidity('이 입력란을 작성하세요.');
        } else {
            t.setCustomValidity('');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-contain bg-center bg-no-repeat bg-y-center"
            style={backgroundStyle}>
            {/* 배경 이미지 최적화를 위한 preload */}
            <link rel="preload" as="image" href={signinBackground} />

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

                    {/* 로그인 폼 */}
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit}
                    >
                        {/* 아이디 필드 */}
                        <FormField
                            id="email"
                            label={<span className="flex items-center gap-2">{CHECK_ICON} 아이디(이메일)</span>}
                            type="email"
                            placeholder="아이디를 입력하세요"
                            value={formData.email}
                            name="email"
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onInvalid={handleEmailInvalid}
                            onInput={clearCustomValidity}
                            required={true}
                            enableValidation={true}
                        />

                        {/* 비밀번호 필드 */}
                        <FormField
                            id="password"
                            label={<span className="flex items-center gap-2">{CHECK_ICON} 비밀번호</span>}
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={formData.password}
                            name="password"
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            onInvalid={handlePasswordInvalid}
                            onInput={clearCustomValidity}
                            required={true}
                            enableValidation={true}
                        />

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
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