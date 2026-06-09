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