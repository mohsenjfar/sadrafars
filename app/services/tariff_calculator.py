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
    # ============================================================

    def _get_group(self, floors: int) -> tuple:
        """
        تعیین گروه ساختمانی بر اساس تعداد طبقات (سقف)
        بازگشت: (نام گروه، کلید گروه برای جستجو در جدول)
        """
        if floors <= 2:
            return ("الف", "A")
        elif floors <= 5:
            return ("ب", "B")
        elif floors <= 7:
            return ("ج (۶-۷)", "C1")
        elif floors <= 10:
            return ("ج (۸-۱۰)", "C2")
        elif floors <= 12:
            return ("د (۱۱-۱۲)", "D1")
        elif floors <= 15:
            return ("د (۱۳-۱۵)", "D2")
        else:
            return ("د (۱۶+)", "D3")

    def _get_supervision_rate(self, group_key: str) -> int:
        """
        نرخ نظارت ۴ رشته اصلی به ازای هر مترمربع (ریال)
        بر اساس ۷ گروه
        """
        rates = {
            "A": 3_534_000,   # الف (۱-۲ سقف)
            "B": 4_498_000,   # ب (۳-۵ سقف)
            "C1": 5_077_000,  # ج (۶-۷ سقف)
            "C2": 5_783_000,  # ج (۸-۱۰ سقف)
            "D1": 7_069_000,  # د (۱۱-۱۲ سقف)
            "D2": 8_354_000,  # د (۱۳-۱۵ سقف)
            "D3": 8_354_000,  # د (۱۶+ سقف)
        }
        return rates.get(group_key, 0)

    def _get_surveying_rate(self, group_key: str) -> int:
        """
        نرخ نقشه‌برداری ساختمان به ازای هر مترمربع (ریال)
        گروه الف: نیازی ندارد (۰)
        """
        rates = {
            "A": 0,            # الف - نیاز ندارد
            "B": 587_000,      # ب (۳-۵ سقف)
            "C1": 628_000,     # ج (۶-۷ سقف)
            "C2": 642_000,     # ج (۸-۱۰ سقف)
            "D1": 681_000,     # د (۱۱-۱۲ سقف)
            "D2": 696_000,     # د (۱۳-۱۵ سقف)
            "D3": 773_000,     # د (۱۶+ سقف)
        }
        return rates.get(group_key, 0)

    def _get_design_rate(self, group_key: str) -> int:
        """
        نرخ طراحی ۴ رشته اصلی به ازای هر مترمربع (ریال)
        بر اساس ۷ گروه - از جدول طراحی در اکسل
        """
        rates = {
            "A": 2_892_000,   # الف (۱-۲ سقف)
            "B": 3_680_000,   # ب (۳-۵ سقف)
            "C1": 4_154_000,  # ج (۶-۷ سقف)
            "C2": 4_732_000,  # ج (۸-۱۰ سقف)
            "D1": 5_783_000,  # د (۱۱-۱۲ سقف)
            "D2": 6_835_000,  # د (۱۳-۱۵ سقف)
            "D3": 6_835_000,  # د (۱۶+ سقف)
        }
        return rates.get(group_key, 0)

    def calculate_design(self, area_m2: float, floors: int) -> TariffResponse:
        """
        محاسبه هزینه طراحی ساختمان
        هزینه = متراژ × نرخ هر مترمربع
        بدون مالیات
        """
        group_name, group_key = self._get_group(floors)
        rate = self._get_design_rate(group_key)
        base_amount = int(area_m2 * rate)

        return TariffResponse(
            base_amount=base_amount,
            vat=0,
            total_amount=base_amount,
            details={
                "گروه ساختمانی": group_name,
                "تعداد طبقات": floors,
                "متراژ": area_m2,
                "نرخ هر متر مربع": rate,
                "نوع خدمت": "طراحی"
            }
        )

    def calculate_supervision(self, area_m2: float, floors: int) -> TariffResponse:
        """
        محاسبه هزینه نظارت ساختمان (شامل نقشه‌برداری در صورت نیاز)
        هزینه = متراژ × نرخ نظارت هر مترمربع + (متراژ × نرخ نقشه‌برداری در صورت نیاز)
        بدون مالیات
        """
        group_name, group_key = self._get_group(floors)
        supervision_rate = self._get_supervision_rate(group_key)
        surveying_rate = self._get_surveying_rate(group_key)
        
        supervision_cost = int(area_m2 * supervision_rate)
        surveying_cost = int(area_m2 * surveying_rate) if surveying_rate > 0 else 0
        base_amount = supervision_cost + surveying_cost

        details = {
            "گروه ساختمانی": group_name,
            "تعداد طبقات": floors,
            "متراژ": area_m2,
            "نرخ نظارت هر متر مربع": supervision_rate,
            "هزینه نظارت": supervision_cost,
        }
        
        if surveying_rate > 0:
            details["نرخ نقشه‌برداری هر متر مربع"] = surveying_rate
            details["هزینه نقشه‌برداری"] = surveying_cost
            details["وضعیت نقشه‌برداری"] = "نیاز دارد"
        else:
            details["وضعیت نقشه‌برداری"] = "نیاز ندارد (گروه الف)"

        return TariffResponse(
            base_amount=base_amount,
            vat=0,
            total_amount=base_amount,
            details=details
        )

    def calculate_engineering_surveying(self, area_m2: float, floors: int) -> TariffResponse:
        """
        محاسبه هزینه نقشه‌برداری ساختمان (به صورت مستقل)
        هزینه = متراژ × نرخ نقشه‌برداری (در صورت نیاز)
        بدون مالیات
        """
        group_name, group_key = self._get_group(floors)
        surveying_rate = self._get_surveying_rate(group_key)
        
        if surveying_rate == 0:
            return TariffResponse(
                base_amount=0,
                vat=0,
                total_amount=0,
                details={
                    "گروه ساختمانی": group_name,
                    "تعداد طبقات": floors,
                    "وضعیت": "نیازی به نقشه‌برداری مستقل نیست",
                    "required": False
                }
            )
        
        base_amount = int(area_m2 * surveying_rate)
        
        return TariffResponse(
            base_amount=base_amount,
            vat=0,
            total_amount=base_amount,
            details={
                "گروه ساختمانی": group_name,
                "تعداد طبقات": floors,
                "متراژ": area_m2,
                "نرخ هر متر مربع": surveying_rate,
                "وضعیت": "نیاز به نقشه‌برداری دارد",
                "required": True
            }
        )

    def calculate_all_engineering_fees(self, area_m2: float, floors: int, include_surveying: bool = False) -> TariffResponse:
        """
        محاسبه تمام هزینه‌های مهندسی (طراحی + نظارت + نقشه‌برداری در صورت نیاز)
        بدون مالیات
        بازگشت به صورت TariffResponse برای نمایش یکپارچه در فرانت‌اند
        """
        design = self.calculate_design(area_m2, floors)
        supervision = self.calculate_supervision(area_m2, floors)
        
        total_amount = design.total_amount + supervision.total_amount
        
        # ساخت جزئیات کامل برای نمایش
        details = {
            "طراحی": {
                "مبلغ": design.total_amount,
                "گروه ساختمانی": design.details.get("گروه ساختمانی"),
                "نرخ هر متر مربع": design.details.get("نرخ هر متر مربع"),
            },
            "نظارت": {
                "مبلغ": supervision.total_amount,
                "گروه ساختمانی": supervision.details.get("گروه ساختمانی"),
                "نرخ نظارت هر متر مربع": supervision.details.get("نرخ نظارت هر متر مربع"),
            },
            "متراژ": area_m2,
            "تعداد طبقات": floors,
        }
        
        # اضافه کردن جزئیات نقشه‌برداری اگر وجود داشته باشد
        if "نرخ نقشه‌برداری هر متر مربع" in supervision.details:
            details["نقشه‌برداری"] = {
                "مبلغ": supervision.details.get("هزینه نقشه‌برداری"),
                "نرخ هر متر مربع": supervision.details.get("نرخ نقشه‌برداری هر متر مربع"),
                "وضعیت": supervision.details.get("وضعیت نقشه‌برداری"),
            }
        
        return TariffResponse(
            base_amount=total_amount,
            vat=0,
            total_amount=total_amount,
            details=details
        )

    def _jalali_to_gregorian(self, jalali_date: str) -> str:
        """تبدیل تاریخ شمسی به میلادی (فرمت ورودی: YYYY/MM/DD)"""
        import jdatetime
        
        parts = jalali_date.split('/')
        if len(parts) != 3:
            raise ValueError("فرمت تاریخ باید YYYY/MM/DD باشد")
        
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        
        # تبدیل شمسی به میلادی
        gregorian = jdatetime.date(year, month, day).togregorian()
        
        return f"{gregorian.year}-{gregorian.month:02d}-{gregorian.day:02d}"
    
    def calculate_delay_penalty(self, area_m2: float, floors: int, license_date: str) -> TariffResponse:
        """
        محاسبه هزینه مابه‌التفاوت تاخیر نظارت
        هر 6 ماه (یا کسری) بعد از 18 ماه = 20% هزینه نظارت پایه
        """
        from datetime import datetime
        import jdatetime
        
        # تبدیل تاریخ شمسی به میلادی
        try:
            parts = license_date.split('/')
            if len(parts) != 3:
                raise ValueError("فرمت تاریخ باید YYYY/MM/DD باشد")
            
            year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            gregorian = jdatetime.date(year, month, day).togregorian()
            gregorian_date = f"{gregorian.year}-{gregorian.month:02d}-{gregorian.day:02d}"
            
        except Exception as e:
            return TariffResponse(
                base_amount=0,
                vat=0,
                total_amount=0,
                details={"error": f"فرمت تاریخ نامعتبر: {str(e)}", "راهنما": "فرمت صحیح: 1403/01/15"}
            )
        
        # محاسبه تعداد ماه‌های گذشته
        license_datetime = datetime.strptime(gregorian_date, "%Y-%m-%d")
        today = datetime.now()
        
        months_passed = (today.year - license_datetime.year) * 12 + (today.month - license_datetime.month)
        
        # محاسبه مازاد بر 18 ماه
        excess_months = max(0, months_passed - 18)
        
        # محاسبه تعداد واحدهای 6 ماهه (با سقف)
        units = (excess_months + 5) // 6
        
        # محاسبه هزینه نظارت پایه
        group_name, group_key = self._get_group(floors)
        supervision_rate = self._get_supervision_rate(group_key)
        surveying_rate = self._get_surveying_rate(group_key)
        
        base_supervision_cost = int(area_m2 * (supervision_rate + surveying_rate))
        
        # محاسبه مبلغ اضافه تاخیر
        penalty_amount = int(base_supervision_cost * 0.2 * units)
        
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
                "ماه‌های گذشته": months_passed,
                "مازاد بر ۱۸ ماه": excess_months,
                "تعداد واحدهای ۶ ماهه": units,
                "هزینه نظارت پایه": base_supervision_cost,
                "درصد هر واحد": "20%",
                "مبلغ هر واحد": int(base_supervision_cost * 0.2),
                "گروه ساختمانی": group_name,
                "متراژ": area_m2,
                "تعداد طبقات": floors
            }
        )