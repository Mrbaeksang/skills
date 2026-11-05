# Historical exporter; not registered by the preview entrypoint.
def export_legacy(rows):
    return "\n".join(str(row) for row in rows)
