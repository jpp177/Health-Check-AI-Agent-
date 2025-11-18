from flask import Flask, request, jsonify, render_template
from agent.simulate import simulate_data
from agent.health_check import build_health_context
from agent.chatbot import customer_chat
from agent.ticket import create_ticket, send_ticket
from agent.anomaly_detector import detect_anomalies

app = Flask(__name__)

@app.get("/")
def home():
    return render_template("chat.html")

@app.get("/dashboard")
def dashboard():
    return render_template("dashboard.html")

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
