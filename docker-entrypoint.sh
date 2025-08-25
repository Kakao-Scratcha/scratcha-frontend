#!/bin/sh

# Set default environment variables with better error handling
if [ -z "$VITE_API_URL" ]; then
    export VITE_API_URL="http://10.0.129.24:8001"
    echo "⚠️ VITE_API_URL not set, using default: $VITE_API_URL"
else
    echo "✅ VITE_API_URL set to: $VITE_API_URL"
fi

if [ -z "$ENVIRONMENT" ]; then
    export ENVIRONMENT="production"
    echo "⚠️ ENVIRONMENT not set, using default: $ENVIRONMENT"
else
    echo "✅ ENVIRONMENT set to: $ENVIRONMENT"
fi

if [ -z "$DNS_SERVER" ]; then
    export DNS_SERVER="10.96.0.10"
    echo "⚠️ DNS_SERVER not set, using default: $DNS_SERVER"
else
    echo "✅ DNS_SERVER set to: $DNS_SERVER"
fi

echo "🚀 Frontend starting..."
echo "📊 Configuration Summary:"
echo "   API URL: $VITE_API_URL"
echo "   Environment: $ENVIRONMENT"
echo "   DNS Server: $DNS_SERVER"

# Validate VITE_API_URL format
if [[ "$VITE_API_URL" != http://* && "$VITE_API_URL" != https://* ]]; then
    echo "❌ Error: VITE_API_URL must start with http:// or https://"
    echo "   Current value: $VITE_API_URL"
    echo "   Using fallback: http://10.0.129.24:8001"
    export VITE_API_URL="http://10.0.129.24:8001"
fi

# Update DNS resolver in nginx config
echo "🔧 Updating DNS resolver to: $DNS_SERVER"
sed -i "s|resolver 10.96.0.10 valid=30s;|resolver $DNS_SERVER valid=30s;|g" /etc/nginx/nginx.conf

# Kubernetes environment DNS configuration
if [[ "$VITE_API_URL" == *"svc.cluster.local"* ]]; then
    echo "🔧 Kubernetes internal service detected: $VITE_API_URL"
    
    # Update nginx proxy settings for internal service
    sed -i "s|set \$backend_server \"[^\"]*\"|set \$backend_server \"$VITE_API_URL\"|g" /etc/nginx/nginx.conf
    
    # Keep /api/config returning relative path for internal service
    sed -i "s|set \$api_url \"[^\"]*\"|set \$api_url \"/api\"|g" /etc/nginx/nginx.conf
    
    echo "✅ Kubernetes internal service proxy configured"
else
    echo "🔧 External service configuration: $VITE_API_URL"
    
    # Extract host and port from VITE_API_URL
    if [[ "$VITE_API_URL" =~ ^(https?://)([^:/]+)(:([0-9]+))? ]]; then
        PROTOCOL="${BASH_REMATCH[1]}"
        HOST="${BASH_REMATCH[2]}"
        PORT="${BASH_REMATCH[4]:-8001}"
        
        echo "   Protocol: $PROTOCOL"
        echo "   Host: $HOST"
        echo "   Port: $PORT"
        
        # Update backend server setting
        BACKEND_URL="${PROTOCOL}${HOST}:${PORT}"
        sed -i "s|set \$backend_server \"[^\"]*\"|set \$backend_server \"$BACKEND_URL\"|g" /etc/nginx/nginx.conf
        
        # Update /api/config to return relative path
        sed -i "s|set \$api_url \"[^\"]*\"|set \$api_url \"/api\"|g" /etc/nginx/nginx.conf
        
        echo "✅ External service proxy configured: $BACKEND_URL"
    else
        echo "❌ Error: Invalid VITE_API_URL format: $VITE_API_URL"
        echo "   Using fallback configuration"
        sed -i "s|set \$backend_server \"[^\"]*\"|set \$backend_server \"http://10.0.129.24:8001\"|g" /etc/nginx/nginx.conf
        sed -i "s|set \$api_url \"[^\"]*\"|set \$api_url \"/api\"|g" /etc/nginx/nginx.conf
    fi
fi

# Update environment name
sed -i "s|set \$env_name \"[^\"]*\"|set \$env_name \"$ENVIRONMENT\"|g" /etc/nginx/nginx.conf

# Validate nginx configuration
echo "🔍 Validating nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration validation failed"
    echo "   Using default configuration..."
    # Restore default configuration if validation fails
    cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf 2>/dev/null || {
        echo "   No backup configuration found, using current config"
    }
fi

echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"
