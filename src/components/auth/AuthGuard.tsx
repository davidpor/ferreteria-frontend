// src/components/auth/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: ('admin' | 'vendedor' | 'cliente')[];
}

export const AuthGuard = ({ children, roles }: AuthGuardProps) => {
  const router          = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [checking, setChecking]   = useState(true);

  useEffect(() => {
    // Esperamos a que Zustand hidrate desde localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      if (roles && user && !roles.includes(user.rol)) {
        router.replace('/catalogo');
        return;
      }
      setChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router, roles]);

  if (checking) return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-base)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Loader2 size={32} color="var(--color-brand)"
          style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
          Verificando sesión...
        </p>
      </div>
    </div>
  );

  return <>{children}</>;
};