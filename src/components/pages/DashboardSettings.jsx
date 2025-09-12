import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import ErrorModal from '../ui/ErrorModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { authAPI, paymentAPI } from '../../services/api';
import { validateUserName } from '../../utils/validators';
import { devLog, devError } from '../../utils/logger';
import useErrorHandler from '../../hooks/useErrorHandler';

export default function DashboardSettings() {
    const { user, updateUser, logout } = useAuth();

    // 에러 처리 훅 (투트랙 시스템)
    const { errorState, closeError, handleRetry, executeAllWithErrorHandling } = useErrorHandler();

    // 액션별 에러 모달 상태 (개별 에러 처리용)
    const [_errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    // 초기 로드 여부를 추적하는 ref
    const isInitialLoad = useRef(true);

    // 프리미엄 유저 확인 (결제 내역이 있는지 확인)
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [isPremiumLoading, setIsPremiumLoading] = useState(false);

    const getServerUserName = (u) => (u?.userName ?? u?.username ?? u?.name ?? u?.email ?? '');

    // 액션별 에러 처리 함수
    const handleApiError = (error, operation) => {
        console.error(`❌ ${operation} 실패:`, error);
        let errorMessage = '작업을 수행하는데 실패했습니다.';

        if (error.response?.status === 404) {
            errorMessage = '요청한 데이터를 찾을 수 없습니다.';
        } else if (error.response?.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.response?.status === 401) {
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else if (error.response?.status === 409) {
            errorMessage = '이미 사용 중인 이름입니다.';
        } else if (error.response?.status === 400) {
            errorMessage = '입력 정보를 확인해주세요.';
        } else if (error.response?.status === 422) {
            errorMessage = '입력 정보를 확인해주세요.';
        }

        setErrorModal({
            isOpen: true,
            message: errorMessage
        });
    };

    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 사용량 경고 설정 상태
    const [usageWarningEnabled, setUsageWarningEnabled] = useState(false);
    const [usageWarningThreshold, setUsageWarningThreshold] = useState(1000);
    // 이름 변경 폼
    const [nameForm, setNameForm] = useState({
        currentName: getServerUserName(user),
        newName: ''
    });
    // 비밀번호 UI용 상태
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // 사용자 정보가 변경될 때마다 이름 폼 업데이트
    useEffect(() => {
        const serverName = getServerUserName(user);
        if (serverName && serverName !== nameForm.currentName) {
            setNameForm(prev => ({
                ...prev,
                currentName: serverName
            }));
        }
    }, [user, nameForm.currentName]);

    // 사용량 경고 설정 저장/불러오기 함수들
    const saveUsageWarningSettings = useCallback((enabled, threshold) => {
        if (user?.id) {
            const settings = {
                enabled,
                threshold,
                userId: user.id,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(`usageWarning_${user.id}`, JSON.stringify(settings));
            devLog('✅ 사용량 경고 설정 저장:', settings);
        }
    }, [user?.id]);


    // 프리미엄 유저 확인 함수
    const checkPremiumStatus = useCallback(async () => {
        try {
            setIsPremiumLoading(true);
            const response = await paymentAPI.getPaymentHistory(1, 1);
            const hasPaymentHistory = response.data.total > 0;
            setIsPremiumUser(hasPaymentHistory);
            devLog('✅ 프리미엄 유저 확인:', { hasPaymentHistory, isPremium: hasPaymentHistory });
        } catch (error) {
            devError('❌ 프리미엄 유저 확인 실패:', error);
            setIsPremiumUser(false);
            throw error; // 에러를 다시 throw하여 useErrorHandler에서 감지할 수 있도록 함
        } finally {
            setIsPremiumLoading(false);
        }
    }, []);

    // 사용자 정보가 변경될 때마다 설정 불러오기
    useEffect(() => {
        if (user?.id) {
            try {
                const saved = localStorage.getItem(`usageWarning_${user.id}`);
                if (saved) {
                    const settings = JSON.parse(saved);
                    setUsageWarningEnabled(settings.enabled || false);
                    setUsageWarningThreshold(settings.threshold || 1000);
                }
            } catch (error) {
                console.error('사용량 경고 설정 불러오기 실패:', error);
            }
        }
    }, [user?.id]);

    // 초기 데이터 로드 (투트랙 시스템 - 페이지 로드 에러)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 모든 API 호출을 에러 처리와 함께 실행 (모든 API가 성공해야만 완료)
                const allSuccessful = await executeAllWithErrorHandling([
                    {
                        apiCall: () => checkPremiumStatus(),
                        operation: '프리미엄 상태 확인',
                        onSuccess: () => console.log('✅ 프리미엄 상태 확인 완료')
                    }
                ]);

                if (allSuccessful) {
                    console.log('✅ 모든 초기 데이터 로드 완료');
                    isInitialLoad.current = false; // 성공한 경우에만 로딩 완료
                } else {
                    console.log('❌ 일부 API 호출이 실패했습니다. 에러 모달이 표시됩니다.');
                    // 실패한 경우에는 로딩 상태 유지 (isInitialLoad.current = true)
                }
            } catch (error) {
                console.error('❌ 초기 데이터 로드 중 예상치 못한 오류:', error);
                // 예상치 못한 오류의 경우에도 초기 로드 상태 유지
            }
        };

        loadInitialData();
    }, [checkPremiumStatus, executeAllWithErrorHandling]);

    // 사용량 경고 설정 변경 핸들러
    const handleUsageWarningChange = (enabled, threshold) => {
        setUsageWarningEnabled(enabled);
        setUsageWarningThreshold(threshold);
        saveUsageWarningSettings(enabled, threshold);
    };

    // 이름 변경 처리 (투트랙 시스템 - 액션별 에러)
    const handleNameChange = async (e) => {
        e.preventDefault();
        devLog('정보 수정:', { nameForm, passwordForm });

        const trimmedName = nameForm.newName.trim();
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        // 이름 유효성 검사
        if (!trimmedName) {
            setErrorModal({
                isOpen: true,
                message: '이름을 입력해주세요.'
            });
            return;
        }

        const { isValid, error } = validateUserName(trimmedName);
        if (!isValid) {
            setErrorModal({
                isOpen: true,
                message: error
            });
            return;
        }

        // 비밀번호 변경이 있는 경우 유효성 검사
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                setErrorModal({
                    isOpen: true,
                    message: '비밀번호 변경을 위해서는 모든 비밀번호 필드를 입력해주세요.'
                });
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorModal({
                    isOpen: true,
                    message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.'
                });
                return;
            }

            if (newPassword.length < 8) {
                setErrorModal({
                    isOpen: true,
                    message: '새 비밀번호는 8자 이상이어야 합니다.'
                });
                return;
            }
        }

        setIsUpdating(true);
        try {
            devLog('🔄 정보 수정 API 호출 중...');

            // API 요청 데이터 구성
            const requestData = { userName: trimmedName };
            if (currentPassword && newPassword && confirmPassword) {
                requestData.currnetPassword = currentPassword;
                requestData.newPassword = newPassword;
                requestData.confirmPassword = confirmPassword;
            }

            const response = await authAPI.updateProfile(requestData);
            devLog('✅ 정보 수정 성공:', response.data);

            // 로컬 상태 업데이트
            updateUser({ userName: trimmedName, username: trimmedName, name: trimmedName });

            devLog('✅ 정보 수정 완료 - 로컬 상태 업데이트됨');

            setIsNameModalOpen(false);

            // 폼 초기화
            setNameForm({
                currentName: trimmedName,
                newName: ''
            });
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // 성공 메시지도 에러 모달로 표시
            setErrorModal({
                isOpen: true,
                message: '정보가 성공적으로 수정되었습니다!'
            });
        } catch (error) {
            devError('❌ 정보 수정 실패:', error);
            handleApiError(error, '정보 수정');
        } finally {
            setIsUpdating(false);
        }
    };



    // 회원 탈퇴 처리 (투트랙 시스템 - 액션별 에러)
    const handleAccountDelete = async () => {
        devLog('🗑️ 회원 탈퇴 시도');

        setIsDeleting(true);
        try {
            devLog('🔄 회원 탈퇴 API 호출 중...');
            const response = await authAPI.deleteAccount();
            devLog('✅ 회원 탈퇴 성공:', response.data);

            // 프론트엔드에서만 로그아웃 처리 (백엔드 API 없음)
            devLog('🔒 회원 탈퇴 후 프론트엔드 로그아웃 처리');
            await logout();

            // 모달 닫기
            setIsDeleteModalOpen(false);

            // 성공 메시지도 에러 모달로 표시
            setErrorModal({
                isOpen: true,
                message: '회원 탈퇴가 완료되었습니다. 로그인 페이지로 이동합니다.'
            });
            devLog('✅ 회원 탈퇴 완료');

        } catch (error) {
            devError('❌ 회원 탈퇴 실패:', error);
            handleApiError(error, '회원 탈퇴');
        } finally {
            setIsDeleting(false);
        }
    };


    // 모든 데이터가 로드될 때까지 로딩 표시 (투트랙 시스템)
    const isDataLoading = isPremiumLoading || !user || isInitialLoad.current;

    return (
        <DashboardLayout
            title="설정"
            subtitle="설정을 관리하세요"
        >
            {isDataLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4 bg-transparent">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        설정 정보를 불러오는 중...
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* 사용량 경고 설정 */}
                    {isPremiumUser && (
                        <div className="p-6 rounded-lg theme-card">
                            <h2 className="text-xl font-semibold theme-text-primary mb-6">사용량 경고 설정</h2>

                            <div className="space-y-6">
                                {/* 경고 활성화 토글 */}
                                <div className="flex items-center justify-between p-4 theme-layout-secondary rounded-lg">
                                    <div>
                                        <h4 className="font-medium theme-text-primary">토큰 사용량 경고</h4>
                                        <p className="text-sm theme-text-secondary">보유 토큰이 설정한 수치 이하로 떨어지면 경고를 표시합니다</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={usageWarningEnabled}
                                            onChange={(e) => handleUsageWarningChange(e.target.checked, usageWarningThreshold)}
                                            className="sr-only peer"
                                            aria-label="토큰 사용량 경고 활성화"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* 경고 임계값 설정 */}
                                {usageWarningEnabled && (
                                    <div className="p-4 theme-layout-secondary rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="font-medium theme-text-primary">경고 임계값</h4>
                                                <p className="text-sm theme-text-secondary">이 수치 이하로 토큰이 떨어지면 경고가 표시됩니다</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label htmlFor="usage-warning-threshold" className="text-sm font-medium theme-text-primary">경고 임계값:</label>
                                            <select
                                                id="usage-warning-threshold"
                                                value={usageWarningThreshold}
                                                onChange={(e) => handleUsageWarningChange(usageWarningEnabled, parseInt(e.target.value))}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                aria-label="경고 임계값 선택"
                                            >
                                                <option value={1000}>1,000 토큰</option>
                                                <option value={3000}>3,000 토큰</option>
                                                <option value={5000}>5,000 토큰</option>
                                                <option value={10000}>10,000 토큰</option>
                                                <option value={30000}>30,000 토큰</option>
                                                <option value={50000}>50,000 토큰</option>
                                                <option value={100000}>100,000 토큰</option>
                                            </select>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                현재 설정: <span className="font-medium text-blue-600 dark:text-blue-400">{usageWarningThreshold.toLocaleString()} 토큰</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 회원 설정 */}
                    <div className="p-6 rounded-lg theme-card">
                        <h2 className="text-xl font-semibold theme-text-primary mb-6">회원 설정</h2>

                        <div className="space-y-4">
                            {/* 이름 변경 */}
                            <div className="flex items-center justify-between p-4 theme-layout-secondary rounded-lg">
                                <div>
                                    <h4 className="font-medium theme-text-primary">회원 정보 수정</h4>
                                    <p className="text-sm theme-text-secondary">현재 이름 : {getServerUserName(user) || '설정되지 않음'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const serverName = getServerUserName(user);
                                        setNameForm(prev => ({ ...prev, currentName: serverName, newName: serverName }));
                                        setIsNameModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-blue-700 dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-800 dark:hover:bg-blue-700 transition"
                                >
                                    변경하기
                                </button>
                            </div>



                            {/* 회원 탈퇴 */}
                            <div className="flex items-center justify-between p-4 theme-layout-secondary rounded-lg">
                                <div>
                                    <h4 className="font-medium theme-text-primary">회원 탈퇴</h4>
                                    <p className="text-sm theme-text-secondary">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다</p>
                                </div>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                                >
                                    탈퇴하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 이름 변경 모달 */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title="회원 정보 수정"
                centerTitle
                hideClose
                borderless
                titleClassName="text-2xl md:text-3xl"
                headerClassName="pt-4 pb-2 px-6"
                bodyClassName="pt-2 pb-6 px-6"
            >
                <form onSubmit={handleNameChange} className="space-y-4">

                    {/* 아이디(이메일) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">아이디 (이메일)</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none"
                        />
                    </div>

                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                        <input
                            type="text"
                            value={nameForm.newName}
                            onChange={(e) => setNameForm(prev => ({ ...prev, newName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* 비밀번호 (UI만) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새로운 비밀번호</label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="새 비밀번호를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새로운 비밀번호 확인</label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsNameModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-700 dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-800 dark:hover:bg-blue-700 transition"
                            disabled={isUpdating}
                        >
                            {isUpdating ? '변경 중...' : '변경하기'}
                        </button>
                    </div>
                </form>
            </Modal>



            {/* 회원 탈퇴 확인 모달 (리디자인) */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="회원 탈퇴"
                centerTitle
                hideClose
                borderless
                headerClassName="pt-4 pb-2 px-6"
                bodyClassName="pt-2 pb-6 px-6"
            >
                <div className="space-y-5">
                    {/* 경고 박스 */}
                    <div className="p-4 rounded-lg border border-red-300 bg-red-50">
                        <div className="flex items-center gap-2 text-red-700 font-semibold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.4 14.55A1.5 1.5 0 003.1 21h17.8a1.5 1.5 0 001.21-2.59L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
                            </svg>
                            <span>회원 탈퇴 전 꼭 확인하세요</span>
                        </div>
                        <ul className="mt-3 text-sm text-red-700 list-disc pl-5 space-y-1">
                            <li>탈퇴 후 30일간 데이터 보관, 이후 완전 삭제되어 복구 불가</li>
                            <li>남은 토큰은 환불·이전 불가 (30일 경과 시 즉시 소멸)</li>
                            <li>30일 이내 복구 시 문의 절차 필수</li>
                            <li>탈퇴 시, 30일 후 모든 데이터와 권한이 완전히 삭제됩니다</li>
                        </ul>
                    </div>

                    {/* 확인 문구 */}
                    <div className="text-center text-gray-900 dark:text-white leading-relaxed">
                        <p>정말로 회원탈퇴를 진행 하시겠습니까?</p>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">이 작업은 되돌릴 수 없습니다.</p>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleAccountDelete}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                            disabled={isDeleting}
                        >
                            {isDeleting ? '탈퇴 중...' : '탈퇴하기'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 액션별 에러 모달 (정보 수정, 회원 탈퇴 등) */}
            <Modal
                isOpen={_errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                title="알림"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-blue-800">알림</span>
                        </div>
                        <p className="text-blue-700 mt-2">{_errorModal.message}</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setErrorModal({ isOpen: false, message: '' })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 페이지 로드 에러 모달 (통합 ErrorModal) */}
            <ErrorModal
                isOpen={errorState.isOpen}
                onClose={closeError}
                onRetry={handleRetry}
                message={errorState.message}
                title={errorState.title || "데이터 로드 실패"}
            />
        </DashboardLayout>
    );
} 