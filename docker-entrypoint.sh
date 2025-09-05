#!/bin/sh

echo "🚀 Frontend starting..."

# 2GB RAM 환경 파일 디스크립터 제한 설정
ulimit -n 262144 2>/dev/null || true   # 1,048,576 → 262,144로 완화
ulimit -u 32768 2>/dev/null || true    # 65,536 → 32,768로 완화
echo "📈 File descriptor limit set to: $(ulimit -n)"
echo "📈 Max processes limit set to: $(ulimit -u)"

# 메모리 사용량 모니터링 (HPA 테스트용)
echo "📊 Memory usage monitoring:"
echo "   Total memory: $(cat /proc/meminfo | grep MemTotal | awk '{print $2}') KB"
echo "   Available memory: $(cat /proc/meminfo | grep MemAvailable | awk '{print $2}') KB"
echo "   Current limit: $(ulimit -n)"
echo "   Max processes: $(ulimit -u)"
echo "   Max open files: $(cat /proc/sys/fs/file-max 2>/dev/null || echo 'N/A')"

# 기본 환경변수 설정
export VITE_API_URL=${VITE_API_URL:-"http://10.0.129.24:8001"}
export ENVIRONMENT=${ENVIRONMENT:-"production"}

echo "📊 Configuration:"
echo "   API URL: $VITE_API_URL"
echo "   Environment: $ENVIRONMENT"

# nginx 설정 업데이트 (간단하게)
if echo "$VITE_API_URL" | grep -q "svc.cluster.local"; then
    echo "🔧 Kubernetes internal service detected"
    # 내부 서비스는 nginx 프록시 사용
    sed -i "s|set \$backend_server \"[^\"]*\"|set \$backend_server \"$VITE_API_URL\"|g" /etc/nginx/nginx.conf
else
    echo "🔧 External service configuration"
    # 외부 서비스 설정
    sed -i "s|set \$backend_server \"[^\"]*\"|set \$backend_server \"$VITE_API_URL\"|g" /etc/nginx/nginx.conf
fi

# 환경 이름 업데이트
sed -i "s|set \$env_name \"[^\"]*\"|set \$env_name \"$ENVIRONMENT\"|g" /etc/nginx/nginx.conf

echo "✅ Configuration updated"
echo "🚀 Starting nginx..."

exec nginx -g "daemon off;"