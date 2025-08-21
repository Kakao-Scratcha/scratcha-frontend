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

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
