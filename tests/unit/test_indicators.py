from __future__ import annotations

import numpy as np
import pytest

from packages.quant import fallback, indicators


def test_sma_calculation() -> None:
    data = [10.0, 20.0, 30.0, 40.0, 50.0]
    res = fallback.sma(data, period=3)
    assert len(res) == 5
    assert np.isnan(res[0])
    assert np.isnan(res[1])
    assert res[2] == pytest.approx(20.0)
    assert res[3] == pytest.approx(30.0)
    assert res[4] == pytest.approx(40.0)


def test_sma_edge_cases() -> None:
    assert len(fallback.sma([], period=5)) == 0
    short_res = fallback.sma([1.0, 2.0], period=5)
    assert len(short_res) == 2
    assert np.all(np.isnan(short_res))

    with pytest.raises(ValueError, match="positive"):
        fallback.sma([1.0, 2.0], period=0)


def test_ema_calculation() -> None:
    data = [10.0, 20.0, 30.0, 40.0, 50.0]
    period = 3
    # period=3 -> alpha = 2/(3+1) = 0.5
    # SMA seed at index 2: (10+20+30)/3 = 20.0
    # index 3: 0.5*40.0 + 0.5*20.0 = 30.0
    # index 4: 0.5*50.0 + 0.5*30.0 = 40.0
    res = fallback.ema(data, period=period)
    assert np.isnan(res[0])
    assert np.isnan(res[1])
    assert res[2] == pytest.approx(20.0)
    assert res[3] == pytest.approx(30.0)
    assert res[4] == pytest.approx(40.0)


def test_ema_edge_cases() -> None:
    assert len(fallback.ema([], period=5)) == 0
    short_res = fallback.ema([1.0, 2.0], period=5)
    assert np.all(np.isnan(short_res))

    with pytest.raises(ValueError, match="positive"):
        fallback.ema([1.0, 2.0], period=0)


def test_rsi_calculation() -> None:
    # Pure uptrend -> RSI should approach 100
    uptrend = [float(i) for i in range(1, 30)]
    res = fallback.rsi(uptrend, period=14)
    assert np.all(np.isnan(res[:14]))
    assert not np.isnan(res[14])
    assert res[14] == pytest.approx(100.0)

    # Pure downtrend -> RSI should approach 0
    downtrend = [float(30 - i) for i in range(30)]
    res_down = fallback.rsi(downtrend, period=14)
    assert np.all(np.isnan(res_down[:14]))
    assert res_down[14] == pytest.approx(0.0)


def test_rsi_constant_data() -> None:
    constant = [100.0] * 30
    res = fallback.rsi(constant, period=14)
    assert res[14] == pytest.approx(50.0)


def test_macd_calculation() -> None:
    np.random.seed(42)
    data = np.cumsum(np.random.randn(100)) + 100.0
    macd_line, signal_line, hist = fallback.macd(
        data, fastperiod=12, slowperiod=26, signalperiod=9
    )

    assert len(macd_line) == 100
    assert len(signal_line) == 100
    assert len(hist) == 100

    # macd_line should have NaNs before slowperiod - 1 (index 25)
    assert np.all(np.isnan(macd_line[:25]))
    assert not np.isnan(macd_line[25])

    # signal_line should have NaNs before slowperiod - 1 + signalperiod - 1 (index 25 + 8 = 33)
    assert np.all(np.isnan(signal_line[:33]))
    assert not np.isnan(signal_line[33])

    # hist = macd_line - signal_line for valid signal_line
    valid_idx = ~np.isnan(signal_line)
    np.testing.assert_allclose(hist[valid_idx], macd_line[valid_idx] - signal_line[valid_idx])


def test_stddev_calculation() -> None:
    data = [10.0, 10.0, 10.0, 10.0, 10.0]
    res = fallback.stddev(data, period=3)
    assert np.isnan(res[0])
    assert np.isnan(res[1])
    assert res[2] == pytest.approx(0.0)
    assert res[3] == pytest.approx(0.0)

    # variance = ((10-20)^2 + (20-20)^2 + (30-20)^2)/3 = 200/3
    data2 = [10.0, 20.0, 30.0]
    res2 = fallback.stddev(data2, period=3)
    assert res2[2] == pytest.approx(np.sqrt(200.0 / 3.0))


def test_atr_calculation() -> None:
    high = [10.0, 12.0, 15.0, 14.0, 16.0] * 5
    low = [9.0, 10.0, 12.0, 11.0, 13.0] * 5
    close = [9.5, 11.5, 13.5, 12.5, 15.0] * 5

    res = fallback.atr(high, low, close, period=14)
    assert len(res) == len(high)
    assert np.all(np.isnan(res[:14]))
    assert not np.isnan(res[14])
    assert np.all(res[14:] > 0)


def test_adx_calculation() -> None:
    # 50 candles of trending data
    high = [float(i + 2) for i in range(50)]
    low = [float(i) for i in range(50)]
    close = [float(i + 1) for i in range(50)]

    res = fallback.adx(high, low, close, period=14)
    assert len(res) == 50
    # First valid ADX is at index 2*period - 1 = 27
    assert np.all(np.isnan(res[:27]))
    assert not np.isnan(res[27])
    assert np.all((res[27:] >= 0) & (res[27:] <= 100))


def test_indicators_interface_and_graceful_degradation() -> None:
    assert isinstance(indicators.TALIB_AVAILABLE, bool)

    data = [float(i) for i in range(1, 30)]
    res_sma = indicators.sma(data, period=5)
    assert len(res_sma) == len(data)
    assert res_sma[4] == pytest.approx(3.0)

    res_ema = indicators.ema(data, period=5)
    assert len(res_ema) == len(data)

    res_rsi = indicators.rsi(data, period=14)
    assert len(res_rsi) == len(data)
