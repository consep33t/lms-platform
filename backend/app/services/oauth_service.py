import logging
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleOAuthService:
    @staticmethod
    async def verify_google_token(id_token: str) -> dict:
        """
        Verify Google ID token via Google TokenInfo API.
        Returns user payload: { sub, email, name, picture, email_verified }
        """
        token_info_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(token_info_url)
                if res.status_code != 200:
                    logger.warning(f"Google token verification failed: {res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token Google tidak valid atau telah kadaluarsa."
                    )
                data = res.json()
                # Optional client_id check if configured
                if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
                    logger.warning(f"Audience mismatch: {data.get('aud')} != {settings.GOOGLE_CLIENT_ID}")

                return {
                    "google_id": data.get("sub"),
                    "email": data.get("email"),
                    "full_name": data.get("name") or data.get("email", "").split("@")[0],
                    "avatar_url": data.get("picture"),
                    "email_verified": data.get("email_verified") in [True, "true"]
                }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error communicating with Google OAuth: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gagal menghubungi server autentikasi Google."
            )
