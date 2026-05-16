'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Loader2, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

function DetalleAdminPedidoContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [accion, setAccion] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [remito, setRemito] = useState('');
    const [factura, setFactura] = useState('');
    const [nota, setNota] = useState('');
    const [motivo, setMotivo] = useState('');

    const cargar = () => {
        ordersApi.getById(Number(id))
            .then(r => setOrder(r.data.pedido))
            .catch(() => router.push('/admin/pedidos'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, [id]);

    const cambiarEstado = async (nuevoEstado: string, datos: any = {}) => {
        setEnviando(true);
        try {
            const fn: Record<string, Function> = {
                en_preparacion: () => ordersApi.prepare(Number(id), { nota }),
                despachado: () => ordersApi.dispatch(Number(id), { numero_remito: remito, numero_factura: factura, nota }),
                entregado: () => ordersApi.deliver(Number(id), { nota }),
                cancelado: () => ordersApi.cancel(Number(id), { motivo }),
            };
            await fn[nuevoEstado]?.();
            toast.success(`Pedido ${nuevoEstado.replace('_', ' ')}`);
            setAccion(null);
            cargar();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Error al actualizar');
        } finally {
            setEnviando(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={36} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (!order) return null;

    const ACCIONES_DISPONIBLES: Record<string, { label: string; siguiente: string; color: string }[]> = {
        confirmado: [{ label: 'Iniciar preparación', siguiente: 'en_preparacion', color: '#F59E0B' }, { label: 'Cancelar pedido', siguiente: 'cancelado', color: '#EF4444' }],
        en_preparacion: [{ label: 'Marcar como despachado', siguiente: 'despachado', color: '#8B5CF6' }, { label: 'Cancelar pedido', siguiente: 'cancelado', color: '#EF4444' }],
        despachado: [{ label: 'Confirmar entrega', siguiente: 'entregado', color: '#22C55E' }],
        entregado: [],
        cancelado: [],
    };

    const accionesDisp = ACCIONES_DISPONIBLES[order.estado] || [];

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
                    <Link href="/admin/pedidos" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', textDecoration: 'none', fontSize: '14px' }}>
                        <ArrowLeft size={16} /> Pedidos
                    </Link>
                    <span style={{ color: 'var(--color-border)' }}>/</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{order.numero}</span>
                </div>

                {/* Header */}
                <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: accionesDisp.length > 0 ? '1.25rem' : 0 }}>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', marginBottom: '6px' }}>{order.numero}</h1>
                            <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                                Empresa: <strong style={{ color: '#fff' }}>{(order.empresa as any)?.razon_social}</strong>
                                {' · '}Fecha: {formatDate((order as any).created_at || (order as any).createdAt)}
                            </p>
                            {order.direccion_entrega && (
                                <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)', marginTop: '3px' }}>
                                    Entrega: {order.direccion_entrega}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {!accion && accionesDisp.map(a => (
                                <button key={a.siguiente} onClick={() => setAccion(a.siguiente)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: `${a.color}15`, border: `1px solid ${a.color}40`, borderRadius: '10px', color: a.color, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                    {a.siguiente === 'cancelado' ? <XCircle size={15} /> : a.siguiente === 'entregado' ? <CheckCircle2 size={15} /> : <Truck size={15} />}
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Panel de acción activo */}
                    {accion && (
                        <div style={{ padding: '1.25rem', background: 'var(--color-bg-elevated)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1rem', textTransform: 'capitalize' }}>
                                {accion.replace('_', ' ')}
                            </h3>

                            {accion === 'despachado' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>N° Remito</label>
                                        <input value={remito} onChange={e => setRemito(e.target.value)} placeholder="REM-001234" className="input-dark" style={{ fontSize: '13px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>N° Factura</label>
                                        <input value={factura} onChange={e => setFactura(e.target.value)} placeholder="FAC-A-001234" className="input-dark" style={{ fontSize: '13px' }} />
                                    </div>
                                </div>
                            )}

                            {accion === 'cancelado' ? (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Motivo de cancelación *</label>
                                    <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Explicá el motivo..." className="input-dark" rows={2} style={{ resize: 'vertical', fontSize: '13px', fontFamily: 'inherit' }} />
                                </div>
                            ) : (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nota interna (opcional)</label>
                                    <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Observaciones..." className="input-dark" style={{ fontSize: '13px' }} />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setAccion(null)} className="btn-ghost" style={{ fontSize: '13px' }}>Cancelar</button>
                                <button onClick={() => cambiarEstado(accion)} disabled={enviando}
                                    className={accion === 'cancelado' ? 'btn-danger' : 'btn-brand'}
                                    style={{ fontSize: '13px' }}>
                                    {enviando ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem' }}>

                    {/* Productos + historial */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="card-dark" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Productos</h3>
                            </div>
                            {order.items?.map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Package size={16} color="var(--color-content-muted)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '2px' }}>{item.nombre_producto}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', fontFamily: 'monospace' }}>{item.sku_producto}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>x{item.cantidad}</p>
                                        <p style={{ fontWeight: 700, color: 'var(--color-brand)', fontSize: '14px' }}>{formatPrice(item.subtotal)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {order.historial && order.historial.length > 0 && (
                            <div className="card-dark" style={{ padding: '1.25rem 1.5rem' }}>
                                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1rem' }}>Historial</h3>
                                {order.historial.map(h => (
                                    <div key={h.id} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand)', flexShrink: 0, marginTop: '5px' }} />
                                        <div>
                                            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, textTransform: 'capitalize' }}>{h.estado_nuevo.replace('_', ' ')}</p>
                                            {h.nota && <p style={{ fontSize: '12px', color: 'var(--color-content-secondary)' }}>{h.nota}</p>}
                                            <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '2px' }}>{formatDate(h.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card-dark" style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1rem' }}>Resumen</h3>
                            {[
                                { label: 'Subtotal', value: formatPrice(order.subtotal) },
                                { label: `IVA (${order.iva_porcentaje}%)`, value: formatPrice(order.iva_monto) },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--color-content-secondary)' }}>{label}</span>
                                    <span style={{ color: '#fff' }}>{value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                                <span style={{ fontWeight: 900, color: 'var(--color-brand)', fontSize: '18px' }}>{formatPrice(order.total)}</span>
                            </div>
                            {[
                                { label: 'Método de pago', value: order.metodo_pago?.replace(/_/g, ' ') },
                                { label: 'Estado de pago', value: order.estado_pago },
                                ...(order.numero_remito ? [{ label: 'N° Remito', value: order.numero_remito }] : []),
                                ...(order.numero_factura ? [{ label: 'N° Factura', value: order.numero_factura }] : []),
                            ].map(({ label, value }) => (
                                <div key={label} style={{ marginBottom: '8px' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                                    <p style={{ fontSize: '13px', color: '#fff', textTransform: 'capitalize' }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPedidoDetallePage() {
    return <AuthGuard roles={['admin', 'vendedor']}><DetalleAdminPedidoContent /></AuthGuard>;
}