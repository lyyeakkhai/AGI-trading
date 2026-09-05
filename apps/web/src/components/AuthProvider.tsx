'use client';
import React, { createContext, useContext, useState } from 'react';

const DEFAULT_DEV_TOKEN = 'mock-owner-csrf-token';

const AuthContext = createContext<{ 
    csrfToken: string | null; 
    setCsrfToken: (token: string | null) => void;
    isAuthenticated: boolean;
}>({ 
    csrfToken: DEFAULT_DEV_TOKEN, 
    setCsrfToken: () => {},
    isAuthenticated: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Default to authenticated in paper/simulation mode so user can view all dashboard workspaces
    const [csrfToken, setCsrfToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('agi_csrf_token') || DEFAULT_DEV_TOKEN;
        }
        return DEFAULT_DEV_TOKEN;
    });

    const updateCsrfToken = (token: string | null) => {
        setCsrfToken(token);
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('agi_csrf_token', token);
            } else {
                localStorage.removeItem('agi_csrf_token');
            }
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                csrfToken, 
                setCsrfToken: updateCsrfToken,
                isAuthenticated: Boolean(csrfToken) 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
