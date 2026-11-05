# Preview fixture

`app.preview(lines)` returns total and report for `(sku, positive quantity)` pairs. Catalog SKU keys are unique. Unknown SKU raises ValueError; an empty order returns zero and an empty report. Catalog is immutable for one process. Production storage, concurrency, UI and external services are absent. archive.py is out of scope except inventory. No repository history is supplied.
