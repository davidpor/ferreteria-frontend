// src/app/catalogo/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Product, Category, PaginationMeta } from '@/types';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useAuthStore } from '@/store/auth.store';

const ORDENES = [
  { value: 'nombre_asc',  label: 'Nombre A-Z'      },
  { value: 'nombre_desc', label: 'Nombre Z-A'      },
  { value: 'precio_asc',  label: 'Menor precio'    },
  { value: 'precio_desc', label: 'Mayor precio'    },
  { value: 'recientes',   label: 'Más recientes'   },
];

export default function CatalogoPage() {
  const user = useAuthStore(s => s.user);

  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [pagination,  setPagination]  = useState<PaginationMeta | null>(null);

  // Filtros
  const [buscar,      setBuscar]      = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [orden,       setOrden]       = useState('nombre_asc');
  const [page,        setPage]        = useState(1);
  const [conStock,    setConStock]    = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);

  // Carga de categorías
  useEffect(() => {
    productsApi.categories()
      .then(r => setCategories(r.data.categorias || []))
      .catch(() => {});
  }, []);

  // Carga de productos
  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      // Si el usuario es cliente usamos el catálogo con precios personalizados
      const fn = user?.rol === 'cliente' ? productsApi.catalog : productsApi.list;
      const params: any = { page, limit: 12, orden };
      if (buscar)      params.buscar      = buscar;
      if (categoriaId) params.categoria_id = categoriaId;
      if (conStock)    params.con_stock   = 'true';

      const res = await fn(params);
      const data = res.data;

      // El catálogo devuelve { catalogo } y el list devuelve { productos }
      setProducts(data.catalogo || data.productos || []);
      setPagination(data.paginacion || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [buscar, categoriaId, orden, page, conStock, user]);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  // Búsqueda con debounce
  const [buscarInput, setBuscarInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setBuscar(buscarInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [buscarInput]);

  const limpiarFiltros = () => {
    setBuscarInput(''); setBuscar('');
    setCategoriaId(''); setOrden('nombre_asc');
    setConStock(false); setPage(1);
  };

  const hayFiltros = buscar || categoriaId || conStock || orden !== 'nombre_asc';

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Barra de filtros ──────────────────────────────────── */}
      <div style={{ background: 'var(--color-bg-overlay)', borderBottom: '1px solid var(--color-border)', padding: '1rem 1.5rem', position: 'sticky', top: '64px', zIndex: 40 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

          {/* Fila principal */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Categorías como pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px', flexShrink: 0 }}>
                CATEGORÍAS:
              </span>
              <button
                onClick={() => { setCategoriaId(''); setPage(1); }}
                className={`badge-outline ${!categoriaId ? 'badge-outline-active' : ''}`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategoriaId(String(cat.id)); setPage(1); }}
                  className={`badge-outline ${categoriaId === String(cat.id) ? 'badge-outline-active' : ''}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div style={{ position: 'relative', width: '220px', flexShrink: 0 }}>
              <Search size={14} color="var(--color-content-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={buscarInput}
                onChange={e => setBuscarInput(e.target.value)}
                className="input-dark"
                style={{ paddingLeft: '34px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
              />
              {buscarInput && (
                <button onClick={() => setBuscarInput('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Ordenar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <SlidersHorizontal size={13} color="var(--color-content-muted)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                value={orden}
                onChange={e => { setOrden(e.target.value); setPage(1); }}
                className="input-dark"
                style={{ paddingLeft: '30px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px', paddingRight: '28px', cursor: 'pointer', width: '160px', appearance: 'none' }}
              >
                {ORDENES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-content-muted)' }} />
            </div>

            {/* Limpiar filtros */}
            {hayFiltros && (
              <button onClick={limpiarFiltros} className="btn-ghost" style={{ fontSize: '12px', padding: '8px 12px', flexShrink: 0 }}>
                <X size={13} /> Limpiar
              </button>
            )}
          </div>

          {/* Filtro con stock */}
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-content-secondary)' }}>
              <input
                type="checkbox"
                checked={conStock}
                onChange={e => { setConStock(e.target.checked); setPage(1); }}
                style={{ accentColor: 'var(--color-brand)', width: '15px', height: '15px' }}
              />
              Solo productos con stock disponible
            </label>
            {pagination && (
              <span style={{ fontSize: '12px', color: 'var(--color-content-muted)', marginLeft: 'auto' }}>
                {pagination.total} productos encontrados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid de productos ─────────────────────────────────── */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card-dark" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: '200px' }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: '12px', width: '60px', marginBottom: '10px' }} />
                  <div className="skeleton" style={{ height: '18px', width: '100%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '28px', width: '120px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Search size={48} color="var(--color-content-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>No hay productos</h3>
            <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px', marginBottom: '1.5rem' }}>
              Probá con otros filtros o términos de búsqueda
            </p>
            <button onClick={limpiarFiltros} className="btn-outline" style={{ margin: '0 auto' }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', padding: '1rem', background: 'var(--color-bg-card)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                  Página <strong style={{ color: '#fff' }}>{pagination.currentPage}</strong> de{' '}
                  <strong style={{ color: '#fff' }}>{pagination.totalPages}</strong>
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="btn-ghost"
                    style={{ padding: '8px 16px', fontSize: '13px', opacity: pagination.hasPrevPage ? 1 : 0.4 }}
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn-brand"
                    style={{ padding: '8px 16px', fontSize: '13px', opacity: pagination.hasNextPage ? 1 : 0.4 }}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}