from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, User
from app.auth import get_current_user, require_admin
from app.schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderOut)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    order = Order(
        company_id=current_user.company_id,
        order_number=payload.order_number,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        status=payload.status,
        items=payload.items,
        total_amount=payload.total_amount,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Order)
        .filter(Order.company_id == current_user.company_id)
        .all()
    )


@router.get("/lookup/{order_number}", response_model=OrderOut)
def lookup_order(
    order_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .filter(
            Order.company_id == current_user.company_id,
            Order.order_number == order_number,
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order