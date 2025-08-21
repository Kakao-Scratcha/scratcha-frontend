# frontend/Dockerfile 수정
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 빌드 시점에 환경 변수 설정 - sdev 서버용
ARG VITE_API_URL=http://210.109.80.247:8001
ENV VITE_API_URL=$VITE_API_URL
# docker build --build-arg VITE_API_URL=http://210.109.80.247:8001 -t leekyz/scratcha-frontend-sdev:latest .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 