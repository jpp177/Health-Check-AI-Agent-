import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import random, json

DATA = Path("data")
DATA.mkdir(exist_ok=True)

def simulate_data():
    now = datetime.utcnow()
    timestamps = [now - timedelta(minutes=i*5) for i in range(288)]  # 1 day of 5-min intervals

    df = pd.DataFrame({
        "ts_utc": timestamps,
        "rssi_dbm": np.random.normal(-55, 4, len(timestamps)),
        "snr_db": np.random.normal(30, 3, len(timestamps)),
        "latency_ms": np.random.normal(35, 8, len(timestamps)),
        "packet_loss_pct": np.abs(np.random.normal(0.3, 0.4, len(timestamps))),
        "reboot_event": np.random.choice([0,1], len(timestamps), p=[0.97,0.03]),
        "wan_up": np.random.choice([1,0], len(timestamps), p=[0.99,0.01]),
        "upload_speed_mbps": np.random.normal(10, 1.5, len(timestamps)),
        "download_speed_mbps": np.random.normal(60, 8, len(timestamps)),
    })

    # 💥 Inject anomalies
    anomaly_idx = np.random.choice(df.index, size=15, replace=False)
    df.loc[anomaly_idx, "rssi_dbm"] = np.random.uniform(-85, -75, len(anomaly_idx))
    df.loc[anomaly_idx, "latency_ms"] = np.random.uniform(250, 400, len(anomaly_idx))
    df.loc[anomaly_idx, "packet_loss_pct"] = np.random.uniform(5, 15, len(anomaly_idx))
    df.loc[anomaly_idx, "download_speed_mbps"] = np.random.uniform(5, 20, len(anomaly_idx))
    df.loc[anomaly_idx, "upload_speed_mbps"] = np.random.uniform(1, 3, len(anomaly_idx))

    df.to_csv(DATA/"metrics.csv", index=False)

    meta = {
        "service_address": "1234 Elm Street, Springfield",
        "serial_number": f"SR-{random.randint(10000,99999)}",
        "location_id": f"LOC-{random.randint(1000,9999)}"
    }

    # ✅ Properly save as valid JSON (fixes JSONDecodeError)
    (DATA/"meta.json").write_text(json.dumps(meta, indent=2))

    return df
