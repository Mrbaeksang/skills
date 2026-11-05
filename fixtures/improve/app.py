from orders import quote
from reports import sales_report

def preview(lines):
    return {"total": quote(lines), "report": sales_report(lines)}
