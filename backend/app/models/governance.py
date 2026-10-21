from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text

from backend.app.db.session import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"
    id = Column(Integer, primary_key=True, autoincrement=True)
    headline = Column(String(255), nullable=False)
    publisher = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False, unique=True)
    published_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    category = Column(String(50), default="Technical") # Technical, Driver Transfers, Regulations, Race Reports
    confirmation_status = Column(String(50), default="Officially Confirmed") # Officially Confirmed, Reported by Named Source, Paddock Rumour
    reliability_score = Column(Float, default=1.0) # 0.0 to 1.0
    summary = Column(Text, nullable=False)
    entity_tags = Column(String(255), nullable=True) # e.g. "Ferrari, Hamilton, Austin"

class Regulation(Base):
    __tablename__ = "regulations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    year = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False) # Technical, Sporting, Financial
    summary = Column(Text, nullable=False)
    effective_date = Column(String(20), nullable=True)
    pdf_url = Column(String(500), nullable=True)

class Penalty(Base):
    __tablename__ = "penalties"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False)
    driver_id = Column(String(50), ForeignKey("drivers.driver_id"), nullable=False)
    incident_type = Column(String(100), nullable=False)
    penalty_awarded = Column(String(100), nullable=False) # e.g. "5s Time Penalty", "3-Place Grid Drop"
    stewards_document_id = Column(String(50), nullable=True)

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String(50), ForeignKey("races.race_id"), nullable=False)
    model_name = Column(String(100), default="ApexOps Monte Carlo v1.2")
    projected_winner_driver_id = Column(String(50), nullable=False)
    projected_pole_driver_id = Column(String(50), nullable=False)
    projected_winner_prob = Column(Float, default=0.0)
    features_used = Column(String(255), default="Historical Pace, Qualifying Delta, Circuit Degradation")
    simulated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
