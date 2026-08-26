'use client';
import { useState } from 'react';

export default function ProposalsPage() {
    const [status, setStatus] = useState<string | null>(null);

    const approve = async (id: string) => {
        try {
            const res = await fetch(`/api/v1/owner/proposals/${id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) setStatus('Approved!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Pending Proposals</h1>
            {status && <div className="bg-green-600 text-white p-2 mb-4 rounded">{status}</div>}
            <div className="bg-gray-800 p-4 rounded shadow flex justify-between items-center">
                <div>
                    <h3 className="font-bold">Trade: BUY BTC</h3>
                    <div className="text-sm text-gray-400">Amount: 0.1 BTC @ $50,000</div>
                    <div className="text-xs text-red-400 mt-1">Expires in: 295s</div>
                </div>
                <button onClick={() => approve('prop_123')} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold text-white">
                    Approve
                </button>
            </div>
        </div>
    );
}
