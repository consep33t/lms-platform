from typing import Dict, Any, List
from app.schemas.payment import (
    OrderCreateRequest, OrderResponse, CouponResponse, InvoiceResponse
)
from datetime import datetime

class PaymentService:
    @staticmethod
    async def create_order(user_id: int, request: OrderCreateRequest) -> OrderResponse:
        return OrderResponse(
            id=1,
            user_id=user_id,
            course_id=request.course_id,
            amount=request.amount,
            status="pending",
            created_at=datetime.utcnow(),
            payment_url="https://payment.gateway.com/pay/123"
        )

    @staticmethod
    async def validate_coupon_discount(coupon_code: str, amount: float) -> CouponResponse:
        discount = amount * 0.1 if coupon_code == "DISCOUNT10" else 0.0
        return CouponResponse(
            valid=discount > 0,
            discount_amount=discount,
            final_amount=amount - discount
        )

    @staticmethod
    async def handle_webhook(gateway: str, payload: Dict[str, Any]) -> bool:
        return True

    @staticmethod
    async def get_invoice(order_id: int, user_id: int) -> InvoiceResponse:
        return InvoiceResponse(
            order_id=order_id,
            invoice_number=f"INV-{order_id}",
            user_name="Student Name",
            amount=100.0,
            date=datetime.utcnow(),
            status="paid"
        )
