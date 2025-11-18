from flask import Flask, request, jsonify, render_template
from agent.simulate import simulate_data
from agent.health_check import build_health_context
from agent.chatbot import customer_chat
from agent.ticket import create_ticket, send_ticket
from agent.anomaly_detector import detect_anomalies
import pandas as pd
from pathlib import Path
import json

app = Flask(__name__)
DATA = Path("data")

@app.get("/")
def home():
    return render_template("chat.html")

@app.get("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.get("/api/wifi-metrics")
def wifi_metrics():
    try:
        # Read the WiFi telemetry CSV
        csv_path = DATA / "ml_test_1K.csv"
        
        if not csv_path.exists():
            return jsonify({"error": "WiFi telemetry data not found"}), 404
        
        df = pd.read_csv(csv_path)
        
        # Calculate key WiFi health metrics
        total_devices = len(df)
        anomaly_count = len(df[df['label'] == 'anomaly'])
        normal_count = len(df[df['label'] == 'normal'])
        
        # Signal strength metrics
        avg_rssi = float(df['rssi'].mean())
        weak_signal_count = len(df[df['rssi'] < -70])
        excellent_signal_count = len(df[df['rssi'] > -50])
        
        # Determine overall signal quality
        if avg_rssi > -50:
            signal_quality = "Excellent"
        elif avg_rssi > -60:
            signal_quality = "Good"
        elif avg_rssi > -70:
            signal_quality = "Fair"
        else:
            signal_quality = "Poor"
        
        # Transmission metrics
        avg_tx_retransmit = float(df['tx_retransmit_ppm'].mean())
        avg_tx_fail = float(df['tx_fail_ppm'].mean())
        avg_rx_drop = float(df['rx_drop_ppm'].mean())
        
        high_retransmit_count = len(df[df['tx_retransmit_ppm'] > 20000])
        high_tx_fail_count = len(df[df['tx_fail_ppm'] > 10000])
        high_rx_drop_count = len(df[df['rx_drop_ppm'] > 10000])
        
        # Network speed metrics (convert bps to Mbps)
        avg_tx_speed = float(df['tx_rate_info_rate_bps'].mean() / 1_000_000)
        avg_rx_speed = float(df['rx_rate_info_rate_bps'].mean() / 1_000_000)
        
        # Frequency distribution
        freq_2ghz_count = len(df[df['frequency'] < 5000])
        freq_5ghz_count = len(df[df['frequency'] >= 5000])
        
        # Authentication types
        wpa2_count = len(df[df['auth_type'] == 'WPA2'])
        wpa3_count = len(df[df['auth_type'] == 'WPA3'])
        open_count = len(df[df['auth_type'] == 'OPEN'])
        
        # Connection quality metrics
        avg_connected_time = float(df['connected_time_s'].mean() / 3600)  # Convert to hours
        avg_inactive_time = float(df['inactive_time_ms'].mean())
        
        # Network utilization
        avg_tx_utilization = float(df['tx_utilization_spm'].mean())
        avg_rx_utilization = float(df['rx_utilization_spm'].mean())
        
        # Device model distribution
        model_counts = df['model'].value_counts().to_dict() if 'model' in df.columns else {}
        
        # Firmware versions
        firmware_counts = df['firmware'].value_counts().to_dict() if 'firmware' in df.columns else {}
        outdated_firmware_count = len(df[df['label'] == 'anomaly']) if 'anomaly_type' in df.columns else 0
        
        # Anomalies by model
        anomalies_by_model = {}
        if 'model' in df.columns:
            for model in df['model'].unique():
                model_df = df[df['model'] == model]
                total = len(model_df)
                anomaly_cnt = len(model_df[model_df['label'] == 'anomaly'])
                anomalies_by_model[model] = {
                    'total': total,
                    'anomalies': anomaly_cnt,
                    'percentage': round((anomaly_cnt / total * 100), 2) if total > 0 else 0
                }
        
        # Anomalies by firmware
        anomalies_by_firmware = {}
        if 'firmware' in df.columns:
            for firmware in df['firmware'].unique():
                firmware_df = df[df['firmware'] == firmware]
                total = len(firmware_df)
                anomaly_cnt = len(firmware_df[firmware_df['label'] == 'anomaly'])
                anomalies_by_firmware[firmware] = {
                    'total': total,
                    'anomalies': anomaly_cnt,
                    'percentage': round((anomaly_cnt / total * 100), 2) if total > 0 else 0
                }
        
        # Get recent anomalies with details
        anomalies = df[df['label'] == 'anomaly'].head(10)
        recent_anomalies = []
        
        for _, row in anomalies.iterrows():
            anomaly_reason = str(row['anomaly_type']) if pd.notna(row.get('anomaly_type')) else str(row.get('anomaly_reason', 'Unknown'))
            recent_anomalies.append({
                "timestamp": str(row['timestamp']),
                "device": str(row['mac_address']),
                "model": str(row.get('model', 'Unknown')) if pd.notna(row.get('model')) else "Unknown",
                "firmware": str(row.get('firmware', 'Unknown')) if pd.notna(row.get('firmware')) else "Unknown",
                "reason": anomaly_reason,
                "rssi": float(row['rssi']),
                "frequency": int(row['frequency'])
            })
        
        # Calculate health score (0-100)
        health_score = 100
        if avg_rssi < -70:
            health_score -= 20
        elif avg_rssi < -60:
            health_score -= 10
        
        if avg_tx_fail > 5000:
            health_score -= 15
        if avg_tx_retransmit > 15000:
            health_score -= 15
        if avg_rx_drop > 5000:
            health_score -= 10
        
        anomaly_rate = (anomaly_count / total_devices) * 100
        health_score -= int(anomaly_rate)
        
        health_score = max(0, min(100, health_score))
        
        # Determine health status
        if health_score >= 90:
            health_status = "Excellent"
            status_icon = "🟢"
        elif health_score >= 75:
            health_status = "Good"
            status_icon = "🟡"
        elif health_score >= 60:
            health_status = "Fair"
            status_icon = "🟠"
        else:
            health_status = "Poor"
            status_icon = "🔴"
        
        # Prepare response
        metrics = {
            "overview": {
                "health_status": health_status,
                "status_icon": status_icon,
                "health_score": health_score,
                "total_devices": total_devices,
                "anomaly_count": anomaly_count,
                "normal_count": normal_count
            },
            "signal": {
                "avg_rssi": round(avg_rssi, 2),
                "signal_quality": signal_quality,
                "weak_signal_count": weak_signal_count,
                "excellent_signal_count": excellent_signal_count
            },
            "transmission": {
                "avg_tx_retransmit_ppm": round(avg_tx_retransmit, 2),
                "avg_tx_fail_ppm": round(avg_tx_fail, 2),
                "avg_rx_drop_ppm": round(avg_rx_drop, 2),
                "high_retransmit_count": high_retransmit_count,
                "high_tx_fail_count": high_tx_fail_count,
                "high_rx_drop_count": high_rx_drop_count
            },
            "network_speed": {
                "avg_tx_speed_mbps": round(avg_tx_speed, 2),
                "avg_rx_speed_mbps": round(avg_rx_speed, 2)
            },
            "frequency": {
                "freq_2ghz_count": freq_2ghz_count,
                "freq_5ghz_count": freq_5ghz_count,
                "freq_2ghz_pct": round((freq_2ghz_count / total_devices) * 100, 1),
                "freq_5ghz_pct": round((freq_5ghz_count / total_devices) * 100, 1)
            },
            "security": {
                "wpa2_count": wpa2_count,
                "wpa3_count": wpa3_count,
                "open_count": open_count
            },
            "connection": {
                "avg_connected_hours": round(avg_connected_time, 2),
                "avg_inactive_ms": round(avg_inactive_time, 2)
            },
            "utilization": {
                "avg_tx_utilization_spm": round(avg_tx_utilization, 2),
                "avg_rx_utilization_spm": round(avg_rx_utilization, 2)
            },
            "devices": {
                "model_counts": model_counts,
                "firmware_counts": firmware_counts,
                "outdated_firmware_count": outdated_firmware_count
            },
            "anomalies_by_model": anomalies_by_model,
            "anomalies_by_firmware": anomalies_by_firmware,
            "recent_anomalies": recent_anomalies
        }
        
        return jsonify(metrics)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.post("/run-diagnostics")
def run_diag():
    simulate_data()
    detect_anomalies()
    build_health_context()
    return jsonify({"ok": True, "msg": "Router diagnostics complete ✅"})

@app.post("/chat")
def chat():
    user_msg = (request.json or {}).get("message", "")
    reply, raise_ticket = customer_chat(user_msg)

    if raise_ticket:
        create_ticket(user_msg)
        send_ticket()
        reply = "✅ Your issue has been escalated to customer support."

    return jsonify({
        "reply": reply,
        "ticket_created": raise_ticket
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
