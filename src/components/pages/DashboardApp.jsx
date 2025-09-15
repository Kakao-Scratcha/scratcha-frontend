import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import ErrorModal from '../ui/ErrorModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useDashboardStore } from '../../stores/dashboardStore';
import { applicationAPI } from '../../services/api';
import { devLog, devError } from '../../utils/logger';
import useErrorHandler from '../../hooks/useErrorHandler';

export default function DashboardApp() {
    // 에러 처리 훅
    const { errorState, closeError, handleRetry, executeAllWithErrorHandling } = useErrorHandler();

    const {
        apps,
        apiKeys,
        toggleApiKeyStatus: toggleApiKeyStatusInStore,
        refreshApplications,
        isAppsLoading,
    } = useDashboardStore();

    const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
    const [isDeleteAppModalOpen, setIsDeleteAppModalOpen] = useState(false);
    const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false);
    const [isAddApiKeyModalOpen, setIsAddApiKeyModalOpen] = useState(false);
    const [isDeleteApiKeyModalOpen, setIsDeleteApiKeyModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [selectedApiKeyId, setSelectedApiKeyId] = useState(null);
    const [expandedApps, setExpandedApps] = useState(new Set());
    const [togglingKeyIds, setTogglingKeyIds] = useState(new Set());

    // APP 설정 관련 상태 (난이도 설정 모달용)
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    // 난이도 설정 모달 상태
    const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
    const [selectedAppForDifficulty, setSelectedAppForDifficulty] = useState(null);
    const [tempDifficulty, setTempDifficulty] = useState('middle');

    // API 관련 상태
    const [loading, setLoading] = useState(false);
    const [_errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    // 초기 로드 여부를 추적하는 state (리렌더링을 위해)
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // 새 APP 폼 상태
    const [newAppForm, setNewAppForm] = useState({
        name: '',
        description: '',
        difficulty: 'middle'
    });

    // APP 수정 폼 상태
    const [editAppForm, setEditAppForm] = useState({
        name: '',
        description: ''
    });

    // 새 API 키 폼 상태
    const [newApiKeyForm, setNewApiKeyForm] = useState({
        difficulty: 'middle'
    });

    // APP 확장/축소 토글
    const toggleAppExpansion = (appId) => {
        const newExpanded = new Set(expandedApps);
        if (newExpanded.has(appId)) {
            newExpanded.delete(appId);
        } else {
            newExpanded.add(appId);
        }
        setExpandedApps(newExpanded);
    };

    // 선택된 APP과 API 키들
    const selectedApp = apps?.find(app => app.id === selectedAppId);
    const selectedApiKey = apiKeys?.find(key => key.id === selectedApiKeyId);


    // API 에러 처리 함수
    const handleApiError = (error, operation) => {
        devError(`❌ ${operation} 실패:`, error);

        let errorMessage = `${operation} 중 오류가 발생했습니다.`;

        // 서버 응답이 있는 경우 상세 정보 표시
        if (error.response) {
            const status = error.response.status;
            const statusText = error.response.statusText;
            const responseData = error.response.data;

            devError(`📡 서버 응답 상세:`, {
                status,
                statusText,
                data: responseData,
                headers: error.response.headers
            });

            // 서버에서 보낸 메시지를 우선적으로 확인
            if (responseData?.detail) {
                if (Array.isArray(responseData.detail)) {
                    errorMessage = responseData.detail
                        .map(item => item.msg || item.message || JSON.stringify(item))
                        .join(', ');
                } else {
                    errorMessage = responseData.detail;
                }
            } else if (responseData?.message) {
                errorMessage = responseData.message;
            } else {
                // 서버 메시지가 없는 경우에만 기본 메시지 사용
                if (status === 401) {
                    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
                } else if (status === 403) {
                    errorMessage = '권한이 없습니다.';
                } else if (status === 404) {
                    if (operation === '애플리케이션 목록 로드') {
                        return; // 앱이 없는 것은 정상적인 상황
                    } else {
                        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
                    }
                } else if (status === 422) {
                    errorMessage = '앱을 삭제할 수 없습니다. API 키가 연결되어 있거나 다른 제약 조건이 있을 수 있습니다.';
                } else {
                    // 서버 응답이 있지만 구체적인 오류 메시지가 없는 경우
                    errorMessage = `서버 오류 (${status} ${statusText})\n\n응답 내용:\n${JSON.stringify(responseData, null, 2)}`;
                }
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        setErrorModal({ isOpen: true, message: errorMessage });
    };

    // 데이터 로드 함수
    const loadApplications = useCallback(async () => {
        setLoading(true);
        try {
            const result = await refreshApplications();
            return result; // 성공 시 결과 반환
        } catch (error) {
            devError('❌ 애플리케이션 데이터 로드 실패:', error);
            throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
        } finally {
            setLoading(false);
        }
    }, [refreshApplications]);

    // APP 추가 처리
    const handleAddApp = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!newAppForm.name.trim()) {
            setErrorModal({ isOpen: true, message: '앱 이름을 입력해주세요.' });
            return;
        }

        setLoading(true);
        try {
            // 1. APP 생성 (API 키가 자동으로 생성됨)
            const appResponse = await applicationAPI.createApplication({
                appName: newAppForm.name.trim(),
                description: newAppForm.description.trim(),
                expiresPolicy: 0
            });

            // 2. 생성된 APP의 ID 가져오기
            const newAppId = appResponse.data?.id;
            if (!newAppId) {
                throw new Error('생성된 APP의 ID를 찾을 수 없습니다.');
            }

            // 3. 자동 생성된 API 키의 난이도를 설정된 난이도로 변경
            const applications = await applicationAPI.getAllApplications();
            const newApp = applications.data.find(app => app.id === newAppId);
            const apiKeys = newApp?.keys || (newApp?.key ? [newApp.key] : []);

            if (newApp && apiKeys && apiKeys.length > 0) {
                const autoGeneratedApiKey = apiKeys[0];
                await applicationAPI.updateApiKeyDifficulty(autoGeneratedApiKey.id, newAppForm.difficulty);
            }

            // 4. 성공 시 폼 초기화 및 모달 닫기
            setNewAppForm({ name: '', description: '', difficulty: 'middle' });
            setIsAddAppModalOpen(false);

            // 5. 데이터 다시 조회
            try {
                await loadApplications();
            } catch (error) {
                handleApiError(error, '데이터 새로고침');
            }
        } catch (error) {
            handleApiError(error, 'APP 및 API 키 생성');
        } finally {
            setLoading(false);
        }
    };

    // APP 수정 모달 열기
    const handleOpenEditApp = (app) => {
        setSelectedAppId(app.id);
        setEditAppForm({
            name: app.name || '',
            description: app.description || ''
        });
        setIsEditAppModalOpen(true);
    };

    // APP 수정 처리
    const handleUpdateApp = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!selectedAppId) {
            setErrorModal({ isOpen: true, message: '수정할 APP이 선택되지 않았습니다.' });
            return;
        }

        if (!editAppForm.name.trim()) {
            setErrorModal({ isOpen: true, message: '앱 이름을 입력해주세요.' });
            return;
        }

        setLoading(true);
        try {
            await applicationAPI.updateApplication(selectedAppId, {
                appName: editAppForm.name.trim(),
                description: editAppForm.description.trim()
            });


            setIsEditAppModalOpen(false);
            setEditAppForm({ name: '', description: '' });

            // 데이터 다시 조회
            try {
                await loadApplications();
            } catch (error) {
                handleApiError(error, '데이터 새로고침');
            }
        } catch (error) {
            handleApiError(error, 'APP 수정');
        } finally {
            setLoading(false);
        }
    };

    // APP 삭제 처리
    const handleDeleteApp = async () => {
        if (!selectedAppId) {
            return;
        }

        setLoading(true);
        try {
            await applicationAPI.deleteApplication(selectedAppId);

            setSelectedAppId(null);
            setIsDeleteAppModalOpen(false);

            // 데이터 다시 조회
            devLog('�� APP 삭제 후 데이터 다시 조회 시작');
            try {
                await loadApplications();
            } catch (error) {
                handleApiError(error, '데이터 새로고침');
            }
        } catch (error) {
            handleApiError(error, 'APP 삭제');
        } finally {
            setLoading(false);
        }
    };

    // API 키 추가 처리
    const handleAddApiKey = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!selectedAppId) {
            setErrorModal({ isOpen: true, message: '앱을 선택해주세요.' });
            return;
        }


        setLoading(true);
        try {
            await applicationAPI.createApiKey({
                appId: selectedAppId,
                expiresPolicy: 0,
                difficulty: newApiKeyForm.difficulty
            });

            setNewApiKeyForm({ difficulty: 'middle' });
            setIsAddApiKeyModalOpen(false);

            // 데이터 다시 조회
            try {
                await loadApplications();
            } catch (error) {
                handleApiError(error, '데이터 새로고침');
            }
        } catch (error) {
            handleApiError(error, 'API 키 생성');
        } finally {
            setLoading(false);
        }
    };

    // API 키 삭제 처리
    const handleDeleteApiKey = async () => {
        if (!selectedApiKeyId || !selectedAppId) {
            return;
        }

        setLoading(true);
        try {
            await applicationAPI.deleteApiKey(selectedApiKeyId);

            setSelectedApiKeyId(null);
            setIsDeleteApiKeyModalOpen(false);

            // 데이터 다시 조회
            devLog('�� API 키 삭제 후 데이터 다시 조회');
            try {
                await loadApplications();
            } catch (error) {
                handleApiError(error, '데이터 새로고침');
            }
        } catch (error) {
            handleApiError(error, 'API 키 삭제');
        } finally {
            setLoading(false);
        }
    };

    // API 키 표시 (마스킹)
    const maskApiKey = (key) => {
        if (!key) return '';
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };

    // 난이도 설정 모달 관련 함수들
    const handleOpenDifficultyModal = (app) => {
        setSelectedAppForDifficulty(app);
        setTempDifficulty(app.settings.difficulty || 'low');
        setIsDifficultyModalOpen(true);
    };

    const handleCloseDifficultyModal = () => {
        setIsDifficultyModalOpen(false);
        setSelectedAppForDifficulty(null);
        setTempDifficulty('middle');
    };

    const handleSaveDifficulty = async () => {
        if (!selectedAppForDifficulty) return;

        setIsUpdatingSettings(true);
        try {
            // 해당 앱의 API 키들에 난이도 설정 적용
            const appApiKeys = useDashboardStore.getState().apiKeys.filter(key => key.appId === selectedAppForDifficulty.id);

            for (const apiKey of appApiKeys) {
                await applicationAPI.updateApiKeyDifficulty(apiKey.id, tempDifficulty);
            }

            // 앱 목록 새로고침
            try {
                await loadApplications();
            } catch (error) {
                handleApiError(error, '데이터 새로고침');
            }

            handleCloseDifficultyModal();
        } catch (error) {
            handleApiError(error, '난이도 변경');
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    // HTTP 환경에서 사용할 fallback 복사 함수
    const copyToClipboardFallback = async (text) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                return;
            } else {
                throw new Error('execCommand 실패');
            }
        } catch {
            // 사용자에게 수동 복사 안내
            const message = `API 키를 수동으로 복사해주세요:\n\n${text}`;
            alert(message);

            // 선택 가능한 텍스트로 표시
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'fixed';
            tempDiv.style.top = '50%';
            tempDiv.style.left = '50%';
            tempDiv.style.transform = 'translate(-50%, -50%)';
            tempDiv.style.background = 'white';
            tempDiv.style.padding = '20px';
            tempDiv.style.border = '2px solid #ccc';
            tempDiv.style.borderRadius = '8px';
            tempDiv.style.zIndex = '9999';
            tempDiv.innerHTML = `
                <h2>API 키 복사</h2>
                <p>아래 텍스트를 선택하여 복사하세요:</p>
                <textarea readonly style="width: 100%; height: 60px; margin: 10px 0;">${text}</textarea>
                <button onclick="this.parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">닫기</button>
            `;
            document.body.appendChild(tempDiv);

            throw new Error('수동 복사 안내 표시됨');
        }
    };

    // 초기 데이터 로드 (투트랙 시스템 - 페이지 로드 에러)
    useEffect(() => {
        // 초기 로드가 이미 완료된 경우 실행하지 않음
        if (!isInitialLoad) return;

        const loadInitialData = async () => {
            try {
                // 모든 API 호출을 에러 처리와 함께 실행 (모든 API가 성공해야만 완료)
                const allSuccessful = await executeAllWithErrorHandling([
                    {
                        apiCall: () => loadApplications(),
                        operation: '앱 목록 로드',
                        onSuccess: () => console.log('✅ 앱 목록 로드 완료')
                    }
                ]);

                if (allSuccessful) {
                    console.log('✅ 모든 초기 데이터 로드 완료');
                    setIsInitialLoad(false); // 성공한 경우에만 로딩 완료
                } else {
                    console.log('❌ 일부 API 호출이 실패했습니다. 에러 모달이 표시됩니다.');
                    // 실패한 경우에는 로딩 상태 유지 (isInitialLoad = true)
                }
            } catch (error) {
                console.error('❌ 초기 데이터 로드 중 예상치 못한 오류:', error);
                // 예상치 못한 오류의 경우에도 로딩 상태 유지 (에러 모달 표시를 위해)
                // isInitialLoad는 그대로 true로 유지
            }
        };

        loadInitialData();
    }, [loadApplications, executeAllWithErrorHandling, isInitialLoad]);

    // 모든 데이터가 로드될 때까지 로딩 표시 (투트랙 시스템)
    const isDataLoading = isAppsLoading || loading || isInitialLoad;

    return (
        <DashboardLayout
            title="APP"
            subtitle="APP 및 API 키를 관리하세요"
        >
            {isDataLoading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4 bg-transparent">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        APP 데이터를 불러오는 중...
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* ===== 통합 APP 관리 ===== */}
                    <div className="p-6 rounded-lg theme-card border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold theme-text-primary">APP 관리</h2>
                            </div>
                            <button
                                onClick={() => setIsAddAppModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>APP 추가</span>
                            </button>
                        </div>
                        <p className="text-sm theme-text-secondary mb-6">
                            총 {apps.length}개의 앱이 있습니다 ({apps.length}/3)
                        </p>

                        {/* 통합 APP 카드들 */}
                        <div className="space-y-6">
                            {(() => {
                                const filteredApps = apps.filter((app, index, self) =>
                                    index === self.findIndex(a => a.id === app.id)
                                );
                                return filteredApps;
                            })().map((app, index) => (
                                <div key={`integrated_app_${app.id}`} className="relative">
                                    <div className="theme-card border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                                        {/* APP 헤더 - 통합 버전 */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    {/* APP 번호 표시 */}
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1 max-w-md">
                                                        <h3
                                                            className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate cursor-help"
                                                            title={app.name}
                                                        >
                                                            {app.name}
                                                        </h3>
                                                        <p
                                                            className="text-sm text-gray-600 dark:text-gray-400 truncate"
                                                            title={app.description}
                                                        >
                                                            {app.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    {/* 난이도 표시 - API 키가 있을 때만 표시 */}
                                                    {apiKeys?.filter(key => key.appId === app.id).length > 0 && (
                                                        <button
                                                            onClick={() => handleOpenDifficultyModal(app)}
                                                            className="group relative px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${(app.settings.difficulty || 'low') === 'low'
                                                                ? 'bg-green-500'
                                                                : (app.settings.difficulty || 'low') === 'middle'
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-red-500'
                                                                }`}></div>
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                난이도 설정
                                                            </span>
                                                        </button>
                                                    )}

                                                    {/* 액션 버튼들 - 개선된 디자인 */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditApp(app)}
                                                            disabled={loading}
                                                            className="group relative px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            <span>수정</span>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedAppId(app.id);
                                                                setIsDeleteAppModalOpen(true);
                                                            }}
                                                            disabled={loading}
                                                            className="group relative px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            <span>삭제</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 간결한 요약 정보 */}
                                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                                                {/* 좌측: 핵심 정보 */}
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">상태:</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${app.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {app.status === 'active' ? '활성' : '비활성'}
                                                        </span>
                                                    </div>

                                                    {apiKeys?.filter(key => key.appId === app.id).length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">난이도:</span>
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${(app.settings.difficulty || 'low') === 'low'
                                                                ? 'bg-green-100 text-green-800'
                                                                : (app.settings.difficulty || 'low') === 'middle'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {(app.settings.difficulty || 'low') === 'low' ? '쉬움' :
                                                                    (app.settings.difficulty || 'low') === 'middle' ? '보통' : '어려움'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">API 키:</span>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                            {apiKeys?.filter(key => key.appId === app.id).length || 0}개
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 우측: 확장/API 키 추가 버튼 */}
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => {
                                                            if (apiKeys?.filter(key => key.appId === app.id).length === 0) {
                                                                // API 키가 없으면 바로 API 키 추가 모달 열기
                                                                setSelectedAppId(app.id);
                                                                setIsAddApiKeyModalOpen(true);
                                                            } else {
                                                                // API 키가 있으면 확장/축소 토글
                                                                toggleAppExpansion(app.id);
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-transparent rounded-lg transition"
                                                        aria-label={apiKeys?.filter(key => key.appId === app.id).length === 0 ? "API 키 추가" : (expandedApps.has(app.id) ? "API 키 목록 접기" : "API 키 목록 펼치기")}
                                                    >
                                                        {apiKeys?.filter(key => key.appId === app.id).length === 0 ? (
                                                            // API 키가 없는 경우: 멋진 + 아이콘
                                                            <svg
                                                                className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-110"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        ) : (
                                                            // API 키가 있는 경우: 확장/축소 아이콘
                                                            <svg
                                                                className={`w-6 h-6 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-110 ${expandedApps.has(app.id) ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* API 키 섹션 (확장 시) - 기존과 동일 */}
                                            {expandedApps.has(app.id) && (
                                                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mt-6">
                                                    <div className="p-0">

                                                        <div className="space-y-0">
                                                            {(() => {
                                                                const appApiKeys = apiKeys?.filter(key => key.appId === app.id) || [];
                                                                const uniqueApiKeys = appApiKeys.filter((apiKey, index, self) =>
                                                                    index === self.findIndex(key => key.id === apiKey.id)
                                                                );
                                                                return uniqueApiKeys;
                                                            })().map((apiKey, index) => (
                                                                <div key={`full_api_key_${app.id}_${apiKey.id}_${index}`} className="w-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                                                                    {/* API 키 헤더 */}
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-3 h-3 rounded-full ${apiKey.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API 키</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={async () => {
                                                                                    const id = apiKey.id;
                                                                                    setTogglingKeyIds((prev) => {
                                                                                        const next = new Set(prev);
                                                                                        next.add(id);
                                                                                        return next;
                                                                                    });
                                                                                    // Optimistic UI 업데이트: 현재 상태 반전만 수행(한 번)
                                                                                    const currentKeys = useDashboardStore.getState().apiKeys;
                                                                                    const current = currentKeys.find(k => k.id === id);
                                                                                    const optimisticNext = current?.status === 'active' ? 'inactive' : 'active';
                                                                                    toggleApiKeyStatusInStore(id, optimisticNext);
                                                                                    try {
                                                                                        const newStatus = apiKey.status === 'active' ? false : true;
                                                                                        await applicationAPI.toggleApiKeyStatus(id, newStatus);
                                                                                        try {
                                                                                            await loadApplications();
                                                                                        } catch (error) {
                                                                                            handleApiError(error, '데이터 새로고침');
                                                                                        }
                                                                                    } catch (error) {
                                                                                        // 실패 시 롤백: 원래 상태로 되돌림
                                                                                        toggleApiKeyStatusInStore(id, current?.status);
                                                                                        handleApiError(error, 'API 키 상태 변경');
                                                                                    } finally {
                                                                                        setTogglingKeyIds((prev) => {
                                                                                            const next = new Set(prev);
                                                                                            next.delete(id);
                                                                                            return next;
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                disabled={togglingKeyIds.has(apiKey.id) || loading}
                                                                                className={`group relative px-4 py-2 ${apiKey.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    {apiKey.status === 'active' ? (
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM15 9l-6 6M9 9l6 6" />
                                                                                    ) : (
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                    )}
                                                                                </svg>
                                                                                <span>{togglingKeyIds.has(apiKey.id) ? '처리중...' : (apiKey.status === 'active' ? '비활성화' : '활성화')}</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedApiKeyId(apiKey.id);
                                                                                    setSelectedAppId(app.id);
                                                                                    setIsDeleteApiKeyModalOpen(true);
                                                                                }}
                                                                                className="group relative px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                                <span>삭제</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* API 키 값 */}
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2">
                                                                            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                                                                                {apiKey.key}
                                                                            </code>
                                                                        </div>
                                                                        <button
                                                                            onClick={async () => {
                                                                                try {
                                                                                    if (window.location.protocol === 'https:') {
                                                                                        await navigator.clipboard.writeText(apiKey.key);
                                                                                    } else {
                                                                                        await copyToClipboardFallback(apiKey.key);
                                                                                    }
                                                                                    alert('API 키가 복사되었습니다.');
                                                                                } catch {
                                                                                    alert('복사에 실패했습니다.');
                                                                                }
                                                                            }}
                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                            </svg>
                                                                            <span>복사</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {apps.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">APP이 없습니다</h2>
                                    <p className="text-gray-600 dark:text-gray-400">첫 번째 APP을 추가해보세요</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* APP 추가 모달 */}
            <Modal
                isOpen={isAddAppModalOpen}
                onClose={() => {
                    setNewAppForm({ name: '', description: '', difficulty: 'middle' });
                    setIsAddAppModalOpen(false);
                }}
                title="새 APP 추가"
            >
                <form onSubmit={handleAddApp} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            APP 이름
                        </label>
                        <input
                            type="text"
                            value={newAppForm.name}
                            onChange={(e) => setNewAppForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="APP 이름을 입력하세요"
                            maxLength={100}
                            required
                            disabled={loading}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                최대 100자까지 입력 가능
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {newAppForm.name.length}/100
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            설명
                        </label>
                        <textarea
                            value={newAppForm.description}
                            onChange={(e) => setNewAppForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="APP에 대한 설명을 입력하세요"
                            rows={3}
                            maxLength={500}
                            required
                            disabled={loading}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                최대 500자까지 입력 가능
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {newAppForm.description.length}/500
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            난이도 설정
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            생성될 API 키의 기본 난이도를 설정하세요.
                        </p>
                        <div className="space-y-1">
                            <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input
                                    type="radio"
                                    name="newAppDifficulty"
                                    value="low"
                                    checked={newAppForm.difficulty === 'low'}
                                    onChange={(e) => setNewAppForm(prev => ({ ...prev, difficulty: e.target.value }))}
                                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                />
                                <div className="ml-3 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">쉬움</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">낮은 노이즈 강도</div>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input
                                    type="radio"
                                    name="newAppDifficulty"
                                    value="middle"
                                    checked={newAppForm.difficulty === 'middle'}
                                    onChange={(e) => setNewAppForm(prev => ({ ...prev, difficulty: e.target.value }))}
                                    className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                                />
                                <div className="ml-3 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">보통</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">중간 노이즈 강도</div>
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input
                                    type="radio"
                                    name="newAppDifficulty"
                                    value="high"
                                    checked={newAppForm.difficulty === 'high'}
                                    onChange={(e) => setNewAppForm(prev => ({ ...prev, difficulty: e.target.value }))}
                                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <div className="ml-3 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">어려움</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">높은 노이즈 강도</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setNewAppForm({ name: '', description: '', difficulty: 'middle' });
                                setIsAddAppModalOpen(false);
                            }}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-transparent transition disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? '추가 중...' : '추가'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* APP 수정 모달 */}
            <Modal
                isOpen={isEditAppModalOpen}
                onClose={() => setIsEditAppModalOpen(false)}
                title="APP 수정"
            >
                <form onSubmit={handleUpdateApp} className="space-y-4">
                    {selectedApp && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">선택한 APP</p>
                            <p
                                className="font-medium text-gray-900 dark:text-gray-100 truncate cursor-help"
                                title={selectedApp.name}
                            >
                                {selectedApp.name}
                            </p>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 truncate cursor-help"
                                title={selectedApp.description}
                            >
                                {selectedApp.description}
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            APP 이름
                        </label>
                        <input
                            type="text"
                            value={editAppForm.name}
                            onChange={(e) => setEditAppForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="APP 이름을 입력하세요"
                            maxLength={100}
                            required
                            disabled={loading}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                최대 100자까지 입력 가능
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {editAppForm.name.length}/100
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            설명
                        </label>
                        <textarea
                            value={editAppForm.description}
                            onChange={(e) => setEditAppForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="APP에 대한 설명을 입력하세요"
                            rows={3}
                            maxLength={500}
                            disabled={loading}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                최대 500자까지 입력 가능
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {editAppForm.description.length}/500
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditAppModalOpen(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-transparent transition disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* APP 삭제 확인 모달 */}
            <Modal
                isOpen={isDeleteAppModalOpen}
                onClose={() => setIsDeleteAppModalOpen(false)}
                title="APP 삭제 확인"
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
                            APP을 삭제하면 모든 API 키와 관련 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
                        </p>
                    </div>

                    {selectedApp && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">삭제할 APP:</p>
                            <p
                                className="text-gray-900 dark:text-gray-100 truncate cursor-help"
                                title={selectedApp.name}
                            >
                                {selectedApp.name}
                            </p>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 truncate cursor-help"
                                title={selectedApp.description}
                            >
                                {selectedApp.description}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsDeleteAppModalOpen(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-transparent transition disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDeleteApp}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {loading ? '삭제 중...' : '삭제'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* API 키 추가 모달 */}
            <Modal
                isOpen={isAddApiKeyModalOpen}
                onClose={() => setIsAddApiKeyModalOpen(false)}
                title="새 API 키 추가"
            >
                <form onSubmit={handleAddApiKey} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            난이도
                        </label>
                        <select
                            value={newApiKeyForm.difficulty || 'middle'}
                            onChange={(e) => setNewApiKeyForm(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="low">쉬움</option>
                            <option value="middle">보통</option>
                            <option value="high">어려움</option>
                        </select>
                    </div>

                    {selectedApp && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">선택된 APP:</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate" title={selectedApp.name}>{selectedApp.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedApp.id}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddApiKeyModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-transparent transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? '추가 중...' : '추가'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* API 키 삭제 확인 모달 */}
            <Modal
                isOpen={isDeleteApiKeyModalOpen}
                onClose={() => setIsDeleteApiKeyModalOpen(false)}
                title="API 키 삭제 확인"
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
                            API 키를 삭제하면 해당 키로는 더 이상 API 호출을 할 수 없습니다.
                        </p>
                    </div>

                    {selectedApiKey && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">삭제할 API 키:</p>
                            <p
                                className="text-gray-900 dark:text-gray-100 truncate cursor-help"
                                title={selectedApiKey.name}
                            >
                                {selectedApiKey.name}
                            </p>
                            <p
                                className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate cursor-help"
                                title={selectedApiKey.key}
                            >
                                {maskApiKey(selectedApiKey.key)}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsDeleteApiKeyModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-transparent transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDeleteApiKey}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {loading ? '삭제 중...' : '삭제'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 기존 API 연동 에러 모달 (앱 추가/수정/삭제 등 액션별 에러용) */}
            <Modal
                isOpen={_errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                title="오류 발생"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="font-medium text-red-800">오류</span>
                        </div>
                        <p className="text-red-700 mt-2 whitespace-pre-wrap break-words">{_errorModal.message}</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setErrorModal({ isOpen: false, message: '' })}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 난이도 설정 모달 */}
            <Modal
                isOpen={isDifficultyModalOpen}
                onClose={handleCloseDifficultyModal}
                title="난이도 설정"
            >
                {selectedAppForDifficulty && (
                    <div className="space-y-4">
                        <div>
                            <h3
                                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate cursor-help"
                                title={selectedAppForDifficulty.name}
                            >
                                {selectedAppForDifficulty.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                캡차의 난이도를 설정하세요. 난이도가 높을수록 캡차가 어려워지지만 보안성이 향상됩니다.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                난이도 선택
                            </label>
                            <div className="space-y-1">
                                <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value="low"
                                        checked={tempDifficulty === 'low'}
                                        onChange={(e) => setTempDifficulty(e.target.value)}
                                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                    />
                                    <div className="ml-3 flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">쉬움</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">낮은 노이즈 강도</div>
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value="middle"
                                        checked={tempDifficulty === 'middle'}
                                        onChange={(e) => setTempDifficulty(e.target.value)}
                                        className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                                    />
                                    <div className="ml-3 flex items-center gap-3">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">보통</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">중간 노이즈 강도</div>
                                        </div>
                                    </div>
                                </label>

                                <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value="high"
                                        checked={tempDifficulty === 'high'}
                                        onChange={(e) => setTempDifficulty(e.target.value)}
                                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <div className="ml-3 flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">어려움</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">높은 노이즈 강도</div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleCloseDifficultyModal}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveDifficulty}
                                disabled={isUpdatingSettings}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUpdatingSettings && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {isUpdatingSettings ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 에러 모달 */}
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