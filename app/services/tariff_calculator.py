class TariffCalculator:
    """Tariff 1405 Calculator"""

    VAT_RATE = 0.10
    BASE_POINT_PRICE = 7_580_374

    def apply_vat(self, base_amount: float):
        vat = base_amount * self.VAT_RATE
        total = base_amount + vat
        return {
            "base_amount": round(base_amount, 2),
            "vat": round(vat, 2),
            "total_amount": round(total, 2)
        }

    # -------------------------------
    # 1-1 مساحی و برداشت مسطحاتی
    # -------------------------------

    def calculate_land_survey(self, area_m2: float):

        if area_m2 <= 500:
            base = 55_031_259
            return self.apply_vat(base)

        total = 55_031_259
        remaining = area_m2 - 500

        brackets = [
            (500, 38_378),
            (1000, 23_901),
            (3000, 14_120),
            (45000, 7_628),
        ]

        for limit, rate in brackets:
            used = min(remaining, limit)
            total += used * rate
            remaining -= used

            if remaining <= 0:
                return self.apply_vat(total)

        if remaining > 0:
            raise ValueError("برای بیش از 50001 متر مربع باید به تعرفه سازمان مدیریت ارجاع شود.")

        return self.apply_vat(total)

    # -------------------------------
    # UTM
    # -------------------------------

    def calculate_utm(self, area_m2: float):

        if area_m2 <= 500:
            base = 34_914_000
        elif area_m2 <= 2000:
            base = 52_371_000
        elif area_m2 <= 5000:
            base = 69_828_000
        else:
            base = 87_285_000

        return self.apply_vat(base)

    # -------------------------------
    # میخکوبی
    # -------------------------------

    def calculate_staking(self, num_points: int):

        if 1 <= num_points <= 8:
            base = 60_642_992
        elif 9 <= num_points <= 50:
            base = 0.8 * num_points * self.BASE_POINT_PRICE
        elif 51 <= num_points <= 100:
            base = 0.5 * num_points * self.BASE_POINT_PRICE
        elif 101 <= num_points <= 500:
            base = 0.4 * num_points * self.BASE_POINT_PRICE
        else:
            raise ValueError("تعداد نقاط خارج از بازه تعرفه است.")

        return self.apply_vat(base)

    # -------------------------------
    # برداشت تک خطی
    # -------------------------------

    def calculate_single_line_survey(self, area_m2: float):

        if area_m2 <= 500:
            base = 27_000_000
        elif area_m2 <= 2000:
            base = 35_000_000
        elif area_m2 <= 5000:
            base = 45_000_000
        else:
            base = 60_000_000

        return self.apply_vat(base)

    # -------------------------------
    # ترسیم UTM ساختمان
    # -------------------------------

    def calculate_building_utm_drawing(self, area_m2: float):

        if area_m2 <= 500:
            base = 20_000_000
        elif area_m2 <= 2000:
            base = 28_000_000
        elif area_m2 <= 5000:
            base = 36_000_000
        else:
            base = 45_000_000

        return self.apply_vat(base)

    # -------------------------------
    # دریافتی تک خطی
    # -------------------------------

    def calculate_single_line_receivable(self, area_m2: float):

        survey = self.calculate_single_line_survey(area_m2)["base_amount"]
        utm = self.calculate_building_utm_drawing(area_m2)["base_amount"]

        base = survey + utm
        return self.apply_vat(base)

    # -------------------------------
    # تفکیکی دارای سابقه
    # -------------------------------

    def calculate_subdivision_with_history(self, area_m2: float):

        if area_m2 <= 500:
            base = 40_000_000
        elif area_m2 <= 2000:
            base = 55_000_000
        elif area_m2 <= 5000:
            base = 70_000_000
        else:
            base = 90_000_000

        return self.apply_vat(base)

    # -------------------------------
    # تفکیکی فاقد سابقه
    # -------------------------------

    def calculate_subdivision_without_history(self, area_m2: float):

        survey = self.calculate_single_line_survey(area_m2)["base_amount"]
        subdivision = self.calculate_subdivision_with_history(area_m2)["base_amount"]

        base = survey + subdivision
        return self.apply_vat(base)

    # -------------------------------
    # توپوگرافی
    # -------------------------------

    def calculate_topography(self, area_m2: float):

        rate = 12000
        base = area_m2 * rate

        return self.apply_vat(base)

    # -------------------------------
    # نقشه بلوک شهری
    # -------------------------------

    def calculate_urban_block_map(self, area_m2: float):

        rate = 9000
        base = area_m2 * rate

        return self.apply_vat(base)

    # -------------------------------
    # پروفیل طولی و عرضی
    # -------------------------------

    def calculate_profile(self, length_km: float):

        rate = 25_000_000
        base = length_km * rate

        return self.apply_vat(base)

    # -------------------------------
    # مقاطع طولی
    # -------------------------------

    def calculate_longitudinal_section(self, length_km: float):

        rate = 18_000_000
        base = length_km * rate

        return self.apply_vat(base)

    # -------------------------------
    # نقشه وضع موجود مناطق خاص
    # -------------------------------

    def calculate_special_zone_map(self, area_m2: float):

        rate = 15000
        base = area_m2 * rate

        return self.apply_vat(base)

    # -------------------------------
    # کنترل قائم ستون
    # -------------------------------

    def calculate_column_vertical_control(self, height_m: float, columns: int):

        rate = 250_000
        base = height_m * columns * rate

        return self.apply_vat(base)
