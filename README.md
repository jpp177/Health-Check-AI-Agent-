<h1 align="center">🌐 Wi-Fi AI Support Agent</h1>
<h3 align="center">An Intelligent Agent for Router Diagnostics, Troubleshooting & Ticket Automation</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Flask-Web%20Framework-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/LangChain-Agent%20Framework-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/OpenAI-GPT%20Models-purple?style=for-the-badge">
</p>

<hr/>

<h2>📘 Table of Contents</h2>

<ul>
  <li><a href="#overview">🚀 Overview</a></li>
  <li><a href="#features">🧠 Features</a></li>
  <li><a href="#tech-stack">⚙️ Tech Stack</a></li>
  <li><a href="#project-structure">📂 Project Structure</a></li>
  <li><a href="#setup">🔧 Setup Instructions</a></li>
  <li><a href="#usage">🎯 Usage Guide</a></li>
  <li><a href="#ticket">📊 Example Ticket</a></li>
  <li><a href="#how-it-works">🧩 How It Works</a></li>
  <li><a href="#agent-vs-chatbot">🤖 AI Agent vs Chatbot</a></li>
  <li><a href="#purpose">📌 Project Purpose</a></li>
</ul>

<hr/>

<h2 id="overview">🚀 Overview</h2>

<p>
The <strong>Wi-Fi AI Support Agent</strong> is an intelligent customer-support system that:
</p>

<ul>
  <li>Monitors router health</li>
  <li>Detects anomalies using machine learning</li>
  <li>Explains issues in simple language</li>
  <li>Suggests troubleshooting steps</li>
  <li>Remembers conversation context</li>
  <li>Creates support tickets automatically</li>
</ul>

<p>
This is not a normal chatbot — it behaves like a <strong>virtual ISP support engineer</strong>.
</p>

<hr/>

<h2 id="features">🧠 Features</h2>

<ul>
  <li>📡 <strong>Router Telemetry Monitoring</strong> — RSSI, latency, throughput, reboots, metadata</li>
  <li>🧠 <strong>AI Intent Understanding</strong> — no keyword triggers</li>
  <li>⚠️ <strong>Anomaly Detection (Isolation Forest)</strong></li>
  <li>🛠️ <strong>Troubleshooting Workflow</strong> — fixes before escalation</li>
  <li>🎫 <strong>Smart Ticketing System</strong> with metadata + anomaly reasoning</li>
  <li>🧠 <strong>Conversation Memory</strong></li>
  <li>💬 <strong>Modern Chat UI</strong></li>
</ul>

<hr/>

<h2 id="tech-stack">⚙️ Tech Stack</h2>

<ul>
  <li>Python + Flask</li>
  <li>OpenAI GPT-4o-mini</li>
  <li>LangChain (memory)</li>
  <li>Isolation Forest (ML anomaly detection)</li>
  <li>Pandas / NumPy</li>
  <li>HTML / CSS / JavaScript</li>
</ul>

<hr/>

<h2 id="project-structure">📂 Project Structure</h2>

<pre>
wifi-agent-app/
│── app.py
│── .env
│── requirements.txt
│
├── agent/
│   ├── simulate.py
│   ├── health_check.py
│   ├── chatbot.py
│   └── ticket.py
│
├── data/
│   ├── router_metrics.csv
│   ├── context.json
│   └── ticket.json
│
├── templates/
│   └── chat.html
│
└── static/
    ├── chat.js
    └── chat.css
</pre>

<hr/>

<h2 id="setup">🔧 Setup Instructions</h2>

<h3>1️⃣ Create Virtual Environment</h3>

<pre>
python -m venv venv
venv\Scripts\activate   (Windows)
source venv/bin/activate (Mac/Linux)
</pre>

<h3>2️⃣ Install Dependencies</h3>

<pre>
pip install -r requirements.txt
</pre>

<h3>3️⃣ Create <code>.env</code> File</h3>

<pre>
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini
</pre>

<h3>4️⃣ Run the App</h3>

<pre>
python app.py
</pre>

<p>Open in browser: <strong>http://127.0.0.1:5000</strong></p>

<hr/>

<h2 id="usage">🎯 Usage Guide</h2>

<h3>▶️ 1. Run Diagnostics</h3>
<p>Generates telemetry, summary & anomaly analysis.</p>

<h3>💬 2. Ask Questions</h3>

<ul>
  <li>Why is my Wi-Fi slow?</li>
  <li>How is my router performing?</li>
  <li>Give me fixes for my Wi-Fi.</li>
</ul>

<h3>🛠️ 3. Troubleshooting First</h3>
<p>The agent suggests fixes before opening a ticket.</p>

<h3>🎫 4. Ticket Escalation</h3>
<p>Only happens if user says the issue still continues.</p>

<hr/>

<h2 id="ticket">📊 Example Ticket</h2>

<pre>
{
  "customer_request": "My Wi-Fi is still not working",
  "router_status": {
    "service_address": "1234 Elm Street, Springfield",
    "serial_number": "SR-73882",
    "location_id": "LOC-4984",
    "avg_rssi": -55.98,
    "avg_latency": 49.04,
    "avg_upload_speed": 9.55,
    "avg_download_speed": 57.79,
    "anomaly_count": 18,
    "anomaly_explanation": "Multiple abnormal drops in signal quality and latency spikes detected."
  },
  "ticket_status": "Created"
}
</pre>

<hr/>

<h2 id="how-it-works">🧩 How It Works</h2>

<ol>
  <li><strong>Data Simulation</strong> — realistic router telemetry</li>
  <li><strong>Health Analysis</strong></li>
  <li><strong>Anomaly Detection</strong> (Isolation Forest)</li>
  <li><strong>Conversation Memory</strong></li>
  <li><strong>LLM Reasoning</strong></li>
  <li><strong>Ticket Creation</strong> with metadata & anomaly explanation</li>
</ol>

<hr/>

<h2 id="agent-vs-chatbot">🤖 AI Agent vs Chatbot</h2>

<table>
  <tr>
    <th>Chatbot</th>
    <th>AI Agent (This Project)</th>
  </tr>
  <tr>
    <td>Only replies</td>
    <td>Understands + takes actions</td>
  </tr>
  <tr>
    <td>No reasoning</td>
    <td>Diagnoses issues</td>
  </tr>
  <tr>
    <td>No memory</td>
    <td>Remembers conversation</td>
  </tr>
  <tr>
    <td>Cannot escalate</td>
    <td>Creates support tickets</td>
  </tr>
  <tr>
    <td>No data access</td>
    <td>Reads telemetry + anomalies</td>
  </tr>
</table>

<hr/>

<h2 id="purpose">📌 Project Purpose</h2>

<p>
This project demonstrates a full <strong>Agentic AI System</strong> with:
</p>

<ul>
  <li>Real data analysis</li>
  <li>LLM reasoning & memory</li>
  <li>Troubleshooting workflow</li>
  <li>Anomaly detection model</li>
  <li>Autonomous ticket generation</li>
  <li>Frontend + backend integration</li>
</ul>


