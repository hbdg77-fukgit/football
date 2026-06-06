# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json ./
RUN npm install

# Copy source and build
COPY frontend/ ./
RUN npm run build


# ── Stage 2: Flask backend + built frontend ────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask application
COPY backend/ ./

# Copy built React app into a static folder served by Flask (optional)
# The frontend is served separately in Railway; this is here for single-service deploys.
COPY --from=frontend-builder /app/frontend/dist ./static/frontend

# Expose port (Railway injects $PORT at runtime)
EXPOSE 5000

# Start with Gunicorn
CMD gunicorn --bind "0.0.0.0:${PORT:-5000}" --workers 2 --timeout 120 app:app
