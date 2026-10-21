import time
import uuid
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.api import api_router
from backend.app.db.init_db import init_database
from backend.app.db.session import SessionLocal
from backend.app.models.operations import DataSource

from operations.monitoring.telemetry_collector import telemetry_collector
from operations.logging.log_buffer import operational_log_handler

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'
)
logger = logging.getLogger("apexops.api")

# Attach operational_log_handler to root and apexops loggers
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
if operational_log_handler not in root_logger.handlers:
    root_logger.addHandler(operational_log_handler)

apexops_logger = logging.getLogger("apexops")
apexops_logger.setLevel(logging.INFO)
if operational_log_handler not in apexops_logger.handlers:
    apexops_logger.addHandler(operational_log_handler)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Enterprise-grade Formula 1 Data, Analytics, Telemetry, and IT Operations Platform.",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Correlation ID Middleware
@app.middleware("http")
async def add_process_time_and_correlation_id(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    start_time = time.time()
    status_code = 500
    error_detail = None
    
    try:
        response = await call_next(request)
        status_code = response.status_code
        process_time_ms = (time.time() - start_time) * 1000
        response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"
        response.headers["X-Correlation-ID"] = correlation_id
        
        # Exclude high-frequency health probes from flooding logs
        if not request.url.path.endswith("/health"):
            logger.info(f"{request.method} {request.url.path} [{response.status_code}] {process_time_ms:.1f}ms - CID: {correlation_id}")
        
        return response
    except Exception as exc:
        status_code = 500
        error_detail = str(exc)
        logger.error(f"{request.method} {request.url.path} [500] - CID: {correlation_id} - Error: {exc}", exc_info=True)
        raise
    finally:
        duration_ms = (time.time() - start_time) * 1000
        route = request.scope.get("route")
        route_template = getattr(route, "path", None) or request.url.path
        telemetry_collector.record_request(
            method=request.method,
            path=route_template,
            status_code=status_code,
            duration_ms=duration_ms,
            correlation_id=correlation_id,
            error_detail=error_detail
        )

@app.on_event("startup")
def startup_event():
    logger.info("Starting ApexOps Engine...")
    if operational_log_handler not in root_logger.handlers:
        root_logger.addHandler(operational_log_handler)
    if operational_log_handler not in apexops_logger.handlers:
        apexops_logger.addHandler(operational_log_handler)
    init_database()
    
    # Initialize default data sources if not present
    db = SessionLocal()
    try:
        sources = [
            {"name": "Jolpica", "type": "REST_API", "url": settings.JOLPICA_BASE_URL},
            {"name": "OpenF1", "type": "REST_API", "url": settings.OPENF1_BASE_URL},
            {"name": "FastF1", "type": "PYTHON_LIB", "url": "fastf1.local_cache"},
            {"name": "FIA Official", "type": "RSS/PRESS", "url": "https://www.fia.com"}
        ]
        for s in sources:
            if not db.query(DataSource).filter(DataSource.name == s["name"]).first():
                db.add(DataSource(
                    name=s["name"],
                    type=s["type"],
                    endpoint_url=s["url"],
                    health_status="HEALTHY",
                    last_ping_ms=45.0
                ))
        db.commit()
    except Exception as e:
        logger.warning(f"Error seeding data sources on startup: {e}")
    finally:
        db.close()

@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
def health_check():
    """Liveness probe reporting backend availability and current reference time."""
    return {
        "status": "UP",
        "service": "ApexOps Core Backend",
        "reference_date": settings.REFERENCE_DATE,
        "environment": settings.ENVIRONMENT,
        "version": settings.PROJECT_VERSION
    }

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Mount frontend production build if available
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path.startswith("health"):
            return None
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "ApexOps API active. Frontend dist not built."}

