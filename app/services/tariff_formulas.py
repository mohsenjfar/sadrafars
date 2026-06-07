# tariff_1405.py
# تعرفه خدمات نقشه برداری ۱۴۰۵
# تمام مبالغ به ریال هستند

# =========================
# ردیف 1-1 : مساحی و برداشت مسطحاتی
# =========================

def row_1_1(area_m2: float) -> float:
    """
    محاسبه تعرفه مساحی و برداشت مسطحاتی
    :param area_m2: مساحت به متر مربع
    :return: مبلغ نهایی (ریال)
    """

    if area_m2 <= 500:
        return 55_031_259

    total = 55_031_259
    remaining = area_m2 - 500

    brackets = [
        (500, 38_378),    # 501-1000
        (1000, 23_901),   # 1001-2000
        (3000, 14_120),   # 2001-5000
        (45000, 7_628),   # 5001-50000
    ]

    for limit, rate in brackets:
        used = min(remaining, limit)
        total += used * rate
        remaining -= used
        if remaining <= 0:
            return total

    if remaining > 0:
        raise ValueError(
            "برای بیش از 50001 متر مربع باید به تعرفه سازمان مدیریت ارجاع شود."
        )

    return total


# =========================
# ردیف 2 : پیاده سازی نقشه
# =========================

BASE_POINT_PRICE = 7_580_374

def row_2(num_points: int) -> float:
    """
    محاسبه تعرفه پیاده کردن نقشه
    :param num_points: تعداد نقاط (N)
    """

    if 1 <= num_points <= 8:
        return 60_642_992

    if 9 <= num_points <= 50:
        return 0.8 * num_points * BASE_POINT_PRICE

    if 51 <= num_points <= 100:
        return 0.5 * num_points * BASE_POINT_PRICE

    if 101 <= num_points <= 500:
        return 0.4 * num_points * BASE_POINT_PRICE

    raise ValueError("تعداد نقاط خارج از بازه تعرفه است.")


# =========================
# ردیف 6 : نقشه مسطحاتی بلوکی
# =========================

def row_6(area_m2: float) -> float:
    """
    تهیه نقشه مسطحاتی بلوکی
    """

    if area_m2 <= 200:
        return 68_909_749

    extra = area_m2 - 200
    return 68_909_749 + (extra * 17_958)


# =========================
# ردیف 7 : پروفیل طولی و عرضی
# =========================

def row_7(length_km: float) -> float:
    """
    محاسبه بر اساس کیلومتر طول
    """
    return length_km * 62_855_510


# =========================
# ردیف 8 : مقاطع طولی معابر شهری
# =========================

def row_8(length_km: float) -> float:
    """
    حداقل 1 کیلومتر محاسبه می‌شود
    """
    effective_length = max(length_km, 1)
    return effective_length * 53_876_150


# =========================
# ردیف 10 : کنترل قائم ستون
# =========================

def row_10(height_m: float, area_m2: float = None) -> float:
    """
    اگر ارتفاع <= 15 متر → مقطوع
    اگر بیشتر از 15 متر → نیاز به مساحت دارد
    """

    if height_m <= 15:
        return 6_285_555

    if area_m2 is None:
        raise ValueError("برای ستون بالای 15 متر باید مساحت ارائه شود.")

    return area_m2 * 269_380


# =========================
# تابع اعمال ضریب
# =========================

def apply_coefficient(amount: float, coefficient: float = 1.0) -> float:
    """
    اعمال ضریب (مثلاً شرایط سخت 1.4)
    """
    return amount * coefficient
