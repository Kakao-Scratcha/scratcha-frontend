import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import { useDashboardStore } from '../../stores/dashboardStore';
import { applicationAPI } from '../../services/api';
import { useDevModeStore } from '../../stores/devModeStore';
import { DUMMY_APPS, DUMMY_API_KEYS } from '../../data/dummyData';

export default function DashboardApp() {
    const {
        apps,
        apiKeys,
        addApp,
        addApiKey,
        deleteApiKey,
        toggleApiKeyStatus,
        clearApps,
        clearApiKeys
    } = useDashboardStore();

    const { isDevMode } = useDevModeStore();

    const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
    const [isDeleteAppModalOpen, setIsDeleteAppModalOpen] = useState(false);
    const [isAddApiKeyModalOpen, setIsAddApiKeyModalOpen] = useState(false);
    const [isDeleteApiKeyModalOpen, setIsDeleteApiKeyModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [selectedApiKeyId, setSelectedApiKeyId] = useState(null);
    const [expandedApps, setExpandedApps] = useState(new Set());

    // API 관련 상태
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    // 새 APP 폼 상태
    const [newAppForm, setNewAppForm] = useState({
        name: '',
        description: ''
    });

    // 새 API 키 폼 상태
    const [newApiKeyForm, setNewApiKeyForm] = useState({
        name: ''
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

    // API 에러 처리 함수
    const handleApiError = (error, operation) => {
        console.error(`❌ ${operation} 실패:`, error);
        console.log(`🔍 ${operation} 오류 상세 분석:`, {
            operation,
            errorType: error.constructor.name,
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });

        let errorMessage = `${operation} 중 오류가 발생했습니다.`;

        if (error.response?.status === 401) {
            console.log('🔐 401 인증 오류');
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else if (error.response?.status === 403) {
            console.log('🚫 403 권한 오류');
            errorMessage = '권한이 없습니다.';
        } else if (error.response?.status === 404) {
            console.log('🔍 404 리소스 없음');
            if (operation === '애플리케이션 목록 로드') {
                console.log('📝 앱이 없습니다. 정상적인 상황입니다.');
                return;
            } else {
                errorMessage = '요청한 리소스를 찾을 수 없습니다.';
            }
        } else if (error.response?.status === 422) {
            console.log('🔍 422 Unprocessable Entity 오류 상세 정보:', error.response.data);
            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    errorMessage = error.response.data.detail
                        .map(item => item.msg || item.message || JSON.stringify(item))
                        .join(', ');
                } else {
                    errorMessage = error.response.data.detail;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = '앱을 삭제할 수 없습니다. API 키가 연결되어 있거나 다른 제약 조건이 있을 수 있습니다.';
            }
        } else if (error.response?.data?.detail) {
            console.log('📋 응답 데이터 detail:', error.response.data.detail);
            errorMessage = error.response.data.detail;
        } else if (error.message) {
            console.log('💬 에러 메시지:', error.message);
            errorMessage = error.message;
        }

        console.log(`📢 최종 에러 메시지: ${errorMessage}`);
        setErrorModal({ isOpen: true, message: errorMessage });
    };

    // 데이터 로드 함수 (재사용 가능)
    const loadApplications = async () => {
        console.log('🚀 데이터 로드 시작');
        setLoading(true);

        // 기존 데이터 클리어
        clearApps();
        clearApiKeys();

        // 개발 모드에서는 더미 데이터 사용
        if (isDevMode) {
            console.log('🔄 개발 모드 - 더미 데이터 로드');

            // 더미 앱 데이터 추가
            DUMMY_APPS.forEach(app => {
                addApp({
                    id: app.id,
                    name: app.name,
                    description: app.description,
                    status: app.status || 'active'
                });
            });

            // 더미 API 키 데이터 추가
            DUMMY_API_KEYS.forEach(apiKey => {
                addApiKey({
                    id: apiKey.id,
                    appId: apiKey.appId,
                    name: apiKey.name,
                    key: apiKey.key,
                    status: apiKey.status || 'active',
                    lastUsed: apiKey.lastUsed || '사용 기록 없음'
                });
            });

            setLoading(false);
            return;
        }

        // 일반 모드에서는 실제 API 호출
        try {
            console.log('🔄 애플리케이션 목록 로드 시작');
            const response = await applicationAPI.getAllApplications();
            console.log('✅ 애플리케이션 목록 로드 성공:', response.data);

            // Set을 사용한 중복 체크
            const processedKeyIds = new Set();
            console.log('🔄 데이터 처리 시작 - 총 앱 개수:', response.data.length);

            // 응답 데이터를 Zustand store 형식에 맞게 변환하여 저장
            response.data.forEach((app, index) => {
                console.log(`📝 앱 ${index + 1}/${response.data.length} 처리 중:`, { id: app.id, name: app.appName });

                // 앱 정보 저장
                addApp({
                    id: app.id,
                    name: app.appName, // API 응답의 appName 필드 사용
                    description: app.description,
                    status: 'active' // 기본값으로 active 설정
                });
                console.log(`✅ 앱 저장 완료: ${app.appName} (ID: ${app.id})`);

                // 앱에 포함된 키 정보가 있다면 함께 저장
                if (app.key && !processedKeyIds.has(app.key.id)) {
                    console.log(`🔑 앱 ${app.id}의 키 정보 발견:`, app.key);
                    processedKeyIds.add(app.key.id);
                    console.log(`📋 처리된 키 ID 목록:`, Array.from(processedKeyIds));

                    addApiKey({
                        id: app.key.id,
                        appId: app.id,
                        name: `API Key ${app.key.id}`,
                        key: app.key.key,
                        status: app.key.isActive ? 'active' : 'inactive',
                        lastUsed: '사용 기록 없음'
                    });
                    console.log(`✅ API 키 저장 완료: ${app.key.id}`);
                } else if (app.key) {
                    console.log(`⚠️ 키 ${app.key.id}는 이미 처리되었습니다. (중복 방지)`);
                } else {
                    console.log(`ℹ️ 앱 ${app.id}에는 키 정보가 없습니다.`);
                }
            });

            console.log('🎯 최종 처리 결과:', {
                총앱개수: response.data.length,
                처리된키개수: processedKeyIds.size,
                처리된키목록: Array.from(processedKeyIds)
            });

        } catch (error) {
            console.log('❌ loadApplications 함수에서 오류 발생:', error);
            console.log('❌ 오류 상세 정보:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            handleApiError(error, '애플리케이션 목록 로드');
        } finally {
            console.log('🏁 loadApplications 함수 종료');
            setLoading(false);
        }
    };

    // APP 추가 처리 (API 연결)
    const handleAddApp = async (e) => {
        e.preventDefault();
        if (!newAppForm.name.trim() || !newAppForm.description.trim()) {
            setErrorModal({ isOpen: true, message: 'APP 이름과 설명을 모두 입력해주세요.' });
            return;
        }

        setLoading(true);
        try {
            console.log('🔄 APP 생성 시작:', newAppForm);
            const response = await applicationAPI.createApplication({
                appName: newAppForm.name.trim(),
                description: newAppForm.description.trim(),
                expiresPolicy: 0
            });

            console.log('✅ APP 생성 성공:', response.data);

            setNewAppForm({ name: '', description: '' });
            setIsAddAppModalOpen(false);

            // 데이터 다시 조회
            console.log('🔄 APP 추가 후 데이터 다시 조회');
            await loadApplications();
        } catch (error) {
            handleApiError(error, 'APP 생성');
        } finally {
            setLoading(false);
        }
    };

    // APP 삭제 처리 (API 연결)
    const handleDeleteApp = async () => {
        console.log('🚀 handleDeleteApp 함수 시작:', { selectedAppId });

        if (!selectedAppId) {
            console.log('❌ selectedAppId가 없습니다.');
            return;
        }

        setLoading(true);
        try {
            console.log('🔄 APP 삭제 API 호출 시작:', selectedAppId);
            const response = await applicationAPI.deleteApplication(selectedAppId);
            console.log('✅ APP 삭제 API 응답:', response);

            console.log('✅ APP 삭제 성공');

            setSelectedAppId(null);
            setIsDeleteAppModalOpen(false);
            console.log('✅ 모달 닫기 완료');

            // 데이터 다시 조회
            console.log('🔄 APP 삭제 후 데이터 다시 조회 시작');
            await loadApplications();
            console.log('✅ 데이터 재조회 완료');
        } catch (error) {
            console.log('❌ APP 삭제 중 오류 발생:', error);
            console.log('❌ 오류 상세 정보:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            handleApiError(error, 'APP 삭제');
        } finally {
            console.log('🏁 handleDeleteApp 함수 종료');
            setLoading(false);
        }
    };

    // API 키 추가 처리
    const handleAddApiKey = async (e) => {
        e.preventDefault();
        if (!newApiKeyForm.name.trim() || !selectedAppId) {
            setErrorModal({ isOpen: true, message: 'API 키 이름을 입력해주세요.' });
            return;
        }

        setLoading(true);
        try {
            if (isDevMode) {
                // 개발 모드에서는 더미 데이터 사용
                addApiKey({
                    appId: selectedAppId,
                    name: newApiKeyForm.name.trim(),
                    key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
                    status: 'active',
                    lastUsed: '사용 기록 없음'
                });
            } else {
                // 실제 API 호출
                console.log('🔄 API 키 생성 시작:', { appId: selectedAppId, name: newApiKeyForm.name.trim() });
                const response = await applicationAPI.createApiKey(selectedAppId, '');

                console.log('✅ API 키 생성 성공:', response.data);
            }

            setNewApiKeyForm({ name: '' });
            setIsAddApiKeyModalOpen(false);

            // 데이터 다시 조회
            console.log('🔄 API 키 추가 후 데이터 다시 조회');
            await loadApplications();
        } catch (error) {
            handleApiError(error, 'API 키 생성');
        } finally {
            setLoading(false);
        }
    };

    // API 키 삭제 처리
    const handleDeleteApiKey = async () => {
        console.log('🚀 handleDeleteApiKey 함수 시작:', { selectedApiKeyId, selectedAppId });

        if (!selectedApiKeyId || !selectedAppId) {
            console.log('❌ 필수 값 누락:', { selectedApiKeyId, selectedAppId });
            return;
        }

        setLoading(true);
        try {
            if (isDevMode) {
                // 개발 모드에서는 더미 데이터 사용
                console.log('🔄 개발 모드 - 더미 데이터에서 삭제');
                deleteApiKey(selectedApiKeyId);
            } else {
                // 실제 API 호출
                console.log('🔄 API 키 삭제 시작:', { keyId: selectedApiKeyId });
                await applicationAPI.deleteApiKey(selectedApiKeyId);

                console.log('✅ API 키 삭제 성공');
            }

            setSelectedApiKeyId(null);
            setIsDeleteApiKeyModalOpen(false);
            console.log('✅ 삭제 완료 - 모달 닫기');

            // 데이터 다시 조회
            console.log('🔄 API 키 삭제 후 데이터 다시 조회');
            await loadApplications();
        } catch (error) {
            console.log('❌ API 키 삭제 오류:', error);
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

    // 초기 데이터 로드
    useEffect(() => {
        let isMounted = true; // 컴포넌트 마운트 상태 추적

        const loadApplicationsWithCleanup = async () => {
            if (!isMounted) return; // 컴포넌트가 언마운트된 경우 중단

            console.log('🚀 useEffect 실행 - 데이터 로드 시작');
            await loadApplications();
        };

        loadApplicationsWithCleanup();

        // 클린업 함수
        return () => {
            console.log('🧹 useEffect 클린업 - 컴포넌트 언마운트');
            isMounted = false;
        };
    }, []); // 빈 의존성 배열로 설정하여 한 번만 실행

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
                        {isDevMode && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">개발 모드 - 더미 데이터 사용</p>
                        )}
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
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
                    </div>
                )}

                {/* APP 리스트 */}
                {!loading && (
                    <div className="space-y-4">
                        {(() => {
                            const filteredApps = apps.filter((app, index, self) =>
                                // 중복 제거: 같은 id를 가진 첫 번째 앱만 유지
                                index === self.findIndex(a => a.id === app.id)
                            );
                            console.log('🎨 UI 렌더링 - 앱 목록:', {
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
                                                    console.log(`🔑 UI 렌더링 - 앱 ${app.id} (${app.name})의 API 키:`, {
                                                        앱ID: app.id,
                                                        앱이름: app.name,
                                                        전체키개수: apiKeys.length,
                                                        해당앱키개수: appApiKeys.length,
                                                        중복제거후키개수: uniqueApiKeys.length,
                                                        키목록: uniqueApiKeys.map(key => ({ id: key.id, name: key.name, status: key.status }))
                                                    });
                                                    return uniqueApiKeys;
                                                })().map((apiKey, index) => (
                                                    <div key={`api_key_${app.id}_${apiKey.id}_${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{apiKey.name}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                                    {maskApiKey(apiKey.key)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <StatusBadge status={apiKey.status} />
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        if (isDevMode) {
                                                                            // 개발 모드에서는 로컬 상태만 변경
                                                                            toggleApiKeyStatus(apiKey.id);
                                                                        } else {
                                                                            // 실제 API 호출
                                                                            const newStatus = apiKey.status === 'active' ? false : true;
                                                                            console.log('🔄 API 키 상태 변경 시작:', { keyId: apiKey.id, isActive: newStatus });

                                                                            await applicationAPI.toggleApiKeyStatus(apiKey.id, newStatus);

                                                                            console.log('✅ API 키 상태 변경 성공');
                                                                        }

                                                                        // 데이터 다시 조회
                                                                        console.log('🔄 API 키 상태 변경 후 데이터 다시 조회');
                                                                        await loadApplications();
                                                                    } catch (error) {
                                                                        handleApiError(error, 'API 키 상태 변경');
                                                                    }
                                                                }}
                                                                className={`px-2 py-1 rounded text-xs font-medium transition ${apiKey.status === 'active'
                                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                    }`}
                                                            >
                                                                {apiKey.status === 'active' ? '비활성화' : '활성화'}
                                                            </button>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                마지막 사용: {apiKey.lastUsed}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('🔘 API 키 삭제 버튼 클릭:', { apiKeyId: apiKey.id, apiKeyName: apiKey.name, appId: app.id });
                                                                    setSelectedApiKeyId(apiKey.id);
                                                                    setSelectedAppId(app.id); // 앱 ID도 함께 설정
                                                                    setIsDeleteApiKeyModalOpen(true);
                                                                    console.log('✅ 삭제 모달 열기 완료');
                                                                }}
                                                                className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-200 transition"
                                                            >
                                                                삭제
                                                            </button>
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
                            API 키 이름
                        </label>
                        <input
                            type="text"
                            value={newApiKeyForm.name}
                            onChange={(e) => setNewApiKeyForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="API 키 이름을 입력하세요"
                            required
                        />
                    </div>

                    {selectedApp && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">선택된 APP:</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedApp.name}</p>
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