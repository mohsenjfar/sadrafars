# file_path: app/services/tariff_calculator.py

from app.models.tariff_models import TariffResponse


class TariffCalculator:
    """محاسبه‌گر تعرفه‌های نقشه‌برداری و مهندسی ساختمان - سال ۱۴۰۵"""

    # ============================================================
    # بخش ۱: تعرفه‌های نقشه‌برداری (بر اساس surv.md) - با مالیات ۱۰%
    # ============================================================

    def _add_vat(self, base_amount: float) -> tuple:
        """محاسبه مالیات ۱۰% برای نقشه‌برداری"""
        vat = int(base_amount * 0.10)
        return vat, base_amount + vat

    def calculate_land_survey(self, area_m2: float) -> TariffResponse:
        """مساحی و برداشت مسطحاتی (ردیف 1-1) - پلکانی"""
        area_m2 = max(area_m2, 500)

        if area_m2 <= 500:
            base = 55_031_259
        elif area_m2 <= 1000:
            base = 55_031_259 + (area_m2 - 500) * 38_378
        elif area_m2 <= 2000:
            base = 55_031_259 + (500 * 38_378) + (area_m2 - 1000) * 23_901
        elif area_m2 <= 5000:
            base = 55_031_259 + (500 * 38_378) + (1000 * 23_901) + (area_m2 - 2000) * 14_120
        elif area_m2 <= 50000:
            base = 55_031_259 + (500 * 38_378) + (1000 * 23_901) + (3000 * 14_120) + (area_m2 - 5000) * 7_628
        else:
            base = 55_031_259 + (500 * 38_378) + (1000 * 23_901) + (3000 * 14_120) + (45000 * 7_628)

        base = int(base)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"مساحت محاسبه شده": area_m2, "نوع محاسبه": "پلکانی"}
        )

    def calculate_utm(self, area_m2: float) -> TariffResponse:
        """جانمایی (UTM) - ردیف‌های 2-1، 3-1، 4-1 - مقطوع تجمعی"""
        area_m2 = max(area_m2, 500)

        if area_m2 <= 1000:
            base = 44_896_792
        elif area_m2 <= 5000:
            base = 44_896_792 + 53_876_150  # 98,772,942
        elif area_m2 <= 10000:
            base = 44_896_792 + 53_876_150 + 62_855_510  # 161,628,452
        else:
            return self.calculate_land_survey(area_m2)

        base = int(base)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"مساحت": area_m2, "نوع محاسبه": "مقطوع تجمعی"}
        )

    def calculate_staking(self, num_points: int) -> TariffResponse:
        """میخکوبی (ردیف 2) - پلکانی تجمعی"""
        num_points = max(num_points, 8)

        if num_points <= 8:
            base = 60_642_992
        elif num_points <= 50:
            # مبلغ 8 نقطه اول + مابه‌التفاوت نقاط 9 تا 50
            extra_points = num_points - 8
            base = 60_642_992 + int(extra_points * 0.8 * 7_580_374)
        elif num_points <= 100:
            # مبلغ 50 نقطه اول + مابه‌التفاوت نقاط 51 تا 100
            extra_points = num_points - 50
            base = 60_642_992 + int(42 * 0.8 * 7_580_374) + int(extra_points * 0.5 * 7_580_374)
        else:  # 101 تا 500
            # مبلغ 100 نقطه اول + مابه‌التفاوت نقاط 101 تا 500
            extra_points = num_points - 100
            base = 60_642_992 + int(42 * 0.8 * 7_580_374) + int(50 * 0.5 * 7_580_374) + int(extra_points * 0.4 * 7_580_374)

        base = int(base)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"تعداد نقاط": num_points, "نوع محاسبه": "پلکانی تجمعی"}
        )

    def calculate_single_line_receivable(self, area_m2: float) -> TariffResponse:
        """تک خطی قابل دریافت = ردیف 3-1 + 3-2"""
        area_m2 = max(area_m2, 500)
        rate = 125_713 + 98_774  # 224,487 ریال بر مترمربع
        base = int(area_m2 * rate)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"متراژ": area_m2, "نرخ هر متر": rate}
        )

    def calculate_subdivision_with_history(self, area_m2: float) -> TariffResponse:
        """تفکیکی دارای سابقه = ردیف 3-4"""
        area_m2 = max(area_m2, 500)
        rate = 53_871
        base = int(area_m2 * rate)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"متراژ": area_m2, "نرخ هر متر": rate}
        )

    def calculate_subdivision_without_history(self, area_m2: float) -> TariffResponse:
        """تفکیکی فاقد سابقه = ردیف 3-1 + 3-4"""
        area_m2 = max(area_m2, 500)
        rate = 125_713 + 53_871  # 179,584 ریال بر مترمربع
        base = int(area_m2 * rate)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"متراژ": area_m2, "نرخ هر متر": rate}
        )

    def calculate_topography(self, area_m2: float) -> TariffResponse:
        """توپوگرافی (ردیف 5) - پلکانی تجمعی"""
        area_m2 = max(area_m2, 500)

        if area_m2 <= 500:
            base = 68_243_120
        elif area_m2 <= 5000:
            # مبلغ 500 متر اول + مابه‌التفاوت 501 تا 5000
            extra = area_m2 - 500
            base = 68_243_120 + int(extra * 26_933)
        elif area_m2 <= 10000:
            # مبلغ 5000 متر اول + مابه‌التفاوت 5001 تا 10000
            extra = area_m2 - 5000
            base = 68_243_120 + int(4500 * 26_933) + int(extra * 19_747)
        else:
            # مبلغ 10000 متر اول + مابه‌التفاوت بیشتر از 10000
            extra = area_m2 - 10000
            base = 68_243_120 + int(4500 * 26_933) + int(5000 * 19_747) + int(extra * 13_467)

        base = int(base)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"مساحت": area_m2, "نوع محاسبه": "پلکانی تجمعی"}
        )

    def calculate_urban_block_map(self, area_m2: float) -> TariffResponse:
        """نقشه مسطحاتی املاک شهری (ردیف 6) - پلکانی تجمعی"""
        area_m2 = max(area_m2, 1)

        if area_m2 <= 200:
            base = 68_909_749
        else:
            # مبلغ 200 متر اول + مابه‌التفاوت مازاد
            extra = area_m2 - 200
            base = 68_909_749 + int(extra * 17_958)

        base = int(base)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"مساحت": area_m2, "نوع محاسبه": "پلکانی تجمعی"}
        )

    def calculate_profile(self, length_km: float) -> TariffResponse:
        """پروفیل طولی و عرضی (ردیف 7)"""
        length_km = max(length_km, 1.0)
        base = int(length_km * 62_855_510)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"طول (کیلومتر)": length_km}
        )

    def calculate_longitudinal_section(self, length_km: float) -> TariffResponse:
        """مقاطع طولی (ردیف 8)"""
        length_km = max(length_km, 1.0)
        base = int(length_km * 53_876_150)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"طول (کیلومتر)": length_km}
        )

    def calculate_special_zone_map(self, area_m2: float) -> TariffResponse:
        """وضع موجود مناطق خاص (ردیف 9)"""
        area_m2 = max(area_m2, 1)
        base = int(area_m2 * 39_510)
        base = max(base, 80_814_223)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"مساحت": area_m2, "حداقل اعمال شده": base == 80_814_223}
        )

    def calculate_column_vertical_control(self, height_m: float, columns: int) -> TariffResponse:
        """کنترل قائم ستون‌ها (ردیف 10)"""
        columns = max(columns, 4)
        if height_m <= 15:
            base = columns * 6_285_555
        else:
            base = columns * 6_285_555 + (height_m - 15) * columns * 269_380

        base = int(base)
        vat, total = self._add_vat(base)
        return TariffResponse(
            base_amount=base,
            vat=vat,
            total_amount=total,
            details={"تعداد ستون": columns, "ارتفاع (متر)": height_m}
        )

    # ============================================================
    # بخش ۲: تعرفه‌های خدمات مهندسی ساختمان (بدون مالیات)
    # ============================================================

    def _find_group_and_row(self, area: float, floors: int) -> tuple:
        """تعیین گروه ساختمانی و ردیف مساحت"""
        if floors <= 2:
            group = "الف"
        elif floors <= 5:
            group = "ب"
        elif floors <= 7:
            group = "ج"
        else:
            group = "د"

        if area <= 600:
            area_row = "تا 600 مترمربع"
        elif area <= 2000:
            area_row = "تا 2000 مترمربع"
        elif area <= 5000:
            area_row = "تا 5000 مترمربع"
        else:
            area_row = "5000 مترمربع و بالاتر"

        return group, area_row

    def _get_design_rate(self, group: str, area_row: str) -> int:
        """دریافت نرخ طراحی (مبلغ کل پروژه به ریال)"""
        design_rates = {
            ("الف", "تا 600 مترمربع"): 2_892_000,
            ("الف", "تا 2000 مترمربع"): 3_680_000,
            ("الف", "تا 5000 مترمربع"): 4_154_000,
            ("الف", "5000 مترمربع و بالاتر"): 4_732_000,
            ("ب", "تا 600 مترمربع"): 3_680_000,
            ("ب", "تا 2000 مترمربع"): 4_154_000,
            ("ب", "تا 5000 مترمربع"): 4_732_000,
            ("ب", "5000 مترمربع و بالاتر"): 5_783_000,
            ("ج", "تا 600 مترمربع"): 4_154_000,
            ("ج", "تا 2000 مترمربع"): 4_732_000,
            ("ج", "تا 5000 مترمربع"): 5_783_000,
            ("ج", "5000 مترمربع و بالاتر"): 6_835_000,
            ("د", "تا 600 مترمربع"): 4_732_000,
            ("د", "تا 2000 مترمربع"): 5_783_000,
            ("د", "تا 5000 مترمربع"): 6_835_000,
            ("د", "5000 مترمربع و بالاتر"): 6_835_000,
        }
        return design_rates.get((group, area_row), 0)

    def _get_supervision_rate(self, group: str, area_row: str) -> int:
        """دریافت نرخ نظارت (مبلغ کل پروژه به ریال)"""
        supervision_rates = {
            ("الف", "تا 600 مترمربع"): 3_534_000,
            ("الف", "تا 2000 مترمربع"): 4_498_000,
            ("الف", "تا 5000 مترمربع"): 5_077_000,
            ("الف", "5000 مترمربع و بالاتر"): 5_783_000,
            ("ب", "تا 600 مترمربع"): 4_498_000,
            ("ب", "تا 2000 مترمربع"): 5_077_000,
            ("ب", "تا 5000 مترمربع"): 5_783_000,
            ("ب", "5000 مترمربع و بالاتر"): 7_069_000,
            ("ج", "تا 600 مترمربع"): 5_077_000,
            ("ج", "تا 2000 مترمربع"): 5_783_000,
            ("ج", "تا 5000 مترمربع"): 7_069_000,
            ("ج", "5000 مترمربع و بالاتر"): 8_354_000,
            ("د", "تا 600 مترمربع"): 5_783_000,
            ("د", "تا 2000 مترمربع"): 7_069_000,
            ("د", "تا 5000 مترمربع"): 8_354_000,
            ("د", "5000 مترمربع و بالاتر"): 8_354_000,
        }
        return supervision_rates.get((group, area_row), 0)

    def _need_surveying(self, area: float, floors: int) -> bool:
        """آیا نیاز به نقشه‌برداری است؟"""
        group, _ = self._find_group_and_row(area, floors)
        return area > 600 and group in ["ب", "ج", "د"]

    def _get_surveying_rate(self, group: str, area_row: str) -> int:
        """دریافت نرخ نقشه‌برداری (مبلغ کل پروژه به ریال)"""
        surveying_rates = {
            ("ب", "تا 600 مترمربع"): 0,
            ("ب", "تا 2000 مترمربع"): 628_000,
            ("ب", "تا 5000 مترمربع"): 642_000,
            ("ب", "5000 مترمربع و بالاتر"): 681_000,
            ("ج", "تا 600 مترمربع"): 0,
            ("ج", "تا 2000 مترمربع"): 642_000,
            ("ج", "تا 5000 مترمربع"): 681_000,
            ("ج", "5000 مترمربع و بالاتر"): 696_000,
            ("د", "تا 600 مترمربع"): 0,
            ("د", "تا 2000 مترمربع"): 681_000,
            ("د", "تا 5000 مترمربع"): 696_000,
            ("د", "5000 مترمربع و بالاتر"): 773_000,
        }
        return surveying_rates.get((group, area_row), 0)

    def calculate_design(self, area_m2: float, floors: int) -> TariffResponse:
        """محاسبه هزینه طراحی ساختمان - بدون مالیات"""
        group, area_row = self._find_group_and_row(area_m2, floors)
        rate = self._get_design_rate(group, area_row)
        base_amount = rate  # مبلغ کل پروژه، نه ضرب در متراژ

        design_details = {
            "گروه ساختمانی": group,
            "ردیف مساحت": area_row,
            "نرخ کل پروژه": rate,
            "مساحت": area_m2,
            "هزینه طراحی": base_amount
        }

        return TariffResponse(
            base_amount=base_amount,
            vat=0,
            total_amount=base_amount,
            details=design_details
        )

    def calculate_supervision(self, area_m2: float, floors: int) -> TariffResponse:
        """محاسبه هزینه نظارت ساختمان - بدون مالیات"""
        group, area_row = self._find_group_and_row(area_m2, floors)
        rate = self._get_supervision_rate(group, area_row)
        base_amount = rate  # مبلغ کل پروژه، نه ضرب در متراژ

        supervision_details = {
            "گروه ساختمانی": group,
            "ردیف مساحت": area_row,
            "نرخ کل پروژه": rate,
            "مساحت": area_m2,
            "هزینه نظارت": base_amount
        }

        return TariffResponse(
            base_amount=base_amount,
            vat=0,
            total_amount=base_amount,
            details=supervision_details
        )

    def calculate_engineering_surveying(self, area_m2: float, floors: int) -> TariffResponse:
        """محاسبه هزینه نقشه‌برداری ساختمان - بدون مالیات"""
        group, area_row = self._find_group_and_row(area_m2, floors)

        if not self._need_surveying(area_m2, floors):
            return TariffResponse(
                base_amount=0,
                vat=0,
                total_amount=0,
                details={"message": "نیازی به نقشه‌برداری مستقل نیست", "required": False}
            )

        rate = self._get_surveying_rate(group, area_row)
        base_amount = rate  # مبلغ کل پروژه، نه ضرب در متراژ

        surveying_details = {
            "گروه ساختمانی": group,
            "ردیف مساحت": area_row,
            "نرخ کل پروژه": rate,
            "مساحت": area_m2,
            "هزینه نقشه‌برداری": base_amount,
            "required": True,
            "message": "نیاز به نقشه‌برداری دارید"
        }

        return TariffResponse(
            base_amount=base_amount,
            vat=0,
            total_amount=base_amount,
            details=surveying_details
        )

    def calculate_all_engineering_fees(self, area_m2: float, floors: int, include_surveying: bool = False) -> dict:
        """محاسبه تمام هزینه‌های مهندسی (طراحی + نظارت + نقشه‌برداری) - بدون مالیات"""
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