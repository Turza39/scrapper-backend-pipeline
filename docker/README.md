# Docker Setup Guide

## Project Structure

After the recent updates, the Docker configuration has been reorganized:

```
docker/
├── backend/
│   └── Dockerfile          # Python FastAPI backend
├── frontend/
│   └── Dockerfile          # React frontend with multi-stage build
```

## Services

### Backend (Python/FastAPI)
- **Location:** `docker/backend/Dockerfile`
- **Port:** 8000 (internal) → 8000 (exposed)
- **Build Context:** Root directory
- **Dependencies:** `requirements.txt`

### Frontend (React)
- **Location:** `docker/frontend/Dockerfile`
- **Port:** 3000 (internal) → 3000 (exposed)
- **Build Context:** Root directory
- **Build Type:** Multi-stage (Node builder → http-server runtime)

### Nginx (Reverse Proxy)
- **Port:** 80/443
- **Routes:**
  - `/` → Frontend (React app)
  - `/api/` → Backend (FastAPI)
  - `/docs`, `/redoc`, `/openapi.json` → Backend documentation

## Running with Docker Compose

### Start all services:
```bash
docker-compose up -d
```

### Access services:
- **Frontend:** http://localhost:3000 or http://localhost
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost/docs
- **API Docs (ReDoc):** http://localhost/redoc

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

## Building Manually

### Build Backend:
```bash
docker build -f docker/backend/Dockerfile -t scraper-backend:latest .
```

### Build Frontend:
```bash
docker build -f docker/frontend/Dockerfile -t scraper-frontend:latest .
```

## Environment Variables

### Backend
- `DEBUG`: Set to "False" for production (default: "False")

No database or Redis configured by default. To add them, update `docker-compose.yml`.

## Network

All services communicate through the `scraper-network` Docker network:
- Service-to-service communication uses container names (e.g., `http://backend:8000`)

## Future Enhancements

To add PostgreSQL and Redis:
1. Uncomment service definitions in `docker-compose.yml`
2. Update backend environment variables
3. Update `docker/backend/Dockerfile` if additional dependencies needed
4. Restart services

## Notes

- The frontend Dockerfile uses a multi-stage build to minimize final image size
- Nginx is configured to proxy WebSocket connections for live reload
- Both services share the workspace volume for development
