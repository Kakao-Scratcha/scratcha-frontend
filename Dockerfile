# frontend/Dockerfile 수정
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 빌드 시점에 환경 변수 설정 - 클라우드 외부 IP로 변경
ARG VITE_API_URL=http://210.109.81.41:8001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 