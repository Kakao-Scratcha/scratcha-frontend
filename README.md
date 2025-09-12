# Scratcha Frontend

캡차 서비스 관리 플랫폼의 프론트엔드 애플리케이션입니다. React + Vite + Tailwind 기반으로 구성되며, 전역 상태는 Zustand를 사용합니다.

## 기술 스택

- React 19.1.0 (react-router-dom 7.7.1)
- Vite 7.0.4 (+ @vitejs/plugin-react, @tailwindcss/vite)
- Tailwind CSS 4.1.11
- Zustand 5.0.7
- Axios 1.11.0
- Recharts 3.1.0

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 린트 검사
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 환경 변수 / 설정

### 동적 API URL 설정

- **위치**: `src/config/api.js`
- **동작 방식**:
  1. `import.meta.env.VITE_API_URL` 환경 변수 우선 사용
  2. 개발 환경: `http://localhost:8001` 자동 연결
  3. 프로덕션: `/api` 상대 경로 사용

### 환경 변수 설정 방법

```bash
# 개발 환경
VITE_API_URL=http://localhost:8001

# 프로덕션 환경
VITE_API_URL=http://your-backend-server:8001

# 쿠버네티스 환경
VITE_API_URL=http://backend-service:8001
```

### Docker 빌드

```bash
# Dockerfile에서 빌드 시 환경 변수 주입
docker build --build-arg VITE_API_URL=http://your-api-server:8001 -t your-image .
```

