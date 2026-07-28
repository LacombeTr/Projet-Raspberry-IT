from fastapi import APIRouter

from schemas import LedRequest
from sensors.led import status_led

router = APIRouter()


@router.post("/")
async def set_led(body: LedRequest):
    status_led.set_color(body.severity)
    return {"severity": body.severity}
