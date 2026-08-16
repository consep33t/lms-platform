import hmac
import hashlib
from fastapi import APIRouter, Depends, Request, HTTPException, status
from typing import Dict, Any, List
from app.schemas.payment import (
    OrderCreateRequest, OrderResponse, CouponValidateRequest, CouponResponse,
    PaymentWebhookPayload, InvoiceResponse
)
from app.services.payment_service import PaymentService
from app.core.dependencies import get_current_user_id
from app.core.config import settings

router = APIRouter()


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    request: OrderCreateRequest,
    user_id: int = Depends(get_current_user_id)
):
    return await PaymentService.create_order(user_id, request)


@router.post("/coupons/validate", response_model=CouponResponse)
async def validate_coupon(
    request: CouponValidateRequest,
    user_id: int = Depends(get_current_user_id)
):
    return await PaymentService.validate_coupon_discount(request.coupon_code, request.amount)


@router.post("/webhooks/midtrans")
async def handle_midtrans_webhook(request: Request):
    payload = await request.json()
    
    # Midtrans Signature Key verification
    order_id = payload.get("order_id", "")
    status_code = str(payload.get("status_code", ""))
    gross_amount = str(payload.get("gross_amount", ""))
    signature_key = payload.get("signature_key", "")
    
    if signature_key and hasattr(settings, "MIDTRANS_SERVER_KEY") and settings.MIDTRANS_SERVER_KEY:
        raw_str = f"{order_id}{status_code}{gross_amount}{settings.MIDTRANS_SERVER_KEY}"
        expected_sig = hashlib.sha512(raw_str.encode("utf-8")).hexdigest()
        if not hmac.compare_digest(expected_sig, signature_key):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature key")

    success = await PaymentService.handle_webhook("midtrans", payload)
    return {"success": success}


@router.post("/webhooks/stripe")
async def handle_stripe_webhook(request: Request):
    payload = await request.json()
    success = await PaymentService.handle_webhook("stripe", payload)
    return {"success": success}


@router.get("/orders/my", response_model=List[OrderResponse])
async def get_my_orders(user_id: int = Depends(get_current_user_id)):
    return []


@router.get("/orders/{id}/invoice", response_model=InvoiceResponse)
async def get_invoice(
    id: int,
    user_id: int = Depends(get_current_user_id)
):
    return await PaymentService.get_invoice(id, user_id)
