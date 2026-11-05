# Catalog identifiers are unique; this immutable snapshot lives for one process.
PRODUCTS = tuple((f"sku-{i}", i + 1) for i in range(2000))
