'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { setCsrfToken } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, totp_code: totp })
            });
            if (!res.ok) throw new Error('Login failed');
            const data = await res.json();
            setCsrfToken(data.csrf_token);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-center">Owner Login</h1>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none"
                    required
                />
                <input 
                    type="text" 
                    placeholder="TOTP Code" 
                    value={totp}
                    onChange={(e) => setTotp(e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none"
                    required
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}
