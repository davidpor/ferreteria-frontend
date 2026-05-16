'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function PagoExitosoPage() {
    const { id } = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Esperamos un momento para que el webhook de MP actualice el estado
        const timer = setTimeout(() => {
            ordersApi.getById(Number(id))
                .then(r => setOrder(r.data.pedido))
                .catch(() => { })
                .finally(() => setLoading(false));
        }, 2000);
        return () => clearTimeout(timer);
    }, [id]);

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            background: 'var(--color-bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="card-dark animate-fade-up" style={{ maxWidth: '480px', width: '100%', padding: '3rem', textAlign: 'center' }}>

                {/* Ícono de éxito */}
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(34,197,94,0.1)',
                    border: '3px solid #22C55E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 0 40px rgba(34,197,94,0.2)',
                }}>
                    <CheckCircle2 size={40} color="#22C55E" />
                </div>

                <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '12px' }}>
                    ¡Pago exitoso!
                </h1>

                <p style={{ color: 'var(--color-content-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Tu pago fue procesado correctamente por Mercado Pago.
                    El estado de tu pedido se actualizará en breve.
                </p>

                {/* Detalle del pedido */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                        <Loader2 size={24} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : order && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: 'var(--color-bg-elevated)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        marginBottom: '1.5rem',
                        textAlign: 'left',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>Pedido</span>
                            <span style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{order.numero}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>Total pagado</span>
                            <span style={{ fontSize: '15px', color: 'var(--color-brand)', fontWeight: 900 }}>{formatPrice(order.total)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>Estado de pago</span>
                            <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: 600 }}>
                                {order.estado_pago === 'pagado' ? '✓ Acreditado' : '⏳ Procesando'}
                            </span>
                        </div>
                    </div>
                )}

                {/* MP Payment ID */}
                {searchParams.get('payment_id') && (
                    <p style={{ fontSize: '12px', color: 'var(--color-content-muted)', marginBottom: '1.5rem' }}>
                        ID de transacción: <span style={{ fontFamily: 'monospace' }}>{searchParams.get('payment_id')}</span>
                    </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href={`/mis-pedidos/${id}`} className="btn-brand" style={{ justifyContent: 'center', fontSize: '14px' }}>
                        <ShoppingBag size={16} /> Ver mi pedido
                    </Link>
                    <Link href="/catalogo" className="btn-outline" style={{ justifyContent: 'center', fontSize: '14px' }}>
                        Seguir comprando <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}