import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDevModeStore = create(
    persist(
        (set, get) => ({
            // 개발 모드 상태
            isDevMode: true, // 기본값은 개발 모드
            // 개발 모드 토글
            toggleDevMode: () => {
                set(state => ({ isDevMode: !state.isDevMode }));
            },
            // 개발 모드 설정
            setDevMode: (isDev) => {
                set({ isDevMode: isDev });
            },
            // 현재 모드 정보
            getModeInfo: () => {
                const { isDevMode } = get();
                return {
                    isDevMode,
                    modeName: isDevMode ? '개발 모드' : '일반 모드',
                    description: isDevMode
                        ? '더미 데이터를 사용하여 개발 중입니다'
                        : '실제 API와 통신합니다',
                    icon: isDevMode ? '🔧' : '🚀'
                };
            }
        }),
        {
            name: 'dev-mode-storage', // localStorage 키
            partialize: (state) => ({ isDevMode: state.isDevMode }) // 저장할 상태만 선택
        }
    )
); 