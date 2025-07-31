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
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.login(credentials);
                    const { user, token } = response.data;

                    localStorage.setItem('authToken', token);

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        lastActivity: new Date().toISOString(),
                    });

                    return { success: true };
                } catch (error) {
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
                    const { user, token } = response.data;

                    localStorage.setItem('authToken', token);

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        lastActivity: new Date().toISOString(),
                    });

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
                    const token = localStorage.getItem('authToken');
                    const isDevMode = token && token.startsWith('dev_token_');

                    if (!isDevMode) {
                        // 일반 모드: 실제 API 호출
                        await authAPI.logout();
                    }
                } catch {
                    // 로그아웃 에러 처리
                } finally {
                    localStorage.removeItem('authToken');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        lastActivity: null,
                    });
                }
            },

            getProfile: async () => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.getProfile();
                    set({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                        lastActivity: new Date().toISOString(),
                    });
                } catch {
                    set({
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    localStorage.removeItem('authToken');
                }
            },

            // 사용자 정보 업데이트
            updateUser: (userData) => {
                set(state => ({
                    user: { ...state.user, ...userData },
                    lastActivity: new Date().toISOString(),
                }));
            },

            // 토큰 갱신
            refreshToken: async () => {
                try {
                    const response = await authAPI.refreshToken();
                    const { token } = response.data;

                    localStorage.setItem('authToken', token);
                    set({
                        token,
                        lastActivity: new Date().toISOString(),
                    });

                    return { success: true };
                } catch {
                    // 토큰 갱신 실패 시 로그아웃
                    get().logout();
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

            // 초기화
            initialize: () => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // 개발 모드 토큰인지 확인
                    if (token.startsWith('dev_token_')) {
                                            // 개발 모드: 더미 사용자 정보 복원
                    const isAdmin = token.includes('admin');
                    const dummyUser = createDummyUser(
                        isAdmin ? 1 : 2, 
                        isAdmin ? 'dummyname' : '개발자', 
                        isAdmin
                    );

                        set({
                            user: dummyUser,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            lastActivity: new Date().toISOString(),
                        });
                    } else {
                        // 일반 모드: 실제 API 호출
                        set({ token, isAuthenticated: true });
                        get().getProfile();
                    }
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
        }
    )
); 