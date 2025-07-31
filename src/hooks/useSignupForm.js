import { useState } from 'react';

export function useSignupForm() {
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        passwordConfirm: '',
        email: ''
    });

    const [errors, setErrors] = useState({
        id: '',
        password: '',
        passwordConfirm: '',
        email: ''
    });

    const [validationStatus, setValidationStatus] = useState({
        id: false,
        password: false,
        passwordConfirm: false,
        email: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    const validateField = (field, value) => {
        switch (field) {
            case 'id': {
                const idRegex = /^[a-zA-Z0-9]{4,12}$/;
                return {
                    isValid: idRegex.test(value),
                    error: idRegex.test(value) ? '' : '아이디는 영문 대소문자와 숫자 4-12자로 입력해주세요.'
                };
            }
            case 'password': {
                const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,20}$/;
                return {
                    isValid: passwordRegex.test(value),
                    error: passwordRegex.test(value) ? '' : '비밀번호는 영문 대소문자, 숫자, 특수문자 8-20자로 입력해주세요.'
                };
            }
            case 'passwordConfirm': {
                return {
                    isValid: value === formData.password && value !== '',
                    error: value === formData.password ? '' : '비밀번호가 일치하지 않습니다.'
                };
            }
            case 'email': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: emailRegex.test(value),
                    error: emailRegex.test(value) ? '' : '올바른 이메일 형식을 입력해주세요.'
                };
            }
            default:
                return { isValid: false, error: '' };
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        const validation = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: validation.error }));
        setValidationStatus(prev => ({ ...prev, [field]: validation.isValid }));
    };

    const validateForm = () => {
        const fields = ['id', 'password', 'passwordConfirm', 'email'];
        const newErrors = {};
        const newValidationStatus = {};

        fields.forEach(field => {
            const validation = validateField(field, formData[field]);
            newErrors[field] = validation.error;
            newValidationStatus[field] = validation.isValid;
        });

        setErrors(newErrors);
        setValidationStatus(newValidationStatus);

        return Object.values(newErrors).every(error => error === '');
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const isSuccess = Math.random() > 0.5;
            if (isSuccess) {
                setSuccessModal({ isOpen: true, message: '회원가입이 완료되었습니다!' });
                setFormData({ id: '', password: '', passwordConfirm: '', email: '' });
            } else {
                setErrorModal({ isOpen: true, message: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' });
            }
        } catch {
            setErrorModal({ isOpen: true, message: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' });
        } finally {
            setIsLoading(false);
        }
    };

    return {
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
    };
} 