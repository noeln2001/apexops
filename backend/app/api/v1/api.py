from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    overview,
    standings,
    drivers,
    constructors,
    circuits,
    races,
    telemetry,
    strategy,
    simulations,
    championship,
    news,
    operations,
    exports,
    gallery
)

api_router = APIRouter()

api_router.include_router(overview.router, tags=["Overview"])
api_router.include_router(championship.router, tags=["Championship Tracker & Max Scenarios"])
api_router.include_router(gallery.router, tags=["UHD Image Gallery"])
api_router.include_router(standings.router, tags=["Standings"])
api_router.include_router(drivers.router, tags=["Drivers"])
api_router.include_router(constructors.router, tags=["Constructors"])
api_router.include_router(circuits.router, tags=["Circuits"])
api_router.include_router(races.router, tags=["Races & Sessions"])
api_router.include_router(telemetry.router, tags=["Telemetry Lab"])
api_router.include_router(strategy.router, tags=["Strategy Lab"])
api_router.include_router(simulations.router, tags=["Championship Simulator"])
api_router.include_router(news.router, tags=["News & Regulations"])
api_router.include_router(operations.router, tags=["Operations & Observability"])
api_router.include_router(exports.router, tags=["Data Exports"])