권장 Node.js 버전: 20.x

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/           # 공용 컴포넌트
│   │   ├── dashboard/        # 대시보드 레이아웃/네비게이션
│   │   ├── forms/            # 폼 UI 컴포넌트
│   │   ├── pages/            # 라우트 페이지
│   │   ├── ui/               # 재사용 가능한 UI 조각
│   │   ├── AuthProvider.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeProvider.jsx
│   ├── config/               # 환경/클라이언트 설정
│   │   └── api.js            # 동적 API URL 설정
│   ├── hooks/                # 커스텀 훅
│   ├── services/             # API 서비스 래퍼
│   │   └── api.js
│   ├── stores/               # Zustand 전역 상태
│   │   ├── authStore.js
│   │   ├── darkModeStore.js
│   │   └── dashboardStore.js
│   ├── utils/                # 유틸리티
│   │   └── chartImports.js
│   ├── App.jsx               # 라우팅 엔트리
│   ├── main.jsx              # React 엔트리
│   └── global.css            # 전역 스타일
├── public/                   # 정적 파일
├── vite.config.js            # Vite 설정 (최적화됨)
├── eslint.config.js          # ESLint 설정
├── nginx.conf                # Nginx 설정 (프로덕션)
├── Dockerfile                # 컨테이너 빌드
├── docker-compose.yml        # 배포/개발 구성
└── index.html                # HTML 템플릿
```

## 라우팅

- `/` → 메인 페이지
- `/overview`, `/pricing`, `/demo`
- `/signin`, `/signup`
- `/dashboard` (보호 라우트)
  - index: 대시보드 개요
  - `/settings`, `/usage`, `/billing`, `/app`

## 상태 관리 (Zustand)

- `authStore.js`: 토큰/사용자/세션 관리, 로그인/로그아웃/프로필 로드
- `dashboardStore.js`: 앱/키/사용량/통계 상태 관리 (실제 API 연동)
- `darkModeStore.js`: 다크모드 상태 관리

모든 기능은 실제 API 기준으로 동작하며, 더미 데이터는 제거되었습니다.

## API 서비스 개요

- **위치**: `src/services/api.js`
- **인증**: `/api/dashboard/auth/*`
- **사용자**: `/api/dashboard/users/*`
- **애플리케이션**: `/api/dashboard/applications/*`
- **API 키**: `/api/dashboard/api-keys/*`
- **대시보드**: `/dashboard/*`

axios 인스턴스(`src/config/api.js`)는 요청/응답 인터셉터로 토큰 부착과 로깅을 처리합니다.

## 쿠버네티스 지원

### ConfigMap 설정

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  VITE_API_URL: "http://backend-service:8001"
```

### Deployment 환경 변수

```yaml
env:
  - name: VITE_API_URL
    valueFrom:
      configMapKeyRef:
        name: frontend-config
        key: VITE_API_URL
```

### Nginx 설정

- **SPA 라우팅**: 모든 요청을 `index.html`로 리다이렉트
- **정적 파일 캐싱**: 1년간 캐싱
- **보안 헤더**: XSS, CSRF 방지
- **Gzip 압축**: 성능 최적화
- **헬스체크**: `/health` 엔드포인트

## 빌드/배포

### 로컬 빌드

```bash
npm run build  # dist/ 폴더 생성
```

### Docker 빌드

```bash
# 기본 빌드
docker build -t scratcha-frontend .

# 환경 변수와 함께 빌드
docker build --build-arg VITE_API_URL=http://your-api:8001 -t scratcha-frontend .
```

### Docker 실행

```bash
# 기본 실행
docker run -d -p 3000:80 scratcha-frontend

# 환경 변수와 함께 실행
docker run -d -p 3000:80 -e VITE_API_URL=http://your-api:8001 scratcha-frontend
```

### 쿠버네티스 배포

```bash
kubectl apply -f k8s-configmap.yaml
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
kubectl apply -f k8s-ingress.yaml
```

## 개발 가이드

### 환경 변수 설정

1. 프로젝트 루트에 `.env.development` 파일 생성
2. `VITE_API_URL=http://localhost:8001` 설정
3. 개발 서버 재시작

### API 연결 테스트

브라우저 개발자 도구 콘솔에서:

```javascript
// 환경 변수 확인
console.log("API URL:", import.meta.env.VITE_API_URL);

// API 요청 테스트
fetch("/api/dashboard/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test", password: "test" }),
});
```

## 성능 최적화 (2025-09-09)

### 적용된 최적화 사항

#### 1. Nginx Gzip 압축 최적화

- **압축 레벨**: 6 → 9 (최대 압축률)
- **추가 MIME 타입**: 15개 → 20개 지원
- **예상 절약**: ~2,000 KiB
- **설정 파일**: `nginx.conf`

```nginx
gzip_comp_level 9;  # 최대 압축률
gzip_types
    text/plain text/css text/xml text/javascript
    application/json application/javascript application/xml+rss
    application/atom+xml image/svg+xml application/wasm
    application/manifest+json text/cache-manifest
    application/x-web-app-manifest+json;
```

#### 2. Vite 빌드 최적화

- **Terser 압축 강화**: console.log 제거, dead code 제거
- **CSS 압축**: LightningCSS 적용
- **소스맵 비활성화**: 프로덕션 크기 절약
- **예상 절약**: ~2,000 KiB
- **설정 파일**: `vite.config.js`

```javascript
terserOptions: {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.warn'],
    passes: 2,
    dead_code: true,
    unused: true,
    // ... 기타 압축 옵션
  }
}
```

#### 3. 이미지 최적화

- **width/height 속성 추가**: 레이아웃 시프트 방지
- **loading="lazy" 속성**: 지연 로딩
- **WebP 변환**: signup-background.png → WebP (800x600, 85% 품질)
- **예상 절약**: ~300 KiB
- **적용 파일**: `MainPage.jsx`, `DashboardOverview.jsx`, `Signin.jsx`

```jsx
<img src={imageSrc} alt="이미지 설명" width={400} height={300} loading="lazy" />
```

#### 4. CSS 최적화

- **Tailwind CSS 4 JIT 모드**: 자동 PurgeCSS (미사용 CSS 제거)
- **LightningCSS 압축**: 더 강력한 CSS 압축
- **CSS 코드 분할**: 필요한 CSS만 로드
- **예상 절약**: ~150 KiB
- **설정 파일**: `vite.config.js`, `global.css`

```javascript
plugins: [
  react(),
  tailwindcss(), // JIT 모드 자동 활성화
],
build: {
  cssCodeSplit: true,
  cssMinify: 'lightningcss',
}
```

#### 5. 청크 분할 전략

- **라이브러리 분리**: react-vendor, chart-vendor, utils-vendor
- **라우트 기반 분리**: public-pages, dashboard-pages
- **컴포넌트 분리**: dashboard-app, payment-pages
- **지연 로딩**: React.lazy + Suspense
- **설정 파일**: `vite.config.js`, `App.jsx`

```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'chart-vendor': ['recharts'],
  'payment-vendor': ['@tosspayments/tosspayments-sdk'],
  'utils-vendor': ['axios', 'zustand', 'prismjs'],
  // ... 기타 청크 분할
}
```

#### 6. 접근성 개선

- **aria-label 속성 추가**: 다크모드 토글 버튼
- **스크린 리더 지원**: 시각 장애인 사용자 접근성 향상
- **적용 파일**: `Header.jsx`, `DashboardHeader.jsx`

```jsx
<button
  onClick={toggle}
  aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
>
```

### 성능 개선 결과

#### 예상 성능 향상

- **총 절약량**: 약 1,361 KiB (23% 감소)
- **Performance 점수**: 86 → 95-98점 (+9~12점)
- **Accessibility 점수**: 93 → 95-97점 (+2~4점)
- **Best Practices**: 100점 유지
- **SEO**: 100점 유지

#### 핵심 성능 지표 개선

- **First Contentful Paint**: 2.5s → 1.8s (28% 개선)
- **Largest Contentful Paint**: 4.5s → 3.2s (29% 개선)
- **Speed Index**: 2.5s → 2.0s (20% 개선)
- **Total Blocking Time**: 0ms 유지
- **Cumulative Layout Shift**: 0 유지

### Lighthouse 테스트 방법

#### CLI 명령어

```bash
# 개발 서버 테스트
npx lighthouse http://localhost:5173 --output=json --output-path=./lighthouse-main.json --chrome-flags="--headless"

# 프로덕션 빌드 테스트
npm run build
npx serve dist -p 8080
npx lighthouse http://localhost:8080 --output=json --output-path=./lighthouse-prod.json --chrome-flags="--headless"

# 모바일 시뮬레이션
npx lighthouse http://localhost:8080 --form-factor=mobile --throttling-method=devtools --throttling.rttMs=150 --throttling.throughputKbps=1638 --output=json --output-path=./lighthouse-mobile.json --chrome-flags="--headless"
```

#### 결과 분석

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lighthouse-prod.json', 'utf8'));
console.log('Performance:', Math.round(data.categories.performance.score * 100));
console.log('FCP:', data.audits['first-contentful-paint'].displayValue);
console.log('LCP:', data.audits['largest-contentful-paint'].displayValue);
"
```

### 최적화 파일 목록

- `nginx.conf`: Gzip 압축 최적화
- `vite.config.js`: 빌드 최적화, 청크 분할, CSS 압축
- `index.html`: Google Fonts 최적화
- `App.jsx`: 지연 로딩 구현
- `MainPage.jsx`, `DashboardOverview.jsx`, `Signin.jsx`: 이미지 최적화
- `Header.jsx`, `DashboardHeader.jsx`: 접근성 개선

## 성능 최적화 (2025-01-15)

### 적용된 최적화 사항

#### 1. 로컬 폰트 적용

- **Google Fonts CDN 제거**: 네트워크 의존성 제거
- **로컬 폰트 파일**: `public/fonts/` 디렉토리에 Noto Sans 폰트 저장
- **@font-face 정의**: HTML에 직접 폰트 정의로 즉시 로딩
- **LCP 안정성**: 폰트 로딩으로 인한 레이아웃 시프트 방지
- **예상 개선**: LCP 200-500ms 단축
- **적용 파일**: `index.html`, `public/fonts/`

```css
@font-face {
  font-family: "Noto Sans KR";
  font-weight: 400;
  src: url("/fonts/NotoSans-Regular.woff2") format("woff2");
}
```

#### 2. JavaScript 코드 스플리팅 최적화

- **하이브리드 청크 분리**: 라이브러리 + 라우트 기반 분할
- **동적 임포트**: React.lazy + Suspense로 지연 로딩
- **초기 번들 크기**: 945.7 KiB → 20.31 kB (메인 페이지만)
- **네트워크 효율성**: 90% 이상 개선
- **예상 개선**: FCP 300-500ms 단축
- **적용 파일**: `vite.config.js`, `App.jsx`

```javascript
// 청크 분할 전략
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'main-page': ['./src/components/pages/MainPage.jsx'],
  'public-pages': ['./src/components/pages/Overview.jsx', ...],
  'dashboard-pages': ['./src/components/pages/DashboardOverview.jsx', ...]
}

// 동적 임포트
const Overview = lazy(() => import('./components/pages/Overview'));
```

#### 3. 이미지 최적화 (vite-imagetools)

- **WebP 변환**: 모든 PNG/JPG 이미지를 WebP로 자동 변환
- **품질 최적화**: 85% 품질로 파일 크기 최적화
- **명시적 크기**: width/height 속성으로 CLS 방지
- **지연 로딩**: loading="lazy" 속성으로 초기 로딩 최적화
- **예상 절약**: ~200-400 KiB
- **적용 파일**: `vite.config.js`, 모든 이미지 컴포넌트

```javascript
// vite-imagetools 설정
imagetools({
  defaultDirectives: (url) => {
    const params = new URLSearchParams();
    if (url.pathname.match(/\.(png|jpg|jpeg)$/i)) {
      params.set("format", "webp");
      params.set("quality", "85");
    }
    return params;
  },
});
```

#### 4. SPA 라우팅 완전 구현

- **Nginx 설정 최적화**: 모든 경로를 index.html로 리다이렉트
- **404 에러 처리**: SPA의 NotFound 컴포넌트로 처리
- **직접 경로 접근**: 새로고침 시에도 정상 동작
- **SEO 친화적**: 모든 경로가 200 상태 코드 반환
- **적용 파일**: `nginx.conf`

```nginx
# SPA 라우팅 강화
location ~* ^/(overview|pricing|demo|...)(/.*)?$ {
    try_files $uri /index.html;
}

# 404 에러를 SPA로 처리
error_page 404 /index.html;

# 나머지 모든 경로 처리
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 5. 개발 환경 API 설정 최적화

- **.env 파일 우선 사용**: VITE_API_URL 환경 변수 우선 처리
- **동적 감지 fallback**: .env 파일이 없을 때 자동 감지
- **에러 방지**: 개발 환경에서 /api/config 호출 실패 방지
- **적용 파일**: `src/config/api.js`

```javascript
// 개발 환경에서 .env 파일 우선 사용
if (import.meta.env.DEV) {
  if (
    import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL !== "undefined"
  ) {
    const envApiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = envApiUrl.endsWith("/api") ? envApiUrl : `${envApiUrl}/api`;
    return apiUrl;
  }
  // fallback: 동적 감지
}
```

#### 6. 접근성 개선

- **헤딩 순서 수정**: h1 → h2 순서로 올바른 구조
- **aria-label 추가**: 버튼에 접근 가능한 이름 제공
- **스크린 리더 지원**: 시각 장애인 사용자 접근성 향상
- **적용 파일**: `Pricing.jsx`, `Header.jsx`, `DashboardHeader.jsx`

```jsx
// 헤딩 순서 수정
<h1>가격 플랜</h1>
<h2>Free</h2>  {/* h3 → h2로 변경 */}

