# Scratcha Frontend

캡차 서비스 관리 플랫폼의 프론트엔드 애플리케이션입니다. React + Vite + Tailwind 기반으로 구성되며, 전역 상태는 Zustand를 사용합니다.

## 기술 스택

- **React** 19.1.0 (react-router-dom 7.7.1)
- **Vite** 7.0.4 (+ @vitejs/plugin-react, @tailwindcss/vite)
- **Tailwind CSS** 4.1.11
- **Zustand** 5.0.7 (전역 상태 관리)
- **Axios** 1.11.0 (HTTP 클라이언트)
- **Recharts** 3.1.0 (차트 라이브러리)
- **Prism.js** 1.30.0 (코드 하이라이팅)
- **TossPayments SDK** 2.3.7 (결제 연동)
- **Scratcha SDK** 2.0.28 (캡차 연동)

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 린트 검사
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── assets/                  # 정적 자원
│   │   └── images/             # 이미지 파일들
│   ├── components/             # React 컴포넌트
│   │   ├── dashboard/          # 대시보드 레이아웃/네비게이션
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── MenuData.jsx
│   │   │   ├── MenuLink.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UserInfo.jsx
│   │   ├── forms/              # 폼 UI 컴포넌트
│   │   │   ├── FormField.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormLabel.jsx
│   │   │   └── SignupButton.jsx
│   │   ├── pages/              # 라우트 페이지
│   │   │   ├── ApiDocs.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── DashboardApp.jsx
│   │   │   ├── DashboardBilling.jsx
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── DashboardSettings.jsx
│   │   │   ├── DashboardUsage.jsx
│   │   │   ├── Demo.jsx
│   │   │   ├── MainPage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Signin.jsx
│   │   │   └── Signup.jsx
│   │   ├── tosspayments/       # 결제 관련 컴포넌트
│   │   │   ├── Checkout.jsx
│   │   │   ├── common.js
│   │   │   ├── Fail.jsx
│   │   │   └── Success.jsx
│   │   ├── ui/                 # 재사용 가능한 UI 컴포넌트
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── ErrorModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── MultiAppUsageChart.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── OptimizedImage.jsx
│   │   │   ├── PaymentHistoryTable.jsx
│   │   │   ├── SocialLinks.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── SuccessModal.jsx
│   │   │   ├── Table.jsx
│   │   │   └── UsageChart.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeProvider.jsx
│   ├── config/                 # 환경/클라이언트 설정
│   │   └── api.js              # 동적 API URL 설정
│   ├── data/                   # 데이터 파일
│   │   └── dashboardDummy.js   # 더미 데이터 (미사용)
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useAuth.js
│   │   ├── useErrorHandler.js
│   │   └── useSignupForm.js
│   ├── services/               # API 서비스 래퍼
│   │   └── api.js
│   ├── stores/                 # Zustand 전역 상태
│   │   ├── authStore.js        # 인증 상태 관리
│   │   ├── darkModeStore.js    # 다크모드 상태 관리
│   │   └── dashboardStore.js   # 대시보드 데이터 상태 관리
│   ├── utils/                  # 유틸리티 함수
│   │   ├── chartDataUtils.js   # 차트 데이터 처리
│   │   ├── chartImports.js     # 차트 라이브러리 임포트
│   │   ├── logger.js           # 로깅 유틸리티
│   │   ├── tokenUtils.js       # JWT 토큰 처리
│   │   └── validators.js       # 입력 검증
│   ├── App.jsx                 # 라우팅 엔트리포인트
│   ├── main.jsx                # React 엔트리포인트
│   └── global.css              # 전역 스타일
├── public/                     # 정적 파일
│   ├── favicon.svg
│   └── fonts/                  # 로컬 폰트 파일
├── dist/                       # 빌드 결과물
├── docker-entrypoint.sh        # Docker 엔트리포인트
├── Dockerfile                  # 컨테이너 빌드 설정
├── eslint.config.js            # ESLint 설정
├── nginx.conf                  # Nginx 설정 (프로덕션)
├── package.json                # 의존성 및 스크립트
├── package-lock.json           # 의존성 잠금 파일
├── vite.config.js              # Vite 설정 (최적화됨)
└── index.html                  # HTML 템플릿
```

## 라우팅

### 공개 페이지

- `/` → 메인 페이지
- `/overview` → 서비스 소개
- `/pricing` → 요금제 안내
- `/demo` → 데모 페이지
- `/signin` → 로그인
- `/signup` → 회원가입

### 보호된 페이지 (인증 필요)

- `/dashboard` → 대시보드 개요
- `/dashboard/app` → APP 및 API 키 관리
- `/dashboard/usage` → 사용량 통계
- `/dashboard/billing` → 요금 및 결제
- `/dashboard/settings` → 계정 설정

### 결제 페이지

- `/checkout` → 결제 진행
- `/success` → 결제 성공
- `/fail` → 결제 실패

## 상태 관리 (Zustand)

### authStore.js

- **토큰 관리**: JWT 토큰 저장/검증/만료 확인
- **사용자 정보**: 프로필 로드/업데이트
- **인증 상태**: 로그인/로그아웃/세션 관리
- **권한 확인**: 사용자 역할 및 권한 검증

### dashboardStore.js

- **앱 관리**: 애플리케이션 CRUD 작업
- **API 키 관리**: API 키 생성/삭제/상태 변경
- **통계 데이터**: 사용량/요청 통계 로드
- **로그 관리**: API 호출 로그 조회

### darkModeStore.js

- **테마 상태**: 라이트/다크 모드 전환
- **사용자 선호도**: 테마 설정 저장

## API 서비스 구조

### 인증 관련 (authAPI)

- `POST /api/dashboard/auth/login` - 로그인
- `POST /api/dashboard/users/signup` - 회원가입
- `GET /api/dashboard/users/me` - 사용자 정보 조회
- `PATCH /api/dashboard/users/me` - 사용자 정보 수정
- `DELETE /api/dashboard/users/me` - 회원 탈퇴

### 애플리케이션 관리 (applicationAPI)

- `GET /api/dashboard/applications/all` - 모든 애플리케이션 조회
- `POST /api/dashboard/applications/` - 애플리케이션 생성
- `PATCH /api/dashboard/applications/{id}` - 애플리케이션 수정
- `DELETE /api/dashboard/applications/{id}` - 애플리케이션 삭제
- `POST /api/dashboard/api-keys/` - API 키 생성
- `PATCH /api/dashboard/api-keys/{id}` - API 키 난이도 수정
- `DELETE /api/dashboard/api-keys/{id}` - API 키 삭제
- `PUT /api/dashboard/api-keys/{id}/activate` - API 키 활성화
- `PUT /api/dashboard/api-keys/{id}/deactivate` - API 키 비활성화

### 대시보드 통계 (dashboardAPI)

- `GET /api/dashboard/statistics/logs` - 로그 조회
- `GET /api/dashboard/statistics/requests` - 요청 통계
- `GET /api/dashboard/statistics/summary` - 통계 요약

### 결제 관련 (paymentAPI)

- `POST /api/payments/confirm` - 결제 승인
- `GET /api/payments/history` - 구매내역 조회

### 문의하기 (contactAPI)

- `POST /api/contacts/` - 문의사항 전송

## 환경 설정

### 개발 환경 설정

```bash
# .env.development 파일 생성
VITE_API_URL=https://api.scratcha.cloud
```

### 프로덕션 환경 설정

```bash
# .env.production 파일 생성
VITE_API_URL=https://api.scratcha.cloud
```

### Docker 환경 변수

```bash
# Docker 빌드 시 환경 변수 주입
docker build --build-arg VITE_API_URL=https://api.scratcha.cloud -t scratcha-frontend .
```

## 빌드 및 배포

### 로컬 개발

```bash
npm run dev
# → http://localhost:5173
```

### 프로덕션 빌드

```bash
npm run build
# → dist/ 폴더에 빌드 결과물 생성
```

### Docker 빌드

```bash
# 기본 빌드
docker build -t scratcha-frontend .

