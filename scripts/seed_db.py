#!/usr/bin/env python3
"""
Seed script to build and populate ApexOps database schema and initial data.
Can be executed in CI and local setups.
"""
import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from data_engine.etl.seed_initial_data import run_seed

if __name__ == "__main__":
    print("Rebuilding and seeding ApexOps database...")
    run_seed()
    print("ApexOps database seeded successfully.")
