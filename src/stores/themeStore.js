import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'light',
            setTheme: (theme) => {
                set({ theme });
                // 즉시 body 클래스 업데이트
                document.body.classList.remove('light', 'dark', 'ocean', 'outline');
                document.body.classList.add(theme);
            },
            initializeTheme: () => {
                const { theme } = get();
                document.body.classList.remove('light', 'dark', 'ocean', 'outline');
                document.body.classList.add(theme);
            }
        }),
        {
            name: 'theme-storage', // localStorage 키
            partialize: (state) => ({ theme: state.theme }), // theme만 저장
        }
    )
); 