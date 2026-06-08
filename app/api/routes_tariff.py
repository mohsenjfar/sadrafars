from fastapi import APIRouter
from app.models.tariff_models import *
from app.services.tariff_calculator import TariffCalculator

router = APIRouter(prefix="/tariff", tags=["Tariff 1405"])

calc = TariffCalculator()


@router.post("/land_survey", response_model=TariffResponse)
def calculate_land_survey(data: AreaRequest):
    return calc.calculate_land_survey(data.area_m2)

@router.post("/utm", response_model=TariffResponse)
def calculate_utm(payload: AreaRequest):
    amount = calc.calculate_utm(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/staking", response_model=TariffResponse)
def calculate_staking(payload: PointsRequest):
    amount = calc.calculate_staking(payload.num_points)
    return TariffResponse(amount=amount)


@router.post("/single_line_survey", response_model=TariffResponse)
def calculate_single_line_survey(payload: AreaRequest):
    amount = calc.calculate_single_line_survey(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/building_utm_drawing", response_model=TariffResponse)
def calculate_building_utm_drawing(payload: AreaRequest):
    amount = calc.calculate_building_utm_drawing(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/single_line_receivable", response_model=TariffResponse)
def calculate_single_line_receivable(payload: AreaRequest):
    amount = calc.calculate_single_line_receivable(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/subdivision_with_history", response_model=TariffResponse)
def calculate_subdivision_with_history(payload: AreaRequest):
    amount = calc.calculate_subdivision_with_history(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/subdivision_without_history", response_model=TariffResponse)
def calculate_subdivision_without_history(payload: AreaRequest):
    amount = calc.calculate_subdivision_without_history(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/topography", response_model=TariffResponse)
def calculate_topography(payload: AreaRequest):
    amount = calc.calculate_topography(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/urban_block_map", response_model=TariffResponse)
def calculate_urban_block_map(payload: AreaRequest):
    amount = calc.calculate_urban_block_map(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/profile", response_model=TariffResponse)
def calculate_profile(payload: LengthRequest):
    amount = calc.calculate_profile(payload.length_km)
    return TariffResponse(amount=amount)


@router.post("/longitudinal_section", response_model=TariffResponse)
def calculate_longitudinal_section(payload: LengthRequest):
    amount = calc.calculate_longitudinal_section(payload.length_km)
    return TariffResponse(amount=amount)


@router.post("/special_zone_map", response_model=TariffResponse)
def calculate_special_zone_map(payload: AreaRequest):
    amount = calc.calculate_special_zone_map(payload.area_m2)
    return TariffResponse(amount=amount)


@router.post("/column_vertical_control", response_model=TariffResponse)
def calculate_column_vertical_control(payload: ColumnControlRequest):
    amount = calc.calculate_column_vertical_control(
        payload.height_m,
        payload.columns
    )
    return TariffResponse(amount=amount)
