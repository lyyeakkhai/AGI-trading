'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ColorType } from 'lightweight-charts';
import { useParams } from 'next/navigation';

export default function MarketPage() {
    const params = useParams();
    const symbol = (params.symbol as string) || '';
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!symbol) return;
        fetch(`/api/v1/owner/market/candles?symbol=${symbol}`)
            .then(res => res.json())
            .then(data => setChartData(data))
            .catch(err => console.error(err));
    }, [symbol]);

    useEffect(() => {
        if (!chartContainerRef.current || chartData.length === 0) return;

        const chart: IChartApi = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#111827' }, textColor: '#d1d5db' },
            grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: { timeVisible: true, secondsVisible: false },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
            wickUpColor: '#10b981', wickDownColor: '#ef4444'
        });

        candlestickSeries.setData(chartData as any);

        const ws = new WebSocket(`ws://${window.location.host}/api/v1/ws/stream`);
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'market.tick') {
                // update logic
            }
        };

        const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            ws.close();
            chart.remove();
        };
    }, [chartData]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Market: {symbol.replace('-', '/')}</h1>
            <div ref={chartContainerRef} className="w-full h-[400px] bg-gray-800 rounded border border-gray-700" />
        </div>
    );
}
