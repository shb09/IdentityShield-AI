import sqlite3
import json
from datetime import datetime
from pathlib import Path
from app.config import DATABASE_PATH


def get_db():
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'officer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS screenings (
            id TEXT PRIMARY KEY,
            officer_id INTEGER NOT NULL,
            document_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            risk_score INTEGER DEFAULT 0,
            risk_level TEXT DEFAULT 'LOW',
            ocr_confidence REAL DEFAULT 0.0,
            ocr_result TEXT DEFAULT '{}',
            validation_result TEXT DEFAULT '{}',
            tampering_result TEXT DEFAULT '{}',
            face_result TEXT DEFAULT '{}',
            risk_result TEXT DEFAULT '{}',
            explanation TEXT DEFAULT '[]',
            document_image TEXT,
            visa_image TEXT,
            face_image TEXT,
            demo_mode INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (officer_id) REFERENCES users(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            screening_id TEXT,
            officer_id INTEGER,
            action TEXT NOT NULL,
            details TEXT DEFAULT '{}',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Create default admin user if not exists
    from app.auth import hash_password
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
            ("admin", hash_password("admin123"), "System Administrator", "admin")
        )
        cursor.execute(
            "INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
            ("officer", hash_password("officer123"), "Border Officer", "officer")
        )
        conn.commit()
    except sqlite3.IntegrityError:
        pass

    conn.close()
