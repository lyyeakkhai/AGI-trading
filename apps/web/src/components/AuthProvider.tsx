'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext<{ csrfToken: string | null; setCsrfToken: (token: string) => void }>({ 
    csrfToken: null, 
    setCsrfToken: () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!csrfToken && pathname !== '/login' && !pathname.startsWith('/design-system')) {
            router.push('/login');
        }
    }, [csrfToken, pathname, router]);

    return (
        <AuthContext.Provider value={{ csrfToken, setCsrfToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
