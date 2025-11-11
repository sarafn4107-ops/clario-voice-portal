
import re
import io
from datetime import datetime

import streamlit as st
from PyPDF2 import PdfReader

st.set_page_config(page_title="Voice Coach Chatbox", page_icon="🎤", layout="wide")

# ---------------------- Helpers ----------------------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file-like object."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = []
        for page in reader.pages:
            text.append(page.extract_text() or "")
        return "\n".join(text)
    except Exception as e:
        return f"[ERROR] Could not read PDF: {e}"

def safe_float(value, default=None):
    try:
        return float(value)
    except Exception:
        return default

def find_metric(pattern, text, cast=float):
    m = re.search(pattern, text, flags=re.IGNORECASE)
    if m:
        val = m.group(1)
        if cast is float:
            # Remove possible % or other units
            val = re.sub(r"[^0-9.\-]", "", val)
        return safe_float(val, None) if cast is float else val
    return None

def analyze_report(text: str) -> dict:
    """
    Simple rules-based analysis from text.
    Looks for common acoustic/voice metrics and keywords.
    Returns a dict with 'findings' and 'plan'.
    """
    findings = []
    plan_blocks = []

    # ---------- Parse common metrics if present ----------
    # Note: These are heuristic and may not match every report format.
    metrics = {}
    metrics['jitter_pct'] = find_metric(r"jitter[^0-9%]*([0-9.]+)\s*%", text)
    metrics['shimmer_pct'] = find_metric(r"shimmer[^0-9%]*([0-9.]+)\s*%", text)
    metrics['mpt_sec'] = find_metric(r"(?:maximum\s+phonation\s+time|MPT)[^0-9]*([0-9.]+)\s*s", text)
    metrics['sz_ratio'] = find_metric(r"s\/z\s*ratio[^0-9]*([0-9.]+)", text)
    metrics['f0_hz'] = find_metric(r"(?:F0|fundamental\s+frequency)[^0-9]*([0-9.]+)\s*Hz", text)
    metrics['intensity_db'] = find_metric(r"(?:intensity|SPL)[^0-9]*([0-9.]+)\s*dB", text)

    # ---------- Interpret metrics (broad norms, for guidance only) ----------
    # These ranges are generic and not a substitute for clinical evaluation.
    if metrics['jitter_pct'] is not None:
        if metrics['jitter_pct'] > 1.0:
            findings.append(f"Elevated jitter ({metrics['jitter_pct']}%). Possible pitch instability/roughness.")
            plan_blocks.append(("Pitch Stability", [
                "Humming glides (mmmmm) from low to comfortable high and back, 5 minutes.",
                "Semi-occluded vocal tract (SOVT): straw phonation in water, 3 sets × 1 min.",
                "Gentle sirens on 'ng' to smooth register transitions, 3 minutes."
            ]))
        else:
            findings.append(f"Jitter in typical range ({metrics['jitter_pct']}%).")

    if metrics['shimmer_pct'] is not None:
        if metrics['shimmer_pct'] > 3.5:
            findings.append(f"Elevated shimmer ({metrics['shimmer_pct']}%). Potential loudness/control instability.")
            plan_blocks.append(("Loudness Control", [
                "Crescendo–decrescendo on sustained 'ah' (5s up, 5s down), 5 reps.",
                "Lip trills at steady volume for 3 minutes.",
                "Counting 1–10 at soft, medium, loud, then back to soft—maintain clarity."
            ]))
        else:
            findings.append(f"Shimmer in typical range ({metrics['shimmer_pct']}%).")

    if metrics['mpt_sec'] is not None:
        if metrics['mpt_sec'] < 15:
            findings.append(f"Short Maximum Phonation Time ({metrics['mpt_sec']} s). May indicate breath support limits.")
            plan_blocks.append(("Breath Support", [
                "Diaphragmatic breathing: 4–4–6 (inhale 4, hold 4, exhale 6) × 10 cycles.",
                "Sustained 'sss' and 'zzz'—aim for even airstream; 6 reps each.",
                "Wall panting (light) then slow controlled exhale on 'ffff' for 5 minutes total."
            ]))
        else:
            findings.append(f"Maximum Phonation Time looks adequate ({metrics['mpt_sec']} s).")

    if metrics['sz_ratio'] is not None:
        if metrics['sz_ratio'] < 0.8 or metrics['sz_ratio'] > 1.2:
            findings.append(f"S/Z ratio outside typical band (~0.8–1.2): observed {metrics['sz_ratio']}.")
            plan_blocks.append(("Glottal Efficiency", [
                "S/Z drills: alternate sustained /s/ and /z/, match durations; 5 pairs.",
                "Resonant hums (nasal 'mmm') focusing on forward buzz, 3 minutes.",
                "Straw phonation (air only then voiced) to balance airflow/closure, 3 sets."
            ]))
        else:
            findings.append(f"S/Z ratio in typical band ({metrics['sz_ratio']}).")

    if metrics['f0_hz'] is not None:
        findings.append(f"Reported F0 (fundamental frequency): {metrics['f0_hz']} Hz.")
    if metrics['intensity_db'] is not None:
        findings.append(f"Reported intensity: {metrics['intensity_db']} dB.")

    # ---------- Keyword-based screening ----------
    lowered = text.lower()
    def k(*words): return any(w in lowered for w in words)

    if k("hoarse", "hoarseness", "rough", "raspy"):
        plan_blocks.append(("Reduce Hoarseness / Fatigue", [
            "Hydration habit: 2–3 liters/day; sip warm water before/after use.",
            "Vocal rest micro-breaks: 5 minutes rest each hour of heavy use.",
            "SOVT toolkit: straw phonation, lip trills, tongue trills—total 5–8 minutes/day."
        ]))

    if k("nasal", "nasality"):
        plan_blocks.append(("Resonance Balance", [
            "Humming on 'mmm' then open to 'ma' without losing forward buzz.",
            "Nasal–oral contrast drills: 'mee–may–mah–moh–moo', 3 sets.",
            "Y-buzz (light forward resonance) phrases for 3 minutes."
        ]))

    if k("articulation", "clarity", "slurred", "diction"):
        plan_blocks.append(("Articulation & Clarity", [
            "Over-articulate tongue twisters (slow → natural speed), 5 minutes.",
            "Consonant bursts: 'p t k' then phrases with crisp onsets.",
            "Smile-read: read 1 paragraph while smiling lightly to brighten resonance."
        ]))

    if k("strain", "pressed", "hyperfunction", "tension"):
        plan_blocks.append(("Release Excess Tension", [
            "Neck/shoulder stretches (no pain), 3 minutes.",
            "Yawn–sigh glides to reset laryngeal tension, 10 reps.",
            "Low-effort speaking: start 2 semitones below habitual, soft volume for 2 minutes."
        ]))

    if k("breath", "breathing", "support", "airflow"):
        plan_blocks.append(("Breathing Foundation", [
            "Box breathing 4–4–4–4 × 10 cycles.",
            "Sustained fricatives 'sss/fff' for steady flow, 6 reps each.",
            "Read out loud focusing on punctuation → breathe at commas/periods."
        ]))

    # Always include a general warm-up/cool-down unless many blocks exist
    plan_blocks.append(("Daily Warm-up (5–7 min)", [
        "Neck/shoulder roll + jaw massage (1 min).",
        "Lip trills or straw phonation (2 min).",
        "Hums → 5-step sirens (2–3 min)."
    ]))
    plan_blocks.append(("Cool-down (2–3 min)", [
        "Gentle hums, descending slides.",
        "SOVT (straw/lip trill) 60–90 seconds.",
        "2 minutes quiet voice or rest."
    ]))

    # De-duplicate blocks by title
    dedup = {}
    for title, items in plan_blocks:
        dedup.setdefault(title, [])
        for it in items:
            if it not in dedup[title]:
                dedup[title].append(it)

    return {
        "metrics": metrics,
        "findings": findings,
        "plan": [{"title": t, "items": its} for t, its in dedup.items()]
    }

