# file_path: app/services/tariff_calculator.py

from app.models.tariff_models import TariffResponse


class TariffCalculator:
    """محاسبه‌گر تعرفه‌های نقشه‌برداری و مهندسی ساختمان - سال ۱۴۰۵"""

    # ============================================================
    # بخش ۱: تعرفه‌های نقشه‌برداری (موجود)
    # ============================================================
    
    def calculate_land_survey(self, area_m2: float) -> TariffResponse:
        """مساحی عرصه"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 157000  # نرخ فرضی
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_utm(self, area_m2: float) -> TariffResponse:
        """جانمایی (UTM)"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 92000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_staking(self, num_points: int) -> TariffResponse:
        """میخکوبی"""
        min_points = 8
        if num_points < min_points:
            num_points = min_points
        
        base_amount = num_points * 250000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_single_line_survey(self, area_m2: float) -> TariffResponse:
        """نقشه تک خطی"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 125000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_building_utm_drawing(self, area_m2: float) -> TariffResponse:
        """نقشه UTM ساختمانی"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 110000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_single_line_receivable(self, area_m2: float) -> TariffResponse:
        """تک خطی قابل دریافت"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 135000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_subdivision_with_history(self, area_m2: float) -> TariffResponse:
        """تفکیکی دارای سابقه"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 131000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_subdivision_without_history(self, area_m2: float) -> TariffResponse:
        """تفکیکی فاقد سابقه"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 157000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_topography(self, area_m2: float) -> TariffResponse:
        """توپوگرافی"""
        min_area = 500
        if area_m2 < min_area:
            area_m2 = min_area
        
        base_amount = area_m2 * 189000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_urban_block_map(self, area_m2: float) -> TariffResponse:
        """نقشه بلوک شهری"""
        base_amount = area_m2 * 75000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_profile(self, length_km: float) -> TariffResponse:
        """پروفیل طولی"""
        base_amount = length_km * 12500000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_longitudinal_section(self, length_km: float) -> TariffResponse:
        """برش طولی"""
        base_amount = length_km * 18500000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_special_zone_map(self, area_m2: float) -> TariffResponse:
        """نقشه مناطق ویژه"""
        base_amount = area_m2 * 95000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    def calculate_column_vertical_control(self, height_m: float, columns: int) -> TariffResponse:
        """کنترل قائم ستون‌ها"""
        base_amount = height_m * columns * 35000
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat
        )
    
    # ============================================================
    # بخش ۲: تعرفه‌های خدمات مهندسی ساختمان (طراحی، نظارت، نقشه‌برداری)
    # ============================================================
    
    def _find_group_and_row(self, area: float, floors: int) -> tuple:
        """تعیین گروه ساختمانی و ردیف مساحت"""
        if area <= 600:
            area_row = "تا 600 مترمربع"
        elif area <= 2000:
            area_row = "تا 2000 مترمربع"
        elif area <= 5000:
            area_row = "تا 5000 مترمربع"
        else:
            area_row = "5000 مترمربع و بالاتر"
        
        if floors <= 2:
            group = "الف"
        elif floors <= 5:
            group = "ب"
        elif floors <= 7:
            group = "ج"
        else:
            group = "د"
        
        return group, area_row
    
    def _get_design_rate(self, group: str, area_row: str) -> int:
        """دریافت نرخ طراحی (ریال بر مترمربع)"""
        design_rates = {
            ("الف", "تا 600 مترمربع"): 2892000,
            ("الف", "تا 2000 مترمربع"): 3680000,
            ("الف", "تا 5000 مترمربع"): 4154000,
            ("الف", "5000 مترمربع و بالاتر"): 4732000,
            ("ب", "تا 600 مترمربع"): 3680000,
            ("ب", "تا 2000 مترمربع"): 4154000,
            ("ب", "تا 5000 مترمربع"): 4732000,
            ("ب", "5000 مترمربع و بالاتر"): 5783000,
            ("ج", "تا 600 مترمربع"): 4154000,
            ("ج", "تا 2000 مترمربع"): 4732000,
            ("ج", "تا 5000 مترمربع"): 5783000,
            ("ج", "5000 مترمربع و بالاتر"): 6835000,
            ("د", "تا 600 مترمربع"): 4732000,
            ("د", "تا 2000 مترمربع"): 5783000,
            ("د", "تا 5000 مترمربع"): 6835000,
            ("د", "5000 مترمربع و بالاتر"): 6835000,
        }
        return design_rates.get((group, area_row), 0)
    
    def _get_supervision_rate(self, group: str, area_row: str) -> int:
        """دریافت نرخ نظارت (ریال بر مترمربع)"""
        supervision_rates = {
            ("الف", "تا 600 مترمربع"): 3534000,
            ("الف", "تا 2000 مترمربع"): 4498000,
            ("الف", "تا 5000 مترمربع"): 5077000,
            ("الف", "5000 مترمربع و بالاتر"): 5783000,
            ("ب", "تا 600 مترمربع"): 4498000,
            ("ب", "تا 2000 مترمربع"): 5077000,
            ("ب", "تا 5000 مترمربع"): 5783000,
            ("ب", "5000 مترمربع و بالاتر"): 7069000,
            ("ج", "تا 600 مترمربع"): 5077000,
            ("ج", "تا 2000 مترمربع"): 5783000,
            ("ج", "تا 5000 مترمربع"): 7069000,
            ("ج", "5000 مترمربع و بالاتر"): 8354000,
            ("د", "تا 600 مترمربع"): 5783000,
            ("د", "تا 2000 مترمربع"): 7069000,
            ("د", "تا 5000 مترمربع"): 8354000,
            ("د", "5000 مترمربع و بالاتر"): 8354000,
        }
        return supervision_rates.get((group, area_row), 0)
    
    def _need_surveying(self, area: float, floors: int) -> bool:
        """آیا نیاز به نقشه‌برداری است؟"""
        group, _ = self._find_group_and_row(area, floors)
        return area > 600 and group in ["ب", "ج", "د"]
    
    def _get_surveying_rate(self, group: str, area_row: str) -> int:
        """دریافت نرخ نقشه‌برداری (ریال بر مترمربع)"""
        surveying_rates = {
            ("ب", "تا 600 مترمربع"): 0,
            ("ب", "تا 2000 مترمربع"): 628000,
            ("ب", "تا 5000 مترمربع"): 642000,
            ("ب", "5000 مترمربع و بالاتر"): 681000,
            ("ج", "تا 600 مترمربع"): 0,
            ("ج", "تا 2000 مترمربع"): 642000,
            ("ج", "تا 5000 مترمربع"): 681000,
            ("ج", "5000 مترمربع و بالاتر"): 696000,
            ("د", "تا 600 مترمربع"): 0,
            ("د", "تا 2000 مترمربع"): 681000,
            ("د", "تا 5000 مترمربع"): 696000,
            ("د", "5000 مترمربع و بالاتر"): 773000,
        }
        return surveying_rates.get((group, area_row), 0)
    
    def calculate_design(self, area_m2: float, floors: int) -> TariffResponse:
        """محاسبه هزینه طراحی ساختمان"""
        group, area_row = self._find_group_and_row(area_m2, floors)
        rate = self._get_design_rate(group, area_row)
        
        base_amount = rate * area_m2
        
        # جزئیات بیشتر برای نمایش
        design_details = {
            "گروه ساختمانی": group,
            "ردیف مساحت": area_row,
            "نرخ هر مترمربع": rate,
            "مساحت": area_m2,
            "هزینه طراحی": base_amount
        }
        
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat,
            details=design_details
        )
    
    def calculate_supervision(self, area_m2: float, floors: int) -> TariffResponse:
        """محاسبه هزینه نظارت ساختمان"""
        group, area_row = self._find_group_and_row(area_m2, floors)
        rate = self._get_supervision_rate(group, area_row)
        
        base_amount = rate * area_m2
        
        supervision_details = {
            "گروه ساختمانی": group,
            "ردیف مساحت": area_row,
            "نرخ هر مترمربع": rate,
            "مساحت": area_m2,
            "هزینه نظارت": base_amount
        }
        
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat,
            details=supervision_details
        )
    
    def calculate_engineering_surveying(self, area_m2: float, floors: int) -> TariffResponse:
        """محاسبه هزینه نقشه‌برداری ساختمان (در صورت نیاز)"""
        group, area_row = self._find_group_and_row(area_m2, floors)
        
        if not self._need_surveying(area_m2, floors):
            return TariffResponse(
                base_amount=0,
                vat=0,
                total_amount=0,
                details={"message": "نیازی به نقشه‌برداری مستقل نیست", "required": False}
            )
        
        rate = self._get_surveying_rate(group, area_row)
        base_amount = rate * area_m2
        
        surveying_details = {
            "گروه ساختمانی": group,
            "ردیف مساحت": area_row,
            "نرخ هر مترمربع": rate,
            "مساحت": area_m2,
            "هزینه نقشه‌برداری": base_amount,
            "required": True,
            "message": "نیاز به نقشه‌برداری دارید"
        }
        
        vat = base_amount * 0.10
        return TariffResponse(
            base_amount=base_amount,
            vat=vat,
            total_amount=base_amount + vat,
            details=surveying_details
        )
    
    def calculate_all_engineering_fees(self, area_m2: float, floors: int, include_surveying: bool = False) -> dict:
        """محاسبه تمام هزینه‌های مهندسی (طراحی + نظارت + نقشه‌برداری)"""
        design = self.calculate_design(area_m2, floors)
        supervision = self.calculate_supervision(area_m2, floors)
        
        result = {
            "design": design.dict(),
            "supervision": supervision.dict(),
            "total": design.total_amount + supervision.total_amount
        }
        
        if include_surveying:
            surveying = self.calculate_engineering_surveying(area_m2, floors)
            result["surveying"] = surveying.dict()
            result["total"] += surveying.total_amount
        
        return result