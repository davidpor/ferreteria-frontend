'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Loader2, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

const ESTADO_CFG: Record<string, { label: string; color: string; step: number }> = {
  confirmado: { label: 'Confirmado', color: '#3B82F6', step: 1 },
  en_preparacion: { label: 'En preparación', color: '#F59E0B', step: 2 },
  despachado: { label: 'Despachado', color: '#8B5CF6', step: 3 },
  entregado: { label: 'Entregado', color: '#22C55E', step: 4 },
  cancelado: { label: 'Cancelado', color: '#EF4444', step: 0 },
};

const PAGO_CFG: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pago pendiente', color: '#F59E0B' },
  pagado: { label: 'Pagado', color: '#22C55E' },
  parcial: { label: 'Pago parcial', color: '#F97316' },
};

function PedidosContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    ordersApi.list(filtro !== 'todos' ? { estado: filtro } : {})
      .then(r => setOrders(r.data.pedidos || []))
      .catch(() => toast.error('Error al cargar pedidos'))
      .finally(() => setLoading(false));
  }, [filtro]);

  const filtros = [
    { value: 'todos', label: 'Todos' },
    { value: 'confirmado', label: 'Confirmados' },
    { value: 'en_preparacion', label: 'En preparación' },
    { value: 'despachado', label: 'Despachados' },
    { value: 'entregado', label: 'Entregados' },
  ];

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '4px' }}>Mis Pedidos</h1>
          <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>{orders.length} pedidos en tu cuenta</p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {filtros.map(f => (
            <button key={f.value} onClick={() => setFiltro(f.value)}
              className={`badge-outline ${filtro === f.value ? 'badge-outline-active' : ''}`}
              style={{ cursor: 'pointer', border: 'none', fontSize: '13px' }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="card-dark" style={{ padding: '4rem', textAlign: 'center' }}>
            <ShoppingBag size={48} color="var(--color-content-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>No tenés pedidos aún</h3>
            <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
              Confirmá una cotización aprobada para generar tu primer pedido.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orders.map(order => {
              const cfg = ESTADO_CFG[order.estado];
              const pago = PAGO_CFG[order.estado_pago];
              return (
                <Link key={order.id} href={`/mis-pedidos/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card-dark" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,166,35,0.4)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'}>

                    {/* Número y fecha */}
                    <div style={{ minWidth: '150px' }}>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '3px' }}>{order.numero}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-content-muted)' }}>{formatDate((order as any).created_at || (order as any).createdAt)}</p>
                    </div>

                    {/* Estado del pedido */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: `${cfg?.color}18`, color: cfg?.color, border: `1px solid ${cfg?.color}40`, minWidth: '140px', justifyContent: 'center' }}>
                      {cfg?.label}
                    </span>

                    {/* Estado de pago */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: `${pago?.color}15`, color: pago?.color }}>
                      {pago?.label}
                    </span>

                    {/* Método de pago */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', color: 'var(--color-content-secondary)', textTransform: 'capitalize' }}>
                        {order.metodo_pago?.replace('_', ' ')}
                        {order.numero_remito && <span style={{ marginLeft: '8px', color: 'var(--color-content-muted)' }}>· Remito: {order.numero_remito}</span>}
                      </p>
                    </div>q.

                    {/* Total */}
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <p style={{ fontWeight: 900, fontSize: '18px', color: 'var(--color-brand)' }}>{formatPrice(order.total)}</p>
                    </div>

                    <ChevronRight size={18} color="var(--color-content-muted)" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MisPedidosPage() {
  return <AuthGuard roles={['cliente']}><PedidosContent /></AuthGuard>;
}