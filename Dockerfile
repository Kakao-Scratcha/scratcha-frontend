# frontend/Dockerfile 수정
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 빌드 시점에 기본값 설정 (쿠버네티스에서 오버라이드 가능)
#ARG VITE_API_URL=http://210.109.80.247:8001/api
#ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 