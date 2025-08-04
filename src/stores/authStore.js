import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDummyUser } from '../data/dummyData';
import { authAPI } from '../services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // 상태
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastActivity: null, // 마지막 활동 시간

            // 액션
            login: async (credentials) => {
                console.log('🔐 로그인 시도:', credentials);
                set({ isLoading: true, error: null });
                try {
                    console.log('📡 백엔드 API 호출 중...');
                    const response = await authAPI.login(credentials);
                    console.log('✅ 로그인 성공:', response.data);

                    // 백엔드 응답 구조에 맞게 처리
                    const { accessToken, tokenType } = response.data;

                    // 토큰을 HTTP 표준에 맞게 저장 (대문자 Bearer 사용)
                    const token = `Bearer ${accessToken}`;
                    console.log('🔍 저장할 토큰 형식:', {
                        tokenType,
                        accessTokenPreview: accessToken.substring(0, 50) + '...',
                        finalTokenPreview: token.substring(0, 50) + '...',
                        fullToken: token
                    });

                    // 사용자 정보는 별도 API로 가져오기
                    set({
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('💾 토큰 저장 완료, 사용자 정보 가져오기 시작');

                    // 사용자 프로필 정보 가져오기
                    try {
                        await get().getProfile();
                        console.log('✅ 사용자 정보 가져오기 완료');
                    } catch (profileError) {
                        console.error('❌ 사용자 정보 가져오기 실패:', profileError);
                        // 프로필 가져오기 실패해도 로그인은 성공으로 처리
                    }

                    return { success: true };
                } catch (error) {
                    console.error('❌ 로그인 실패:', error);
                    console.error('❌ 오류 응답:', error.response);
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || '로그인에 실패했습니다.',
                    });
                    return { success: false, error: error.response?.data?.message };
                }
            },

            signup: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.signup(userData);
                    console.log('✅ 회원가입 성공:', response.data);

                    // 백엔드 응답 구조에 맞게 처리
                    const { accessToken, tokenType } = response.data;

                    // 토큰을 올바른 형식으로 저장
                    const token = `${tokenType} ${accessToken}`;

                    set({
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('💾 회원가입 토큰 저장 완료, 사용자 정보 가져오기 시작');

                    // 사용자 프로필 정보 가져오기
                    try {
                        await get().getProfile();
                        console.log('✅ 회원가입 후 사용자 정보 가져오기 완료');
                    } catch (profileError) {
                        console.error('❌ 회원가입 후 사용자 정보 가져오기 실패:', profileError);
                        // 프로필 가져오기 실패해도 회원가입은 성공으로 처리
                    }

                    return { success: true };
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || '회원가입에 실패했습니다.',
                    });
                    return { success: false, error: error.response?.data?.message };
                }
            },

            logout: async () => {
                try {
                    // 개발 모드 토큰인지 확인
                    const token = get().token;
                    const isDevMode = token && token.startsWith('dev_token_');

                    if (!isDevMode) {
                        // 일반 모드: 백엔드 API 호출 시도 (구현되지 않았을 수 있음)
                        try {
                            await authAPI.logout();
                            console.log('✅ 백엔드 로그아웃 성공');
                        } catch (logoutError) {
                            console.log('⚠️ 백엔드 로그아웃 API 미구현 또는 실패:', logoutError.message);
                            // 백엔드 로그아웃 실패해도 프론트엔드에서는 로그아웃 처리
                        }
                    }
                } catch (error) {
                    console.log('⚠️ 로그아웃 중 오류:', error.message);
                } finally {
                    // 프론트엔드 상태 초기화
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastActivity: null,
                    });
                    console.log('✅ 프론트엔드 로그아웃 완료');
                }
            },

            getProfile: async () => {
                console.log('👤 사용자 프로필 정보 가져오기 시작');
                set({ isLoading: true });
                try {
                    console.log('📡 /api/dashboard/users/me API 호출 중...');
                    const response = await authAPI.getProfile();
                    console.log('✅ 프로필 정보 가져오기 성공:', response.data);

                    set({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('💾 사용자 정보 저장 완료:', response.data);
                } catch (error) {
                    console.error('❌ 프로필 정보 가져오기 실패:', error);
                    console.error('❌ 오류 상세:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message
                    });

                    // 403 Forbidden은 토큰이 유효하지 않음을 의미
                    if (error.response?.status === 403) {
                        console.log('🔒 403 Forbidden - 토큰이 유효하지 않음');
                        // 토큰은 유지하되 사용자 정보만 초기화
                        set({
                            user: null,
                            isLoading: false,
                            // isAuthenticated는 유지 (토큰이 있으므로)
                        });
                    } else if (error.response?.status === 401) {
                        console.log('🔒 401 Unauthorized - 인증 실패, 로그아웃 처리');
                        // 401은 인증 실패를 의미하므로 로그아웃
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                            lastActivity: null,
                        });
                    } else {
                        // 다른 오류의 경우 인증 상태 초기화
                        set({
                            isLoading: false,
                            isAuthenticated: false,
                        });
                    }
                }
            },

            // 사용자 정보 업데이트
            updateUser: (userData) => {
                set(state => ({
                    user: { ...state.user, ...userData },
                    lastActivity: new Date().toISOString(),
                }));
            },

            // 토큰 갱신 (백엔드 미구현)
            refreshToken: async () => {
                console.log('🔄 토큰 갱신 시도');
                try {
                    const response = await authAPI.refreshToken();
                    const { token } = response.data;

                    set({
                        token,
                        lastActivity: new Date().toISOString(),
                    });

                    console.log('✅ 토큰 갱신 성공');
                    return { success: true };
                } catch (error) {
                    console.log('⚠️ 토큰 갱신 실패 (백엔드 미구현):', error.message);
                    // 토큰 갱신 실패 시에도 로그아웃하지 않음 (백엔드 미구현이므로)
                    return { success: false };
                }
            },

            // 활동 시간 업데이트
            updateActivity: () => {
                set({ lastActivity: new Date().toISOString() });
            },

            // 세션 만료 확인
            checkSessionExpiry: () => {
                const { lastActivity } = get();
                if (!lastActivity) return false;

                const lastActivityTime = new Date(lastActivity);
                const now = new Date();
                const diffInHours = (now - lastActivityTime) / (1000 * 60 * 60);

                // 24시간 이상 활동이 없으면 세션 만료
                if (diffInHours > 24) {
                    get().logout();
                    return true;
                }

                return false;
            },

            // 사용자 권한 확인
            hasPermission: (permission) => {
                const { user } = get();
                if (!user || !user.permissions) return false;
                return user.permissions.includes(permission);
            },

            // 사용자 역할 확인
            hasRole: (role) => {
                const { user } = get();
                if (!user || !user.roles) return false;
                return user.roles.includes(role);
            },

            clearError: () => set({ error: null }),

            // 초기화 - persist된 상태 복원 후 호출
            initialize: () => {
                const state = get();
                console.log('🔄 인증 상태 초기화:', {
                    hasToken: !!state.token,
                    isAuthenticated: state.isAuthenticated,
                    hasUser: !!state.user,
                    tokenType: state.token ? (state.token.startsWith('dev_token_') ? 'dev' : 'prod') : 'none'
                });

                // 상태 불일치 감지 및 수정
                if (state.isAuthenticated && !state.token) {
                    console.log('⚠️ 상태 불일치 감지: 인증됨 but 토큰 없음 - 로그아웃 처리');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastActivity: null,
                    });
                    return;
                }

                if (state.token && !state.isAuthenticated) {
                    console.log('🔍 토큰은 있지만 인증 상태가 아님 - 복원 시도');

                    // 개발 모드 토큰인지 확인
                    if (state.token.startsWith('dev_token_')) {
                        console.log('🔧 개발 모드 토큰 복원');
                        const isAdmin = state.token.includes('admin');
                        const dummyUser = createDummyUser(
                            isAdmin ? 1 : 2,
                            isAdmin ? 'dummyname' : '개발자',
                            isAdmin
                        );

                        set({
                            user: dummyUser,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            lastActivity: new Date().toISOString(),
                        });
                        console.log('✅ 개발 모드 사용자 복원 완료');
                    } else {
                        console.log('🌐 일반 모드 토큰 - 프로필 정보 가져오기');
                        // 일반 모드: 실제 API 호출
                        set({ isAuthenticated: true });
                        get().getProfile();
                    }
                } else if (state.token && state.isAuthenticated && state.user) {
                    console.log('✅ 이미 완전한 인증 상태');
                } else if (!state.token && !state.isAuthenticated) {
                    console.log('❌ 인증 상태 없음');

                    // 개발 모드에서 유효하지 않은 토큰 정리
                    if (import.meta.env.DEV && state.token && !state.token.startsWith('dev_token_')) {
                        console.log('🧹 개발 모드에서 유효하지 않은 토큰 정리');
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                            lastActivity: null,
                        });
                    }
                } else {
                    console.log('⚠️ 예상치 못한 상태:', state);
                }
            },

            // 전역 상태 정보 가져오기
            getAuthInfo: () => {
                const state = get();
                return {
                    isAuthenticated: state.isAuthenticated,
                    user: state.user,
                    isLoading: state.isLoading,
                    lastActivity: state.lastActivity,
                    hasToken: !!state.token,
                };
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                lastActivity: state.lastActivity,
            }),
            onRehydrateStorage: () => (state) => {
                console.log('💾 Persist 상태 복원 완료:', {
                    hasToken: !!state?.token,
                    isAuthenticated: state?.isAuthenticated,
                    hasUser: !!state?.user
                });
            },
        }
    )
); 