import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupForm } from '../../hooks/useSignupForm';
import FormField from '../forms/FormField';
import SignupButton from '../forms/SignupButton';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';

export default function Signup() {
    const navigate = useNavigate();
    const {
        formData,
        errors,
        validationStatus,
        isLoading,
        successModal,
        errorModal,
        handleInputChange,
        handleSignup,
        setSuccessModal,
        setErrorModal
    } = useSignupForm();

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-8 font-[Noto_Sans_KR] bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="rounded-2xl shadow-lg w-full max-w-md p-8 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {/* 페이지 타이틀 (Scratcha 로고 포함) */}
                <div className="text-center mb-8">
                    {/* Scratcha 로고 (non-clickable) */}
                    <div className="flex justify-center mb-4">
                        <img
                            src="/scratchalogo.png"
                            alt="Scratcha"
                            className="h-32 w-auto" // 2x size
                        />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                        회원가입
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        새로운 계정을 만들어보세요
                    </p>
                </div>

                {/* 알림 메시지 */}
                {successModal.isOpen && (
                    <SuccessModal
                        isOpen={successModal.isOpen}
                        message={successModal.message}
                        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
                        onConfirm={() => navigate('/signin')} // Navigate to signin on success
                    />
                )}
                {errorModal.isOpen && (
                    <ErrorModal
                        isOpen={errorModal.isOpen}
                        message={errorModal.message}
                        onClose={() => setErrorModal({ isOpen: false, message: '' })}
                        onRetry={() => { setErrorModal({ isOpen: false, message: '' }); handleSignup(); }}
                    />
                )}

                {/* 회원가입 폼 */}
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <FormField id="id" label="아이디" type="text" placeholder="아이디를 입력하세요" required={true} value={formData.id} onChange={(e) => handleInputChange('id', e.target.value)} error={errors.id} isValid={validationStatus.id} />
                    <FormField id="password" label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" required={true} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} error={errors.password} isValid={validationStatus.password} />
                    <FormField id="passwordConfirm" label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력하세요" required={true} value={formData.passwordConfirm} password={formData.password} onChange={(e) => handleInputChange('passwordConfirm', e.target.value)} error={errors.passwordConfirm} isValid={validationStatus.passwordConfirm} />
                    <FormField id="email" label="이메일" type="email" placeholder="이메일을 입력하세요" required={true} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} error={errors.email} isValid={validationStatus.email} />
                    <SignupButton loading={isLoading} onClick={handleSignup} className="mt-6" />
                </form>

                {/* 로그인 링크 */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        이미 계정이 있으신가요?{' '}
                        <a
                            href="/signin"
                            className="hover:underline font-medium text-blue-600 dark:text-blue-400"
                        >
                            로그인하기
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
} 