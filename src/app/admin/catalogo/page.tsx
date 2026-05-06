// src/app/admin/catalogo/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { productsApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, Upload, X,
  Search, Package, CheckCircle2, Loader2,
  ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Formulario de producto ───────────────────────────────────────
const FORM_INICIAL = {
  sku: '', nombre: '', descripcion: '', marca: '',
  precio_lista: '', precio_costo: '',
  stock_actual: '', stock_minimo: '',
  unidad_venta: 'unidad', cantidad_minima: '1', contenido_por_unidad: '1',
  category_id: '', activo: true, destacado: false,
};

function FormProducto({ producto, categorias, onGuardado, onCancelar }: {
  producto?: Product | null;
  categorias: Category[];
  onGuardado: () => void;
  onCancelar: () => void;
}) {
  const [form,     setForm]     = useState<any>(producto ? {
    ...FORM_INICIAL,
    sku:                  producto.sku,
    nombre:               producto.nombre,
    descripcion:          producto.descripcion || '',
    marca:                producto.marca || '',
    precio_lista:         String(producto.precio_lista),
    precio_costo:         String(producto.precio_costo || ''),
    stock_actual:         String(producto.stock_actual),
    stock_minimo:         String(producto.stock_minimo),
    unidad_venta:         producto.unidad_venta,
    cantidad_minima:      String(producto.cantidad_minima),
    contenido_por_unidad: String(producto.contenido_por_unidad),
    category_id:          String(producto.category_id || ''),
    activo:               producto.activo,
    destacado:            producto.destacado,
  } : FORM_INICIAL);

  const [imagen,   setImagen]   = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string>(producto?.imagen_url ? `${API_URL}${producto.imagen_url}` : '');
  const [loading,  setLoading]  = useState(false);
  const [genIA,    setGenIA]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  // Generación de descripción con IA
  const generarDescripcion = async () => {
    if (!form.nombre || !form.sku) {
      toast.error('Completá el nombre y SKU primero');
      return;
    }
    setGenIA(true);
    try {
      const res = await fetch('/api/ia/descripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, sku: form.sku, marca: form.marca, categoria: categorias.find(c => String(c.id) === form.category_id)?.nombre }),
      });
      const data = await res.json();
      if (data.descripcion) {
        setForm((prev: any) => ({ ...prev, descripcion: data.descripcion }));
        toast.success('Descripción generada con IA');
      }
    } catch {
      toast.error('Error al generar descripción');
    } finally {
      setGenIA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usamos FormData para poder enviar la imagen junto con los datos
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (imagen) fd.append('imagen', imagen);

      const token = localStorage.getItem('accessToken');
      const url   = producto
        ? `${API_URL}/api/products/${producto.id}`
        : `${API_URL}/api/products`;
      const method = producto ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }

      toast.success(producto ? 'Producto actualizado' : 'Producto creado');
      onGuardado();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Campo = ({ label, name, type = 'text', placeholder = '', required = false, children }: any) => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label} {required && <span style={{ color: 'var(--color-brand)' }}>*</span>}
      </label>
      {children || (
        <input name={name} type={type} value={form[name]} onChange={handleChange}
          placeholder={placeholder} required={required} className="input-dark" style={{ fontSize: '13px' }} />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

        {/* Upload de imagen */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Imagen del producto
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 120, height: 120, borderRadius: '12px',
                border: `2px dashed ${preview ? 'var(--color-brand)' : 'var(--color-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                background: 'var(--color-bg-elevated)', position: 'relative'
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload size={24} color="var(--color-content-muted)" />
                  <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '6px' }}>Subir imagen</p>
                </div>
              )}
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="btn-outline" style={{ fontSize: '13px', padding: '8px 16px', marginBottom: '8px' }}>
                <Upload size={14} /> Seleccionar archivo
              </button>
              <p style={{ fontSize: '11px', color: 'var(--color-content-muted)' }}>JPG, PNG o WEBP. Máximo 5MB.</p>
              {preview && (
                <button type="button" onClick={() => { setPreview(''); setImagen(null); }}
                  className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px', marginTop: '4px' }}>
                  <X size={12} /> Quitar imagen
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
          </div>
        </div>

        {/* SKU */}
        <Campo label="SKU" name="sku" placeholder="TAL-800W" required>
          <input name="sku" value={form.sku} onChange={handleChange} placeholder="TAL-800W"
            className="input-dark" style={{ fontSize: '13px', fontFamily: 'monospace', textTransform: 'uppercase' }}
            disabled={!!producto} />
        </Campo>

        {/* Categoría */}
        <Campo label="Categoría" name="category_id">
          <select name="category_id" value={form.category_id} onChange={handleChange}
            className="input-dark" style={{ fontSize: '13px', cursor: 'pointer' }}>
            <option value="">Sin categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Campo>

        {/* Nombre */}
        <div style={{ gridColumn: 'span 2' }}>
          <Campo label="Nombre del producto" name="nombre" placeholder="Taladro Percutor Industrial 800W" required />
        </div>

        {/* Descripción con IA */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Descripción
            </label>
            <button type="button" onClick={generarDescripcion} disabled={genIA}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-brand)', fontSize: '12px', fontWeight: 600 }}>
              {genIA
                ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
                : <><Sparkles size={12} /> Generar con IA</>
              }
            </button>
          </div>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
            placeholder="Descripción técnica del producto..."
            className="input-dark" rows={3} style={{ resize: 'vertical', fontSize: '13px', fontFamily: 'inherit' }} />
        </div>

        {/* Marca */}
        <Campo label="Marca" name="marca" placeholder="Bosch" />

        {/* Unidad de venta */}
        <Campo label="Unidad de venta" name="unidad_venta">
          <select name="unidad_venta" value={form.unidad_venta} onChange={handleChange}
            className="input-dark" style={{ fontSize: '13px', cursor: 'pointer' }}>
            {['unidad','caja','paquete','rollo','kg','metro','litro','par','juego','pallet'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </Campo>

        {/* Precios */}
        <Campo label="Precio de lista (ARS)" name="precio_lista" type="number" placeholder="45000" required />
        <Campo label="Precio de costo (ARS)" name="precio_costo" type="number" placeholder="28000" />

        {/* Stock */}
        <Campo label="Stock actual" name="stock_actual" type="number" placeholder="25" />
        <Campo label="Stock mínimo" name="stock_minimo" type="number" placeholder="5" />

        {/* Cantidad mínima y contenido */}
        <Campo label="Cantidad mínima de compra" name="cantidad_minima" type="number" placeholder="1" />
        <Campo label="Contenido por unidad" name="contenido_por_unidad" type="number" placeholder="1" />

        {/* Checks */}
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '2rem' }}>
          {[
            { name: 'activo',    label: 'Producto activo'    },
            { name: 'destacado', label: 'Mostrar en destacados' },
          ].map(({ name, label }) => (
            <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--color-content-secondary)' }}>
              <input type="checkbox" name={name} checked={form[name]} onChange={handleChange}
                style={{ accentColor: 'var(--color-brand)', width: 16, height: 16 }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <button type="button" onClick={onCancelar} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-brand" style={{ minWidth: '140px', justifyContent: 'center' }}>
          {loading
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
            : <><CheckCircle2 size={16} /> {producto ? 'Actualizar' : 'Crear producto'}</>
          }
        </button>
      </div>
    </form>
  );
}

// ── Página principal del catálogo admin ─────────────────────────
function CatalogoAdminContent() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [buscar,     setBuscar]     = useState('');
  const [modal,      setModal]      = useState<'crear' | 'editar' | null>(null);
  const [selected,   setSelected]   = useState<Product | null>(null);
  const [sortField,  setSortField]  = useState('nombre');
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('asc');

  const cargar = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productsApi.list({ limit: 100 }),
        productsApi.categories(),
      ]);
      setProducts(pRes.data.productos || []);
      setCategorias(cRes.data.categorias || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Desactivar "${nombre}"?`)) return;
    try {
      await productsApi.delete(id);
      toast.success('Producto desactivado');
      cargar();
    } catch {
      toast.error('Error al desactivar');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronUp size={13} style={{ opacity: 0.3 }} />
  );

  const filtrados = products
    .filter(p => !buscar || p.nombre.toLowerCase().includes(buscar.toLowerCase()) || p.sku.toLowerCase().includes(buscar.toLowerCase()))
    .sort((a, b) => {
      const va = (a as any)[sortField] ?? '';
      const vb = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '26px', color: '#fff' }}>Gestión de Catálogo</h1>
            <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {products.length} productos registrados
            </p>
          </div>
          <button onClick={() => { setSelected(null); setModal('crear'); }} className="btn-brand">
            <Plus size={18} /> Nuevo producto
          </button>
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-content-muted)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Buscar por nombre o SKU..." value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="input-dark" style={{ paddingLeft: '36px', fontSize: '13px' }} />
        </div>

        {/* Tabla */}
        <div className="card-dark" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                  {[
                    { label: 'Imagen',      field: ''             },
                    { label: 'SKU',         field: 'sku'          },
                    { label: 'Nombre',      field: 'nombre'       },
                    { label: 'Categoría',   field: 'category_id'  },
                    { label: 'Precio',      field: 'precio_lista' },
                    { label: 'Stock',       field: 'stock_actual' },
                    { label: 'Estado',      field: 'activo'       },
                    { label: 'Acciones',    field: ''             },
                  ].map(({ label, field }) => (
                    <th key={label}
                      onClick={() => field && handleSort(field)}
                      style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '11px', fontWeight: 700,
                        color: 'var(--color-content-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        cursor: field ? 'pointer' : 'default',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {label} {field && <SortIcon field={field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '12px 16px' }}>
                          <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-content-muted)' }}>
                      No hay productos que coincidan con la búsqueda
                    </td>
                  </tr>
                ) : filtrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {/* Imagen */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '8px', overflow: 'hidden', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.imagen_url
                          ? <img src={`${API_URL}${p.imagen_url}`} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={20} color="var(--color-content-muted)" />
                        }
                      </div>
                    </td>
                    {/* SKU */}
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-content-muted)' }}>
                      {p.sku}
                    </td>
                    {/* Nombre */}
                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 500, fontSize: '13px', maxWidth: '220px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                      {p.marca && <div style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '2px' }}>{p.marca}</div>}
                    </td>
                    {/* Categoría */}
                    <td style={{ padding: '10px 16px' }}>
                      {p.categoria
                        ? <span className="badge-brand" style={{ fontSize: '10px', padding: '2px 8px' }}>{p.categoria.nombre}</span>
                        : <span style={{ fontSize: '12px', color: 'var(--color-content-muted)' }}>—</span>
                      }
                    </td>
                    {/* Precio */}
                    <td style={{ padding: '10px 16px', color: 'var(--color-brand)', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {formatPrice(p.precio_lista)}
                    </td>
                    {/* Stock */}
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ color: p.stock_actual > p.stock_minimo ? '#22c55e' : p.stock_actual > 0 ? '#f59e0b' : '#ef4444', fontWeight: 600, fontSize: '14px' }}>
                        {p.stock_actual}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginLeft: '4px' }}>uds.</span>
                    </td>
                    {/* Estado */}
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: p.activo ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.activo ? '#22c55e' : '#ef4444' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setSelected(p); setModal('editar'); }}
                          style={{ padding: '6px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-brand)', display: 'flex' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleEliminar(p.id, p.nombre)}
                          style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal crear/editar */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
            <div className="card-dark animate-fade-in" style={{ width: '100%', maxWidth: '700px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
                  {modal === 'crear' ? 'Nuevo producto' : `Editar: ${selected?.nombre}`}
                </h2>
                <button onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-content-secondary)' }}>
                  <X size={22} />
                </button>
              </div>
              <FormProducto
                producto={modal === 'editar' ? selected : null}
                categorias={categorias}
                onGuardado={() => { setModal(null); cargar(); }}
                onCancelar={() => setModal(null)}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CatalogoAdminPage() {
  return (
    <AuthGuard roles={['admin', 'vendedor']}>
      <CatalogoAdminContent />
    </AuthGuard>
  );
}