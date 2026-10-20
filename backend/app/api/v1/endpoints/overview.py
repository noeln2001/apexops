from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.models.f1_core import Season, Driver, Constructor
from backend.app.models.f1_events import Race, DriverStanding, ConstructorStanding, SessionResult
from backend.app.models.operations import DataSource
from backend.app.models.governance import NewsArticle

router = APIRouter()

@router.get("/overview")
def get_overview_dashboard(
    season: int = Query(2026, description="Championship season year"),
    db: Session = Depends(get_db)
):
    """Aggregates all key data cards for the Overview Dashboard."""
    ref_date = settings.REFERENCE_DATE # "2026-10-20"
    
    # Season info
    season_rec = db.query(Season).filter(Season.year == season).first()
    
    # Upcoming race (first race with date >= ref_date)
    upcoming_race = db.query(Race).filter(
        Race.season_year == season,
        Race.date >= ref_date
    ).order_by(Race.round).first()

    # Most recently completed race (last race with date < ref_date)
    latest_completed_race = db.query(Race).filter(
        Race.season_year == season,
        Race.date < ref_date
    ).order_by(Race.round.desc()).first()

    latest_results = []
    if latest_completed_race:
        results = db.query(SessionResult).filter(
            SessionResult.race_id == latest_completed_race.race_id
        ).order_by(SessionResult.position).limit(10).all()
        for r in results:
            d = db.query(Driver).filter(Driver.driver_id == r.driver_id).first()
            c = db.query(Constructor).filter(Constructor.constructor_id == r.constructor_id).first()
            latest_results.append({
                "position": r.position,
                "position_text": r.position_text,
                "driver_name": f"{d.first_name} {d.last_name}" if d else r.driver_id,
                "driver_code": d.code if d else None,
                "constructor_name": c.name if c else r.constructor_id,
                "constructor_color": c.color_hex if c else "#E10600",
                "points": r.points,
                "time_str": r.time_str or r.status,
                "fastest_lap": r.fastest_lap_time
            })

    # Driver standings (Top 10)
    driver_standings = []
    ds_records = db.query(DriverStanding).filter(
        DriverStanding.season_year == season
    ).order_by(DriverStanding.position).limit(10).all()

    leader_pts = ds_records[0].points if ds_records else 0.0
    for idx, ds in enumerate(ds_records):
        d = db.query(Driver).filter(Driver.driver_id == ds.driver_id).first()
        c = db.query(Constructor).filter(Constructor.constructor_id == ds.constructor_id).first() if ds.constructor_id else None
        gap_to_leader = round(leader_pts - ds.points, 1)
        prev_pts = ds_records[idx - 1].points if idx > 0 else ds.points
        gap_to_prev = round(prev_pts - ds.points, 1)

        driver_standings.append({
            "position": ds.position,
            "driver_id": ds.driver_id,
            "driver_name": f"{d.first_name} {d.last_name}" if d else ds.driver_id,
            "driver_code": d.code if d else None,
            "nationality": d.nationality if d else None,
            "constructor_name": c.name if c else "Privateer",
            "constructor_color": c.color_hex if c else "#E10600",
            "points": ds.points,
            "wins": ds.wins,
            "gap_to_leader": gap_to_leader,
            "gap_to_prev": gap_to_prev
        })

    # Constructor standings (Top 10)
    constructor_standings = []
    cs_records = db.query(ConstructorStanding).filter(
        ConstructorStanding.season_year == season
    ).order_by(ConstructorStanding.position).limit(10).all()

    c_leader_pts = cs_records[0].points if cs_records else 0.0
    for idx, cs in enumerate(cs_records):
        c = db.query(Constructor).filter(Constructor.constructor_id == cs.constructor_id).first()
        gap_to_leader = round(c_leader_pts - cs.points, 1)
        prev_pts = cs_records[idx - 1].points if idx > 0 else cs.points
        gap_to_prev = round(prev_pts - cs.points, 1)

        constructor_standings.append({
            "position": cs.position,
            "constructor_id": cs.constructor_id,
            "constructor_name": c.name if c else cs.constructor_id,
            "constructor_color": c.color_hex if c else "#E10600",
            "points": cs.points,
            "wins": cs.wins,
            "gap_to_leader": gap_to_leader,
            "gap_to_prev": gap_to_prev
        })

    # Recent news (Top 4)
    news = db.query(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(4).all()
    news_items = [
        {
            "id": n.id,
            "headline": n.headline,
            "publisher": n.publisher,
            "url": n.url,
            "published_at": n.published_at.isoformat() if n.published_at else None,
            "category": n.category,
            "confirmation_status": n.confirmation_status,
            "reliability_score": n.reliability_score,
            "summary": n.summary
        } for n in news
    ]

    # Data Provider Health
    providers = db.query(DataSource).all()
    provider_status = [
        {
            "name": p.name,
            "status": p.health_status,
            "last_ping_ms": p.last_ping_ms
        } for p in providers
    ]

    return {
        "season": season,
        "reference_date": ref_date,
        "upcoming_event": {
            "race_id": upcoming_race.race_id if upcoming_race else None,
            "round": upcoming_race.round if upcoming_race else None,
            "name": upcoming_race.name if upcoming_race else "Season Finale",
            "circuit_name": upcoming_race.circuit_rel.name if upcoming_race and upcoming_race.circuit_rel else "Austin (COTA)",
            "date": upcoming_race.date if upcoming_race else "2026-10-25",
            "time_utc": upcoming_race.time_utc if upcoming_race else "19:00:00Z",
            "status": upcoming_race.status if upcoming_race else "Scheduled",
            "circuit_timezone": "America/Chicago (UTC-5)",
            "ist_schedule": "Monday, 26 October 00:30 IST (Race)"
        },
        "latest_completed_event": {
            "race_id": latest_completed_race.race_id if latest_completed_race else None,
            "round": latest_completed_race.round if latest_completed_race else None,
            "name": latest_completed_race.name if latest_completed_race else "Singapore Grand Prix",
            "date": latest_completed_race.date if latest_completed_race else "2026-10-11",
            "results": latest_results
        },
        "driver_standings": driver_standings,
        "constructor_standings": constructor_standings,
        "recent_news": news_items,
        "provider_health": provider_status
    }
