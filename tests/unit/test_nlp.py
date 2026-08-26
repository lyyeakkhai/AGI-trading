from __future__ import annotations

from decimal import Decimal

import pytest

from services.intelligence.nlp import analyze_sentiment, calculate_spam_score, is_spam


def test_analyze_sentiment_bullish() -> None:
    text = "Bitcoin is breaking out to new all-time highs! Massive bullish rally with strong volume."
    score = analyze_sentiment(text)
    assert score > Decimal("0.3")
    assert score <= Decimal("1.0")


def test_analyze_sentiment_bearish() -> None:
    text = "Major exchange exploit reported, Bitcoin dumping hard in catastrophic crash."
    score = analyze_sentiment(text)
    assert score < Decimal("-0.3")
    assert score >= Decimal("-1.0")


def test_analyze_sentiment_neutral_empty() -> None:
    assert analyze_sentiment("") == Decimal("0.0")
    assert analyze_sentiment("   ") == Decimal("0.0")


def test_analyze_sentiment_deterministic() -> None:
    text = "Ethereum layer 2 upgrade goes live with positive adoption signals."
    score1 = analyze_sentiment(text)
    score2 = analyze_sentiment(text)
    assert score1 == score2


def test_calculate_spam_score_clean_post() -> None:
    text = "BTC holding key support level at $60,000 on the 4-hour chart."
    score = calculate_spam_score(text)
    assert score < Decimal("0.5")
    assert not is_spam(text)


def test_calculate_spam_score_excessive_links() -> None:
    text = "Check this out http://a.co http://b.co http://c.co http://d.co"
    score = calculate_spam_score(text)
    assert score >= Decimal("0.6")
    assert is_spam(text)


def test_calculate_spam_score_excessive_cashtags() -> None:
    text = "Buy now $BTC $ETH $SOL $ADA $XRP $DOGE $AVAX $DOT $BNB"
    score = calculate_spam_score(text)
    assert score >= Decimal("0.5")


def test_calculate_spam_score_scam_phrases() -> None:
    text = "Guaranteed 100x gem airdrop claim free crypto connect wallet here!"
    score = calculate_spam_score(text)
    assert score >= Decimal("0.6")
    assert is_spam(text)
