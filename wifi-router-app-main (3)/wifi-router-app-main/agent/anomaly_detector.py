import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from pathlib import Path
import json, os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()
DATA = Path("data")
DATA.mkdir(exist_ok=True)

llm = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0.3)

def detect_anomalies():
    df = pd.read_csv(DATA/"metrics.csv")
    features = ["rssi_dbm", "snr_db", "latency_ms", "packet_loss_pct",
                "upload_speed_mbps", "download_speed_mbps"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df[features])

    model = IsolationForest(contamination=0.06, random_state=42)
    model.fit(X_scaled)
    df["is_anomaly"] = model.predict(X_scaled)
    df["anomaly_score"] = model.decision_function(X_scaled)

    anomalies = df[df["is_anomaly"] == -1]

    summary = {
        "anomaly_count": int(len(anomalies)),
        "avg_anomaly_latency": float(anomalies["latency_ms"].mean()) if len(anomalies) else None,
        "avg_anomaly_rssi": float(anomalies["rssi_dbm"].mean()) if len(anomalies) else None,
        "avg_anomaly_download": float(anomalies["download_speed_mbps"].mean()) if len(anomalies) else None,
        "avg_anomaly_upload": float(anomalies["upload_speed_mbps"].mean()) if len(anomalies) else None
    }

    if len(anomalies) > 0:
        prompt = f"""
Summarize Wi-Fi anomalies in simple language:

- Avg RSSI: {summary['avg_anomaly_rssi']:.2f} dBm
- Avg Latency: {summary['avg_anomaly_latency']:.2f} ms
- Avg Download: {summary['avg_anomaly_download']:.2f} Mbps
- Avg Upload: {summary['avg_anomaly_upload']:.2f} Mbps
- Total events: {summary['anomaly_count']}
"""
        summary["anomaly_explanation"] = llm.invoke([("system", prompt)]).content.strip()
    else:
        summary["anomaly_explanation"] = "No significant anomalies detected."

    (DATA/"anomaly_summary.json").write_text(json.dumps(summary, indent=2))
    return summary
