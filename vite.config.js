import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // 청크 파일명 설정
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 수동 청크 분할
        manualChunks: {
          // React 관련 라이브러리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리
          'ui-vendor': ['recharts', 'zustand'],
          // 대시보드 관련 컴포넌트
          'dashboard': [
            './src/conponents/pages/DashboardOverview.jsx',
            './src/conponents/pages/DashboardSettings.jsx',
            './src/conponents/pages/DashboardUsage.jsx',
            './src/conponents/pages/DashboardBilling.jsx',
            './src/conponents/pages/DashboardApp.jsx'
          ],
          // 인증 관련 컴포넌트
          'auth': [
            './src/conponents/pages/Signin.jsx',
            './src/conponents/pages/Signup.jsx'
          ]
        }
      }
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000
  },
  assetsInclude: ['**/*.ttf'],
  server: {
    port: 3000,
    fs: {
      allow: ['..']
    },
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // 개발 서버 최적화
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'recharts']
  }
})