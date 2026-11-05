from pricing import price

def sales_report(lines):
    return [{"sku": sku, "value": price(sku) * quantity} for sku, quantity in lines]
