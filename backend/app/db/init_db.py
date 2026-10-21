import logging
from pathlib import Path

from alembic.config import Config

from alembic import command
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash
from backend.app.db.session import SessionLocal
from backend.app.models.operations import User

logger = logging.getLogger("apexops.db")


def apply_migrations():
    """Applies Alembic migrations up to head, compatible with SQLite and Postgres."""
    root_dir = Path(__file__).resolve().parent.parent.parent.parent
    alembic_ini = root_dir / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("script_location", str(root_dir / "alembic"))
    command.upgrade(alembic_cfg, "head")


def init_database():
    """Initializes all database tables safely using Alembic migrations and seeds default admin user."""
    logger.info("Initializing ApexOps database schema via Alembic migrations...")
    apply_migrations()
    logger.info("ApexOps schema successfully migrated to head.")

    # Seed Admin User if not exists
    db = SessionLocal()
    try:
        admin_email = settings.ADMIN_EMAIL
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="ApexOps Platform Admin",
                role="admin",
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"Seeded admin user: {admin_email}")
        else:
            # Ensure admin role is set
            if existing.role != "admin" or not existing.is_admin:
                existing.role = "admin"
                existing.is_admin = True
                db.commit()
    except Exception as e:
        logger.warning(f"Could not seed admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database()
