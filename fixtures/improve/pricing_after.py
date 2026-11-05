from catalog import PRODUCTS

# Valid because the fixture catalog is unique and immutable per process.
_PRICES = dict(PRODUCTS)

def price(sku):
    try:
        return _PRICES[sku]
    except (KeyError, TypeError):
        raise ValueError("unknown sku") from None
