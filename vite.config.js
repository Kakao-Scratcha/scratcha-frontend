import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react({
      // 프로덕션 빌드에서 React DevTools 제거
      removeDevtoolsInProduction: true,
    }),
    tailwindcss(),
    imagetools({
      // 이미지 최적화 기본 설정
      defaultDirectives: (url) => {
        const params = new URLSearchParams()

        // WebP 형식 기본 설정 (PNG, JPG인 경우)
        if (url.pathname.match(/\.(png|jpg|jpeg)$/i)) {
          params.set('format', 'webp')
          params.set('quality', '85')
        }

        // 아이콘 파일 최적화 (20x20 이하)
        if (url.pathname.match(/\.(ico|png)$/i) && url.pathname.includes('favicon')) {
          params.set('format', 'webp')
          params.set('quality', '90')
          params.set('w', '20')
          params.set('h', '20')
        }

        // 히어로 이미지 최적화 (400x400)
        if (url.pathname.includes('main-')) {
          params.set('format', 'webp')
          params.set('quality', '95')  // 품질을 95%로 높임
          params.set('w', '400')
          params.set('h', '400')
        }

        return params
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    assetsInlineLimit: 4096, // 4KB 이하 이미지는 인라인으로 처리
    // CSS 최적화 강화
    cssCodeSplit: true, // CSS 코드 분할 활성화 (개발환경에서도 안정적으로 작동)
    rollupOptions: {
      output: {
        // 청크 파일명 설정 - 캐시 최적화
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          // 이미지 파일은 더 긴 해시 사용 (변경 빈도 낮음)
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/[name]-[hash:12].[ext]';
          }
          // 기타 파일은 8자리 해시 사용
          return 'assets/[name]-[hash:8].[ext]';
        },

        // 최적화된 청크 분리 전략 (Lighthouse 개선)
        manualChunks: (id) => {
          // node_modules 의존성 분리
          if (id.includes('node_modules')) {
            // React 관련 라이브러리
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // 차트 라이브러리
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            // 결제 라이브러리
            if (id.includes('tosspayments')) {
              return 'payment-vendor';
            }
            // 기타 유틸리티 라이브러리
            if (id.includes('axios') || id.includes('zustand') || id.includes('prismjs')) {
              return 'utils-vendor';
            }
            // 기타 모든 node_modules
            return 'vendor';
          }

          // 소스 코드 분리
          if (id.includes('src/components/pages/MainPage.jsx')) {
            return 'main-page';
          }

          if (id.includes('src/components/pages/DashboardApp.jsx')) {
            return 'dashboard-app';
          }

          // 대시보드 페이지들
          if (id.includes('src/components/pages/Dashboard')) {
            return 'dashboard-pages';
          }

          // 공개 페이지들
          if (id.includes('src/components/pages/Overview.jsx') ||
            id.includes('src/components/pages/Pricing.jsx') ||
            id.includes('src/components/pages/Demo.jsx') ||
            id.includes('src/components/pages/ApiDocs.jsx') ||
            id.includes('src/components/pages/Contact.jsx')) {
            return 'public-pages';
          }

          // 인증 페이지들
          if (id.includes('src/components/pages/Signin.jsx') ||
            id.includes('src/components/pages/Signup.jsx')) {
            return 'auth-pages';
          }

          // 결제 페이지들
          if (id.includes('src/components/tosspayments/')) {
            return 'payment-pages';
          }
        }
      }
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 프로덕션 빌드 시 console.log 제거
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // console.log 제거
        drop_debugger: true, // debugger 제거
        // 추가 압축 옵션 (Lighthouse 개선)
        pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.error'], // 순수 함수 제거
        passes: 3, // 압축 패스 증가 (더 강력한 압축)
        unsafe: false, // 안전한 압축만 사용
        unsafe_comps: false, // 안전한 비교 연산자만 사용
        unsafe_math: false, // 안전한 수학 연산만 사용
        unsafe_proto: false, // 안전한 프로토타입 접근만 사용
        dead_code: true, // 사용하지 않는 코드 제거
        conditionals: true, // 조건문 최적화
        evaluate: true, // 상수 표현식 평가
        booleans: true, // 불린 최적화
        loops: true, // 루프 최적화
        unused: true, // 사용하지 않는 변수 제거
        if_return: true, // if-return 최적화
        join_vars: true, // 변수 병합
        side_effects: false, // 사이드 이펙트 보존
        // React DevTools 관련 코드 제거
        global_defs: {
          '__REACT_DEVTOOLS_GLOBAL_HOOK__': 'undefined',
          'process.env.NODE_ENV': '"production"'
        },
        // 추가 최적화
        collapse_vars: true, // 변수 병합
        reduce_vars: true, // 변수 축소
        sequences: true, // 시퀀스 최적화
        properties: true, // 속성 최적화
        comparisons: true, // 비교 최적화
        typeofs: true, // typeof 최적화
      },
      mangle: {
        // 변수명 압축 강화
        toplevel: true, // 최상위 변수명도 압축
        safari10: true, // Safari 10 호환성
      },
      format: {
        // 출력 포맷 최적화
        comments: false, // 주석 제거
        beautify: false, // 압축된 형태로 출력
      },
    },
    // CSS 압축 활성화 및 최적화
    cssMinify: 'lightningcss', // 더 빠르고 강력한 CSS 압축
    // 소스맵 최적화 (개발 시에만 필요)
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화로 크기 절약
  },

})