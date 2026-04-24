#!/bin/bash
set -e

echo "[BOOT] Starting Nginx Reverse Proxy..."
nginx -c /app/nginx.conf -g "daemon off;" &
NGINX_PID=$!

echo "[BOOT] Starting Python AI Service (Port 8000)..."
cd /app/ai-service
python3 main.py &
AI_PID=$!

echo "[BOOT] Starting Node Real-time Service (Port 3001)..."
cd /app/realtime-service
npm start &
RT_PID=$!

echo "[BOOT] Starting Next.js Frontend (Port 3000)..."
cd /app/web
npm start &
WEB_PID=$!

echo "[BOOT] All services dispatched. System running on Port 80."

# Wait for any process to exit
wait -n $AI_PID $RT_PID $WEB_PID $NGINX_PID

echo "[SYSTEM_FAULT] A core service terminated unexpectedly."
exit 1
