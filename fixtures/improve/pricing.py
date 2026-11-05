from catalog import PRODUCTS

def price(sku):
    for key, value in PRODUCTS:
        if key == sku:
            return value
    raise ValueError("unknown sku")
