import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/api';

export default function DashboardSettings() {
    const {
        apps,
        selectedAppId,
        selectApp,
        updateAppSettings
    } = useDashboardStore();

    const { user, updateUser, logout } = useAuth();

    // const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 비밀번호 변경 폼 (주석처리)
    // const [passwordForm, setPasswordForm] = useState({
    //     currentPassword: '',
    //     newPassword: '',
    //     confirmPassword: ''
    // });

    // 이름 변경 폼
    const [nameForm, setNameForm] = useState({
        currentName: user?.username || '',
        newName: ''
    });

    // 사용자 정보가 변경될 때마다 이름 폼 업데이트
    useEffect(() => {
        console.log('🔍 사용자 정보 확인:', user);
        if (user?.username) {
            console.log('✅ 사용자 이름 업데이트:', user.username);
            setNameForm(prev => ({
                ...prev,
                currentName: user.username
            }));
        }
    }, [user?.username]);

    // 임시 설정 상태 관리
    const [tempSettings, setTempSettings] = useState({});

    // 선택된 APP
    const selectedApp = apps.find(app => app.id === selectedAppId);

    // 현재 설정 (임시 설정이 있으면 임시 설정, 없으면 원본 설정)
    const currentSettings = selectedApp ? {
        ...selectedApp.settings,
        ...tempSettings[selectedApp.id]
    } : {};

    // 서비스 설정 옵션
    const modelOptions = [
        { value: 'gpt-4', label: 'GPT-4 (고성능)' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (균형)' },
        { value: 'claude-3', label: 'Claude-3 (안정성)' },
        { value: 'custom', label: '커스텀 모델' }
    ];

    const noiseLevelOptions = [
        { value: '상', label: '상 (높은 노이즈)' },
        { value: '중', label: '중 (보통 노이즈)' },
        { value: '하', label: '하 (낮은 노이즈)' }
    ];

    const heuristicLevelOptions = [
        { value: '상', label: '상 (높은 휴리스틱)' },
        { value: '중', label: '중 (보통 휴리스틱)' },
        { value: '하', label: '하 (낮은 휴리스틱)' },
        { value: '없음', label: '없음 (휴리스틱 비활성화)' }
    ];

    // 설정 적용 처리
    const handleApplySettings = () => {
        if (selectedApp && tempSettings[selectedApp.id]) {
            // 실제 APP 설정 업데이트
            updateAppSettings(selectedApp.id, tempSettings[selectedApp.id]);

            // 임시 설정 제거
            setTempSettings(prev => {
                const newTemp = { ...prev };
                delete newTemp[selectedApp.id];
                return newTemp;
            });

            // TODO: 실제 API 호출로 설정 적용
            console.log('설정 적용:', tempSettings[selectedApp.id]);
            alert('설정이 성공적으로 적용되었습니다!');
        }
    };

    // APP 설정 변경 (임시 저장)
    const handleAppSettingChange = (field, value) => {
        if (selectedApp) {
            setTempSettings(prev => ({
                ...prev,
                [selectedApp.id]: {
                    ...prev[selectedApp.id],
                    [field]: value
                }
            }));
        }
    };

    // 이름 변경 처리
    const handleNameChange = async (e) => {
        e.preventDefault();
        console.log('이름 변경:', nameForm);

        // 회원가입과 동일한 정규식 적용
        const nameRegex = /^[가-힣a-zA-Z0-9]{1,30}$/;
        const trimmedName = nameForm.newName.trim();

        // 유효성 검사
        if (!trimmedName) {
            alert('새 이름을 입력해주세요.');
            return;
        }

        if (!nameRegex.test(trimmedName)) {
            alert('이름은 한글, 영문, 숫자만 1-30자로 입력해주세요. (공백 및 특수문자 불가)');
            return;
        }

        setIsUpdating(true);
        try {
            console.log('🔄 이름 변경 API 호출 중...');
            const response = await authAPI.updateUsername(trimmedName);
            console.log('✅ 이름 변경 성공:', response.data);

            // 로컬 상태 업데이트
            updateUser({ username: trimmedName });

            // 유저 정보 다시 불러오기 제거 (무한 호출 방지)
            console.log('✅ 이름 변경 완료 - 로컬 상태 업데이트됨');

            setIsNameModalOpen(false);
            setNameForm({
                currentName: trimmedName,
                newName: ''
            });

            alert('이름이 성공적으로 변경되었습니다!');
        } catch (error) {
            console.error('❌ 이름 변경 실패:', error);

            let errorMessage = '이름 변경에 실패했습니다.';
            if (error.response?.status === 409) {
                errorMessage = '이미 사용 중인 이름입니다.';
            } else if (error.response?.status === 422) {
                errorMessage = '입력 정보를 확인해주세요.';
            }

            alert(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    // 비밀번호 변경 처리 (주석처리)
    // const handlePasswordChange = (e) => {
    //     e.preventDefault();
    //     console.log('비밀번호 변경:', passwordForm);
    //     setIsPasswordModalOpen(false);
    //     setPasswordForm({
    //         currentPassword: '',
    //         newPassword: '',
    //         confirmPassword: ''
    //     });
    // };

    // 회원 탈퇴 처리
    const handleAccountDelete = async () => {
        console.log('🗑️ 회원 탈퇴 시도');

        setIsDeleting(true);
        try {
            console.log('🔄 회원 탈퇴 API 호출 중...');
            const response = await authAPI.deleteAccount();
            console.log('✅ 회원 탈퇴 성공:', response.data);

            // 프론트엔드에서만 로그아웃 처리 (백엔드 API 없음)
            console.log('🔒 회원 탈퇴 후 프론트엔드 로그아웃 처리');
            await logout();

            // 모달 닫기
            setIsDeleteModalOpen(false);

            // 성공 메시지
            alert('회원 탈퇴가 완료되었습니다. 로그인 페이지로 이동합니다.');
            console.log('✅ 회원 탈퇴 완료');

        } catch (error) {
            console.error('❌ 회원 탈퇴 실패:', error);

            let errorMessage = '회원 탈퇴에 실패했습니다.';
            if (error.response?.status === 401) {
                errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
            } else if (error.response?.status === 403) {
                errorMessage = '권한이 없습니다.';
            }

            alert(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    // 설정 상태 텍스트 생성 (원본 설정 기준)
    const getSettingsText = (app) => {
        const model = modelOptions.find(opt => opt.value === app.settings.model)?.label.split(' ')[0] || app.settings.model;
        return `${model} | 노이즈: ${app.settings.noiseLevel} | 휴리스틱: ${app.settings.heuristicLevel}`;
    };

    // 임시 설정이 있는지 확인
    const hasTempSettings = selectedApp && tempSettings[selectedApp.id];

    return (
        <DashboardLayout
            title="설정"
            subtitle="APP 서비스 및 계정 설정을 관리하세요"
        >
            <div className="space-y-8">
                {/* 서비스 설정 */}
                <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">서비스 설정</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* APP 리스트 */}
                        <div className="lg:col-span-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-4">APP 현황</h4>
                            <div className="space-y-3">
                                {apps.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => selectApp(app.id)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedAppId === app.id
                                            ? 'border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium text-gray-900 dark:text-white">{app.name}</h5>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {app.status === 'active' ? '활성' : '비활성'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{app.description}</p>
                                        <div className="space-y-2">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">현재 설정:</span> {getSettingsText(app)}
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                                <span>생성일: {app.createdAt}</span>
                                                <span>오늘: {app.usage.today}회</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 선택된 APP 설정 */}
                        <div className="lg:col-span-2">
                            {selectedApp ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{selectedApp.name} 설정</h4>
                                        <div className="flex items-center gap-3">
                                            {hasTempSettings && (
                                                <span className="text-sm text-orange-600 font-medium">
                                                    설정 변경됨
                                                </span>
                                            )}
                                            <button
                                                onClick={handleApplySettings}
                                                disabled={!hasTempSettings}
                                                className={`px-6 py-2 rounded-lg font-semibold transition ${hasTempSettings
                                                    ? 'bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 hover:opacity-90'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                설정 적용
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* APP 캡차 서비스 모델 설정 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                APP 캡차 서비스 모델
                                            </label>
                                            <select
                                                value={currentSettings.model || selectedApp.settings.model}
                                                onChange={(e) => handleAppSettingChange('model', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                            >
                                                {modelOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                캡차 검증에 사용할 AI 모델을 선택하세요
                                            </p>
                                        </div>

                                        {/* 노이즈 강도 설정 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                노이즈 강도
                                            </label>
                                            <select
                                                value={currentSettings.noiseLevel || selectedApp.settings.noiseLevel}
                                                onChange={(e) => handleAppSettingChange('noiseLevel', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                            >
                                                {noiseLevelOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                캡차 이미지에 적용할 노이즈 강도를 설정하세요
                                            </p>
                                        </div>

                                        {/* 휴리스틱 강도 설정 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                휴리스틱 강도
                                            </label>
                                            <select
                                                value={currentSettings.heuristicLevel || selectedApp.settings.heuristicLevel}
                                                onChange={(e) => handleAppSettingChange('heuristicLevel', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                            >
                                                {heuristicLevelOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                캡차 검증에 사용할 휴리스틱 알고리즘의 강도를 설정하세요
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-600 dark:text-gray-400">설정할 APP을 선택해주세요</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 회원 설정 */}
                <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">회원 설정</h3>

                    <div className="space-y-4">
                        {/* 이름 변경 */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">이름 변경</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">현재 이름: {user?.username || '설정되지 않음'}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setNameForm(prev => ({ ...prev, currentName: user?.username || '' }));
                                    setIsNameModalOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                            >
                                변경하기
                            </button>
                        </div>

                        {/* 비밀번호 변경 (주석처리) */}
                        {/* <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">비밀번호 변경</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">계정 보안을 위해 정기적으로 비밀번호를 변경하세요</p>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                            >
                                변경하기
                            </button>
                        </div> */}

                        {/* 회원 탈퇴 */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">회원 탈퇴</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다</p>
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                            >
                                탈퇴하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 이름 변경 모달 */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title="이름 변경"
            >
                <form onSubmit={handleNameChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            현재 이름
                        </label>
                        <input
                            type="text"
                            value={nameForm.currentName}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            변경할 이름
                        </label>
                        <input
                            type="text"
                            value={nameForm.newName}
                            onChange={(e) => setNameForm(prev => ({ ...prev, newName: e.target.value }))}
                            placeholder="새 이름을 입력하세요 (2-20자)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            이름은 2자 이상 20자 이하로 입력해주세요
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsNameModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                            disabled={isUpdating}
                        >
                            {isUpdating ? '변경 중...' : '변경하기'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* 비밀번호 변경 모달 (주석처리) */}
            {/* <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="비밀번호 변경"
            >
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            현재 비밀번호
                        </label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            새 비밀번호
                        </label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            새 비밀번호 확인
                        </label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                            변경하기
                        </button>
                    </div>
                </form>
            </Modal> */}

            {/* 회원 탈퇴 확인 모달 */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="회원 탈퇴 확인"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="font-medium text-red-800">주의</span>
                        </div>
                        <p className="text-red-700 mt-2 text-sm">
                            회원 탈퇴를 진행하면 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
                        </p>
                    </div>

                    <p className="text-gray-900 dark:text-white">
                        정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </p>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleAccountDelete}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                            disabled={isDeleting}
                        >
                            {isDeleting ? '탈퇴 중...' : '탈퇴하기'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
} 