# Scratcha Frontend 배포 가이드

## Docker Hub 이미지 정보

- **이미지명**: `leekyz/scratcha-frontend:latest`
- **Docker Hub URL**: https://hub.docker.com/r/leekyz/scratcha-frontend

## 기존 서버에서 배포하는 방법

### 1. 기존 컨테이너 중지 및 제거

```bash
# 기존 컨테이너 중지
docker stop scratcha-frontend

# 기존 컨테이너 제거
docker rm scratcha-frontend

# 기존 이미지 제거 (선택사항)
docker rmi scratcha-frontend:latest
```

### 2. 최신 이미지 Pull

```bash
# Docker Hub에서 최신 이미지 pull
docker pull leekyz/scratcha-frontend:latest
```

### 3. 새 컨테이너 실행

```bash
# 포트 3000으로 실행
docker run -d \
  --name scratcha-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  leekyz/scratcha-frontend:latest
```

### 4. Docker Compose 사용 (권장)

```bash
# docker-compose.yml 파일 생성 후
docker-compose up -d
```

## Docker Compose 파일 예시

```yaml
version: "3.8"

services:
  frontend:
    image: leekyz/scratcha-frontend:latest
    container_name: scratcha-frontend
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

## 확인 방법

```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs scratcha-frontend

# 웹사이트 접속 확인
curl http://localhost:3000
```

## 문제 해결

```bash
# 컨테이너 로그 확인
docker logs scratcha-frontend

# 컨테이너 내부 접속
docker exec -it scratcha-frontend sh

# 이미지 정보 확인
docker inspect leekyz/scratcha-frontend:latest
```

## 업데이트 시나리오

```bash
# 1. 새 이미지 pull
docker pull leekyz/scratcha-frontend:latest

# 2. 기존 컨테이너 중지
docker stop scratcha-frontend

# 3. 기존 컨테이너 제거
docker rm scratcha-frontend

# 4. 새 컨테이너 실행
docker run -d --name scratcha-frontend -p 3000:80 --restart unless-stopped leekyz/scratcha-frontend:latest
```

## 환경 변수 (필요시)

```bash
docker run -d \
  --name scratcha-frontend \
  -p 3000:80 \
  -e NODE_ENV=production \
  -e API_URL=https://api.scratcha.com \
  --restart unless-stopped \
  leekyz/scratcha-frontend:latest
```
