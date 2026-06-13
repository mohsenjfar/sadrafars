# file_path: app/services/tariff_calculator.py

from app.models.tariff_models import TariffResponse


class TariffCalculator:
    """محاسبه‌گر تعرفه‌های نقشه‌برداری و مهندسی ساختمان - سال ۱۴۰۵"""

    # ============================================================
    # بخش ۱: تعرفه‌های نقشه‌برداری (بر اساس surv.pdf) - با مالیات ۱۰%
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
            base = 44_896_792 + 53_876_150
        elif area_m2 <= 10000:
            base = 44_896_792 + 53_876_150 + 62_855_510
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
            extra_points = num_points - 8
            base = 60_642_992 + int(extra_points * 0.8 * 7_580_374)
        elif num_points <= 100:
            extra_points = num_points - 50
            base = 60_642_992 + int(42 * 0.8 * 7_580_374) + int(extra_points * 0.5 * 7_580_374)
        else:
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
        rate = 125_713 + 98_774
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
        rate = 125_713 + 53_871
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
            extra = area_m2 - 500
            base = 68_243_120 + int(extra * 26_933)
        elif area_m2 <= 10000:
            extra = area_m2 - 5000
            base = 68_243_120 + int(4500 * 26_933) + int(extra * 19_747)
        else:
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
    # با قوانین جدید:
    # 1. ارتقای گروه بر اساس متراژ
    # 2. شرط نقشه‌برداری: سقف > 5 OR متراژ > 1200
    # 3. شهرسازی فقط برای گروه‌های C و D
    # 4. تمدید نظارت ماهانه
    # ============================================================

    def _get_base_group(self, ceilings: int) -> tuple:
        """
        تعیین گروه پایه بر اساس تعداد سقف
        بازگشت: (نام گروه, کلید گروه)
        """
        if ceilings <= 2:
            return ("الف (۱-۲ سقف)", "A")
        elif ceilings <= 5:
            return ("ب (۳-۵ سقف)", "B")
        elif ceilings <= 7:
            return ("ج (۶-۷ سقف)", "C1")
        elif ceilings <= 10:
            return ("ج (۸-۱۰ سقف)", "C2")
        elif ceilings <= 12:
            return ("د (۱۱-۱۲ سقف)", "D1")
        elif ceilings <= 15:
            return ("د (۱۳-۱۵ سقف)", "D2")
        else:
            return ("د (۱۶+ سقف)", "D3")

    def _apply_area_upgrade(self, group_key: str, area_m2: float) -> tuple:
        """
        ارتقای گروه بر اساس متراژ
        قوانین:
        - الف (A): اگر متراژ > 600 → ارتقا به ب (B)
        - ب (B): اگر متراژ > 2000 → ارتقا به ج (C1)
        - ج (C1): اگر متراژ > 5000 → ارتقا به ج (C2)
        - ج (C2): اگر متراژ > 5000 → ارتقا به د (D1)
        - گروه‌های د: ارتقا ندارند
        """
        upgraded = False
        original_group = group_key
        
        if group_key == "A" and area_m2 > 600:
            group_key = "B"
            upgraded = True
        elif group_key == "B" and area_m2 > 2000:
            group_key = "C1"
            upgraded = True
        elif group_key == "C1" and area_m2 > 5000:
            group_key = "C2"
            upgraded = True
        elif group_key == "C2" and area_m2 > 5000:
            group_key = "D1"
            upgraded = True
        
        return group_key, upgraded, original_group

    def _get_group_name(self, group_key: str) -> str:
        """دریافت نام گروه از کلید"""
        names = {
            "A": "الف (۱-۲ سقف)",
            "B": "ب (۳-۵ سقف)",
            "C1": "ج (۶-۷ سقف)",
            "C2": "ج (۸-۱۰ سقف)",
            "D1": "د (۱۱-۱۲ سقف)",
            "D2": "د (۱۳-۱۵ سقف)",
            "D3": "د (۱۶+ سقف)",
        }
        return names.get(group_key, group_key)

    # ============================================================
    # نرخ‌های تفکیک شده هر رشته (از جدول اکسل)
    # ============================================================

    def _get_design_breakdown(self, group_key: str) -> dict:
        """
        نرخ طراحی تفکیک شده هر رشته (ریال به ازای هر مترمربع)
        از جدول اکسل: معماری، عمران، تاسیسات مکانیکی، تاسیسات برقی، هماهنگ کننده
        """
        rates = {
            "A": {
                "معماری": 916_000,
                "عمران": 1_055_000,
                "تاسیسات مکانیکی": 416_000,
                "تاسیسات برقی": 389_000,
                "هماهنگ کننده": 116_000,
            },
            "B": {
                "معماری": 1_119_000,
                "عمران": 1_294_000,
                "تاسیسات مکانیکی": 559_000,
                "تاسیسات برقی": 524_000,
                "هماهنگ کننده": 184_000,
            },
            "C1": {
                "معماری": 1_210_000,
                "عمران": 1_406_000,
                "تاسیسات مکانیکی": 664_000,
                "تاسیسات برقی": 625_000,
                "هماهنگ کننده": 249_000,
            },
            "C2": {
                "معماری": 1_379_000,
                "عمران": 1_601_000,
                "تاسیسات مکانیکی": 756_000,
                "تاسیسات برقی": 712_000,
                "هماهنگ کننده": 284_000,
            },
            "D1": {
                "معماری": 1_613_000,
                "عمران": 1_882_000,
                "تاسیسات مکانیکی": 968_000,
                "تاسیسات برقی": 914_000,
                "هماهنگ کننده": 405_000,
            },
            "D2": {
                "معماری": 1_907_000,
                "عمران": 2_225_000,
                "تاسیسات مکانیکی": 1_144_000,
                "تاسیسات برقی": 1_081_000,
                "هماهنگ کننده": 478_000,
            },
            "D3": {
                "معماری": 1_907_000,
                "عمران": 2_225_000,
                "تاسیسات مکانیکی": 1_144_000,
                "تاسیسات برقی": 1_081_000,
                "هماهنگ کننده": 478_000,
            },
        }
        return rates.get(group_key, rates["A"])

    def _get_supervision_breakdown(self, group_key: str) -> dict:
        """
        نرخ نظارت تفکیک شده هر رشته (ریال به ازای هر مترمربع)
        از جدول اکسل: معماری، عمران، تاسیسات مکانیکی، تاسیسات برقی، هماهنگ کننده
        """
        rates = {
            "A": {
                "معماری": 1_120_000,
                "عمران": 1_289_000,
                "تاسیسات مکانیکی": 509_000,
                "تاسیسات برقی": 475_000,
                "هماهنگ کننده": 141_000,
            },
            "B": {
                "معماری": 1_367_000,
                "عمران": 1_581_000,
                "تاسیسات مکانیکی": 684_000,
                "تاسیسات برقی": 641_000,
                "هماهنگ کننده": 225_000,
            },
            "C1": {
                "معماری": 1_479_000,
                "عمران": 1_718_000,
                "تاسیسات مکانیکی": 811_000,
                "تاسیسات برقی": 764_000,
                "هماهنگ کننده": 305_000,
            },
            "C2": {
                "معماری": 1_685_000,
                "عمران": 1_957_000,
                "تاسیسات مکانیکی": 924_000,
                "تاسیسات برقی": 870_000,
                "هماهنگ کننده": 347_000,
            },
            "D1": {
                "معماری": 1_972_000,
                "عمران": 2_301_000,
                "تاسیسات مکانیکی": 1_183_000,
                "تاسیسات برقی": 1_118_000,
                "هماهنگ کننده": 495_000,
            },
            "D2": {
                "معماری": 2_331_000,
                "عمران": 2_719_000,
                "تاسیسات مکانیکی": 1_398_000,
                "تاسیسات برقی": 1_321_000,
                "هماهنگ کننده": 585_000,
            },
            "D3": {
                "معماری": 2_331_000,
                "عمران": 2_719_000,
                "تاسیسات مکانیکی": 1_398_000,
                "تاسیسات برقی": 1_321_000,
                "هماهنگ کننده": 585_000,
            },
        }
        return rates.get(group_key, rates["A"])

    def _get_design_rate(self, group_key: str) -> int:
        """نرخ طراحی مجموع ۴ رشته اصلی به ازای هر مترمربع (ریال)"""
        rates = {
            "A": 2_892_000,
            "B": 3_680_000,
            "C1": 4_154_000,
            "C2": 4_732_000,
            "D1": 5_783_000,
            "D2": 6_835_000,
            "D3": 6_835_000,
        }
        return rates.get(group_key, 0)

    def _get_supervision_rate(self, group_key: str) -> int:
        """نرخ نظارت مجموع ۴ رشته اصلی به ازای هر مترمربع (ریال)"""
        rates = {
            "A": 3_534_000,
            "B": 4_498_000,
            "C1": 5_077_000,
            "C2": 5_783_000,
            "D1": 7_069_000,
            "D2": 8_354_000,
            "D3": 8_354_000,
        }
        return rates.get(group_key, 0)

    def _get_surveying_rate(self, group_key: str) -> int:
        """نرخ نقشه‌برداری ساختمان به ازای هر مترمربع (ریال)"""
        rates = {
            "A": 0,
            "B": 587_000,
            "C1": 628_000,
            "C2": 642_000,
            "D1": 681_000,
            "D2": 696_000,
            "D3": 773_000,
        }
        return rates.get(group_key, 0)

    def _needs_surveyor(self, ceilings: int, area_m2: float) -> bool:
        """
        شرط نیاز به ناظر نقشه‌بردار (طبق شرط کاربر):
        سقف > 5 OR متراژ > 1200
        """
        return ceilings > 5 or area_m2 > 1200

    def _get_urban_design_rate(self, group_key: str) -> int:
        """
        نرخ طراحی شهرسازی به ازای هر مترمربع (ریال)
        از جدول اکسل: "طرح های انطباق شهری ساختمان ها (طراح شهرسازی)"
        فقط برای گروه‌های C و D
        """
        rates = {
            "C1": 168_000,
            "C2": 194_000,
            "D1": 291_000,
            "D2": 311_000,
            "D3": 325_000,
        }
        return rates.get(group_key, 0)

    def _needs_urban_design(self, group_key: str) -> bool:
        """آیا نیاز به طراح شهرساز دارد؟ (فقط گروه‌های C و D)"""
        return group_key.startswith("C") or group_key.startswith("D")

    def _get_final_group(self, ceilings: int, area_m2: float) -> tuple:
        """
        دریافت گروه نهایی پس از اعمال ارتقای متراژ
        بازگشت: (group_key, group_name, was_upgraded, original_group_name)
        """
        base_group_key = self._get_base_group(ceilings)[1]
        final_group_key, upgraded, original_key = self._apply_area_upgrade(base_group_key, area_m2)
        
        group_name = self._get_group_name(final_group_key)
        original_name = self._get_group_name(original_key)
        
        return final_group_key, group_name, upgraded, original_name

    def calculate_design(self, area_m2: float, ceilings: int) -> TariffResponse:
        """
        محاسبه هزینه طراحی ساختمان با تفکیک هر رشته
        شامل: طراحی 4 رشته اصلی (تفکیک شده) + طراحی شهرسازی (در صورت نیاز)
        بدون مالیات
        """
        # تعیین گروه نهایی
        group_key, group_name, upgraded, original_name = self._get_final_group(ceilings, area_m2)
        
        # دریافت نرخ‌های تفکیک شده طراحی
        design_rates = self._get_design_breakdown(group_key)
        
        # محاسبه هزینه هر رشته
        design_breakdown = {}
        design_total = 0
        
        for discipline, rate in design_rates.items():
            cost = int(area_m2 * rate)
            design_breakdown[discipline] = {
                "نرخ هر متر مربع": rate,
                "مبلغ": cost
            }
            design_total += cost
        
        # محاسبه طراحی شهرسازی (در صورت نیاز)
        urban_cost = 0
        urban_details = {}
        
        if self._needs_urban_design(group_key):
            urban_rate = self._get_urban_design_rate(group_key)
            urban_cost = int(area_m2 * urban_rate)
            urban_details = {
                "نرخ هر متر مربع": urban_rate,
                "مبلغ": urban_cost,
                "وضعیت": "نیاز دارد (گروه‌های ج و د)"
            }
        else:
            urban_details = {
                "مبلغ": 0,
                "وضعیت": "نیازی به طراح شهرساز نیست (گروه الف یا ب)"
            }
        
        total_cost = design_total + urban_cost
        
        # ساخت جزئیات کامل
        details = {
            "گروه ساختمانی": group_name,
            "تعداد سقف": ceilings,
            "متراژ": area_m2,
            "طراحی - تفکیک رشته‌ها": design_breakdown,
            "جمع طراحی ۴ رشته": design_total,
            "طراحی شهرسازی": urban_details,
            "جمع کل طراحی": total_cost
        }
        
        if upgraded:
            details["توضیح ارتقا"] = f"به دلیل متراژ {area_m2} مترمربع، گروه از {original_name} به {group_name} ارتقا یافت"
        
        return TariffResponse(
            base_amount=total_cost,
            vat=0,
            total_amount=total_cost,
            details=details
        )

    def calculate_supervision(self, area_m2: float, ceilings: int) -> TariffResponse:
        """
        محاسبه هزینه نظارت ساختمان با تفکیک هر رشته
        شامل: نظارت 4 رشته اصلی (تفکیک شده) + نقشه‌برداری (در صورت نیاز)
        بدون مالیات
        """
        # تعیین گروه نهایی
        group_key, group_name, upgraded, original_name = self._get_final_group(ceilings, area_m2)
        
        # دریافت نرخ‌های تفکیک شده نظارت
        supervision_rates = self._get_supervision_breakdown(group_key)
        
        # محاسبه هزینه هر رشته
        supervision_breakdown = {}
        supervision_total = 0
        
        for discipline, rate in supervision_rates.items():
            cost = int(area_m2 * rate)
            supervision_breakdown[discipline] = {
                "نرخ هر متر مربع": rate,
                "مبلغ": cost
            }
            supervision_total += cost
        
        # محاسبه نقشه‌برداری با شرط جدید (سقف > 5 OR متراژ > 1200)
        surveying_cost = 0
        surveying_details = {}
        
        if self._needs_surveyor(ceilings, area_m2):
            surveying_rate = self._get_surveying_rate(group_key)
            surveying_cost = int(area_m2 * surveying_rate)
            surveying_details = {
                "نرخ هر متر مربع": surveying_rate,
                "مبلغ": surveying_cost,
                "وضعیت": f"نیاز دارد (سقف={ceilings}, متراژ={area_m2})"
            }
        else:
            surveying_details = {
                "مبلغ": 0,
                "وضعیت": f"نیازی به ناظر نقشه‌بردار نیست (سقف≤5 و متراژ≤1200)"
            }
        
        total_cost = supervision_total + surveying_cost
        
        # ساخت جزئیات کامل
        details = {
            "گروه ساختمانی": group_name,
            "تعداد سقف": ceilings,
            "متراژ": area_m2,
            "نظارت - تفکیک رشته‌ها": supervision_breakdown,
            "جمع نظارت ۴ رشته": supervision_total,
            "نقشه‌برداری ساختمان": surveying_details,
            "جمع کل نظارت": total_cost
        }
        
        if upgraded:
            details["توضیح ارتقا"] = f"به دلیل متراژ {area_m2} مترمربع، گروه از {original_name} به {group_name} ارتقا یافت"
        
        return TariffResponse(
            base_amount=total_cost,
            vat=0,
            total_amount=total_cost,
            details=details
        )

    def calculate_urban_design(self, area_m2: float, ceilings: int) -> TariffResponse:
        """
        محاسبه مستقل هزینه طراحی شهرسازی
        فقط برای گروه‌های ج و د
        (برای استفاده در صورت نیاز)
        """
        # تعیین گروه نهایی
        group_key, group_name, upgraded, original_name = self._get_final_group(ceilings, area_m2)
        
        details = {
            "گروه ساختمانی": group_name,
            "تعداد سقف": ceilings,
            "متراژ": area_m2,
        }
        
        if upgraded:
            details["توضیح ارتقا"] = f"به دلیل متراژ {area_m2} مترمربع، گروه از {original_name} به {group_name} ارتقا یافت"
        
        if self._needs_urban_design(group_key):
            urban_rate = self._get_urban_design_rate(group_key)
            urban_cost = int(area_m2 * urban_rate)
            details["وضعیت"] = "نیاز به طراح شهرساز دارد"
            details["نرخ هر متر مربع"] = urban_rate
            details["هزینه طراحی شهرسازی"] = urban_cost
            
            return TariffResponse(
                base_amount=urban_cost,
                vat=0,
                total_amount=urban_cost,
                details=details
            )
        else:
            details["وضعیت"] = "نیازی به طراح شهرساز نیست (گروه الف یا ب)"
            details["هزینه طراحی شهرسازی"] = 0
            
            return TariffResponse(
                base_amount=0,
                vat=0,
                total_amount=0,
                details=details
            )

    def calculate_all_engineering_fees(self, area_m2: float, ceilings: int, include_surveying: bool = False) -> TariffResponse:
        """
        محاسبه تمام هزینه‌های مهندسی با تفکیک کامل
        شامل: طراحی (تفکیک 5 رشته + شهرسازی) + نظارت (تفکیک 5 رشته + نقشه‌برداری)
        بدون مالیات
        """
        # تعیین گروه نهایی
        group_key, group_name, upgraded, original_name = self._get_final_group(ceilings, area_m2)
        
        # ============================================================
        # بخش طراحی
        # ============================================================
        design_rates = self._get_design_breakdown(group_key)
        design_breakdown = {}
        design_total = 0
        
        for discipline, rate in design_rates.items():
            cost = int(area_m2 * rate)
            design_breakdown[discipline] = {
                "نرخ هر متر مربع": rate,
                "مبلغ": cost
            }
            design_total += cost
        
        # طراحی شهرسازی
        urban_cost = 0
        urban_details = {}
        
        if self._needs_urban_design(group_key):
            urban_rate = self._get_urban_design_rate(group_key)
            urban_cost = int(area_m2 * urban_rate)
            urban_details = {
                "نرخ هر متر مربع": urban_rate,
                "مبلغ": urban_cost,
                "وضعیت": "نیاز دارد (گروه‌های ج و د)"
            }
        else:
            urban_details = {
                "مبلغ": 0,
                "وضعیت": "نیازی به طراح شهرساز نیست (گروه الف یا ب)"
            }
        
        total_design = design_total + urban_cost
        
        # ============================================================
        # بخش نظارت
        # ============================================================
        supervision_rates = self._get_supervision_breakdown(group_key)
        supervision_breakdown = {}
        supervision_total = 0
        
        for discipline, rate in supervision_rates.items():
            cost = int(area_m2 * rate)
            supervision_breakdown[discipline] = {
                "نرخ هر متر مربع": rate,
                "مبلغ": cost
            }
            supervision_total += cost
        
        # نقشه‌برداری ساختمان
        surveying_cost = 0
        surveying_details = {}
        
        if self._needs_surveyor(ceilings, area_m2):
            surveying_rate = self._get_surveying_rate(group_key)
            surveying_cost = int(area_m2 * surveying_rate)
            surveying_details = {
                "نرخ هر متر مربع": surveying_rate,
                "مبلغ": surveying_cost,
                "وضعیت": f"نیاز دارد (سقف={ceilings}, متراژ={area_m2})"
            }
        else:
            surveying_details = {
                "مبلغ": 0,
                "وضعیت": f"نیازی به ناظر نقشه‌بردار نیست (سقف≤5 و متراژ≤1200)"
            }
        
        total_supervision = supervision_total + surveying_cost
        
        # ============================================================
        # جمع کل نهایی
        # ============================================================
        grand_total = total_design + total_supervision
        
        # ============================================================
        # ساخت خروجی تفکیک شده کامل
        # ============================================================
        details = {
            "گروه ساختمانی": group_name,
            "تعداد سقف": ceilings,
            "متراژ": area_m2,
            
            "═══════════════════════════════════════": "📐 بخش طراحی",
            "طراحی - تفکیک رشته‌ها": design_breakdown,
            "جمع طراحی ۴ رشته": design_total,
            "طراحی شهرسازی": urban_details,
            "جمع کل طراحی": total_design,
            
            "═══════════════════════════════════════": "👷 بخش نظارت",
            "نظارت - تفکیک رشته‌ها": supervision_breakdown,
            "جمع نظارت ۴ رشته": supervision_total,
            "نقشه‌برداری ساختمان": surveying_details,
            "جمع کل نظارت": total_supervision,
            
            "═══════════════════════════════════════": "💰 جمع نهایی",
            "جمع کل (طراحی + نظارت)": grand_total
        }
        
        if upgraded:
            details["توضیح ارتقا"] = f"به دلیل متراژ {area_m2} مترمربع، گروه از {original_name} به {group_name} ارتقا یافت"
        
        return TariffResponse(
            base_amount=grand_total,
            vat=0,
            total_amount=grand_total,
            details=details
        )

    def calculate_delay_penalty(self, area_m2: float, ceilings: int, license_date: str) -> TariffResponse:
        """
        محاسبه هزینه تمدید نظارت (ماهانه)
        فرمول: هزینه تمدید = ماه‌های تمدید شده × (0.6 × مبلغ قرارداد نظارت پایه ÷ 18)
        
        قرارداد نظارت پایه برای 18 ماه است
        اگر ماه‌های گذشته > 18 باشد، مازاد تمدید محسوب می‌شود
        """
        from datetime import datetime
        import jdatetime
        
        # ابتدا هزینه نظارت پایه را محاسبه می‌کنیم (بدون تمدید)
        base_supervision = self.calculate_supervision(area_m2, ceilings)
        base_contract_amount = base_supervision.total_amount  # مبلغ کل قرارداد نظارت برای 18 ماه
        
        # تبدیل تاریخ شمسی به میلادی
        try:
            parts = license_date.split('/')
            if len(parts) != 3:
                raise ValueError("فرمت تاریخ باید YYYY/MM/DD باشد")
            
            year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            gregorian = jdatetime.date(year, month, day).togregorian()
            license_datetime = datetime(gregorian.year, gregorian.month, gregorian.day)
            
        except Exception as e:
            return TariffResponse(
                base_amount=0,
                vat=0,
                total_amount=0,
                details={"error": f"فرمت تاریخ نامعتبر: {str(e)}", "راهنما": "فرمت صحیح: 1403/01/15"}
            )
        
        # محاسبه تعداد ماه‌های گذشته
        today = datetime.now()
        months_passed = (today.year - license_datetime.year) * 12 + (today.month - license_datetime.month)
        
        # محاسبه مازاد بر 18 ماه
        excess_months = max(0, months_passed - 18)
        
        # محاسبه نرخ ماهانه تمدید
        monthly_rate = (0.6 * base_contract_amount) / 18
        
        # محاسبه مبلغ کل تمدید
        penalty_amount = int(excess_months * monthly_rate)
        
        # محاسبه تاریخ امروز شمسی برای نمایش
        today_jalali = jdatetime.date.today()
        today_str = f"{today_jalali.year}/{today_jalali.month:02d}/{today_jalali.day:02d}"
        
        return TariffResponse(
            base_amount=penalty_amount,
            vat=0,
            total_amount=penalty_amount,
            details={
                "تاریخ صدور پروانه (شمسی)": license_date,
                "تاریخ امروز (شمسی)": today_str,
                "ماه‌های گذشته از صدور پروانه": months_passed,
                "مدت قرارداد پایه (ماه)": 18,
                "ماه‌های تمدید شده": excess_months,
                "مبلغ کل قرارداد نظارت پایه": base_contract_amount,
                "نرخ ماهانه تمدید": int(monthly_rate),
                "فرمول محاسبه": "تمدید = ماه‌های تمدید × (0.6 × مبلغ قرارداد ÷ 18)",
                "گروه ساختمانی": base_supervision.details.get("گروه ساختمانی"),
                "متراژ": area_m2,
                "تعداد سقف": ceilings
            }
        )