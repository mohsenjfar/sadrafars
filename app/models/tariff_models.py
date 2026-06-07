from pydantic import BaseModel, Field


class Row11Request(BaseModel):
    area_m2: float = Field(..., gt=0)


class Row2Request(BaseModel):
    num_points: int = Field(..., gt=0)


class Row6Request(BaseModel):
    area_m2: float = Field(..., gt=0)


class Row7Request(BaseModel):
    length_km: float = Field(..., gt=0)


class Row8Request(BaseModel):
    length_km: float = Field(..., gt=0)


class Row10Request(BaseModel):
    height_m: float = Field(..., gt=0)
    area_m2: float | None = None


class TariffResponse(BaseModel):
    amount: float
    description: str = "Tariff 1405 calculation"
