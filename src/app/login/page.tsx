// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, HardHat, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

// ── Esquema de validación ──────────────────────────────────────
const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setApiError('');
    try {
      const res  = await authApi.login(data);
      const { accessToken, usuario } = res.data;
      setAuth(usuario, accessToken);
      toast.success(`¡Bienvenido, ${usuario.nombre}!`);

      // Redirige según el rol
      if (usuario.rol === 'admin' || usuario.rol === 'vendedor') {
        router.push('/admin');
      } else {
        router.push('/catalogo');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al iniciar sesión';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 60% 50%, rgba(245,166,35,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Card del formulario */}
      <div className="animate-fade-up" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '440px',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, background: 'var(--color-brand)',
            borderRadius: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <HardHat size={28} color="#000" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '6px' }}>
            Iniciar sesión
          </h1>
          <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
            Accedé a tu cuenta mayorista
          </p>
        </div>

        {/* Formulario */}
        <div className="card-dark" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Error general de la API */}
            {apiError && (
              <div className="animate-fade-in" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                marginBottom: '1.5rem',
              }}>
                <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#f87171' }}>{apiError}</p>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: 600, color: '#fff', marginBottom: '8px'
              }}>
                Email corporativo
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="empresa@ejemplo.com"
                className={`input-dark ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  Contraseña
                </label>
                <Link href="/recuperar-clave" style={{
                  fontSize: '12px', color: 'var(--color-brand)',
                  textDecoration: 'none', fontWeight: 500,
                }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-dark ${errors.password ? 'input-error' : ''}`}
                  style={{ paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', color: 'var(--color-content-muted)',
                    display: 'flex', padding: '4px',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-brand"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Ingresando...
                </>
              ) : 'Ingresar'}
            </button>

          </form>
        </div>

        {/* Link a registro */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: 'var(--color-content-secondary)' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/registro" style={{ color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none' }}>
            Registrar empresa
          </Link>
        </p>

        {/* Credenciales de prueba */}
        <div style={{
          marginTop: '1.5rem', padding: '1rem',
          background: 'rgba(245,166,35,0.05)',
          border: '1px solid rgba(245,166,35,0.15)',
          borderRadius: '12px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Credenciales de prueba
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { rol: 'Admin',   email: 'carlos@lopezsa.com',  pass: 'MiPassword123' },
            ].map(c => (
              <div key={c.rol} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-content-secondary)' }}>{c.rol}:</span>
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{c.email}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-content-secondary)' }}>Pass:</span>
              <span style={{ color: '#fff', fontFamily: 'monospace' }}>MiPassword123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}