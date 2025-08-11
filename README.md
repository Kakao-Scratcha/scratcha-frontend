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

- API 베이스 URL: `src/config/api.js`
  - `import.meta.env.VITE_API_URL`가 우선 사용되며, 미설정 시 `http://210.109.81.41:8001`로 폴백됩니다.
- 개발 서버 프록시: `vite.config.js`
  - `/api` → `http://localhost:8001`로 프록시 설정되어 있습니다.
- Docker 빌드: `Dockerfile`
  - `ARG VITE_API_URL`로 빌드 타임 API URL 주입 가능 (기본값: `http://210.109.81.41:8001`).

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
│   ├── config/               # 환경/클라이언트 설정 (axios 인스턴스 등)
│   │   └── api.js
│   ├── hooks/                # 커스텀 훅 (인증, 이미지 캐싱 등)
│   ├── services/             # API 서비스 래퍼
│   │   └── api.js
│   ├── stores/               # Zustand 전역 상태
│   │   ├── authStore.js
│   │   ├── darkModeStore.js
│   │   ├── dashboardStore.js
│   │   └── (themeStore.js 제거됨)
│   ├── utils/                # 유틸리티
│   │   └── chartImports.js
│   ├── App.jsx               # 라우팅 엔트리
│   ├── main.jsx              # React 엔트리
│   └── global.css            # 전역 스타일
├── public/                   # 정적 파일
├── vite.config.js            # Vite 설정 (프록시/청크 분리 등)
├── eslint.config.js          # ESLint 설정
├── Dockerfile                # 컨테이너 빌드
├── docker-compose.yml        # 배포/개발 구성 예시
└── index.html
```

## 라우팅

- `/` → 메인 페이지
- `/overview`, `/pricing`, `/demo`
- `/signin`, `/signup`
- `/dashboard` (보호 라우트)
  - index: 대시보드 개요
  - `/settings`, `/usage`, `/billing`, `/app`

## 상태 관리 (Zustand)

- `authStore.js`: 토큰/사용자/세션 유틸 포함, 로그인/로그아웃/프로필 로드 제공
- `dashboardStore.js`: 앱/키/사용량/통계 상태 관리 (실제 API 연동 기반)
- `darkModeStore.js`: 다크모드 상태 (themeStore 제거됨)

개발 모드/더미 데이터는 제거되었으며, 모든 기능은 실제 API 기준으로 동작합니다.

## API 서비스 개요

- 위치: `src/services/api.js`
- 인증: `/api/dashboard/auth/*`, 사용자: `/api/dashboard/users/*`
- 애플리케이션: `/api/dashboard/application/*`, API 키: `/api/dashboard/api-key/*`
- 대시보드: `/dashboard/*` (필요 시 확장)

axios 인스턴스(`src/config/api.js`)는 요청/응답 인터셉터로 토큰 부착과 로깅을 처리합니다.

## 빌드/배포

- 프로덕션 빌드: `npm run build` → 산출물 `dist/`
- Docker
  - `Dockerfile`로 빌드 시 `VITE_API_URL` 전달 가능
  - Nginx로 정적 파일 서빙 (`nginx.conf`)
- 개발 서버 프록시로 백엔드와 연동 (`vite.config.js`)

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