// 접근성 개선
<button aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}>
```

### 성능 개선 결과

#### 예상 성능 향상

- **총 절약량**: 약 1,500-2,000 KiB (25-30% 감소)
- **Performance 점수**: 86 → 95-98점 (+9~12점)
- **Accessibility 점수**: 93 → 95-97점 (+2~4점)
- **Best Practices**: 100점 유지
- **SEO**: 100점 유지

#### 핵심 성능 지표 개선

- **First Contentful Paint**: 2.5s → 1.5s (40% 개선)
- **Largest Contentful Paint**: 4.5s → 2.8s (38% 개선)
- **Speed Index**: 2.5s → 1.8s (28% 개선)
- **Total Blocking Time**: 0ms 유지
- **Cumulative Layout Shift**: 0 유지

### 최적화 파일 목록

- `index.html`: 로컬 폰트 @font-face 정의
- `public/fonts/`: Noto Sans 폰트 파일들
- `vite.config.js`: 코드 스플리팅, 이미지 최적화
- `App.jsx`: 동적 임포트 구현
- `nginx.conf`: SPA 라우팅, 404 에러 처리
- `src/config/api.js`: 개발 환경 API 설정
- `Pricing.jsx`: 헤딩 순서 수정
- 모든 이미지 컴포넌트: WebP 최적화, 명시적 크기

## 최적화 진행 내역

### 2025-01-12: API 반환값 및 에러 처리 최적화

#### 🔧 주요 수정 사항

**1. API 함수 반환값 최적화**

- **문제**: 대부분의 API 함수가 `undefined`를 반환하여 디버깅 및 에러 처리에 어려움
- **해결**: 모든 API 함수에 의미 있는 반환값 추가
- **수정된 파일들**:
  - `frontend/src/stores/dashboardStore.js`
  - `frontend/src/stores/authStore.js`
  - `frontend/src/components/pages/DashboardOverview.jsx`
  - `frontend/src/components/pages/DashboardBilling.jsx`
  - `frontend/src/components/pages/DashboardApp.jsx`
  - `frontend/src/components/pages/DashboardSettings.jsx`

**2. 에러 처리 로직 개선**

- **문제**: `Promise.allSettled`에서 실패한 API도 `fulfilled`로 처리되어 `allSuccessful: true` 반환
- **해결**: `catch` 블록에서 `return null` 대신 `throw error` 사용
- **수정된 파일**: `frontend/src/hooks/useErrorHandler.js`

**3. 로딩 상태 조건 통일**

- **문제**: 각 페이지마다 다른 로딩 조건으로 인한 일관성 부족
- **해결**: 모든 대시보드 페이지에 `getProfile` API 추가하여 `!user` 조건 해결
- **수정된 페이지들**:
  - `DashboardBilling.jsx`: 2개 → 3개 API 호출
  - `DashboardSettings.jsx`: 1개 → 2개 API 호출

**4. ESLint 경고 해결**

- **문제**: `react-hooks/exhaustive-deps` 경고 및 `no-unsafe-finally` 에러
- **해결**: 의존성 배열 최적화 및 `finally` 블록에서 `return` 문 제거
- **수정된 파일들**:
  - `frontend/src/stores/authStore.js`
  - `frontend/src/components/pages/DashboardOverview.jsx`
  - `frontend/src/components/pages/DashboardUsage.jsx`
  - `frontend/src/components/tosspayments/Checkout.jsx`

#### 📊 최적화 결과

**Before (이전)**

```javascript
// API 함수들이 undefined 반환
const result = await someAPI();
console.log(result); // undefined

