# file_path: app/models/tariff_models.py

from pydantic import BaseModel, Field
from typing import Optional


class AreaRequest(BaseModel):
    area_m2: float = Field(..., gt=0)


class PointsRequest(BaseModel):
    num_points: int = Field(..., gt=0)


class LengthRequest(BaseModel):
    length_km: float = Field(..., gt=0)


class ColumnControlRequest(BaseModel):
    height_m: float = Field(..., gt=0)
    columns: int = Field(..., gt=0)


# مدل‌های جدید برای خدمات مهندسی ساختمان
class EngineeringRequest(BaseModel):
    area_m2: float = Field(..., gt=0, description="مساحت زیربنا به مترمربع")
    floors: int = Field(..., gt=0, description="تعداد طبقات")
    include_surveying: Optional[bool] = Field(False, description="آیا نقشه‌برداری محاسبه شود؟")


class TariffResponse(BaseModel):
    base_amount: float
    vat: float
    total_amount: float
    details: Optional[dict] = None  # برای نمایش جزئیات بیشتر

class DelayPenaltyRequest(BaseModel):
    area_m2: float = Field(..., gt=0)
    floors: int = Field(..., gt=0)
    license_date: str = Field(..., description="تاریخ صدور پروانه به شمسی (فرمت: YYYY/MM/DD)")

class StakingPlusUtmRequest(BaseModel):
    num_points: int = Field(..., gt=0, description="تعداد نقاط میخکوبی")
    area_m2: float = Field(..., gt=0, description="متراژ برای جانمایی")

class StakingPlusTopographyRequest(BaseModel):
    num_points: int = Field(..., gt=0, description="تعداد نقاط میخکوبی")
    area_m2: float = Field(..., gt=0, description="متراژ برای توپوگرافی")

class SingleLinePlusLandSurveyRequest(BaseModel):
    built_up_area: float = Field(..., gt=0, description="مساحت زیربنا به مترمربع")
    land_area: float = Field(..., gt=0, description="مساحت زمین به مترمربع")