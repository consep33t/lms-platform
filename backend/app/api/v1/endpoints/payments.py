from fastapi import APIRouter, Depends, Request
from typing import Dict, Any, List
from app.schemas.payment import (
    OrderCreateRequest, OrderResponse, CouponValidateRequest, CouponResponse,
    PaymentWebhookPayload, InvoiceResponse
)
from app.services.payment_service import PaymentService

router = APIRouter()

async def get_current_user_id() -> int:
    return 1

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    request: OrderCreateRequest,
    user_id: int = Depends(get_current_user_id)
):
    return await PaymentService.create_order(user_id, request)

@router.post("/coupons/validate", response_model=CouponResponse)
async def validate_coupon(request: CouponValidateRequest):
    return await PaymentService.validate_coupon_discount(request.coupon_code, request.amount)

@router.post("/webhooks/midtrans")
async def handle_midtrans_webhook(request: Request):
    payload = await request.json()
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
