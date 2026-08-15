import asyncio
import pyodbc
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.core.database import Base
from app.utils.seed import seed_data
import app.models  # load all models for metadata


def create_database_if_not_exists():
    """Create lms_db on MSSQL master if it does not already exist."""
    conn_str = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={settings.DB_SERVER},{settings.DB_PORT};"
        f"DATABASE=master;"
        f"UID={settings.DB_USER};"
        f"PWD={settings.DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )
    print(f"[INIT] Menghubungkan ke MSSQL Server {settings.DB_SERVER}:{settings.DB_PORT}...")
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sys.databases WHERE name = ?", (settings.DB_NAME,))
    exists = cursor.fetchone()

    if not exists:
        print(f"[INIT] Membuat database '{settings.DB_NAME}'...")
        cursor.execute(f"CREATE DATABASE [{settings.DB_NAME}]")
        print(f"[INIT] Database '{settings.DB_NAME}' berhasil dibuat!")
    else:
        print(f"[INIT] Database '{settings.DB_NAME}' sudah ada.")

    cursor.close()
    conn.close()


def migrate_schema_columns():
    """Migrate and add new required columns to tables safely."""
    conn_str = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={settings.DB_SERVER},{settings.DB_PORT};"
        f"DATABASE={settings.DB_NAME};"
        f"UID={settings.DB_USER};"
        f"PWD={settings.DB_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )
    print(f"[INIT] Memeriksa & migrasi kolom skema tabel users...")
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()

    migrations = [
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'personal_email') ALTER TABLE [users] ADD [personal_email] NVARCHAR(255) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'custom_lms_email') ALTER TABLE [users] ADD [custom_lms_email] NVARCHAR(255) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'is_approved') ALTER TABLE [users] ADD [is_approved] BIT NOT NULL DEFAULT 1;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'approval_status') ALTER TABLE [users] ADD [approval_status] NVARCHAR(20) NOT NULL DEFAULT 'approved';",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'registration_source') ALTER TABLE [users] ADD [registration_source] NVARCHAR(50) NOT NULL DEFAULT 'manual';",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'phone_number') ALTER TABLE [users] ADD [phone_number] NVARCHAR(50) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'institution') ALTER TABLE [users] ADD [institution] NVARCHAR(255) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'rejection_reason') ALTER TABLE [users] ADD [rejection_reason] NVARCHAR(500) NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'approved_at') ALTER TABLE [users] ADD [approved_at] DATETIME2 NULL;",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[users]') AND name = 'approved_by') ALTER TABLE [users] ADD [approved_by] INT NULL;",
    ]

    for sql in migrations:
        try:
            cursor.execute(sql)
        except Exception as e:
            print(f"[MIGRATE NOTICE] {e}")

    cursor.close()
    conn.close()
    print(f"[INIT] Migrasi kolom berhasil diperbarui!")


async def create_tables():
    """Create all SQLAlchemy tables in lms_db."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    print("[INIT] Membuat semua tabel skema database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("[INIT] Seluruh tabel berhasil dibuat!")


async def main():
    # 1. Create DB if not exist
    create_database_if_not_exists()
    # 2. Create tables
    await create_tables()
    # 3. Migrate columns
    migrate_schema_columns()
    # 4. Seed initial data
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
