from __future__ import annotations

from decimal import Decimal
import re
from typing import Any

# Check if vaderSentiment is available, otherwise use deterministic fallback
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer  # type: ignore

    _vader_analyzer = SentimentIntensityAnalyzer()
except ImportError:
    _vader_analyzer = None

# Lexicon for deterministic fallback sentiment scoring
_BULLISH_TERMS = {
    "bullish": 0.8,
    "breakout": 0.7,
    "pump": 0.6,
    "rally": 0.7,
    "surge": 0.7,
    "moon": 0.6,
    "buying": 0.5,
    "accumulate": 0.6,
    "long": 0.5,
    "support": 0.4,
    "gain": 0.5,
    "high": 0.4,
    "ath": 0.8,
    "upgrade": 0.6,
    "adoption": 0.6,
    "approval": 0.7,
    "inflow": 0.6,
}

_BEARISH_TERMS = {
    "bearish": -0.8,
    "breakdown": -0.7,
    "dump": -0.7,
    "crash": -0.8,
    "drop": -0.5,
    "plunge": -0.7,
    "selling": -0.5,
    "short": -0.5,
    "resistance": -0.4,
    "loss": -0.5,
    "low": -0.4,
    "hack": -0.9,
    "exploit": -0.9,
    "ban": -0.8,
    "outflow": -0.6,
    "scam": -0.9,
    "rug": -0.9,
    "liquidation": -0.6,
}

_URL_REGEX = re.compile(r"https?://\S+|www\.\S+")
_CASHTAG_REGEX = re.compile(r"\$[A-Za-z0-9_]+")
_HASHTAG_REGEX = re.compile(r"#[A-Za-z0-9_]+")


def analyze_sentiment(text: str) -> Decimal:
    """Analyze sentiment of text using local NLP, returning score from -1.0 to 1.0."""
    if not text or not text.strip():
        return Decimal("0.0")

    if _vader_analyzer is not None:
        scores = _vader_analyzer.polarity_scores(text)
        compound = Decimal(str(round(scores["compound"], 4)))
        return max(Decimal("-1.0"), min(Decimal("1.0"), compound))

    # Deterministic fallback lexicon scoring
    words = re.findall(r"\b\w+\b", text.lower())
    if not words:
        return Decimal("0.0")

    score = 0.0
    matches = 0
    for word in words:
        if word in _BULLISH_TERMS:
            score += _BULLISH_TERMS[word]
            matches += 1
        elif word in _BEARISH_TERMS:
            score += _BEARISH_TERMS[word]
            matches += 1

    if matches == 0:
        return Decimal("0.0")

    normalized = score / max(1, matches)
    return Decimal(str(round(max(-1.0, min(1.0, normalized)), 4)))


def calculate_spam_score(
    text: str,
    author_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> Decimal:
    """Calculate spam probability (0.0 to 1.0) using heuristic rules.

    Flags:
    - Excessive URLs (> 3 URLs -> +0.6)
    - Excessive cashtags/hashtags (> 5 -> +0.5)
    - Typical spam/airdrop phrases (+0.5)
    """
    if not text:
        return Decimal("1.0")

    spam_penalty = 0.0

    urls = _URL_REGEX.findall(text)
    if len(urls) >= 4:
        spam_penalty += 0.7
    elif len(urls) >= 2:
        spam_penalty += 0.3

    cashtags = _CASHTAG_REGEX.findall(text)
    hashtags = _HASHTAG_REGEX.findall(text)
    total_tags = len(cashtags) + len(hashtags)
    if total_tags >= 6:
        spam_penalty += 0.6
    elif total_tags >= 4:
        spam_penalty += 0.3

    text_lower = text.lower()
    spam_phrases = [
        "guaranteed 100x",
        "airdrop claim",
        "free crypto",
        "send eth to",
        "send btc to",
        "connect wallet here",
        "whitelist bonus",
        "giveaway now",
    ]
    for phrase in spam_phrases:
        if phrase in text_lower:
            spam_penalty += 0.6
            break

    score = min(1.0, max(0.0, spam_penalty))
    return Decimal(str(round(score, 4)))


def is_spam(text: str, threshold: Decimal = Decimal("0.6")) -> bool:
    """Convenience helper returning True if text exceeds spam threshold."""
    return calculate_spam_score(text) >= threshold
