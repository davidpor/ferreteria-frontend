// src/app/carrito/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Trash2, ChevronUp, ChevronDown,
  ArrowLeft, ArrowRight, Package
} from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { quotesApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CarritoPage() {
  const router     = useRouter();
  const user       = useAuthStore(s => s.user);
  const { items, updateItem, removeItem, clearCart, total } = useCartStore();
  const [loading,  setLoading]  = useState(false);
  const [obs,      setObs]      = useState('');

  const subtotal   = total();
  const iva        = subtotal * 0.21;
  const totalFinal = subtotal + iva;

  const handleCantidad = (productId: number, delta: number, min: number, current: number) => {
    const next = current + delta;
    if (next < min) return;
    updateItem(productId, next);
  };

  const handleCotizar = async () => {
    if (!user) { router.push('/login'); return; }
    if (items.length === 0) return;
    setLoading(true);
    try {
      await quotesApi.create({
        observaciones_cliente: obs,
        items: items.map(i => ({ product_id: i.product_id, cantidad: i.cantidad })),
      });
      clearCart();
      toast.success('¡Cotización generada! El equipo la revisará pronto.');
      router.push('/mis-cotizaciones');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al generar la cotización');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-bg-elevated)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShoppingCart size={36} color="var(--color-content-muted)" />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px', marginBottom: '2rem', lineHeight: 1.6 }}>
          Explorá el catálogo y agregá productos para generar tu cotización mayorista.
        </p>
        <Link href="/catalogo" className="btn-brand" style={{ justifyContent: 'center' }}>
          <Package size={18} /> Ir al catálogo
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff' }}>Mi carrito</h1>
            <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <Link href="/catalogo" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', textDecoration: 'none', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Seguir comprando
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

          {/* Lista de items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => (
              <div key={item.product_id} className="card-dark" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>

                {/* Imagen */}
                <div style={{ width: 80, height: 80, borderRadius: '10px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {item.imagen_url
                    ? <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Package size={28} color="var(--color-content-muted)" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '4px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.nombre}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-content-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
                    {item.sku}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-brand)', fontWeight: 600 }}>
                    {formatPrice(item.precio_unitario)} / {item.unidad_venta}
                  </p>
                </div>

                {/* Cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <button onClick={() => handleCantidad(item.product_id, -1, item.cantidad_minima, item.cantidad)}
                    style={{ width: 36, height: 44, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-content-secondary)' }}>
                    <ChevronDown size={16} />
                  </button>
                  <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                    {item.cantidad}
                  </span>
                  <button onClick={() => handleCantidad(item.product_id, 1, item.cantidad_minima, item.cantidad)}
                    style={{ width: 36, height: 44, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-content-secondary)' }}>
                    <ChevronUp size={16} />
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right', minWidth: '110px' }}>
                  <p style={{ fontWeight: 900, fontSize: '16px', color: '#fff' }}>{formatPrice(item.subtotal)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '2px' }}>subtotal</p>
                </div>

                {/* Eliminar */}
                <button onClick={() => removeItem(item.product_id)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-content-muted)', borderRadius: '8px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Observaciones */}
            <div className="card-dark" style={{ padding: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                Observaciones para el vendedor (opcional)
              </label>
              <textarea
                value={obs}
                onChange={e => setObs(e.target.value)}
                placeholder="Ej: Necesito entrega en planta, Mendoza capital. Turno mañana..."
                className="input-dark"
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Resumen */}
          <div>
            <div className="card-dark" style={{ padding: '1.5rem', position: 'sticky', top: '160px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '1.25rem' }}>
                Resumen del pedido
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--color-content-secondary)' }}>Subtotal</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--color-content-secondary)' }}>IVA (21%)</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(iva)}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>Total estimado</span>
                  <span style={{ fontWeight: 900, color: 'var(--color-brand)', fontSize: '20px' }}>{formatPrice(totalFinal)}</span>
                </div>
              </div>

              <div style={{ padding: '10px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-content-secondary)', lineHeight: 1.6 }}>
                  📋 Al confirmar se genera una <strong style={{ color: '#fff' }}>cotización</strong>. El precio final se ajusta según tu lista de precios mayorista.
                </p>
              </div>

              <button
                onClick={handleCotizar}
                disabled={loading || items.length === 0}
                className="btn-brand"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginBottom: '10px' }}
              >
                {loading
                  ? 'Generando cotización...'
                  : <><ArrowRight size={18} /> Generar cotización</>
                }
              </button>

              <button onClick={clearCart} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                <Trash2 size={14} /> Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}