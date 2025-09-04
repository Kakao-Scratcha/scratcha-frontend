import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { useDashboardStore } from '../../stores/dashboardStore';
import { applicationAPI } from '../../services/api';
import { devLog, devError } from '../../utils/logger';

export default function DashboardApp() {
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

    // API 관련 상태
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    // 새 APP 폼 상태
    const [newAppForm, setNewAppForm] = useState({
        name: '',
        description: ''
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
    const selectedApp = apps.find(app => app.id === selectedAppId);
    const selectedApiKey = apiKeys.find(key => key.id === selectedApiKeyId);

    // 디버깅용 로그
    if (selectedAppId) {
        devLog('🔍 selectedApp 찾기:', {
            selectedAppId,
            appsLength: apps.length,
            foundApp: selectedApp,
            allAppIds: apps.map(app => ({ id: app.id, name: app.name }))
        });
    }

    // API 에러 처리 함수
    const handleApiError = (error, operation) => {
        devError(`❌ ${operation} 실패:`, error);

        let errorMessage = `${operation} 중 오류가 발생했습니다.`;

        if (error.response?.status === 401) {
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else if (error.response?.status === 403) {
            errorMessage = '권한이 없습니다.';
        } else if (error.response?.status === 404) {
            if (operation === '애플리케이션 목록 로드') {
                return; // 앱이 없는 것은 정상적인 상황
            } else {
                errorMessage = '요청한 리소스를 찾을 수 없습니다.';
            }
        } else if (error.response?.status === 422) {
            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    errorMessage = error.response.data.detail
                        .map(item => item.msg || item.message || JSON.stringify(item))
                        .join(', ');
                } else {
                    errorMessage = error.response.data.detail;
                }
            } else {
                errorMessage = '앱을 삭제할 수 없습니다. API 키가 연결되어 있거나 다른 제약 조건이 있을 수 있습니다.';
            }
        } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.message) {
            errorMessage = error.message;
        }

        setErrorModal({ isOpen: true, message: errorMessage });
    };

    // 데이터 로드 함수 (재사용 가능)
    const loadApplications = useCallback(async () => {
        devLog('🚀 데이터 로드 시작');
        setLoading(true);
        try {
            await refreshApplications();
        } catch (error) {
            handleApiError(error, '애플리케이션 목록 로드');
        } finally {
            setLoading(false);
        }
    }, [refreshApplications]);

    // APP 추가 처리 (API 연결)
    const handleAddApp = async (e) => { // 이벤트 파라미터 추가
        // 폼 제출 기본 동작 방지
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!newAppForm.name.trim()) {
            setErrorModal({ isOpen: true, message: '앱 이름을 입력해주세요.' });
            return;
        }

        setLoading(true);
        try {
            await applicationAPI.createApplication({
                appName: newAppForm.name.trim(),
                description: newAppForm.description.trim(),
                expiresPolicy: 0
            });

            setNewAppForm({ name: '', description: '' });
            setIsAddAppModalOpen(false);

            // 데이터 다시 조회
            await loadApplications();
        } catch (error) {
            handleApiError(error, 'APP 생성');
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

    // APP 수정 처리 (API 연결)
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
            const response = await applicationAPI.updateApplication(selectedAppId, {
                appName: editAppForm.name.trim(),
                description: editAppForm.description.trim()
            });

            devLog('✅ APP 수정 성공:', response.data);

            setIsEditAppModalOpen(false);
            setEditAppForm({ name: '', description: '' });

            // 데이터 다시 조회
            await loadApplications();
        } catch (error) {
            handleApiError(error, 'APP 수정');
        } finally {
            setLoading(false);
        }
    };

    // APP 삭제 처리 (API 연결)
    const handleDeleteApp = async () => {
        devLog('🚀 handleDeleteApp 함수 시작:', { selectedAppId });

        if (!selectedAppId) {
            devLog('❌ selectedAppId가 없습니다.');
            return;
        }

        setLoading(true);
        try {
            devLog('🔄 APP 삭제 API 호출 시작:', selectedAppId);
            const response = await applicationAPI.deleteApplication(selectedAppId);
            devLog('✅ APP 삭제 API 응답:', response);

            devLog('✅ APP 삭제 성공');

            setSelectedAppId(null);
            setIsDeleteAppModalOpen(false);
            devLog('✅ 모달 닫기 완료');

            // 데이터 다시 조회
            devLog('�� APP 삭제 후 데이터 다시 조회 시작');
            await loadApplications();
            devLog('✅ 데이터 재조회 완료');
        } catch (error) {
            devLog('❌ APP 삭제 중 오류 발생:', error);
            devLog('❌ 오류 상세 정보:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            handleApiError(error, 'APP 삭제');
        } finally {
            devLog('🏁 handleDeleteApp 함수 종료');
            setLoading(false);
        }
    };

    // API 키 추가 처리
    const handleAddApiKey = async (e) => { // 이벤트 파라미터 추가
        // 폼 제출 기본 동작 방지
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!selectedAppId) {
            setErrorModal({ isOpen: true, message: '앱을 선택해주세요.' });
            return;
        }

        devLog('🔑 API 키 생성 요청:', {
            selectedAppId,
            selectedAppIdType: typeof selectedAppId,
            difficulty: newApiKeyForm.difficulty,
            requestBody: {
                appId: selectedAppId,
                expiresPolicy: 0,
                difficulty: newApiKeyForm.difficulty
            }
        });

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
            await loadApplications();
        } catch (error) {
            setLoading(false); // 에러 발생 즉시 로딩 상태 해제
            handleApiError(error, 'API 키 생성');
            return; // 에러 발생 시 함수 종료하여 loadApplications() 호출 방지
        }
        // finally 블록 제거됨
        setLoading(false);
    };

    // API 키 삭제 처리
    const handleDeleteApiKey = async () => {
        devLog('🚀 handleDeleteApiKey 함수 시작:', { selectedApiKeyId, selectedAppId });

        if (!selectedApiKeyId || !selectedAppId) {
            devLog('❌ 필수 값 누락:', { selectedApiKeyId, selectedAppId });
            return;
        }

        setLoading(true);
        try {
            // 실제 API 호출
            devLog('🔄 API 키 삭제 시작:', { keyId: selectedApiKeyId });
            await applicationAPI.deleteApiKey(selectedApiKeyId);
            devLog('✅ API 키 삭제 성공');

            setSelectedApiKeyId(null);
            setIsDeleteApiKeyModalOpen(false);
            devLog('✅ 삭제 완료 - 모달 닫기');

            // 데이터 다시 조회
            devLog('�� API 키 삭제 후 데이터 다시 조회');
            await loadApplications();
        } catch (error) {
            setLoading(false); // 에러 발생 즉시 로딩 상태 해제
            devLog('❌ API 키 삭제 오류:', error);
            handleApiError(error, 'API 키 삭제');
            return; // 에러 발생 시 함수 종료하여 loadApplications() 호출 방지
        }
        // finally 블록 제거됨
        setLoading(false);
    };

    // API 키 표시 (마스킹)
    const maskApiKey = (key) => {
        if (!key) return '';
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };

    // HTTP 환경에서 사용할 fallback 복사 함수
    const copyToClipboardFallback = async (text) => {
        devLog('🔄 Fallback 복사 방법 시도...');

        try {
            // 방법 1: document.execCommand 사용 (구형 브라우저 지원)
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
                devLog('✅ Fallback 복사 성공 (execCommand)');
                return;
            } else {
                throw new Error('execCommand 실패');
            }
        } catch (error) {
            devError('❌ Fallback 복사 실패:', error);

            // 방법 2: 사용자에게 수동 복사 안내
            const message = `API 키를 수동으로 복사해주세요:\n\n${text}`;
            alert(message);

            // 방법 3: 선택 가능한 텍스트로 표시
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
                <h3>API 키 복사</h3>
                <p>아래 텍스트를 선택하여 복사하세요:</p>
                <textarea readonly style="width: 100%; height: 60px; margin: 10px 0;">${text}</textarea>
                <button onclick="this.parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">닫기</button>
            `;
            document.body.appendChild(tempDiv);

            throw new Error('수동 복사 안내 표시됨');
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        const loadInitialData = async () => {
            devLog('🚀 컴포넌트 마운트 - 초기 데이터 로드 시작');
            await loadApplications();
        };

        loadInitialData();
    }, [loadApplications]);

    return (
        <DashboardLayout
            title="APP"
            subtitle="APP 및 API 키를 관리하세요"
        >
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">APP 관리</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">총 {apps.length}개의 APP</p>
                    </div>
                    <button
                        onClick={() => setIsAddAppModalOpen(true)}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '로딩 중...' : 'APP 추가'}
                    </button>
                </div>

                {/* 로딩 상태 */}
                {(loading || isAppsLoading) && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
                    </div>
                )}

                {/* APP 리스트 */}
                {!loading && !isAppsLoading && (
                    <div className="space-y-4">
                        {(() => {
                            const filteredApps = apps.filter((app, index, self) =>
                                // 중복 제거: 같은 id를 가진 첫 번째 앱만 유지
                                index === self.findIndex(a => a.id === app.id)
                            );
                            devLog('🎨 UI 렌더링 - 앱 목록:', {
                                원본앱개수: apps.length,
                                필터링후앱개수: filteredApps.length,
                                앱목록: filteredApps.map(app => ({ id: app.id, name: app.name }))
                            });
                            return filteredApps;
                        })().map((app) => (
                            <div key={`app_${app.id}`} className="theme-card border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* APP 헤더 */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleAppExpansion(app.id)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                                            >
                                                <svg
                                                    className={`w-5 h-5 text-gray-900 dark:text-gray-100 transition-transform ${expandedApps.has(app.id) ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{app.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleOpenEditApp(app)}
                                                disabled={loading}
                                                className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition disabled:opacity-50 dark:bg-yellow-900 dark:text-yellow-200"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAppId(app.id);
                                                    setIsDeleteAppModalOpen(true);
                                                }}
                                                disabled={loading}
                                                className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description 섹션 (확장 시에만 표시) */}
                                    {expandedApps.has(app.id) && (
                                        <div className="mt-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">설명</p>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">{app.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* API 키 섹션 (확장 시) */}
                                {expandedApps.has(app.id) && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">API 키</h4>
                                                <button
                                                    onClick={() => {
                                                        devLog('🔑 API 키 추가 모달 열기:', { appId: app.id, appName: app.name });
                                                        setSelectedAppId(app.id);
                                                        setIsAddApiKeyModalOpen(true);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                                                >
                                                    API 키 추가
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {(() => {
                                                    const appApiKeys = apiKeys.filter(key => key.appId === app.id);
                                                    // 중복 제거: 같은 id를 가진 첫 번째 키만 유지
                                                    const uniqueApiKeys = appApiKeys.filter((apiKey, index, self) =>
                                                        index === self.findIndex(key => key.id === apiKey.id)
                                                    );
                                                    devLog(`🔑 UI 렌더링 - 앱 ${app.id} (${app.name})의 API 키:`, {
                                                        앱ID: app.id,
                                                        앱이름: app.name,
                                                        전체키개수: apiKeys.length,
                                                        해당앱키개수: appApiKeys.length,
                                                        중복제거후키개수: uniqueApiKeys.length,
                                                        키목록: uniqueApiKeys.map(key => ({
                                                            id: key.id,
                                                            name: key.name,
                                                            status: key.status,
                                                            difficulty: key.difficulty || 'low'
                                                        }))
                                                    });
                                                    return uniqueApiKeys;
                                                })().map((apiKey, index) => (
                                                    <div key={`api_key_${app.id}_${apiKey.id}_${index}`} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        {/* 첫 줄: 이름(좌, 상태 배지 붙임), 난이도, 마지막사용일(우), 삭제(우) */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{apiKey.name}</p>
                                                                <StatusBadge
                                                                    status={apiKey.status}
                                                                    size="md"
                                                                    className={`h-8 leading-8 px-3 py-0 ${apiKey.status === 'inactive' ? 'bg-red-100 text-red-800 border-red-200' : ''}`}
                                                                />
                                                                {/* 난이도 배지 추가 */}
                                                                <span className={`inline-flex items-center h-8 leading-8 px-3 py-0 rounded text-xs font-medium ${(apiKey.difficulty || 'low') === 'low'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : (apiKey.difficulty || 'low') === 'middle'
                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    }`}>
                                                                    {(apiKey.difficulty || 'low') === 'low' ? '쉬움' :
                                                                        (apiKey.difficulty || 'low') === 'middle' ? '보통' :
                                                                            (apiKey.difficulty || 'low') === 'high' ? '어려움' : (apiKey.difficulty || 'low')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">마지막 사용: {apiKey.lastUsed}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedApiKeyId(apiKey.id);
                                                                        setSelectedAppId(app.id);
                                                                        setIsDeleteApiKeyModalOpen(true);
                                                                    }}
                                                                    className="h-8 px-3 py-0 bg-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-200 transition inline-flex items-center"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {/* 둘째 줄: 전체 키(좌), 활성/비활성 토글(우), 복사(우) */}
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">{apiKey.key}</p>
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
                                                                            const res = await applicationAPI.toggleApiKeyStatus(id, newStatus);
                                                                            devLog('🔁 토글 응답 본문:', res?.data);
                                                                            await loadApplications();
                                                                            const afterKeys = useDashboardStore.getState().apiKeys;
                                                                            const updated = afterKeys.find(k => k.id === id);
                                                                            devLog('✅ 토글 후 최신 상태:', {
                                                                                id,
                                                                                storeStatus: updated?.status,
                                                                                isActive: updated ? updated.status === 'active' : undefined
                                                                            });
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
                                                                    className={`h-8 px-3 py-0 rounded text-xs font-medium transition inline-flex items-center ${apiKey.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'} ${togglingKeyIds.has(apiKey.id) || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {togglingKeyIds.has(apiKey.id) ? '처리중...' : (apiKey.status === 'active' ? '비활성화' : '활성화')}
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        devLog('🔍 API 키 복사 시도:', {
                                                                            apiKeyId: apiKey.id,
                                                                            apiKeyName: apiKey.name,
                                                                            apiKeyValue: apiKey.key,
                                                                            apiKeyLength: apiKey.key?.length,
                                                                            protocol: window.location.protocol,
                                                                            isSecure: window.location.protocol === 'https:'
                                                                        });

                                                                        try {
                                                                            devLog('📋 클립보드 복사 시작...');

                                                                            // HTTPS 환경에서는 Clipboard API 사용
                                                                            if (window.location.protocol === 'https:') {
                                                                                await navigator.clipboard.writeText(apiKey.key);
                                                                                devLog('✅ HTTPS - Clipboard API 복사 성공');
                                                                            } else {
                                                                                // HTTP 환경에서는 fallback 방법 사용
                                                                                devLog('🌐 HTTP 환경 - fallback 방법 사용');
                                                                                await copyToClipboardFallback(apiKey.key);
                                                                            }

                                                                            alert('API 키가 복사되었습니다.');
                                                                        } catch (error) {
                                                                            devError('❌ 클립보드 복사 실패:', {
                                                                                error: error.message,
                                                                                errorName: error.name,
                                                                                errorStack: error.stack,
                                                                                clipboardSupported: !!navigator.clipboard,
                                                                                writeTextSupported: !!navigator.clipboard?.writeText,
                                                                                protocol: window.location.protocol
                                                                            });
                                                                            alert('복사에 실패했습니다.');
                                                                        }
                                                                    }}
                                                                    className="h-8 w-8 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition inline-flex items-center justify-center"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                                                        <path d="M4 4a2 2 0 012-2h6a2 2 0 012 2v1h1a2 2 0 012 2v7a2 2 0 01-2 2h-6a2 2 0 01-2-2v-1H6a2 2 0 01-2-2V4zm2 0v7h6V4H6zm7 3h1a1 1 0 011 1v7a1 1 0 01-1 1h-6a1 1 0 01-1-1v-1h5a2 2 0 002-2V7z" />
                                                                    </svg>
                                                                    <span className="sr-only">복사</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {apiKeys.filter(key => key.appId === app.id).length === 0 && (
                                                    <div className="text-center py-8">
                                                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                        </svg>
                                                        <p className="text-gray-600 dark:text-gray-400">API 키가 없습니다</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-600">새 API 키를 추가해보세요</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {apps.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">APP이 없습니다</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">첫 번째 APP을 추가해보세요</p>
                                <button
                                    onClick={() => setIsAddAppModalOpen(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    APP 추가
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* APP 추가 모달 */}
            <Modal
                isOpen={isAddAppModalOpen}
                onClose={() => setIsAddAppModalOpen(false)}
                title="새 APP 추가"
            >
                <form onSubmit={handleAddApp} className="space-y-4">
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
                            required
                            disabled={loading}
                        />
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
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddAppModalOpen(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
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
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedApp.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApp.description}</p>
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
                            required
                            disabled={loading}
                        />
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
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditAppModalOpen(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
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
                            <p className="text-gray-900 dark:text-gray-100">{selectedApp.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApp.description}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsDeleteAppModalOpen(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDeleteApp}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
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
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedApp.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedApp.id}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddApiKeyModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
                            <p className="text-gray-900 dark:text-gray-100">{selectedApiKey.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                {maskApiKey(selectedApiKey.key)}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsDeleteApiKeyModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDeleteApiKey}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                        >
                            {loading ? '삭제 중...' : '삭제'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 에러 모달 */}
            <Modal
                isOpen={errorModal.isOpen}
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
                        <p className="text-red-700 mt-2">{errorModal.message}</p>
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
        </DashboardLayout>
    );
} 