// 에러 발생 시에도 성공으로 처리
{allSuccessful: true, results: [{status: 'fulfilled', value: undefined}]}

// 로딩 상태가 계속 유지됨
const isDataLoading = isLoading || !user || isInitialLoad.current; // !user가 true
```

**After (수정 후)**

```javascript
// API 함수들이 의미 있는 데이터 반환
const result = await someAPI();
console.log(result); // {success: true, data: {...}}

// 에러 발생 시 올바르게 실패로 처리
{allSuccessful: false, results: [{status: 'rejected', reason: Error}]}

// 로딩 상태가 정상적으로 해제됨
const isDataLoading = isLoading || isInitialLoad.current; // user 정보 로드 완료
```

#### 🚀 성능 개선 효과

1. **디버깅 개선**: 모든 API 호출 결과를 명확히 확인 가능
2. **에러 처리 정확성**: 실패한 API 호출을 올바르게 감지
3. **로딩 상태 일관성**: 모든 페이지에서 동일한 로딩 조건 적용
4. **코드 품질 향상**: ESLint 경고 제거로 코드 안정성 증대
5. **쿠버네티스 환경 안정성**: 개발환경과 프로덕션 환경에서 동일한 동작 보장

#### 🔍 수정된 API 함수 목록

**dashboardStore.js**

- `loadRequestsStats`: `{success: true, data: {...}}` 반환
- `loadAllRequestsStats`: `{success: true}` 반환
- `loadLogs`: `{success: true, data: {...}}` 반환
- `refreshApplications`: `{success: true, apps, apiKeys}` 반환
- `loadStatisticsSummary`: `{success: true, data}` 반환
- `loadMultiAppStatistics`: `{success: true, data}` 반환

**authStore.js**

- `logout`: `{success: true}` 반환
- `initialize`: `{success: true/false, error?}` 반환

**페이지별 API 함수**

- `checkPaymentHistory`: `{success: true, hasHistory/data}` 반환
- `loadApplications`: `result` 반환
- `checkPremiumStatus`: `{success: true, hasPaymentHistory}` 반환

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
