'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, CheckCircle2, XCircle,
  Clock, AlertTriangle, ShoppingCart, Loader2
} from 'lucide-react';
import { quotesApi, ordersApi } from '@/lib/api';
import { Quote } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

const ESTADO_CFG: Record<string, { label: string; color: string }> = {
  borrador:   { label: 'Borrador',    color: '#6B7280' },
  pendiente:  { label: 'En revisión', color: '#F59E0B' },
  aprobada:   { label: 'Aprobada',    color: '#22C55E' },
  rechazada:  { label: 'Rechazada',   color: '#EF4444' },
  vencida:    { label: 'Vencida',     color: '#F97316' },
  convertida: { label: 'Convertida',  color: '#3B82F6' },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function DetalleContent() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [quote,      setQuote]      = useState<Quote | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [metodoPago,  setMetodoPago]  = useState('transferencia');
  const [direccion,   setDireccion]   = useState('');

  useEffect(() => {
    quotesApi.getById(Number(id))
      .then(r => setQuote(r.data.cotizacion))
      .catch(() => router.push('/mis-cotizaciones'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConvertir = async () => {
    if (!quote) return;
    setConvirtiendo(true);
    try {
      const res = await ordersApi.fromQuote(quote.id, {
        metodo_pago: metodoPago,
        direccion_entrega: direccion,
      });
      toast.success(`Pedido ${res.data.pedido.numero} generado`);
      router.push(`/mis-pedidos/${res.data.pedido.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al generar pedido');
      setConvirtiendo(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={36} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!quote) return null;
  const cfg = ESTADO_CFG[quote.estado] || ESTADO_CFG.borrador;

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <Link href="/mis-cotizaciones" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', textDecoration: 'none', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Mis cotizaciones
          </Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{quote.numero}</span>
        </div>

        {/* Header de la cotización */}
        <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '24px', color: '#fff', marginBottom: '6px' }}>
                {quote.numero}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                Creada el {formatDate(quote.created_at)} · Vence el {formatDate(quote.fecha_vencimiento)}
              </p>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '999px', fontWeight: 700, fontSize: '14px',
              background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40`,
            }}>
              {quote.estado === 'aprobada' && <CheckCircle2 size={16} />}
              {quote.estado === 'rechazada' && <XCircle size={16} />}
              {['pendiente','borrador'].includes(quote.estado) && <Clock size={16} />}
              {cfg.label}
            </span>
          </div>

          {/* Nota del vendedor */}
          {quote.nota_vendedor && (
            <div style={{ marginTop: '1rem', padding: '12px 16px', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p style={{ fontSize: '13px', color: '#22C55E', fontWeight: 600, marginBottom: '3px' }}>Nota del vendedor:</p>
              <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>{quote.nota_vendedor}</p>
            </div>
          )}

          {/* Motivo de rechazo */}
          {quote.motivo_rechazo && (
            <div style={{ marginTop: '1rem', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600, marginBottom: '3px' }}>Motivo de rechazo:</p>
              <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>{quote.motivo_rechazo}</p>
            </div>
          )}
        </div>

        {/* Tabla de productos */}
        <div className="card-dark" style={{ overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>
              Productos ({quote.items?.length ?? 0})
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-elevated)' }}>
                  {['Producto', 'SKU', 'Cantidad', 'Precio unit.', 'Descuento', 'Subtotal'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--color-border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quote.items?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.producto?.imagen_url
                            ? <img src={`${API_URL}${item.producto.imagen_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            : <Package size={16} color="var(--color-content-muted)" />
                          }
                        </div>
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{item.nombre_producto}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-content-muted)' }}>{item.sku_producto}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-content-secondary)', fontSize: '13px' }}>{item.cantidad}</td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontSize: '13px' }}>{formatPrice(item.precio_unitario)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: item.descuento_aplicado > 0 ? '#22C55E' : 'var(--color-content-muted)' }}>
                      {item.descuento_aplicado > 0 ? `-${item.descuento_aplicado}%` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-brand)', fontSize: '14px' }}>{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Subtotal', value: formatPrice(quote.subtotal) },
                ...(Number(quote.descuento_extra) > 0 ? [{ label: `Descuento adicional (${quote.descuento_extra}%)`, value: `-${formatPrice(Number(quote.subtotal) * Number(quote.descuento_extra) / 100)}` }] : []),
                { label: `IVA (${quote.iva_porcentaje}%)`, value: formatPrice(quote.iva_monto) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-content-secondary)' }}>{label}</span>
                  <span style={{ color: '#fff' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Total</span>
                <span style={{ fontWeight: 900, color: 'var(--color-brand)', fontSize: '20px' }}>{formatPrice(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de confirmación — solo si está aprobada */}
        {quote.estado === 'aprobada' && (
          <div className="card-dark" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '16px', marginBottom: '1rem' }}>
              Confirmar pedido
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Método de pago
                </label>
                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
                  className="input-dark" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="cheque">Cheque</option>
                  <option value="cuenta_corriente">Cuenta corriente</option>
                  <option value="mercado_pago">Mercado Pago</option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Dirección de entrega (opcional)
                </label>
                <input value={direccion} onChange={e => setDireccion(e.target.value)}
                  placeholder="Av. San Martín 1234, Mendoza"
                  className="input-dark" style={{ fontSize: '13px' }} />
              </div>
            </div>
            <button onClick={handleConvertir} disabled={convirtiendo} className="btn-brand"
              style={{ fontSize: '14px', padding: '12px 28px' }}>
              {convirtiendo
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generando pedido...</>
                : <><ShoppingCart size={16} /> Confirmar pedido — {formatPrice(quote.total)}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetalleCotizacionPage() {
  return (
    <AuthGuard roles={['cliente']}>
      <DetalleContent />
    </AuthGuard>
  );
}