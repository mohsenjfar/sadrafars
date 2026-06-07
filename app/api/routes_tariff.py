from fastapi import APIRouter
from app.models.tariff_models import *
from app.services.tariff_calculator import TariffCalculator

router = APIRouter(prefix="/tariff", tags=["Tariff 1405"])

calc = TariffCalculator()

print("Tariff routes loaded")

@router.post("/row/1-1", response_model=TariffResponse)
def calc_row_1_1(payload: Row11Request):
    amount = calc.row_1_1(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/row/2", response_model=TariffResponse)
def calc_row_2(payload: Row2Request):
    amount = calc.row_2(payload.num_points)
    return TariffResponse(amount=amount)


@router.post("/row/6", response_model=TariffResponse)
def calc_row_6(payload: Row6Request):
    amount = calc.row_6(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/row/7", response_model=TariffResponse)
def calc_row_7(payload: Row7Request):
    amount = calc.row_7(payload.length_km)
    return TariffResponse(amount=amount)


@router.post("/row/8", response_model=TariffResponse)
def calc_row_8(payload: Row8Request):
    amount = calc.row_8(payload.length_km)
    return TariffResponse(amount=amount)


@router.post("/row/10", response_model=TariffResponse)
def calc_row_10(payload: Row10Request):
    amount = calc.row_10(payload.height_m, payload.area_m2)
    return TariffResponse(amount=amount)
