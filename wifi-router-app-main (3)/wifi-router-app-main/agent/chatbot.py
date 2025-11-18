import os
import json
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.chat_history import InMemoryChatMessageHistory

# Load OpenAI key and setup data folder
load_dotenv()
DATA = Path("data")
DATA.mkdir(exist_ok=True)

# Initialize LLM
llm = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0.3)

# ✅ Use LangChain's modern message-based memory
memory = InMemoryChatMessageHistory()

def run_conversation(prompt: str):
    """Simple conversation engine using message-based memory."""
    # Combine message history into a readable prompt
    history_text = "\n".join([
        f"User: {m.content}" if m.type == "human" else f"Bot: {m.content}"
        for m in memory.messages
    ])

    full_prompt = f"{history_text}\nUser: {prompt}"

    # Invoke the model
    response = llm.invoke([
        ("system", "You are a helpful Wi-Fi support assistant. Respond briefly and clearly."),
        ("user", full_prompt)
    ]).content

    # Store messages back in memory
    memory.add_user_message(prompt)
    memory.add_ai_message(response)

    return response


def detect_intent(user_text: str):
    """Detect if user wants STATUS, TROUBLESHOOT, or ESCALATE."""
    intent_llm = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0)
    system = """
You are a Wi-Fi support assistant.
Classify the user's intent into one of:
STATUS, TROUBLESHOOT, or ESCALATE.
Return only one word.
"""
    result = intent_llm.invoke([("system", system), ("user", user_text)]).content.strip().upper()
    return result if result in ["STATUS", "TROUBLESHOOT", "ESCALATE"] else "STATUS"


def customer_chat(user_query: str):
    """Main chat handler with simple in-memory message history."""
    ctx_path = DATA / "context.json"
    if not ctx_path.exists():
        return ("No diagnostics data found. Please run diagnostics first.", False)

    ctx = json.loads(ctx_path.read_text())
    intent = detect_intent(user_query)

    context_text = f"""
Router Health Summary:
- RSSI: {ctx.get('avg_rssi', 'N/A')} dBm
- Latency: {ctx.get('avg_latency', 'N/A')} ms
- Upload: {ctx.get('avg_upload_speed', 'N/A')} Mbps
- Download: {ctx.get('avg_download_speed', 'N/A')} Mbps
- Anomalies: {ctx.get('anomaly_count', 0)}
- Summary: {ctx.get('anomaly_explanation', 'No anomalies found.')}
"""

    system_prompt = f"""
You are a friendly Wi-Fi support assistant.
Use short, simple answers.
Remember what the user said earlier.
Use this router context to guide your response.

{context_text}

For STATUS → summarize health
For TROUBLESHOOT → suggest 5–6 fixes
For ESCALATE → confirm ticket creation politely
"""

    prompt = f"{system_prompt}\n\nUser: {user_query}"
    reply = run_conversation(prompt).strip()
    raise_ticket = (intent == "ESCALATE")
    return reply, raise_ticket
