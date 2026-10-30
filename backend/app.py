from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import json
import re
from pathlib import Path

app = Flask(__name__)
CORS(app)

FAQ_PATH = Path(__file__).with_name("faqs.json")
with FAQ_PATH.open(encoding="utf-8") as f:
    FAQS = json.load(f)

STOP_WORDS = "english"
vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words=STOP_WORDS,
    ngram_range=(1, 2),
    sublinear_tf=True
)
faq_questions = [item["question"] + " " + " ".join(item.get("keywords", [])) for item in FAQS]
FAQ_MATRIX = vectorizer.fit_transform(faq_questions)

def clean_text(value):
    value = re.sub(r"[^a-zA-Z0-9\s']", " ", value.lower())
    return re.sub(r"\s+", " ", value).strip()

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "CodeAlpha AI Tasks API"})

@app.get("/api/faqs")
def faqs():
    return jsonify(FAQS)

@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    question = clean_text(str(data.get("question", "")))
    category = data.get("category", "All")
    if not question:
        return jsonify({"error": "Please enter a question."}), 400

    candidate_ids = [
        i for i, item in enumerate(FAQS)
        if category == "All" or item.get("category") == category
    ]
    if not candidate_ids:
        return jsonify({"answer": "I couldn't find FAQs in that category yet. Try another topic.", "confidence": 0, "matched_question": None})

    query_vector = vectorizer.transform([question])
    scores = cosine_similarity(query_vector, FAQ_MATRIX[candidate_ids]).flatten()
    best_position = int(scores.argmax())
    best_index = candidate_ids[best_position]
    confidence = float(scores[best_position])
    if confidence < 0.12:
        return jsonify({
            "answer": "I’m not fully sure about that yet. Try asking about account setup, pricing, payments, features, or support.",
            "confidence": round(confidence, 3),
            "matched_question": None,
            "source": "fallback"
        })
    item = FAQS[best_index]
    return jsonify({
        "answer": item["answer"],
        "confidence": round(confidence, 3),
        "matched_question": item["question"],
        "category": item["category"],
        "source": "tfidf-cosine-similarity"
    })

@app.post("/api/translate")
def translate():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    source = str(data.get("source", "auto")).lower()
    target = str(data.get("target", "es")).lower()
    if not text:
        return jsonify({"error": "Enter text to translate."}), 400
    if len(text) > 4500:
        return jsonify({"error": "Please keep each translation under 4,500 characters."}), 400
    langpair = f"{'autodetect' if source == 'auto' else source}|{target}"
    try:
        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text, "langpair": langpair},
            timeout=18,
            headers={"User-Agent": "LinguaAI-CodeAlpha-Demo/1.0"}
        )
        response.raise_for_status()
        payload = response.json()
        translated = payload.get("responseData", {}).get("translatedText", "")
        if not translated:
            return jsonify({"error": "The translation service returned an empty response."}), 502
        return jsonify({
            "translatedText": translated,
            "source": source,
            "target": target,
            "provider": "MyMemory"
        })
    except requests.RequestException:
        return jsonify({"error": "Translation service is unavailable. Check your internet connection and try again."}), 503

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
