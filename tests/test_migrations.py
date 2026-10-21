from pathlib import Path

from alembic.config import Config
from sqlalchemy import create_engine, text

from alembic import command
from backend.app.db.init_db import apply_migrations


def test_alembic_migrations_run_successfully():
    """Verify applying migrations brings schema to head."""
    apply_migrations()


def test_alembic_migrations_on_isolated_sqlite_db(tmp_path):
    """Verify Alembic migrations create all tables from scratch on a clean SQLite database."""
    test_db_path = tmp_path / "test_migration.db"
    test_url = f"sqlite:///{test_db_path}"

    root_dir = Path(__file__).resolve().parent.parent
    alembic_ini = root_dir / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("script_location", str(root_dir / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", test_url)

    # Run upgrade to head
    command.upgrade(alembic_cfg, "head")

    # Connect to verify tables and alembic_version table
    engine = create_engine(test_url)
    with engine.connect() as conn:
        rev = conn.execute(text("SELECT version_num FROM alembic_version;")).scalar()
        assert rev == "001_initial_schema"

        # Verify key tables exist
        tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
        table_names = [t[0] for t in tables]
        assert "users" in table_names
        assert "drivers" in table_names
        assert "races" in table_names
        assert "monte_carlo_snapshots" in table_names
        assert "ingestion_runs" in table_names
