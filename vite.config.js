import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

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
        if (url.pathname.match(/\.(ico|png|svg)$/i) && url.pathname.includes('favicon')) {
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

        // 로고 이미지 최적화 (200x60)
        if (url.pathname.includes('scratchalogo')) {
          params.set('format', 'webp')
          params.set('quality', '90')
          params.set('w', '200')
          params.set('h', '60')
        }

        return params
      }
    }),
    // 번들 분석기 추가
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
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
            return 'assets/[name]-[hash:8].[ext]';
          }
          // 기타 파일은 8자리 해시 사용
          return 'assets/[name]-[hash:8].[ext]';
        },

        // 성능 최적화를 위한 청크 분리 전략
        manualChunks: {
          // 1. 라이브러리 분리 (공통 의존성)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils-vendor': ['axios', 'zustand'],

          // 2. 초기 로딩 최적화 (메인 페이지만)
          'critical-layout': [
            './src/components/Layout.jsx',
            './src/components/ui/Header.jsx',
            './src/components/ui/Footer.jsx'
          ],
          'critical-main': [
            './src/components/pages/MainPage.jsx'
          ],

          // 3. 공개 페이지 개별 분리 (사용자 행동 기반)
          'overview-page': ['./src/components/pages/Overview.jsx'],
          'pricing-page': ['./src/components/pages/Pricing.jsx'],
          'demo-page': [
            './src/components/pages/Demo.jsx',
            'scratcha-sdk'
          ],
          'api-docs-page': [
            './src/components/pages/ApiDocs.jsx',
            'prismjs'
          ],
          'contact-page': ['./src/components/pages/Contact.jsx'],

          // 4. 인증 페이지 그룹화 (함께 사용됨)
          'auth-pages': [
            './src/components/pages/Signin.jsx',
            './src/components/pages/Signup.jsx'
          ],

          // 5. 대시보드 페이지 개별 분리 (큰 페이지들)
          'dashboard-overview': ['./src/components/pages/DashboardOverview.jsx'],
          'dashboard-usage': ['./src/components/pages/DashboardUsage.jsx'],
          'dashboard-billing': ['./src/components/pages/DashboardBilling.jsx'],
          'dashboard-settings': ['./src/components/pages/DashboardSettings.jsx'],

          // 차트 라이브러리 별도 청크 (대시보드에서 공통 사용)
          'chart-vendor': ['recharts'],

          // 6. 큰 컴포넌트 개별 분리
          'dashboard-app': ['./src/components/pages/DashboardApp.jsx'],

          // 6. 결제 관련 분리 (지연 로딩)
          'payment-pages': [
            './src/components/tosspayments/Checkout.jsx',
            './src/components/tosspayments/Success.jsx',
            './src/components/tosspayments/Fail.jsx',
            '@tosspayments/tosspayments-sdk'
          ],

          // 7. UI 컴포넌트 그룹화 (자주 함께 사용됨)
          'ui-forms': [
            './src/components/forms/FormField.jsx',
            './src/components/forms/FormInput.jsx',
            './src/components/forms/FormLabel.jsx',
            './src/components/forms/SignupButton.jsx'
          ],
          'ui-modals': [
            './src/components/ui/Modal.jsx',
            './src/components/ui/ErrorModal.jsx',
            './src/components/ui/SuccessModal.jsx'
          ],
          'ui-charts': [
            './src/components/ui/Chart.jsx',
            './src/components/ui/UsageChart.jsx',
            './src/components/ui/MultiAppUsageChart.jsx'
          ],
          'ui-tables': [
            './src/components/ui/Table.jsx',
            './src/components/ui/DataTable.jsx',
            './src/components/ui/PaymentHistoryTable.jsx'
          ],

          // 8. 서비스/유틸리티 분리 (캐싱 최적화)
          'services': [
            './src/services/api.js',
            './src/config/api.js'
          ],
          'utils': [
            './src/utils/chartDataUtils.js',
            './src/utils/chartImports.js',
            './src/utils/logger.js',
            './src/utils/tokenUtils.js',
            './src/utils/validators.js'
          ],
          'stores': [
            './src/stores/authStore.js',
            './src/stores/dashboardStore.js',
            './src/stores/darkModeStore.js'
          ],
          'hooks': [
            './src/hooks/useAuth.js',
            './src/hooks/useErrorHandler.js',
            './src/hooks/useSignupForm.js'
          ],

          // 9. 대시보드 레이아웃 컴포넌트
          'dashboard-layout': [
            './src/components/dashboard/DashboardLayout.jsx',
            './src/components/dashboard/DashboardHeader.jsx',
            './src/components/dashboard/Sidebar.jsx',
            './src/components/dashboard/MenuData.jsx',
            './src/components/dashboard/MenuLink.jsx',
            './src/components/dashboard/UserInfo.jsx'
          ]
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
        pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.debug'], // 순수 함수 제거
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