'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RotateCcw, MessageCircle } from 'lucide-react';

export default function PagoFallidoPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            background: 'var(--color-bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="card-dark animate-fade-up" style={{ maxWidth: '480px', width: '100%', padding: '3rem', textAlign: 'center' }}>

                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)',
                    border: '3px solid #EF4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <XCircle size={40} color="#EF4444" />
                </div>

                <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '12px' }}>
                    El pago no se completó
                </h1>

                <p style={{ color: 'var(--color-content-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Hubo un problema al procesar tu pago. Tu pedido sigue activo y podés intentarlo nuevamente.
                </p>

                <div style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(239,68,68,0.06)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239,68,68,0.2)',
                    marginBottom: '1.5rem',
                    textAlign: 'left',
                }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)', lineHeight: 1.7, margin: 0 }}>
                        Posibles causas: saldo insuficiente, tarjeta rechazada o sesión expirada.
                        Si el problema persiste contactá a tu banco o elegí otro método de pago.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href={`/mis-pedidos/${id}`} className="btn-brand" style={{ justifyContent: 'center', fontSize: '14px' }}>
                        <RotateCcw size={16} /> Volver al pedido e intentar de nuevo
                    </Link>
                    <a href="tel:02614001234" className="btn-outline" style={{ justifyContent: 'center', fontSize: '14px', textDecoration: 'none' }}>
                        <MessageCircle size={16} /> Contactar soporte
                    </a>
                </div>
            </div>
        </div>
    );
}