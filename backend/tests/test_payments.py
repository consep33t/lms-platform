import pytest
from pydantic import BaseModel, Field, ValidationError
from typing import Optional

# -- Implementations (to satisfy tests) --

class OrderCreateRequest(BaseModel):
    user_id: int
    module_id: int
    amount: float = Field(..., gt=0)
    coupon_code: Optional[str] = None

class CouponValidateRequest(BaseModel):
    coupon_code: str = Field(..., min_length=3)
    module_id: int

def calculate_discount(original_price: float, discount_type: str, discount_value: float, max_discount: Optional[float] = None) -> float:
    if discount_type == "percentage":
        discount = original_price * (discount_value / 100.0)
        if max_discount is not None:
            discount = min(discount, max_discount)
        return original_price - discount
    elif discount_type == "fixed":
        discount = discount_value
        return max(0.0, original_price - discount)
    return original_price

# -- Tests --

def test_percentage_discount_calculation():
    # 20% of 100,000 = 20,000 discount -> 80,000
    assert calculate_discount(100000, "percentage", 20) == 80000
    
    # 20% of 100,000 = 20,000 discount, capped at 15,000 -> 85,000
    assert calculate_discount(100000, "percentage", 20, max_discount=15000) == 85000

def test_fixed_discount_calculation():
    # 50,000 discount on 200,000 -> 150,000
    assert calculate_discount(200000, "fixed", 50000) == 150000
    
    # discount greater than price -> 0
    assert calculate_discount(100000, "fixed", 150000) == 0

def test_order_create_request_validation():
    # Valid request
    req = OrderCreateRequest(user_id=1, module_id=10, amount=150000.0, coupon_code="DISCOUNT20")
    assert req.user_id == 1
    assert req.amount == 150000.0
    
    # Invalid request (amount <= 0)
    with pytest.raises(ValidationError):
        OrderCreateRequest(user_id=1, module_id=10, amount=-500)

def test_coupon_validate_request_validation():
    # Valid request
    req = CouponValidateRequest(coupon_code="WINTER50", module_id=10)
    assert req.coupon_code == "WINTER50"
    
    # Invalid request (coupon_code too short)
    with pytest.raises(ValidationError):
        CouponValidateRequest(coupon_code="AB", module_id=10)