def render_plan(plan_dict: dict) -> str:
    lines = []
    lines.append(f"# Personalized Voice Plan ({datetime.now().strftime('%Y-%m-%d')})")
    lines.append("**Note:** Educational guidance only; not medical advice. See a licensed SLP/ENT for clinical concerns.\n")
    if plan_dict["findings"]:
        lines.append("## Findings from Your Report")
        for f in plan_dict["findings"]:
            lines.append(f"- {f}")
        lines.append("")
    lines.append("## Practice Plan")
    for block in plan_dict["plan"]:
        lines.append(f"### {block['title']}")
        for item in block["items"]:
            lines.append(f"- {item}")
        lines.append("")
    return "\n".join(lines)

# ---------------------- UI ----------------------
st.title("🎤 Voice Coach Chatbox")
st.caption("Upload your **voice report PDF** and chat for tailored, non-medical guidance to improve breathing, clarity, stamina, and control.")

if "history" not in st.session_state:
    st.session_state.history = []  # list of dicts with {'role': 'user'|'assistant', 'content': str}
if "last_plan_md" not in st.session_state:
    st.session_state.last_plan_md = ""
if "report_text" not in st.session_state:
    st.session_state.report_text = ""

with st.sidebar:
    st.subheader("Export")
    if st.session_state.last_plan_md:
        st.download_button("⬇️ Download Plan (Markdown)",
                           data=st.session_state.last_plan_md.encode("utf-8"),
                           file_name="voice_plan.md",
                           mime="text/markdown")
    st.markdown("---")
    st.info("This tool provides educational tips only and **does not** diagnose conditions. Consult a qualified professional for medical concerns.")

