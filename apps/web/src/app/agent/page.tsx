'use client';
import { useEffect, useState, useRef } from 'react';

export default function AgentLogsPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://${window.location.host}/api/v1/ws/stream`);
        
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'agent.log' || msg.type === 'log') {
                setLogs(prev => [...prev, JSON.stringify(msg.data)]);
            }
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4">Live Agent Logs</h1>
            <div className="flex-1 bg-black font-mono text-sm p-4 overflow-auto rounded border border-gray-700">
                {logs.length === 0 ? (
                    <div className="text-gray-500">Waiting for logs...</div>
                ) : (
                    logs.map((l, i) => <div key={i} className="text-green-400">{l}</div>)
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
