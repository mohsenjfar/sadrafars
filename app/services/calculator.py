# tariff_calc.py

def mikhkoobi(b):
    if b < 9:
        return 11672029
    if b < 51:
        return 11672029 + (b - 8) * 0.8 * 1459004
    return None


def mikhkoobi_topography(c):
    if c < 501:
        return 13134835
    if c < 5001:
        return 13134835 + (c - 500) * 5184
    if c < 10001:
        return 36462835 + (c - 5000) * 3801
    if c < 20001:
        return 55467835 + (c - 10000) * 3801
    return None


def janemayi(c):
    if c < 1001:
        return 8641339
    if c < 5001:
        return 19010946
    if c < 10000:
        return 31108821
    return None


def masahi_arze(c):
    if c < 501:
        return 10591932
    if c < 1001:
        return 10591932 + (c - 500) * 7387
    if c < 2001:
        return 14285432 + (c - 1000) * 4600
    if c < 5001:
        return 18885432 + (c - 2000) * 2718
    if c < 50000:
        return 27039432 + (c - 5000) * 1468
    return None


def utm(c):
    if c < 1001:
        return 8641339
    if c < 5001:
        return 19010946
    if c < 10000:
        return 31108821
    return None


def topography(c):
    if c < 501:
        return 13134835
    if c < 5001:
        return 13134835 + (c - 500) * 5184
    if c < 10001:
        return 36462835 + (c - 5000) * 3801
    if c < 20001:
        return 55467835 + (c - 10000) * 3801
    return None


def calculate(service, b=None, c=None):
    service = service.strip()

    if service == "میخکوبی":
        return mikhkoobi(b)

    if service == "میخکوبی و توپوگرافی":
        return mikhkoobi_topography(c)

    if service == "جانمایی":
        return janemayi(c)

    if service == "مساحی عرصه":
        return masahi_arze(c)

    if service == "یو تی ام":
        return utm(c)

    if service == "توپوگرافی":
        return topography(c)

    raise ValueError("سرویس نامعتبر است")
