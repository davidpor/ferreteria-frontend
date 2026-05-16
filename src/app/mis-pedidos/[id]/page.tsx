'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, CheckCircle2, Clock,
  Truck, MapPin, FileText, Loader2, CreditCard
} from 'lucide-react';
import { ordersApi, paymentsApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const STEPS = [
  { key: 'confirmado',     label: 'Confirmado',     icon: CheckCircle2 },
  { key: 'en_preparacion', label: 'En preparación', icon: Package },
  { key: 'despachado',     label: 'Despachado',     icon: Truck },
  { key: 'entregado',      label: 'Entregado',      icon: CheckCircle2 },
];

const STEP_INDEX: Record<string, number> = {
  confirmado: 0, en_preparacion: 1, despachado: 2, entregado: 3, cancelado: -1
};

function DetalleContent() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    ordersApi.getById(Number(id))
      .then(r => setOrder(r.data.pedido))
      .catch(() => router.push('/mis-pedidos'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePagarMP = async () => {
    if (!order) return;
    setPagando(true);
    try {
      const res = await paymentsApi.createPreference(order.id);
      window.location.href = res.data.init_point || res.data.sandbox_url;
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al iniciar pago');
      setPagando(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={36} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!order) return null;
  const stepIdx = STEP_INDEX[order.estado] ?? 0;
  const cancelado = order.estado === 'cancelado';

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <Link href="/mis-pedidos" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', textDecoration: 'none', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Mis pedidos
          </Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{order.numero}</span>
        </div>

        {/* Timeline de estados */}
        {!cancelado && (
          <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1.5rem' }}>Estado del pedido</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STEPS.map((step, i) => {
                const done    = i <= stepIdx;
                const current = i === stepIdx;
                const Icon    = step.icon;
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: done ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                        border: `2px solid ${done ? 'var(--color-brand)' : 'var(--color-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: current ? '0 0 16px rgba(245,166,35,0.5)' : 'none',
                        transition: 'all 0.3s',
                      }}>
                        <Icon size={18} color={done ? '#000' : 'var(--color-content-muted)'} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: current ? 700 : 500, color: done ? '#fff' : 'var(--color-content-muted)', whiteSpace: 'nowrap' }}>
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: '2px', background: i < stepIdx ? 'var(--color-brand)' : 'var(--color-border)', marginBottom: '24px', transition: 'background 0.3s' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {cancelado && (
          <div style={{ padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.25rem' }}>
            <p style={{ color: '#EF4444', fontWeight: 700, marginBottom: '4px' }}>Pedido cancelado</p>
            {order.motivo_cancelacion && <p style={{ color: 'var(--color-content-secondary)', fontSize: '13px' }}>{order.motivo_cancelacion}</p>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>

          {/* Columna principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Productos */}
            <div className="card-dark" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Productos ({order.items?.length ?? 0})</h3>
              </div>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={18} color="var(--color-content-muted)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '2px' }}>{item.nombre_producto}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-content-muted)', fontFamily: 'monospace' }}>{item.sku_producto}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>x{item.cantidad}</p>
                    <p style={{ fontWeight: 700, color: 'var(--color-brand)', fontSize: '14px' }}>{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Historial de estados */}
            {order.historial && order.historial.length > 0 && (
              <div className="card-dark" style={{ padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1rem' }}>Historial</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {order.historial.map(h => (
                    <div key={h.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand)', flexShrink: 0, marginTop: '5px' }} />
                      <div>
                        <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500, textTransform: 'capitalize', marginBottom: '2px' }}>
                          {h.estado_nuevo.replace('_', ' ')}
                        </p>
                        {h.nota && <p style={{ fontSize: '12px', color: 'var(--color-content-secondary)' }}>{h.nota}</p>}
                        <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '2px' }}>{formatDate(h.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Resumen económico */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                <span style={{ fontWeight: 900, color: 'var(--color-brand)', fontSize: '20px' }}>{formatPrice(order.total)}</span>
              </div>

              {/* Estado de pago */}
              <div style={{ marginTop: '1rem', padding: '10px 12px', borderRadius: '10px', background: order.estado_pago === 'pagado' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${order.estado_pago === 'pagado' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: order.estado_pago === 'pagado' ? '#22C55E' : '#F59E0B' }}>
                  {order.estado_pago === 'pagado' ? '✓ Pago acreditado' : order.estado_pago === 'parcial' ? '⚠ Pago parcial' : '⏳ Pago pendiente'}
                </p>
              </div>

              {/* Botón pagar con MP */}
              {order.metodo_pago === 'mercado_pago' && order.estado_pago !== 'pagado' && !cancelado && (
                <button onClick={handlePagarMP} disabled={pagando} className="btn-brand"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', fontSize: '14px' }}>
                  {pagando
                    ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    : <><CreditCard size={16} /> Pagar con Mercado Pago</>
                  }
                </button>
              )}
            </div>

            {/* Info logística */}
            <div className="card-dark" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1rem' }}>Información</h3>
              {[
                { icon: CreditCard, label: 'Método de pago', value: order.metodo_pago?.replace(/_/g, ' ') },
                { icon: MapPin,     label: 'Dirección',      value: order.direccion_entrega || 'A coordinar' },
                { icon: FileText,   label: 'Remito',         value: order.numero_remito || '—' },
                { icon: FileText,   label: 'Factura',        value: order.numero_factura || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                  <Icon size={15} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontSize: '13px', color: '#fff', textTransform: 'capitalize' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetallePedidoPage() {
  return <AuthGuard roles={['cliente']}><DetalleContent /></AuthGuard>;
}