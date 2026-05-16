'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ShoppingBag, RefreshCw } from 'lucide-react';

export default function PagoPendientePage() {
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
                    background: 'rgba(245,158,11,0.1)',
                    border: '3px solid #F59E0B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 40px rgba(245,158,11,0.15)',
                }}>
                    <Clock size={40} color="#F59E0B" />
                </div>

                <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '12px' }}>
                    Pago en proceso
                </h1>

                <p style={{ color: 'var(--color-content-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Tu pago está siendo procesado. Esto puede tardar hasta 24 horas hábiles
                    dependiendo del medio de pago elegido.
                </p>

                <div style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(245,158,11,0.06)',
                    borderRadius: '12px',
                    border: '1px solid rgba(245,158,11,0.2)',
                    marginBottom: '1.5rem',
                    textAlign: 'left',
                }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)', lineHeight: 1.7, margin: 0 }}>
                        Una vez que Mercado Pago confirme el pago, actualizaremos el estado
                        de tu pedido automáticamente y te notificaremos por email.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href={`/mis-pedidos/${id}`} className="btn-brand" style={{ justifyContent: 'center', fontSize: '14px' }}>
                        <ShoppingBag size={16} /> Ver estado del pedido
                    </Link>
                    <Link href="/mis-pedidos" className="btn-outline" style={{ justifyContent: 'center', fontSize: '14px' }}>
                        <RefreshCw size={16} /> Ver todos mis pedidos
                    </Link>
                </div>
            </div>
        </div>
    );
}