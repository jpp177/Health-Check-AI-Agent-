from pathlib import Path
import json

DATA = Path("data")
DATA.mkdir(exist_ok=True)

def create_ticket(user_message: str):
    ctx = json.loads((DATA/"context.json").read_text())

    ticket = {
        "customer_request": user_message,
        "router_status": {
            "service_address": ctx.get("service_address", "N/A"),
            "serial_number": ctx.get("serial_number", "N/A"),
            "location_id": ctx.get("location_id", "N/A"),
            "avg_rssi": ctx.get("avg_rssi"),
            "avg_latency": ctx.get("avg_latency"),
            "latency_rating": ctx.get("latency_rating"),
            "avg_upload_speed": ctx.get("avg_upload_speed"),
            "avg_download_speed": ctx.get("avg_download_speed"),
            "anomaly_count": ctx.get("anomaly_count"),
            "anomaly_explanation": ctx.get("anomaly_explanation"),
        },
        "ticket_status": "Created"
    }

    (DATA/"ticket.json").write_text(json.dumps(ticket, indent=2))
    return ticket

def send_ticket():
    src = DATA/"ticket.json"
    dst = DATA/"ticket_sent.json"
    dst.write_text(src.read_text())
    return True
