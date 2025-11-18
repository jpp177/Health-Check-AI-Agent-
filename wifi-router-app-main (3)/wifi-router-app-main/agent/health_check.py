import pandas as pd
from pathlib import Path
import json

DATA = Path("data")

def latency_quality(avg_latency):
    if avg_latency < 20:
        return "Excellent (virtually no delay)"
    elif avg_latency < 50:
        return "Good (smooth, minimal lag)"
    elif avg_latency < 100:
        return "Acceptable (some delay noticeable)"
    elif avg_latency < 200:
        return "Poor (noticeable lag)"
    else:
        return "Very Poor (major delays)"

def build_health_context():
    p = DATA / "metrics.csv"
    meta_p = DATA / "meta.json"
    anomaly_p = DATA / "anomaly_summary.json"

    df = pd.read_csv(p, parse_dates=["ts_utc"])
    avg_latency = float(df["latency_ms"].mean())
    latency_rating = latency_quality(avg_latency)

    ctx = {
        "avg_rssi": float(df["rssi_dbm"].mean()),
        "avg_snr": float(df["snr_db"].mean()),
        "weak_signal_events": int((df["rssi_dbm"] < -70).sum()),
        "avg_latency": avg_latency,
        "latency_rating": latency_rating,
        "high_latency_events": int((df["latency_ms"] > 100).sum()),
        "packet_loss_events": int((df["packet_loss_pct"] > 1).sum()),
        "reboots": int(df["reboot_event"].sum()),
        "uptime": round(1 - float((df["wan_up"] == 0).mean()), 4),
        "avg_upload_speed": float(df["upload_speed_mbps"].mean()),
        "avg_download_speed": float(df["download_speed_mbps"].mean())
    }

    if meta_p.exists():
        meta = json.loads(meta_p.read_text().replace("'", '"'))
        ctx.update(meta)

    if anomaly_p.exists():
        anomalies = json.loads(anomaly_p.read_text())
        ctx.update(anomalies)

    (DATA/"context.json").write_text(json.dumps(ctx, indent=2))
    return ctx