uploaded = st.file_uploader("Upload your Voice Report (PDF)", type=["pdf"], help="We only read text—scanned images may not parse well.")

if uploaded is not None:
    file_bytes = uploaded.read()
    text = extract_text_from_pdf(file_bytes)
    st.session_state.report_text = text

    if text.startswith("[ERROR]"):
        st.error(text)
    else:
        st.success("Report loaded. Type a question below, or ask for a plan.")
        # Auto-analyze once on upload
        analysis = analyze_report(text)
        plan_md = render_plan(analysis)
        st.session_state.last_plan_md = plan_md

        with st.expander("See extracted report text"):
            st.code(text[:5000] if len(text) > 5000 else text)

        st.markdown(plan_md)

# ---------------------- Chat Section ----------------------
st.subheader("Chat")
for msg in st.session_state.history:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

prompt = st.chat_input("Ask for exercises, warm-ups, or clarifications…")

if prompt:
    st.session_state.history.append({"role": "user", "content": prompt})

    # Basic conversational routing
    reply = ""
    p = prompt.lower()

    if not st.session_state.report_text:
        reply = ("Please upload your **PDF voice report** first. After that, I can read it and craft a personalized plan. "
                 "Meanwhile, a universal warm-up: lip trills (2 min), humming slides (2 min), diaphragmatic breathing (2 min).")
    else:
        # If user asks for plan/summary explicitly
        if any(k in p for k in ["plan", "routine", "summary", "program"]):
            analysis = analyze_report(st.session_state.report_text)
            plan_md = render_plan(analysis)
            st.session_state.last_plan_md = plan_md
            reply = plan_md
        # If user asks for breathing help
        elif any(k in p for k in ["breath", "breathing", "diaphragm", "support"]):
            reply = (
                "### Breathing Mini-Block (6–8 min)\n"
                "- **Diaphragmatic breaths**: inhale 4, hold 4, exhale 6 × 10.\n"
                "- **Sustained /sss/**: steady air for as long as comfortable × 6.\n"
                "- **Straw phonation (air → voice)**: 3 × 60s.\n"
                "- **Reading with planned breaths**: mark commas/periods, breathe there."
            )
        # If user asks about hoarseness/fatigue
        elif any(k in p for k in ["hoarse", "fatigue", "tired", "raspy"]):
            reply = (
                "### Anti-Fatigue Toolkit\n"
                "- Hydrate frequently; warm/room-temp water.\n"
                "- **SOVT** (straw/lip trill) 5–8 minutes/day in short sets.\n"
                "- Micro-rests: 5 min quiet each hour of heavy use.\n"
                "- Avoid throat clearing; try a **silent cough** or sip water."
            )
        # Catch-all: give targeted tip plus invite follow-up
        else:
            reply = (
                "Here’s a versatile set you can try now:\n\n"
                "- **Warm-up**: lip or tongue trills (2 min) → hum slides (2 min).\n"
                "- **Articulation**: exaggerated tongue twisters, slow to natural (3 min).\n"
                "- **Resonance**: 'mmm' to 'ma' keeping forward buzz (2 min).\n\n"
                "Tell me what your report says about jitter, shimmer, MPT, or S/Z ratio and I’ll tailor this further."
            )

    st.session_state.history.append({"role": "assistant", "content": reply})
    with st.chat_message("assistant"):
        st.markdown(reply)
