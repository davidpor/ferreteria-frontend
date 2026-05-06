// src/components/catalog/ProductCard.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, Package, Tag } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem    = useCartStore(s => s.addItem);
  const user       = useAuthStore(s => s.user);
  const precio     = product.precio_cliente ?? product.precio_lista;
  const tieneStock = product.stock_actual > 0;

  const handleAgregar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!tieneStock) return;
    addItem({
      product_id:      product.id,
      sku:             product.sku,
      nombre:          product.nombre,
      precio_unitario: precio,
      cantidad:        product.cantidad_minima,
      unidad_venta:    product.unidad_venta,
      cantidad_minima: product.cantidad_minima,
      subtotal:        precio * product.cantidad_minima,
    });
    toast.success(`${product.nombre} agregado al carrito`);
  };

  return (
    <Link href={`/catalogo/${product.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card-dark" style={{
        overflow: 'hidden', height: '100%',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s', cursor: 'pointer',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,166,35,0.4)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Imagen */}
        <div style={{ position: 'relative', height: '200px', background: 'var(--color-bg-elevated)', overflow: 'hidden' }}>
          {product.imagen_url ? (
            <img src={product.imagen_url} alt={product.nombre}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={48} color="var(--color-content-muted)" />
            </div>
          )}

          {/* Badge categoría */}
          {product.categoria && (
            <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
              <span className="badge-brand" style={{ fontSize: '10px', padding: '3px 8px' }}>
                {product.categoria.nombre}
              </span>
            </div>
          )}

          {/* Badge sin stock */}
          {!tieneStock && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', background: '#dc2626', padding: '4px 12px', borderRadius: '20px' }}>
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* SKU */}
          <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', fontFamily: 'monospace', marginBottom: '6px' }}>
            {product.sku}
          </p>

          {/* Nombre */}
          <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#fff', lineHeight: 1.4, marginBottom: '8px', flex: 1 }}>
            {product.nombre}
          </h3>

          {/* Descripción corta */}
          {product.descripcion && (
            <p style={{ fontSize: '12px', color: 'var(--color-content-secondary)', lineHeight: 1.5, marginBottom: '12px',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.descripcion}
            </p>
          )}

          {/* Precio y unidad */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-brand)' }}>
                {formatPrice(precio)}
              </span>
              {product.precio_cliente && product.precio_cliente < product.precio_lista && (
                <span style={{ fontSize: '12px', color: 'var(--color-content-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.precio_lista)}
                </span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '2px' }}>
              por {product.unidad_venta} · mín. {product.cantidad_minima} {product.unidad_venta}
            </p>
          </div>

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: tieneStock ? '#22c55e' : '#dc2626'
              }} />
              <span style={{ fontSize: '12px', color: 'var(--color-content-secondary)' }}>
                {tieneStock ? `${product.stock_actual} en stock` : 'Sin stock'}
              </span>
            </div>
            {product.marca && (
              <span style={{ fontSize: '11px', color: 'var(--color-content-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Tag size={10} /> {product.marca}
              </span>
            )}
          </div>

          {/* Botón agregar */}
          {user && user.rol === 'cliente' && (
            <button
              onClick={handleAgregar}
              disabled={!tieneStock}
              className="btn-brand"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
            >
              <ShoppingCart size={15} />
              {tieneStock ? 'Agregar al carrito' : 'Sin disponibilidad'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};