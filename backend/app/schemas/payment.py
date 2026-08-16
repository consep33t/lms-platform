from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class OrderCreateRequest(BaseModel):
    course_id: int
    amount: float
    coupon_code: Optional[str] = None
    payment_method: str

class OrderResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    amount: float
    status: str
    created_at: datetime
    payment_url: Optional[str] = None

class CouponValidateRequest(BaseModel):
    coupon_code: str
    amount: float

class CouponResponse(BaseModel):
    valid: bool
    discount_amount: float
    final_amount: float

class PaymentWebhookPayload(BaseModel):
    payload: Dict[str, Any]

class InvoiceResponse(BaseModel):
    order_id: int
    invoice_number: str
    user_name: str
    amount: float
    date: datetime
    status: str
