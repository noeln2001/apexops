from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.db.session import get_db
from backend.app.models.governance import NewsArticle
from data_engine.adapters.news_adapter import NewsAdapter

router = APIRouter()
news_adapter = NewsAdapter()

@router.get("/news")
def list_news(
    category: Optional[str] = Query(None, description="Filter by category (Technical, Regulations, Official, Race Preview)"),
    status: Optional[str] = Query(None, description="Filter by confirmation status"),
    search: Optional[str] = Query(None, description="Search term in headline or summary"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Returns curated Formula 1 news, technical developments, and FIA regulatory bulletins."""
    query = db.query(NewsArticle)
    
    if category:
        query = query.filter(NewsArticle.category == category)
    if status:
        query = query.filter(NewsArticle.confirmation_status == status)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(NewsArticle.headline).like(s)) |
            (func.lower(NewsArticle.summary).like(s)) |
            (func.lower(NewsArticle.entity_tags).like(s))
        )

    articles = query.order_by(NewsArticle.published_at.desc()).limit(limit).all()

    # If database empty, populate from news adapter
    if not articles:
        feed_items = news_adapter.fetch_feed_items()
        for item in feed_items:
            existing = db.query(NewsArticle).filter(NewsArticle.url == item["url"]).first()
            if not existing:
                pub_dt = datetime.now(timezone.utc)
                if item.get("published_at"):
                    try:
                        pub_dt = datetime.fromisoformat(item["published_at"].replace("Z", "+00:00"))
                    except Exception:
                        pub_dt = datetime.now(timezone.utc)

                article = NewsArticle(
                    headline=item["headline"],
                    publisher=item["publisher"],
                    url=item["url"],
                    published_at=pub_dt,
                    category=item.get("category", "Technical"),
                    confirmation_status=item.get("confirmation_status", "Officially Confirmed"),
                    reliability_score=item.get("reliability_score", 1.0),
                    summary=item.get("summary", ""),
                    entity_tags=item.get("entity_tags", "F1, FIA")
                )
                db.add(article)
        db.commit()
        articles = db.query(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(limit).all()

    return [
        {
            "id": a.id,
            "headline": a.headline,
            "publisher": a.publisher,
            "url": a.url,
            "published_at": a.published_at.isoformat() if a.published_at else None,
            "category": a.category,
            "confirmation_status": a.confirmation_status,
            "reliability_score": a.reliability_score,
            "summary": a.summary,
            "entity_tags": a.entity_tags
        } for a in articles
    ]

@router.post("/news/refresh")
def refresh_news(db: Session = Depends(get_db)):
    """Triggers an ingestion run to fetch latest RSS headlines."""
    items = news_adapter.fetch_feed_items()
    count = 0
    for item in items:
        if not db.query(NewsArticle).filter(NewsArticle.url == item["url"]).first():
            article = NewsArticle(
                headline=item["headline"],
                publisher=item["publisher"],
                url=item["url"],
                published_at=datetime.now(timezone.utc),
                category=item.get("category", "Technical"),
                confirmation_status=item.get("confirmation_status", "Officially Confirmed"),
                reliability_score=item.get("reliability_score", 1.0),
                summary=item.get("summary", ""),
                entity_tags=item.get("entity_tags", "F1")
            )
            db.add(article)
            count += 1
    db.commit()
    return {"status": "SUCCESS", "new_articles_added": count}
