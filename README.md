# Scratcha Frontend

캡차 서비스 관리 플랫폼의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 19.1.0** - UI 라이브러리
- **Vite 7.0.4** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS 4.1.11** - 유틸리티 CSS 프레임워크
- **React Router DOM 7.7.1** - SPA 라우팅
- **Zustand 5.0.7** - 경량 상태 관리
- **Axios 1.11.0** - HTTP 클라이언트
- **Recharts 3.1.0** - 데이터 시각화

## 주요 기능

- 🔐 **인증 시스템** - 로그인/회원가입
- 🌙 **다크모드** - 테마 전환 지원
- 📊 **대시보드** - 사용량, 설정, 요금 관리
- 📱 **APP 관리** - CRUD 기능
- 🔑 **API 키 관리** - 생성, 삭제, 활성화
- 📈 **사용량 통계** - 차트로 시각화
- 💳 **요금제 관리** - 플랜 변경, 청구 내역

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

## 폴더 구조

```
frontend/
├── src/
│   ├── conponents/           # 컴포넌트 (오타)
│   │   ├── dashboard/        # 대시보드 전용 컴포넌트
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── MenuData.jsx
│   │   │   ├── MenuLink.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UserInfo.jsx
│   │   ├── forms/            # 폼 컴포넌트
│   │   │   ├── FormButton.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormLabel.jsx
│   │   │   └── SignupButton.jsx
│   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── Demo.jsx
│   │   │   ├── MainPage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Signin.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── DashboardSettings.jsx
│   │   │   ├── DashboardUsage.jsx
│   │   │   ├── DashboardBilling.jsx
│   │   │   └── DashboardApp.jsx
│   │   ├── ui/               # UI 컴포넌트
│   │   │   ├── ActivityIcon.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── DemoInfo.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── ErrorModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Icon.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ScratchDemo.jsx
│   │   │   ├── SocialLinks.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Table.jsx
│   │   │   └── ThemeSelector.jsx
│   │   ├── AuthProvider.jsx  # 인증 프로바이더
│   │   ├── Dashboard.jsx     # 대시보드 레이아웃
│   │   ├── Layout.jsx        # 메인 레이아웃
│   │   ├── ProtectedRoute.jsx # 보호된 라우트
│   │   └── ThemeProvider.jsx # 테마 프로바이더
│   ├── config/               # 설정 파일
│   │   └── api.js           # API 설정
│   ├── hooks/                # 커스텀 훅
│   │   ├── useAuth.js       # 인증 훅
│   │   └── useSignupForm.js # 회원가입 폼 훅
│   ├── services/             # API 서비스
│   │   └── api.js           # API 통신 로직
│   ├── stores/               # 상태 관리 (Zustand)
│   │   ├── authStore.js     # 인증 상태
│   │   ├── darkModeStore.js # 다크모드 상태
│   │   ├── dashboardStore.js # 대시보드 상태
│   │   ├── devModeStore.js  # 개발모드 상태
│   │   └── themeStore.js    # 테마 상태
│   ├── utils/                # 유틸리티 함수
│   │   └── chartImports.js  # 차트 관련 유틸
│   ├── assets/               # 정적 자산
│   │   └── react.svg
│   ├── App.jsx              # 메인 앱 컴포넌트
│   ├── main.jsx             # React 앱 진입점
│   └── global.css           # 전역 스타일
├── public/                   # 정적 파일
├── package.json              # 의존성 및 스크립트
├── vite.config.js           # Vite 설정
├── eslint.config.js         # ESLint 설정
└── index.html               # 진입점 HTML
```

## 라우팅 구조

```
/                    → MainPage (메인 페이지)
/overview           → Overview (서비스 개요)
/pricing            → Pricing (요금제)
/demo               → Demo (데모)
/about              → AboutPage (회사 소개)
/contact            → ContactPage (문의)
/signin             → Signin (로그인)
/signup             → Signup (회원가입)
/dashboard/         → Dashboard (대시보드)
├── /               → DashboardOverview (대시보드 개요)
├── /settings       → DashboardSettings (설정)
├── /usage          → DashboardUsage (사용량)
├── /billing        → DashboardBilling (요금)
└── /app            → DashboardApp (APP 관리)
```

## 컴포넌트 구조

### 폴더별 역할

| 폴더            | 역할       | 구분 이유               |
| --------------- | ---------- | ----------------------- |
| **config/**     | 설정 파일  | 환경별 설정 분리        |
| **hooks/**      | 커스텀 훅  | 재사용 가능한 로직 분리 |
| **services/**   | API 서비스 | 비즈니스 로직 분리      |
| **stores/**     | 상태 관리  | 전역 상태 분리          |
| **utils/**      | 유틸리티   | 헬퍼 함수 분리          |
| **conponents/** | 컴포넌트   | UI 컴포넌트 분리        |

### conponents/ 하위 폴더

| 폴더           | 역할            | 구분 이유              |
| -------------- | --------------- | ---------------------- |
| **dashboard/** | 대시보드 전용   | 대시보드 레이아웃 분리 |
| **forms/**     | 폼 컴포넌트     | 폼 요소 재사용         |
| **pages/**     | 페이지 컴포넌트 | 라우트별 페이지 분리   |
| **ui/**        | UI 컴포넌트     | 재사용 가능한 UI       |

## 다크모드 지원

- Tailwind CSS 다크모드 유틸리티 클래스 사용
- `darkModeStore.js`로 상태 관리
- 모든 컴포넌트에서 다크모드 적용
- `dark:` 접두사로 다크모드 스타일 정의

## 개발 가이드

### 새로운 컴포넌트 추가

1. 적절한 폴더에 컴포넌트 파일 생성
2. Tailwind CSS 클래스 사용
3. 다크모드 지원 클래스 추가 (`dark:` 접두사)
4. 필요한 경우 Zustand 스토어 연결

### 스타일링 가이드

- Tailwind CSS 유틸리티 클래스 사용
- 다크모드: `text-gray-900 dark:text-gray-100`
- 배경: `bg-white dark:bg-gray-900`
- 테두리: `border-gray-200 dark:border-gray-700`

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run preview
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
