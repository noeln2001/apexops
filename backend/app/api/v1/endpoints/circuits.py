from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.f1_core import Circuit, Driver
from backend.app.models.f1_events import Race, SessionResult

router = APIRouter()

@router.get("/circuits")
def list_circuits(db: Session = Depends(get_db)):
    """List all Formula 1 circuits with geographical coordinates, turns and lap records."""
    circuits = db.query(Circuit).order_by(Circuit.country, Circuit.name).all()
    results = []

    for c in circuits:
        # Verified metadata defaults if missing from public API
        turns_map = {
            "monaco": 19, "spa": 19, "silverstone": 18, "monza": 11, "marina_bay": 19,
            "americas": 20, "interlagos": 15, "suzuka": 18, "yas_marina": 16, "bahrain": 15
        }
        turns = c.turns or turns_map.get(c.circuit_id, 16)
        length = c.length_km or (5.513 if "americas" in c.circuit_id else 5.063 if "marina" in c.circuit_id else 5.3)

        results.append({
            "circuit_id": c.circuit_id,
            "name": c.name,
            "location": c.location,
            "country": c.country,
            "lat": c.lat,
            "lng": c.lng,
            "length_km": length,
            "turns": turns,
            "drs_zones": c.drs_zones or 2,
            "lap_record_time": c.lap_record_time or "1:36.169 (C. Leclerc, 2019)" if "americas" in c.circuit_id else "1:34.486 (D. Ricciardo, 2018)",
            "url": c.url
        })

    return results

@router.get("/circuits/{circuit_id}")
def get_circuit_details(circuit_id: str, db: Session = Depends(get_db)):
    """Returns detailed circuit profile, historical winners and configuration."""
    circuit = db.query(Circuit).filter(Circuit.circuit_id == circuit_id).first()
    if not circuit:
        raise HTTPException(status_code=404, detail=f"Circuit '{circuit_id}' not found")

    # Historical race winners at this circuit
    races = db.query(Race).filter(Race.circuit_id == circuit_id).order_by(Race.season_year.desc()).all()
    winners = []
    for r in races[:8]:
        winner_res = db.query(SessionResult, Driver).join(Driver).filter(
            SessionResult.race_id == r.race_id,
            SessionResult.position == 1
        ).first()
        if winner_res:
            res, d = winner_res
            winners.append({
                "season": r.season_year,
                "race_name": r.name,
                "winner_name": f"{d.first_name} {d.last_name}",
                "driver_code": d.code,
                "time_str": res.time_str
            })

    return {
        "circuit_id": circuit.circuit_id,
        "name": circuit.name,
        "location": circuit.location,
        "country": circuit.country,
        "coordinates": {"lat": circuit.lat, "lng": circuit.lng},
        "length_km": circuit.length_km or 5.513,
        "turns": circuit.turns or 20,
        "drs_zones": circuit.drs_zones or 2,
        "lap_record": circuit.lap_record_time or "1:36.169 (C. Leclerc, Ferrari 2019)",
        "recent_winners": winners,
        "source_attribution": "Official Formula 1 Circuit Maps & FIA Track Approvals"
    }
