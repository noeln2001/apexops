import logging

from backend.app.db.session import Base, engine

logger = logging.getLogger("apexops.db")

def init_database():
    """Initializes all database tables safely using SQLAlchemy metadata."""
    logger.info("Initializing ApexOps database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("ApexOps schema successfully verified and created.")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database()
