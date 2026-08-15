import asyncio
import os
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserSettings
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentType
from app.models.question import Question, QuestionOption
from app.models.token import ModuleToken
from app.models.media import MediaFile, FileType, StorageDriver, MediaStatus, OwnerType
from app.core.config import settings

STORAGE_PATH = Path(settings.STORAGE_LOCAL_BASE_PATH if os.path.exists(settings.STORAGE_LOCAL_BASE_PATH) else "./uploads")

def create_sample_media_files():
    """Membuat file gambar, thumbnail, dan video demo nyata di storage lokal."""
    avatars_dir = STORAGE_PATH / "avatars"
    thumbs_dir = STORAGE_PATH / "thumbnails"
    images_dir = STORAGE_PATH / "images"
    videos_dir = STORAGE_PATH / "videos"
    docs_dir = STORAGE_PATH / "documents"

    for d in [avatars_dir, thumbs_dir, images_dir, videos_dir, docs_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # 1. Helper generator gambar
    def generate_image(filepath, text, bg_color=(41, 128, 185), size=(600, 400)):
        img = Image.new("RGB", size, color=bg_color)
        draw = ImageDraw.Draw(img)
        draw.rectangle([(10, 10), (size[0]-10, size[1]-10)], outline=(255, 255, 255), width=3)
        draw.text((size[0]//2, size[1]//2), text, fill=(255, 255, 255), anchor="mm")
        img.save(filepath, "PNG")

    # Generate Avatars
    generate_image(avatars_dir / "admin.png", "SUPERADMIN LMS", bg_color=(44, 62, 80), size=(200, 200))
    generate_image(avatars_dir / "budi.png", "BUDI SANTOSO", bg_color=(39, 174, 96), size=(200, 200))
    generate_image(avatars_dir / "siti.png", "SITI AMINAH", bg_color=(142, 68, 173), size=(200, 200))

    # Generate Thumbnails
    generate_image(thumbs_dir / "net_thumb.png", "MODUL 1: JARINGAN & SUBNETTING", bg_color=(31, 58, 147), size=(800, 450))
    generate_image(thumbs_dir / "mikrotik_thumb.png", "MODUL 2: MASTERING MIKROTIK", bg_color=(192, 57, 43), size=(800, 450))
    generate_image(thumbs_dir / "sec_thumb.png", "MODUL 3: ZERO TRUST SECURITY", bg_color=(22, 160, 133), size=(800, 450))

    # Generate Content Images
    generate_image(images_dir / "osi_layer_chart.png", "DIAGRAM 7 LAYER OSI & TCP/IP", bg_color=(52, 73, 94), size=(800, 500))
    generate_image(images_dir / "mikrotik_topo.png", "TOPOLOGI MIKROTIK ROUTEROS", bg_color=(189, 87, 73), size=(800, 500))
    generate_image(images_dir / "zerotrust_diag.png", "ARSITEKTUR ZERO TRUST & IAM", bg_color=(26, 188, 156), size=(800, 500))

    # Generate PDF Reference Documents
    with open(docs_dir / "cheat_sheet_subnetting.pdf", "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n")

    # Generate Lightweight MP4 Videos using ffmpeg if available or standard video stub
    for v_name in ["tcp_ip_tutorial.mp4", "mikrotik_firewall_demo.mp4", "zerotrust_vpn_guide.mp4"]:
        v_path = videos_dir / v_name
        try:
            cmd = [
                "ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=blue:s=640x360:d=10",
                "-vf", f"drawtext=text='LMS Video Tutorial - {v_name}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", str(v_path)
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
        except Exception:
            # Fallback binary stub
            with open(v_path, "wb") as f:
                f.write(b"\x00\x00\x00 ftypisom\x00\x00\x02\x00isomiso2avc1mp41\x00\x00\x00\x08free")

    print("[MEDIA] File media nyata (Avatar, Thumbnail, Diagram, Video, PDF) berhasil dibuat di disk.")


async def seed_comprehensive_database():
    create_sample_media_files()

    async with AsyncSessionLocal() as db:
        print("[SEED] Memulai proses seeding data lengkap LMS...")

        # -------------------------------------------------------------
        # 1. USERS & PROFILES
        # -------------------------------------------------------------
        # Superadmin
        admin = await db.scalar(select(User).where(User.email == "admin@lms.alfanet.id"))
        if not admin:
            admin = User(
                email="admin@lms.alfanet.id",
                full_name="Administrator LMS Alfanet",
                hashed_password=get_password_hash("AdminPass123!"),
                role=UserRole.superadmin,
                is_active=True
            )
            db.add(admin)
            await db.flush()
            db.add(UserSettings(user_id=admin.id, theme="system", language="id"))
        else:
            admin.full_name = "Administrator LMS Alfanet"
            admin.hashed_password = get_password_hash("AdminPass123!")

        # Peserta 1: Budi Santoso
        user_budi = await db.scalar(select(User).where(User.email == "budi.santoso@lms.alfanet.id"))
        if not user_budi:
            user_budi = User(
                email="budi.santoso@lms.alfanet.id",
                full_name="Budi Santoso (Network Engineer)",
                hashed_password=get_password_hash("PesertaBudi2026!"),
                role=UserRole.user,
                is_active=True
            )
            db.add(user_budi)
            await db.flush()
            db.add(UserSettings(user_id=user_budi.id, theme="dark", language="id"))
        else:
            user_budi.full_name = "Budi Santoso (Network Engineer)"
            user_budi.hashed_password = get_password_hash("PesertaBudi2026!")

        # Peserta 2: Siti Aminah
        user_siti = await db.scalar(select(User).where(User.email == "siti.aminah@lms.alfanet.id"))
        if not user_siti:
            user_siti = User(
                email="siti.aminah@lms.alfanet.id",
                full_name="Siti Aminah (Security Analyst)",
                hashed_password=get_password_hash("PesertaSiti2026!"),
                role=UserRole.user,
                is_active=True
            )
            db.add(user_siti)
            await db.flush()
            db.add(UserSettings(user_id=user_siti.id, theme="light", language="id"))
        else:
            user_siti.full_name = "Siti Aminah (Security Analyst)"
            user_siti.hashed_password = get_password_hash("PesertaSiti2026!")

        await db.flush()

        # -------------------------------------------------------------
        # 2. MEDIA FILES RECORDS
        # -------------------------------------------------------------
        async def get_or_create_media(storage_key, orig_name, file_type, mime, owner_type, duration=None):
            m = await db.scalar(select(MediaFile).where(MediaFile.storage_key == storage_key))
            if not m:
                m = MediaFile(
                    owner_type=owner_type,
                    file_type=file_type,
                    storage_driver=StorageDriver.local,
                    storage_key=storage_key,
                    original_name=orig_name,
                    mime_type=mime,
                    size_bytes=102400,
                    duration_seconds=duration,
                    status=MediaStatus.ready,
                    created_by=admin.id
                )
                db.add(m)
                await db.flush()
            return m

        media_thumb_net = await get_or_create_media("thumbnails/net_thumb.png", "net_thumb.png", FileType.image, "image/png", OwnerType.module_thumbnail)
        media_thumb_mik = await get_or_create_media("thumbnails/mikrotik_thumb.png", "mikrotik_thumb.png", FileType.image, "image/png", OwnerType.module_thumbnail)
        media_thumb_sec = await get_or_create_media("thumbnails/sec_thumb.png", "sec_thumb.png", FileType.image, "image/png", OwnerType.module_thumbnail)

        media_img_osi = await get_or_create_media("images/osi_layer_chart.png", "osi_layer_chart.png", FileType.image, "image/png", OwnerType.session_content)
        media_img_mik = await get_or_create_media("images/mikrotik_topo.png", "mikrotik_topo.png", FileType.image, "image/png", OwnerType.session_content)
        media_img_sec = await get_or_create_media("images/zerotrust_diag.png", "zerotrust_diag.png", FileType.image, "image/png", OwnerType.session_content)

        media_vid_tcp = await get_or_create_media("videos/tcp_ip_tutorial.mp4", "tcp_ip_tutorial.mp4", FileType.video, "video/mp4", OwnerType.session_content, duration=300.0)
        media_vid_mik = await get_or_create_media("videos/mikrotik_firewall_demo.mp4", "mikrotik_firewall_demo.mp4", FileType.video, "video/mp4", OwnerType.session_content, duration=450.0)
        media_vid_sec = await get_or_create_media("videos/zerotrust_vpn_guide.mp4", "zerotrust_vpn_guide.mp4", FileType.video, "video/mp4", OwnerType.session_content, duration=360.0)

        # -------------------------------------------------------------
        # 3. MODUL 1: Arsitektur Jaringan & Subnetting IPv4/IPv6
        # -------------------------------------------------------------
        mod1 = await db.scalar(select(Module).where(Module.title.like("%Subnetting%")))
        if not mod1:
            mod1 = Module(
                title="Arsitektur Jaringan Enterprise & Subnetting IPv4/IPv6",
                description="Pelajari arsitektur jaringan LAN/WAN enterprise, model OSI 7 layer, protokol TCP/IP, serta teknik praktis kalkulasi subnet mask CIDR dan VLSM.",
                status=ModuleStatus.published,
                passing_score=75.0,
                order=1,
                thumbnail_media_id=media_thumb_net.id,
                created_by=admin.id
            )
            db.add(mod1)
            await db.flush()

        # Token Modul 1
        t1 = await db.scalar(select(ModuleToken).where(ModuleToken.token_code == "NET-ADV-2026"))
        if not t1:
            db.add(ModuleToken(
                module_id=mod1.id,
                token_code="NET-ADV-2026",
                max_uses=100,
                expired_at=datetime.utcnow() + timedelta(days=90),
                is_active=True,
                created_by=admin.id
            ))

        # Sesi 1 Modul 1
        sess1_1 = await db.scalar(select(ModuleSession).where(ModuleSession.module_id == mod1.id, ModuleSession.order == 1))
        if not sess1_1:
            sess1_1 = ModuleSession(
                module_id=mod1.id,
                title="Sesi 1: Pemodelan OSI 7 Layer & Enkapsulasi Protokol TCP/IP",
                description="Membedah aliran data dari Application layer hingga Physical layer serta format frame Ethernet & paket IP.",
                order=1,
                duration_minutes=45
            )
            db.add(sess1_1)
            await db.flush()

            # Konten Teks & Video
            db.add(SessionContent(
                session_id=sess1_1.id,
                order=1,
                content_type=ContentType.text,
                text_body="### Konsep Dasar Pemodelan Jaringan\n\nDalam jaringan komputer enterprise, pemahaman mendalam tentang **Model OSI 7 Layer** dan **TCP/IP Protocol Suite** adalah fondasi utama. Setiap layer memiliki tanggung jawab independen (modularitas) yang memungkinkan interoperabilitas antar perangkat dari berbagai vendor."
            ))
            db.add(SessionContent(
                session_id=sess1_1.id,
                order=2,
                content_type=ContentType.image,
                media_file_id=media_img_osi.id
            ))
            db.add(SessionContent(
                session_id=sess1_1.id,
                order=3,
                content_type=ContentType.video,
                media_file_id=media_vid_tcp.id
            ))

        # Sesi 2 Modul 1 (Subnetting & Kuis)
        sess1_2 = await db.scalar(select(ModuleSession).where(ModuleSession.module_id == mod1.id, ModuleSession.order == 2))
        if not sess1_2:
            sess1_2 = ModuleSession(
                module_id=mod1.id,
                title="Sesi 2: Kalkulasi Subnetting CIDR, VLSM & Kuis Evaluasi",
                description="Perhitungan alokasi network prefix, subnet mask, jumlah host valid, dan broadcast address.",
                order=2,
                duration_minutes=60
            )
            db.add(sess1_2)
            await db.flush()

            db.add(SessionContent(
                session_id=sess1_2.id,
                order=1,
                content_type=ContentType.text,
                text_body="### Panduan Perhitungan Subnet Mask CIDR\n\nSubnetting adalah teknik membagi satu blok network besar menjadi beberapa sub-network yang lebih kecil dan efisien untuk mencegah pemborosan IP address.\n\n| Prefix | Subnet Mask | Jumlah Host Valid |\n|---|---|---|\n| /24 | 255.255.255.0 | 254 Host |\n| /26 | 255.255.255.192 | 62 Host |\n| /28 | 255.255.255.240 | 14 Host |\n| /30 | 255.255.255.252 | 2 Host (Point-to-Point) |"
            ))

            # Soal Kuis Sesi 2
            q1 = Question(
                session_id=sess1_2.id,
                question_text="Berapa jumlah IP address yang dapat digunakan oleh host pada subnet dengan prefix /27?",
                explanation="Subnet /27 memiliki 32 total IP (2^(32-27) = 32). Dikurangi 2 (Network & Broadcast), sehingga host valid adalah 30.",
                points=20,
                order=1
            )
            db.add(q1)
            await db.flush()
            db.add_all([
                QuestionOption(question_id=q1.id, option_text="30 Host", is_correct=True, order=1),
                QuestionOption(question_id=q1.id, option_text="32 Host", is_correct=False, order=2),
                QuestionOption(question_id=q1.id, option_text="62 Host", is_correct=False, order=3),
                QuestionOption(question_id=q1.id, option_text="14 Host", is_correct=False, order=4),
            ])

            q2 = Question(
                session_id=sess1_2.id,
                question_text="Jika IP 192.168.10.75 diberikan subnet mask 255.255.255.192 (/26), berapakah Network Address dari IP tersebut?",
                explanation="Blok subnet kelipatan 64: 0, 64, 128, 192. IP 75 berada pada rentang blok 64 hingga 127. Network address = 192.168.10.64.",
                points=20,
                order=2
            )
            db.add(q2)
            await db.flush()
            db.add_all([
                QuestionOption(question_id=q2.id, option_text="192.168.10.0", is_correct=False, order=1),
                QuestionOption(question_id=q2.id, option_text="192.168.10.64", is_correct=True, order=2),
                QuestionOption(question_id=q2.id, option_text="192.168.10.128", is_correct=False, order=3),
                QuestionOption(question_id=q2.id, option_text="192.168.10.75", is_correct=False, order=4),
            ])

        # -------------------------------------------------------------
        # 4. MODUL 2: Mastering MikroTik RouterOS
        # -------------------------------------------------------------
        mod2 = await db.scalar(select(Module).where(Module.title.like("%MikroTik%")))
        if not mod2:
            mod2 = Module(
                title="Mastering MikroTik RouterOS: Routing, Firewall & Bandwidth Management",
                description="Panduan konfigurasi MikroTik RouterOS mulai dari initial setup, IP addressing, DHCP Server, Firewall NAT & Mangle, hingga QoS Simple Queue PCQ.",
                status=ModuleStatus.published,
                passing_score=75.0,
                order=2,
                thumbnail_media_id=media_thumb_mik.id,
                created_by=admin.id
            )
            db.add(mod2)
            await db.flush()

        # Token Modul 2
        t2 = await db.scalar(select(ModuleToken).where(ModuleToken.token_code == "MIKROTIK-PRO-2026"))
        if not t2:
            db.add(ModuleToken(
                module_id=mod2.id,
                token_code="MIKROTIK-PRO-2026",
                max_uses=100,
                expired_at=datetime.utcnow() + timedelta(days=90),
                is_active=True,
                created_by=admin.id
            ))

        # Sesi 1 Modul 2
        sess2_1 = await db.scalar(select(ModuleSession).where(ModuleSession.module_id == mod2.id, ModuleSession.order == 1))
        if not sess2_1:
            sess2_1 = ModuleSession(
                module_id=mod2.id,
                title="Sesi 1: Konfigurasi Bridge, IP Pool & DHCP Server MikroTik",
                description="Setup gateway internet, DNS server, bridge LAN ports, dan DHCP Server otomatis.",
                order=1,
                duration_minutes=50
            )
            db.add(sess2_1)
            await db.flush()

            db.add(SessionContent(
                session_id=sess2_1.id,
                order=1,
                content_type=ContentType.text,
                text_body="### Initial Setup MikroTik RouterOS\n\nUntuk menghubungkan jaringan lokal (LAN) ke internet melalui MikroTik, langkah standar meliputi:\n1. Konfigurasi IP Address pada interface WAN (misal ether1-ISP).\n2. Pembuatan Interface Bridge (misal bridge-LAN) yang menggabungkan ether2 hingga ether5.\n3. Setting IP DNS dengan mengaktifkan `Allow Remote Requests`.\n4. Konfigurasi IP Route `dst-address=0.0.0.0/0 gateway=<IP_GATEWAY_ISP>`."
            ))
            db.add(SessionContent(
                session_id=sess2_1.id,
                order=2,
                content_type=ContentType.image,
                media_file_id=media_img_mik.id
            ))
            db.add(SessionContent(
                session_id=sess2_1.id,
                order=3,
                content_type=ContentType.video,
                media_file_id=media_vid_mik.id
            ))

        # Sesi 2 Modul 2 (Firewall NAT & Kuis)
        sess2_2 = await db.scalar(select(ModuleSession).where(ModuleSession.module_id == mod2.id, ModuleSession.order == 2))
        if not sess2_2:
            sess2_2 = ModuleSession(
                module_id=mod2.id,
                title="Sesi 2: Firewall Filter, NAT Masquerade & Kuis Evaluasi",
                description="Mekanisme keamanan firewall dan translasi alamat jaringan (Source NAT / Masquerade).",
                order=2,
                duration_minutes=50
            )
            db.add(sess2_2)
            await db.flush()

            db.add(SessionContent(
                session_id=sess2_2.id,
                order=1,
                content_type=ContentType.text,
                text_body="### Prinsip Kerja Firewall NAT Masquerade\n\nNAT (Network Address Translation) dengan action `masquerade` digunakan untuk mentranslasikan seluruh IP privat client LAN menjadi IP publik dinamis yang terpasang pada interface WAN saat berkomunikasi ke internet."
            ))

            q_mik1 = Question(
                session_id=sess2_2.id,
                question_text="Action NAT manakah yang digunakan pada MikroTik jika IP publik WAN diberikan secara dinamis oleh ISP (DHCP Client/PPPoE)?",
                explanation="Action 'masquerade' otomatis menyesuaikan source IP dengan IP yang terpasang di interface WAN dinamis.",
                points=20,
                order=1
            )
            db.add(q_mik1)
            await db.flush()
            db.add_all([
                QuestionOption(question_id=q_mik1.id, option_text="src-nat", is_correct=False, order=1),
                QuestionOption(question_id=q_mik1.id, option_text="masquerade", is_correct=True, order=2),
                QuestionOption(question_id=q_mik1.id, option_text="dst-nat", is_correct=False, order=3),
                QuestionOption(question_id=q_mik1.id, option_text="redirect", is_correct=False, order=4),
            ])

        # -------------------------------------------------------------
        # 5. MODUL 3: Zero Trust Security & Cloud Defense
        # -------------------------------------------------------------
        mod3 = await db.scalar(select(Module).where(Module.title.like("%Zero Trust%")))
        if not mod3:
            mod3 = Module(
                title="Keamanan Siber: Zero Trust Architecture & Pertahanan Jaringan",
                description="Strategi keamanan modern berbasis paradigma Zero Trust ('Never Trust, Always Verify'), integrasi Identity Access Management (IAM), MFA, dan Secure Tunneling.",
                status=ModuleStatus.published,
                passing_score=80.0,
                order=3,
                thumbnail_media_id=media_thumb_sec.id,
                created_by=admin.id
            )
            db.add(mod3)
            await db.flush()

        # Token Modul 3
        t3 = await db.scalar(select(ModuleToken).where(ModuleToken.token_code == "ZEROTRUST-SEC-2026"))
        if not t3:
            db.add(ModuleToken(
                module_id=mod3.id,
                token_code="ZEROTRUST-SEC-2026",
                max_uses=100,
                expired_at=datetime.utcnow() + timedelta(days=90),
                is_active=True,
                created_by=admin.id
            ))

        # Sesi 1 Modul 3
        sess3_1 = await db.scalar(select(ModuleSession).where(ModuleSession.module_id == mod3.id, ModuleSession.order == 1))
        if not sess3_1:
            sess3_1 = ModuleSession(
                module_id=mod3.id,
                title="Sesi 1: Pilar Zero Trust & Identity-Driven Access",
                description="Pergeseran dari perimeter-based defense menuju context-aware identity security.",
                order=1,
                duration_minutes=45
            )
            db.add(sess3_1)
            await db.flush()

            db.add(SessionContent(
                session_id=sess3_1.id,
                order=1,
                content_type=ContentType.text,
                text_body="### Mengapa Zero Trust Diperlukan?\n\nModel keamanan tradisional 'Kastil dan Parit' (Castle-and-Moat) mengasumsikan bahwa siapapun yang berada di dalam jaringan lokal dapat dipercaya. Zero Trust mematahkan asumsi ini dengan prinsip:\n1. **Verify Explicitly** � Selalu otentikasi dan otorisasi berdasarkan seluruh data poin yang ada.\n2. **Use Least Privilege Access** � Batasi akses user hanya sebatas resource yang diperlukan (JIT/JEA).\n3. **Assume Breach** � Minimalkan blast radius dengan segmentasi jaringan mikro dan enkripsi end-to-end."
            ))
            db.add(SessionContent(
                session_id=sess3_1.id,
                order=2,
                content_type=ContentType.image,
                media_file_id=media_img_sec.id
            ))
            db.add(SessionContent(
                session_id=sess3_1.id,
                order=3,
                content_type=ContentType.video,
                media_file_id=media_vid_sec.id
            ))

        # Sesi 2 Modul 3 (Kuis Zero Trust)
        sess3_2 = await db.scalar(select(ModuleSession).where(ModuleSession.module_id == mod3.id, ModuleSession.order == 2))
        if not sess3_2:
            sess3_2 = ModuleSession(
                module_id=mod3.id,
                title="Sesi 2: Evaluasi Pemahaman Zero Trust Security",
                description="Ujian komprehensif implementasi Zero Trust Network Access (ZTNA) dan mitigasi ancaman.",
                order=2,
                duration_minutes=40
            )
            db.add(sess3_2)
            await db.flush()

            q_sec1 = Question(
                session_id=sess3_2.id,
                question_text="Manakah dari pilihan berikut yang BUKAN merupakan pilar utama dari arsitektur Zero Trust NIST SP 800-207?",
                explanation="Zero Trust melarang kepercayaan implisit terhadap lokasi internal jaringan (tidak ada 'Implicit Internal Trust').",
                points=20,
                order=1
            )
            db.add(q_sec1)
            await db.flush()
            db.add_all([
                QuestionOption(question_id=q_sec1.id, option_text="Verify Explicitly", is_correct=False, order=1),
                QuestionOption(question_id=q_sec1.id, option_text="Least Privilege Access", is_correct=False, order=2),
                QuestionOption(question_id=q_sec1.id, option_text="Implicit Trust for Local LAN", is_correct=True, order=3),
                QuestionOption(question_id=q_sec1.id, option_text="Assume Breach", is_correct=False, order=4),
            ])

        await db.commit()
        print("======================================================")
        print("?? SEED DATA LENGKAP REALISTIS BERHASIL DIBUAT!")
        print("======================================================")
        print("?? AKUN PENGGUNA:")
        print("  1. Superadmin:  admin@lms.alfanet.id      / AdminPass123!")
        print("  2. Peserta 1:   budi.santoso@lms.alfanet.id / PesertaBudi2026!")
        print("  3. Peserta 2:   siti.aminah@lms.alfanet.id  / PesertaSiti2026!")
        print("------------------------------------------------------")
        print("?? MODUL & TOKEN PEMBELAJARAN:")
        print("  Modul 1: Arsitektur Jaringan Enterprise     -> Token: NET-ADV-2026")
        print("  Modul 2: Mastering MikroTik RouterOS       -> Token: MIKROTIK-PRO-2026")
        print("  Modul 3: Zero Trust Security & Defense     -> Token: ZEROTRUST-SEC-2026")
        print("======================================================")

if __name__ == "__main__":
    asyncio.run(seed_comprehensive_database())


seed_data = seed_comprehensive_database

