from fastapi import APIRouter
from app.models.tariff_models import *
from app.services.tariff_calculator import TariffCalculator

router = APIRouter(prefix="/tariff", tags=["Tariff 1405"])

calc = TariffCalculator()


# ============================================================
# مسیرهای موجود نقشه‌برداری
# ============================================================

@router.post("/land_survey", response_model=TariffResponse)
def calculate_land_survey(data: AreaRequest):
    return calc.calculate_land_survey(data.area_m2)

@router.post("/utm", response_model=TariffResponse)
def calculate_utm(payload: AreaRequest):
    return calc.calculate_utm(payload.area_m2)

@router.post("/staking", response_model=TariffResponse)
def calculate_staking(payload: PointsRequest):
    return calc.calculate_staking(payload.num_points)

@router.post("/single_line_survey", response_model=TariffResponse)
def calculate_single_line_survey(payload: AreaRequest):
    return calc.calculate_single_line_survey(payload.area_m2)

@router.post("/building_utm_drawing", response_model=TariffResponse)
def calculate_building_utm_drawing(payload: AreaRequest):
    return calc.calculate_building_utm_drawing(payload.area_m2)

@router.post("/single_line_receivable", response_model=TariffResponse)
def calculate_single_line_receivable(payload: AreaRequest):
    return calc.calculate_single_line_receivable(payload.area_m2)

@router.post("/subdivision_with_history", response_model=TariffResponse)
def calculate_subdivision_with_history(payload: AreaRequest):
    return calc.calculate_subdivision_with_history(payload.area_m2)

@router.post("/subdivision_without_history", response_model=TariffResponse)
def calculate_subdivision_without_history(payload: AreaRequest):
    return calc.calculate_subdivision_without_history(payload.area_m2)

@router.post("/topography", response_model=TariffResponse)
def calculate_topography(payload: AreaRequest):
    return calc.calculate_topography(payload.area_m2)

@router.post("/urban_block_map", response_model=TariffResponse)
def calculate_urban_block_map(payload: AreaRequest):
    return calc.calculate_urban_block_map(payload.area_m2)

@router.post("/profile", response_model=TariffResponse)
def calculate_profile(payload: LengthRequest):
    return calc.calculate_profile(payload.length_km)

@router.post("/longitudinal_section", response_model=TariffResponse)
def calculate_longitudinal_section(payload: LengthRequest):
    return calc.calculate_longitudinal_section(payload.length_km)

@router.post("/special_zone_map", response_model=TariffResponse)
def calculate_special_zone_map(payload: AreaRequest):
    return calc.calculate_special_zone_map(payload.area_m2)

@router.post("/column_vertical_control", response_model=TariffResponse)
def calculate_column_vertical_control(payload: ColumnControlRequest):
    return calc.calculate_column_vertical_control(
        payload.height_m,
        payload.columns
    )


# ============================================================
# مسیرهای جدید برای خدمات مهندسی ساختمان
# ============================================================

@router.post("/engineering/design", response_model=TariffResponse)
def calculate_engineering_design(payload: EngineeringRequest):
    """محاسبه هزینه طراحی ساختمان"""
    return calc.calculate_design(payload.area_m2, payload.floors)


@router.post("/engineering/supervision", response_model=TariffResponse)
def calculate_engineering_supervision(payload: EngineeringRequest):
    """محاسبه هزینه نظارت ساختمان"""
    return calc.calculate_supervision(payload.area_m2, payload.floors)


@router.post("/engineering/surveying", response_model=TariffResponse)
def calculate_engineering_surveying(payload: EngineeringRequest):
    """محاسبه هزینه نقشه‌برداری ساختمان (در صورت نیاز)"""
    return calc.calculate_engineering_surveying(payload.area_m2, payload.floors)


@router.post("/engineering/all")
def calculate_all_engineering_fees(payload: EngineeringRequest):
    """محاسبه تمام هزینه‌های مهندسی (طراحی + نظارت + نقشه‌برداری)"""
    return calc.calculate_all_engineering_fees(
        payload.area_m2, 
        payload.floors, 
        payload.include_surveying
    )