# 환경 변수와 함께 빌드
docker build --build-arg VITE_API_URL=https://api.scratcha.cloud -t scratcha-frontend .
```

### Docker 실행

```bash
# 컨테이너 실행
docker run -d -p 3000:80 scratcha-frontend
```

## 성능 최적화

### 코드 스플리팅

- **라이브러리 분리**: react-vendor, chart-vendor, utils-vendor
- **페이지별 분리**: 각 대시보드 페이지 개별 청크
- **지연 로딩**: React.lazy + Suspense

### 이미지 최적화

- **WebP 변환**: 모든 PNG/JPG → WebP 자동 변환
- **크기 최적화**: 85% 품질로 압축
- **지연 로딩**: loading="lazy" 속성

### 빌드 최적화

- **Terser 압축**: 프로덕션에서 console.log 제거
- **CSS 최적화**: LightningCSS 압축
- **번들 분석**: rollup-plugin-visualizer

## 주요 기능

### 인증 시스템

- JWT 토큰 기반 인증
- 자동 토큰 갱신
- 세션 만료 관리
- 비밀번호 보이기/안보이기

### 애플리케이션 관리

- APP 생성/수정/삭제
- API 키 관리 (생성/삭제/활성화/비활성화)
- 난이도 설정 (쉬움/보통/어려움)
- 입력 길이 제한 (이름 100자, 설명 500자)

### 사용량 통계

- 실시간 차트 (당일/7일/30일/전체)
- 다중 앱 통계
- 로그 테이블 뷰
- 툴팁 개선 (날짜 + 사용량 수치)

### 결제 시스템

- TossPayments 연동
- 토큰 충전
- 구매내역 조회
- 결제 상태 관리

### UI/UX 개선

- 다크모드 지원
- 반응형 디자인
- 모달 폼 자동 초기화
- 에러 메시지 개선
- 접근성 향상

## 최신 업데이트 (2025-09-17)

### 🎨 UI/UX 개선

**모달 폼 초기화**

- 취소 시 모든 입력 내용 자동 초기화
- X 버튼, ESC 키, 배경 클릭 시에도 초기화

**비밀번호 입력 개선**

- 회원정보수정에서 비밀번호 보이기/안보이기 토글
- 호버 효과 및 포커스 외곽선 제거

**API 키 상태 시각화**

- 활성화: 초록색 원
- 비활성화: 회색 원
- 난이도 설정 버튼 텍스트 통일

**입력 검증 강화**

- APP 이름: 최대 100자 제한
- APP 설명: 최대 500자 제한
- 실시간 문자 수 카운터

**다크모드 색상 개선**

- 요금 페이지 토큰 현황 카드별 색상 구별
- 라이트모드는 기존 회색 유지

**그래프 툴팁 개선**

- 사용량 숫자 추가 (파란색 강조)
- 불필요한 "사용량" 텍스트 제거

### 🐛 버그 수정

**사용량 페이지 무한 로딩 해결**

- APP이 없는 경우 적절한 안내 메시지 표시
- 기존 로그가 있으면 앱이 0개여도 데이터 표시

**당일 그래프 데이터 매핑 오류 해결**

- 시간 형식 통일: `9:00` → `09:00`
- 모든 서버 데이터가 정확히 그래프에 반영

**구매내역 테이블 렌더링 개선**

- `initialData` prop으로 외부 데이터 전달
- 중복 API 호출 제거

**에러 메시지 개선**

- 서버 응답 메시지 우선 표시
- 하드코딩된 메시지 최소화
- 상세 에러 로깅 추가

### 🔧 레이아웃 개선

**긴 텍스트 처리**

- APP 이름 최대 너비 제한
- 텍스트 줄임 + 툴팁 표시
- 버튼 가시성 보장

**입력 필드 개선**

- 불필요한 포커스 외곽선 제거
- 깔끔한 비밀번호 토글 버튼

## 개발 가이드

### API 연결 테스트

```javascript
// 브라우저 콘솔에서 환경 변수 확인
console.log("API URL:", import.meta.env.VITE_API_URL);

// API 요청 테스트
fetch("/api/dashboard/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test", password: "test" }),
});
```

### 디버깅

개발 환경에서는 상세한 콘솔 로그가 출력됩니다:

- API 요청/응답 로그
- 상태 변경 로그
- 에러 상세 정보

프로덕션에서는 성능을 위해 콘솔 로그가 제거됩니다.

### 성능 모니터링

```bash
# Lighthouse 테스트
npx lighthouse http://localhost:5173 --output=json --output-path=./lighthouse.json

# 번들 분석
npm run build
# → dist/bundle-analysis.html 생성
```

## 배포 환경

### Nginx 설정

- SPA 라우팅 지원
- Gzip 압축 (레벨 9)
- 정적 파일 캐싱
- 보안 헤더

### 쿠버네티스

- ConfigMap으로 환경 변수 관리
- 동적 API URL 설정
- 내부 서비스 디스커버리

## 라이선스

MIT License
