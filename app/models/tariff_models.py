from pydantic import BaseModel, Field


class AreaRequest(BaseModel):
    area_m2: float = Field(..., gt=0)


class PointsRequest(BaseModel):
    num_points: int = Field(..., gt=0)


class LengthRequest(BaseModel):
    length_km: float = Field(..., gt=0)


class ColumnControlRequest(BaseModel):
    height_m: float = Field(..., gt=0)
    columns: int = Field(..., gt=0)


class TariffResponse(BaseModel):
    amount: float
    description: str = "Tariff 1405 calculation"
