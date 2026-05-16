'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Eye, Search, Loader2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const ESTADO_CFG: Record<string, { label: string; color: string }> = {
    confirmado: { label: 'Confirmado', color: '#3B82F6' },
    en_preparacion: { label: 'En preparación', color: '#F59E0B' },
    despachado: { label: 'Despachado', color: '#8B5CF6' },
    entregado: { label: 'Entregado', color: '#22C55E' },
    cancelado: { label: 'Cancelado', color: '#EF4444' },
};

const PAGO_CFG: Record<string, { label: string; color: string }> = {
    pendiente: { label: 'Pendiente', color: '#F59E0B' },
    pagado: { label: 'Pagado', color: '#22C55E' },
    parcial: { label: 'Parcial', color: '#F97316' },
};

function PedidosAdminContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [buscar, setBuscar] = useState('');

    const cargar = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 100 };
            if (filtro !== 'todos') params.estado = filtro;
            const res = await ordersApi.list(params);
            setOrders(res.data.pedidos || []);
        } catch {
            toast.error('Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [filtro]);

    const filtros = [
        { value: 'todos', label: 'Todos' },
        { value: 'confirmado', label: 'Confirmados' },
        { value: 'en_preparacion', label: 'En preparación' },
        { value: 'despachado', label: 'Despachados' },
        { value: 'entregado', label: 'Entregados' },
        { value: 'cancelado', label: 'Cancelados' },
    ];

    const filtrados = orders.filter(o =>
        !buscar ||
        o.numero?.toLowerCase().includes(buscar.toLowerCase()) ||
        (o.empresa as any)?.razon_social?.toLowerCase().includes(buscar.toLowerCase())
    );

    const pendientesPrep = orders.filter(o => o.estado === 'confirmado').length;

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '26px', color: '#fff', marginBottom: '4px' }}>Gestión de Pedidos</h1>
                        <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>{orders.length} pedidos en el sistema</p>
                    </div>
                    {pendientesPrep > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>
                                {pendientesPrep} {pendientesPrep === 1 ? 'pedido confirmado' : 'pedidos confirmados'} sin preparar
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                        {filtros.map(f => (
                            <button key={f.value} onClick={() => setFiltro(f.value)}
                                className={`badge-outline ${filtro === f.value ? 'badge-outline-active' : ''}`}
                                style={{ cursor: 'pointer', border: 'none', fontSize: '13px' }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '240px', flexShrink: 0 }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-content-muted)', pointerEvents: 'none' }} />
                        <input type="text" placeholder="Buscar empresa o número..." value={buscar}
                            onChange={e => setBuscar(e.target.value)}
                            className="input-dark" style={{ paddingLeft: '34px', fontSize: '13px', paddingTop: '8px', paddingBottom: '8px' }} />
                    </div>
                </div>

                <div className="card-dark" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <Loader2 size={28} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <ShoppingBag size={40} color="var(--color-content-muted)" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ color: 'var(--color-content-muted)', fontSize: '14px' }}>No hay pedidos con estos filtros</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                                    {['Número', 'Empresa', 'Fecha', 'Total', 'Estado', 'Pago', 'Acciones'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map(order => {
                                    const cfg = ESTADO_CFG[order.estado];
                                    const pago = PAGO_CFG[order.estado_pago];
                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{order.numero}</p>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{(order.empresa as any)?.razon_social || '—'}</p>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-content-secondary)', whiteSpace: 'nowrap' }}>
                                                {formatDate((order as any).created_at || (order as any).createdAt)}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-brand)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                                {formatPrice(order.total)}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: `${cfg?.color}18`, color: cfg?.color, border: `1px solid ${cfg?.color}30`, whiteSpace: 'nowrap' }}>
                                                    {cfg?.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: `${pago?.color}15`, color: pago?.color, whiteSpace: 'nowrap' }}>
                                                    {pago?.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Link href={`/admin/pedidos/${order.id}`}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: order.estado === 'confirmado' ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)', border: `1px solid ${order.estado === 'confirmado' ? 'var(--color-brand)' : 'var(--color-border)'}`, borderRadius: '10px', color: order.estado === 'confirmado' ? '#000' : '#fff', fontSize: '13px', textDecoration: 'none', fontWeight: order.estado === 'confirmado' ? 700 : 500 }}>
                                                    <Eye size={14} />
                                                    {order.estado === 'confirmado' ? 'Preparar' : 'Ver'}
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminPedidosPage() {
    return <AuthGuard roles={['admin', 'vendedor']}><PedidosAdminContent /></AuthGuard>;
}