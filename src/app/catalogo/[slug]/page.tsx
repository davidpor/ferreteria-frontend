// src/app/catalogo/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, ArrowLeft, Package, Tag,
  Truck, Shield, ChevronUp, ChevronDown, Loader2
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductoDetallePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore(s => s.addItem);
  const user = useAuthStore(s => s.user);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    productsApi.getBySlug(slug)
      .then(r => {
        setProduct(r.data.producto);
        setCantidad(r.data.producto.cantidad_minima || 1);
      })
      .catch(() => router.push('/catalogo'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={36} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!product) return null;

  const precio = product.precio_cliente ?? product.precio_lista;
  const tieneStock = product.stock_actual > 0;
  const descuento = product.precio_cliente && product.precio_cliente < product.precio_lista
    ? Math.round((1 - product.precio_cliente / product.precio_lista) * 100)
    : 0;

  const handleCantidad = (delta: number) => {
    const min = product.cantidad_minima || 1;
    const next = cantidad + delta;
    if (next < min) return;
    setCantidad(next);
  };

  const handleAgregar = async () => {
    if (!tieneStock) return;
    setAgregando(true);
    await new Promise(r => setTimeout(r, 400));
    addItem({
      product_id: product.id,
      sku: product.sku,
      nombre: product.nombre,
      precio_unitario: precio,
      cantidad,
      unidad_venta: product.unidad_venta,
      cantidad_minima: product.cantidad_minima,
      subtotal: precio * cantidad,
      imagen_url: product.imagen_url,
    });
    toast.success(`${product.nombre} agregado al carrito`);
    setAgregando(false);
  };

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
          <Link href="/catalogo" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--color-content-secondary)', textDecoration: 'none',
            fontSize: '14px', fontWeight: 500,
          }}>
            <ArrowLeft size={16} /> Catálogo
          </Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          {product.categoria && (
            <>
              <span style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
                {product.categoria.nombre}
              </span>
              <span style={{ color: 'var(--color-border)' }}>/</span>
            </>
          )}
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{product.nombre}</span>
        </div>

        {/* Layout principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>

          {/* Imagen */}
          <div>
            <div className="card-dark" style={{
              aspectRatio: '1', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative'
            }}>
              {product.imagen_url ? (
                <img
                  src={product.imagen_url?.startsWith('http')
                    ? product.imagen_url
                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${product.imagen_url}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Package size={96} color="var(--color-content-muted)" />
              )}

              {descuento > 0 && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: '#22c55e', color: '#fff',
                  fontWeight: 900, fontSize: '14px',
                  padding: '4px 10px', borderRadius: '20px'
                }}>
                  -{descuento}%
                </div>
              )}
            </div>
          </div>

          {/* Info del producto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Categoría y SKU */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {product.categoria && (
                <span className="badge-brand" style={{ fontSize: '11px' }}>
                  {product.categoria.nombre}
                </span>
              )}
              <span style={{ fontSize: '12px', color: 'var(--color-content-muted)', fontFamily: 'monospace' }}>
                SKU: {product.sku}
              </span>
            </div>

            {/* Nombre */}
            <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', lineHeight: 1.2 }}>
              {product.nombre}
            </h1>

            {/* Marca */}
            {product.marca && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', fontSize: '14px' }}>
                <Tag size={14} /> {product.marca}
              </div>
            )}

            {/* Precio */}
            <div style={{ padding: '1.25rem', background: 'var(--color-bg-elevated)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--color-brand)' }}>
                  {formatPrice(precio)}
                </span>
                {descuento > 0 && (
                  <span style={{ fontSize: '18px', color: 'var(--color-content-muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.precio_lista)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                Por {product.unidad_venta}
                {product.contenido_por_unidad > 1 && ` (contiene ${product.contenido_por_unidad} unidades)`}
              </p>
              {product.cantidad_minima > 1 && (
                <p style={{ fontSize: '12px', color: 'var(--color-brand)', marginTop: '4px', fontWeight: 500 }}>
                  ⚠ Cantidad mínima de compra: {product.cantidad_minima} {product.unidad_venta}
                </p>
              )}
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: tieneStock ? '#22c55e' : '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: tieneStock ? '#22c55e' : '#dc2626', fontWeight: 600 }}>
                {tieneStock ? `${product.stock_actual} unidades disponibles` : 'Sin stock disponible'}
              </span>
            </div>

            {/* Selector cantidad + botón */}
            {user?.rol === 'cliente' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Selector */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px', overflow: 'hidden'
                }}>
                  <button onClick={() => handleCantidad(-1)} style={{
                    width: 40, height: 48, background: 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-content-secondary)'
                  }}>
                    <ChevronDown size={18} />
                  </button>
                  <span style={{ minWidth: '48px', textAlign: 'center', fontWeight: 700, color: '#fff', fontSize: '16px' }}>
                    {cantidad}
                  </span>
                  <button onClick={() => handleCantidad(1)} style={{
                    width: 40, height: 48, background: 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-content-secondary)'
                  }}>
                    <ChevronUp size={18} />
                  </button>
                </div>

                {/* Botón agregar */}
                <button
                  onClick={handleAgregar}
                  disabled={!tieneStock || agregando}
                  className="btn-brand"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                >
                  {agregando
                    ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Agregando...</>
                    : <><ShoppingCart size={18} /> Agregar al carrito</>
                  }
                </button>
              </div>
            )}

            {/* Subtotal */}
            {user?.rol === 'cliente' && tieneStock && (
              <p style={{ fontSize: '14px', color: 'var(--color-content-secondary)', textAlign: 'center' }}>
                Subtotal: <strong style={{ color: 'var(--color-brand)', fontSize: '16px' }}>
                  {formatPrice(precio * cantidad)}
                </strong>
              </p>
            )}

            {/* Beneficios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
              {[
                { icon: Truck, text: 'Envío directo a obra en toda la provincia' },
                { icon: Shield, text: 'Garantía del fabricante incluida' },
                { icon: Package, text: 'Stock garantizado para pedidos mayoristas' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color="var(--color-brand)" />
                  <span style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {product.descripcion && (
          <div className="card-dark" style={{ padding: '1.5rem', marginTop: '2rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '1rem' }}>
              Descripción del producto
            </h2>
            <p style={{ color: 'var(--color-content-secondary)', lineHeight: 1.8, fontSize: '14px' }}>
              {product.descripcion}
            </p>
          </div>
        )}

        {/* Especificaciones técnicas */}
        <div className="card-dark" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '1rem' }}>
            Especificaciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {[
              { label: 'SKU', value: product.sku },
              { label: 'Marca', value: product.marca || '—' },
              { label: 'Unidad venta', value: product.unidad_venta },
              { label: 'Contenido', value: `${product.contenido_por_unidad} unid.` },
              { label: 'Cant. mínima', value: `${product.cantidad_minima} ${product.unidad_venta}` },
              { label: 'Stock actual', value: `${product.stock_actual} unid.` },
              ...(product.peso_kg ? [{ label: 'Peso', value: `${product.peso_kg} kg` }] : []),
              ...(product.categoria ? [{ label: 'Categoría', value: product.categoria.nombre }] : []),
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--color-content-muted)', paddingRight: '1rem' }}>{label}</span>
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}