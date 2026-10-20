import io
import csv
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.f1_events import SessionResult, Race, DriverStanding
from backend.app.models.f1_core import Driver, Constructor

router = APIRouter()

@router.get("/exports/{dataset}")
def export_dataset(
    dataset: str,
    season: int = Query(2026),
    format: str = Query("csv", description="Format: csv or json"),
    db: Session = Depends(get_db)
):
    """Safely exports controlled data sets with pagination and attribution."""
    if dataset == "standings":
        records = db.query(DriverStanding).filter(DriverStanding.season_year == season).order_by(DriverStanding.position).all()
        rows = []
        for r in records:
            d = db.query(Driver).filter(Driver.driver_id == r.driver_id).first()
            c = db.query(Constructor).filter(Constructor.constructor_id == r.constructor_id).first() if r.constructor_id else None
            rows.append({
                "Position": r.position,
                "Driver": f"{d.first_name} {d.last_name}" if d else r.driver_id,
                "Code": d.code if d else "",
                "Team": c.name if c else "",
                "Points": r.points,
                "Wins": r.wins,
                "Season": r.season_year,
                "Attribution": "ApexOps / Jolpica F1"
            })
    elif dataset == "races":
        records = db.query(Race).filter(Race.season_year == season).order_by(Race.round).all()
        rows = []
        for r in records:
            rows.append({
                "Round": r.round,
                "RaceName": r.name,
                "Date": r.date,
                "TimeUTC": r.time_utc,
                "Status": r.status,
                "CircuitID": r.circuit_id,
                "Season": r.season_year,
                "Attribution": "ApexOps / Formula 1 Official Calendar"
            })
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported dataset '{dataset}'. Choose 'standings' or 'races'.")

    if format == "csv":
        output = io.StringIO()
        if rows:
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=apexops_{dataset}_{season}.csv"}
        )
    else:
        return {"dataset": dataset, "season": season, "record_count": len(rows), "data": rows}
