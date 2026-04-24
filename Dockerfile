FROM node:20-bullseye

# Install Python 3.10 and Nginx
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set up working directory
WORKDIR /app

# Copy root configuration files
COPY nginx.conf /app/nginx.conf
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# --------------------------
# 1. Build AI Service
# --------------------------
COPY ai-service /app/ai-service
WORKDIR /app/ai-service
# We map python to python3 via the active venv
RUN pip install --no-cache-dir -r requirements.txt

# --------------------------
# 2. Build Realtime Service
# --------------------------
WORKDIR /app
COPY realtime-service /app/realtime-service
WORKDIR /app/realtime-service
RUN npm install

# --------------------------
# 3. Build Next.js Frontend
# --------------------------
WORKDIR /app
COPY web /app/web
WORKDIR /app/web
# We don't set env vars here, they are relative paths now
RUN npm install
RUN npm run build

# --------------------------
# Final Setup
# --------------------------
WORKDIR /app

# Expose port 80 for Nginx
EXPOSE 80

# Start everything
CMD ["./start.sh"]
