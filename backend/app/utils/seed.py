import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserSettings
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentType
from app.models.question import Question, QuestionOption
from app.models.token import ModuleToken
from app.core.security import get_password_hash


async def seed_data():
    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        stmt = select(User).where(User.email == "admin@lms.alfanet.id")
        res = await db.execute(stmt)
        existing_admin = res.scalar_one_or_none()

        if existing_admin:
            print("[SEED] Data awal sudah ada di database, melewati proses seeding.")
            return

        print("[SEED] Inisialisasi data awal LMS...")

        # 1. Admin User
        admin = User(
            email="admin@lms.alfanet.id",
            full_name="Administrator LMS",
            hashed_password=get_password_hash("AdminPass123!"),
            role=UserRole.superadmin,
            is_active=True,
        )
        db.add(admin)
        await db.flush()

        admin_settings = UserSettings(user_id=admin.id)
        db.add(admin_settings)

        # 2. Sample User Peserta
        user = User(
            email="peserta@lms.alfanet.id",
            full_name="Peserta Uji Coba",
            hashed_password=get_password_hash("PesertaPass123!"),
            role=UserRole.user,
            is_active=True,
        )
        db.add(user)
        await db.flush()

        user_settings = UserSettings(user_id=user.id)
        db.add(user_settings)

        # 3. Sample Module
        module = Module(
            title="Pengenalan Jaringan Komputer & Subnetting",
            description="Pelajari dasar-dasar arsitektur jaringan, layer OSI, TCP/IP, serta teknik perhitungan subnet mask IPv4.",
            status=ModuleStatus.published,
            passing_score=70.0,
            order=1,
            created_by=admin.id,
        )
        db.add(module)
        await db.flush()

        # 4. Sample Session
        session = ModuleSession(
            module_id=module.id,
            title="Sesi 1: Dasar Protokol TCP/IP & OSI Model",
            description="Pemahaman 7 layer OSI dan perbandingannya dengan 4 layer TCP/IP.",
            order=1,
            duration_minutes=45,
        )
        db.add(session)
        await db.flush()

        # 5. Sample Content Block
        content = SessionContent(
            session_id=session.id,
            order=1,
            content_type=ContentType.text,
            text_body="Protokol TCP/IP adalah standar komunikasi data internet. Setiap layer bertanggung jawab memproses paket data dari Application layer hingga Network Interface.",
        )
        db.add(content)

        # 6. Sample Question & Options
        question = Question(
            session_id=session.id,
            question_text="Lapisan OSI manakah yang bertanggung jawab untuk routing paket data antar jaringan?",
            explanation="Network Layer (Layer 3) bertanggung jawab untuk logical addressing (IP) dan routing paket data.",
            points=1,
            order=1,
        )
        db.add(question)
        await db.flush()

        options = [
            QuestionOption(question_id=question.id, option_text="Physical Layer", is_correct=False, order=1),
            QuestionOption(question_id=question.id, option_text="Data Link Layer", is_correct=False, order=2),
            QuestionOption(question_id=question.id, option_text="Network Layer", is_correct=True, order=3),
            QuestionOption(question_id=question.id, option_text="Transport Layer", is_correct=False, order=4),
        ]
        db.add_all(options)

        # 7. Sample Module Token
        token = ModuleToken(
            module_id=module.id,
            token_code="NET2026X",
            max_uses=100,
            current_uses=0,
            expired_at=datetime.utcnow() + timedelta(days=90),
            is_active=True,
            created_by=admin.id,
        )
        db.add(token)

        await db.commit()
        print("[SEED] Data awal berhasil dibuat!")
        print("  Superadmin: admin@lms.alfanet.id / AdminPass123!")
        print("  Peserta:    peserta@lms.alfanet.id / PesertaPass123!")
        print("  Token Modul: NET2026X")


if __name__ == "__main__":
    asyncio.run(seed_data())
