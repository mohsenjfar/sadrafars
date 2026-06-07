# app/services/tariff_calculator.py

from . import tariff_formulas as f


class TariffCalculator:
    """Calculator for Tariff 1405"""

    def row_1_1(self, area_m2: float) -> float:
        return f.row_1_1(area_m2)

    def row_2(self, num_points: int) -> float:
        return f.row_2(num_points)

    def row_6(self, area_m2: float) -> float:
        return f.row_6(area_m2)

    def row_7(self, length_km: float) -> float:
        return f.row_7(length_km)

    def row_8(self, length_km: float) -> float:
        return f.row_8(length_km)

    def row_10(self, height_m: float, area_m2: float = None) -> float:
        return f.row_10(height_m, area_m2)
