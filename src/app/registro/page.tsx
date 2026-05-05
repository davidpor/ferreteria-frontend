// src/app/registro/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HardHat, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { validarCuit } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  // Empresa
  razon_social:  z.string().min(3, 'Mínimo 3 caracteres'),
  cuit:          z.string().refine(validarCuit, 'CUIT inválido. Formato: XX-XXXXXXXX-X'),
  condicion_iva: z.enum(['responsable_inscripto','monotributista','exento'], {
    errorMap: () => ({ message: 'Seleccioná una opción' })
  }),
  ciudad:        z.string().min(2, 'Requerido'),
  provincia:     z.string().min(2, 'Requerido'),
  telefono:      z.string().optional(),
  // Usuario
  nombre:        z.string().min(2, 'Requerido'),
  apellido:      z.string().min(2, 'Requerido'),
  email:         z.string().email('Email inválido'),
  password:      z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirmar:     z.string(),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
});

type FormData = z.infer<typeof schema>;

// Componente campo reutilizable
const Campo = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
      {label}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

export default function RegistroPage() {
  const router  = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const [exito,    setExito]    = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setApiError('');
    try {
      await authApi.register({
        empresa: {
          razon_social:  data.razon_social,
          cuit:          data.cuit,
          condicion_iva: data.condicion_iva,
          ciudad:        data.ciudad,
          provincia:     data.provincia,
          telefono:      data.telefono,
        },
        usuario: {
          nombre:   data.nombre,
          apellido: data.apellido,
          email:    data.email,
          password: data.password,
        },
      });
      setExito(true);
    } catch (err: any) {
      setApiError(err?.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (exito) return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div className="card-dark animate-fade-up" style={{ maxWidth: '480px', width: '100%', padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={32} color="#22c55e" />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '24px', color: '#fff', marginBottom: '12px' }}>
          ¡Registro exitoso!
        </h2>
        <p style={{ color: 'var(--color-content-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Tu empresa fue registrada. Nuestro equipo revisará tu solicitud y activará tu cuenta en las próximas <strong style={{ color: '#fff' }}>24 horas hábiles</strong>.
        </p>
        <Link href="/login" className="btn-brand" style={{ justifyContent: 'center' }}>
          Ir al login
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)',
      padding: '3rem 1rem',
      background: 'radial-gradient(ellipse at 40% 20%, rgba(245,166,35,0.05) 0%, transparent 60%), var(--color-bg-base)',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--color-brand)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <HardHat size={26} color="#000" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '26px', color: '#fff', marginBottom: '6px' }}>
            Registrar empresa
          </h1>
          <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
            Creá tu cuenta mayorista para acceder a precios y condiciones especiales
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {apiError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '1.5rem' }}>
              <AlertCircle size={16} color="#f87171" />
              <p style={{ fontSize: '13px', color: '#f87171' }}>{apiError}</p>
            </div>
          )}

          {/* Datos de la empresa */}
          <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-brand)', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              Datos de la empresa
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Campo label="Razón social *" error={errors.razon_social?.message}>
                  <input {...register('razon_social')} placeholder="Ferretería López SA" className={`input-dark ${errors.razon_social ? 'input-error' : ''}`} />
                </Campo>
              </div>
              <Campo label="CUIT *" error={errors.cuit?.message}>
                <input {...register('cuit')} placeholder="20-12345678-9" className={`input-dark ${errors.cuit ? 'input-error' : ''}`} />
              </Campo>
              <Campo label="Condición IVA *" error={errors.condicion_iva?.message}>
                <select {...register('condicion_iva')} className={`input-dark ${errors.condicion_iva ? 'input-error' : ''}`}
                  style={{ cursor: 'pointer' }}>
                  <option value="">Seleccioná...</option>
                  <option value="responsable_inscripto">Responsable Inscripto</option>
                  <option value="monotributista">Monotributista</option>
                  <option value="exento">Exento</option>
                </select>
              </Campo>
              <Campo label="Ciudad *" error={errors.ciudad?.message}>
                <input {...register('ciudad')} placeholder="Mendoza" className={`input-dark ${errors.ciudad ? 'input-error' : ''}`} />
              </Campo>
              <Campo label="Provincia *" error={errors.provincia?.message}>
                <input {...register('provincia')} placeholder="Mendoza" className={`input-dark ${errors.provincia ? 'input-error' : ''}`} />
              </Campo>
              <div style={{ gridColumn: 'span 2' }}>
                <Campo label="Teléfono" error={errors.telefono?.message}>
                  <input {...register('telefono')} placeholder="2614001234" className="input-dark" />
                </Campo>
              </div>
            </div>
          </div>

          {/* Datos del usuario */}
          <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-brand)', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              Datos del contacto principal
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Campo label="Nombre *" error={errors.nombre?.message}>
                <input {...register('nombre')} placeholder="Carlos" className={`input-dark ${errors.nombre ? 'input-error' : ''}`} />
              </Campo>
              <Campo label="Apellido *" error={errors.apellido?.message}>
                <input {...register('apellido')} placeholder="López" className={`input-dark ${errors.apellido ? 'input-error' : ''}`} />
              </Campo>
              <div style={{ gridColumn: 'span 2' }}>
                <Campo label="Email *" error={errors.email?.message}>
                  <input {...register('email')} type="email" placeholder="carlos@empresa.com" className={`input-dark ${errors.email ? 'input-error' : ''}`} />
                </Campo>
              </div>
              <Campo label="Contraseña *" error={errors.password?.message}>
                <input {...register('password')} type="password" placeholder="Mínimo 8 caracteres" className={`input-dark ${errors.password ? 'input-error' : ''}`} />
              </Campo>
              <Campo label="Confirmar contraseña *" error={errors.confirmar?.message}>
                <input {...register('confirmar')} type="password" placeholder="Repetí la contraseña" className={`input-dark ${errors.confirmar ? 'input-error' : ''}`} />
              </Campo>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Registrando...</>
            ) : 'Crear cuenta mayorista'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '14px', color: 'var(--color-content-secondary)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}