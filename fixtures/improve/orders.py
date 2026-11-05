from pricing import price

def quote(lines):
    return sum(price(sku) * quantity for sku, quantity in lines)
