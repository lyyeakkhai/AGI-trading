from __future__ import annotations

from datetime import datetime, timezone
import numpy as np
import pandas as pd
import pytest

from packages.quant.structure import (
    calculate_rvol,
    detect_swing_highs_lows,
    detect_swing_points,
    detect_volume_anomalies,
    identify_key_levels,
)


def test_detect_swing_highs_lows() -> None:
    # A clear peak at index 5 and trough at index 10
    highs = [10.0, 11.0, 12.0, 13.0, 14.0, 20.0, 14.0, 13.0, 12.0, 11.0, 10.0]
    lows = [9.0, 10.0, 11.0, 12.0, 13.0, 19.0, 13.0, 12.0, 11.0, 10.0, 5.0]

    swing_h, swing_l = detect_swing_highs_lows(highs, lows, window=2)
    assert len(swing_h) >= 1
    assert any(idx == 5 and price == 20.0 for idx, price in swing_h)


def test_detect_swing_points_dataframe() -> None:
    n = 20
    df = pd.DataFrame(
        {
            "timestamp": [
                datetime(2026, 1, 1, i, 0, tzinfo=timezone.utc) for i in range(n)
            ],
            "high": [10.0 + (5.0 if i == 7 else 0.0) for i in range(n)],
            "low": [5.0 - (3.0 if i == 14 else 0.0) for i in range(n)],
            "close": [8.0] * n,
            "volume": [100.0] * n,
        }
    )

    pts = detect_swing_points(df, window=3)
    high_pts = [p for p in pts if p.is_high]
    low_pts = [p for p in pts if not p.is_high]

    assert any(p.index == 7 and p.price == 15.0 for p in high_pts)
    assert any(p.index == 14 and p.price == 2.0 for p in low_pts)


def test_calculate_rvol() -> None:
    # 25 bars with constant volume 100, then bar 24 has 300 volume
    volumes = [100.0] * 24 + [300.0]
    rvol = calculate_rvol(volumes, period=20)
    assert len(rvol) == 25
    assert np.isnan(rvol[0])
    assert np.isnan(rvol[18])
    assert rvol[19] == pytest.approx(1.0)
    # The last bar: SMA of last 20 = (19*100 + 300)/20 = 2200/20 = 110
    # rvol = 300 / 110 = 2.7272
    assert rvol[24] == pytest.approx(300.0 / 110.0)


def test_detect_volume_anomalies() -> None:
    volumes = [100.0] * 24 + [500.0]
    anomalies = detect_volume_anomalies(volumes, period=20, threshold=2.0)
    assert len(anomalies) == 25
    assert not anomalies[19]
    assert anomalies[24]


def test_identify_key_levels() -> None:
    swing_highs = [(5, 100.0), (12, 100.5), (20, 150.0)]
    swing_lows = [(3, 50.0), (10, 50.2), (18, 70.0)]

    levels = identify_key_levels(swing_highs, swing_lows, tolerance=0.01)
    assert len(levels["resistance"]) == 2
    assert levels["resistance"][0] == pytest.approx(100.25)
    assert levels["resistance"][1] == pytest.approx(150.0)

    assert len(levels["support"]) == 2
    assert levels["support"][0] == pytest.approx(50.1)
    assert levels["support"][1] == pytest.approx(70.0)
