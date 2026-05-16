'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Package, Loader2 } from 'lucide-react';
import { quotesApi } from '@/lib/api';
import { Quote } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function DetalleAdminContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [accion, setAccion] = useState<'aprobar' | 'rechazar' | null>(null);
    const [nota, setNota] = useState('');
    const [descExtra, setDescExtra] = useState('0');
    const [motivo, setMotivo] = useState('');
    const [enviando, setEnviando] = useState(false);

    const cargar = () => {
        quotesApi.getById(Number(id))
            .then(r => setQuote(r.data.cotizacion))
            .catch(() => router.push('/admin/cotizaciones'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { cargar(); }, [id]);

    const handleAprobar = async () => {
        setEnviando(true);
        try {
            await quotesApi.approve(Number(id), {
                nota_vendedor: nota,
                descuento_extra: parseFloat(descExtra) || 0,
            });
            toast.success('Cotización aprobada');
            setAccion(null);
            cargar();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Error al aprobar');
        } finally {
            setEnviando(false);
        }
    };

    const handleRechazar = async () => {
        if (!motivo.trim()) { toast.error('Ingresá el motivo del rechazo'); return; }
        setEnviando(true);
        try {
            await quotesApi.reject(Number(id), { motivo });
            toast.success('Cotización rechazada');
            setAccion(null);
            cargar();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Error al rechazar');
        } finally {
            setEnviando(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={36} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (!quote) return null;
    const esPendiente = quote.estado === 'pendiente';

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
                    <Link href="/admin/cotizaciones" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', textDecoration: 'none', fontSize: '14px' }}>
                        <ArrowLeft size={16} /> Cotizaciones
                    </Link>
                    <span style={{ color: 'var(--color-border)' }}>/</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{quote.numero}</span>
                </div>

                {/* Header */}
                <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', marginBottom: '6px' }}>{quote.numero}</h1>
                            <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                                Empresa: <strong style={{ color: '#fff' }}>{(quote.empresa as any)?.razon_social}</strong>
                                {' · '}CUIT: {(quote.empresa as any)?.cuit}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)', marginTop: '3px' }}>
                                Creada el {formatDate((quote as any).created_at || (quote as any).createdAt)}
                                {' · '}Vence el {formatDate(quote.fecha_vencimiento)}
                            </p>
                            {quote.observaciones_cliente && (
                                <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-content-secondary)', fontStyle: 'italic' }}>
                                    "{quote.observaciones_cliente}"
                                </p>
                            )}
                        </div>

                        {/* Botones de acción — solo si está pendiente */}
                        {esPendiente && !accion && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setAccion('rechazar')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#EF4444', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                    <XCircle size={16} /> Rechazar
                                </button>
                                <button onClick={() => setAccion('aprobar')}
                                    className="btn-brand" style={{ fontSize: '14px', padding: '10px 18px' }}>
                                    <CheckCircle2 size={16} /> Aprobar
                                </button>
                            </div>
                        )}

                        {/* Estado actual si no es pendiente */}
                        {!esPendiente && (
                            <span style={{ fontSize: '13px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px', background: quote.estado === 'aprobada' ? 'rgba(34,197,94,0.1)' : quote.estado === 'rechazada' ? 'rgba(239,68,68,0.1)' : 'rgba(107,114,128,0.1)', color: quote.estado === 'aprobada' ? '#22C55E' : quote.estado === 'rechazada' ? '#EF4444' : '#6B7280', border: `1px solid currentColor` }}>
                                {quote.estado === 'aprobada' ? '✓ Aprobada' : quote.estado === 'rechazada' ? '✕ Rechazada' : quote.estado}
                            </span>
                        )}
                    </div>

                    {/* Panel de aprobación */}
                    {accion === 'aprobar' && (
                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px' }}>
                            <h3 style={{ fontWeight: 700, color: '#22C55E', fontSize: '15px', marginBottom: '1rem' }}>Aprobar cotización</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Descuento adicional (%)
                                    </label>
                                    <input type="number" min="0" max="50" value={descExtra}
                                        onChange={e => setDescExtra(e.target.value)}
                                        className="input-dark" style={{ fontSize: '13px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Nota para el cliente (opcional)
                                    </label>
                                    <input type="text" value={nota} onChange={e => setNota(e.target.value)}
                                        placeholder="Ej: Aprobado. Coordinar entrega."
                                        className="input-dark" style={{ fontSize: '13px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setAccion(null)} className="btn-ghost" style={{ fontSize: '13px' }}>Cancelar</button>
                                <button onClick={handleAprobar} disabled={enviando} className="btn-brand" style={{ fontSize: '13px' }}>
                                    {enviando ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle2 size={14} /> Confirmar aprobación</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Panel de rechazo */}
                    {accion === 'rechazar' && (
                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px' }}>
                            <h3 style={{ fontWeight: 700, color: '#EF4444', fontSize: '15px', marginBottom: '1rem' }}>Rechazar cotización</h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Motivo del rechazo *
                                </label>
                                <textarea value={motivo} onChange={e => setMotivo(e.target.value)}
                                    placeholder="Explicá el motivo para que el cliente pueda corregirlo..."
                                    className="input-dark" rows={3} style={{ resize: 'vertical', fontSize: '13px', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setAccion(null)} className="btn-ghost" style={{ fontSize: '13px' }}>Cancelar</button>
                                <button onClick={handleRechazar} disabled={enviando} className="btn-danger" style={{ fontSize: '13px' }}>
                                    {enviando ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><XCircle size={14} /> Confirmar rechazo</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info post-revisión */}
                    {quote.nota_vendedor && (
                        <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(34,197,94,0.06)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '12px', color: '#22C55E', fontWeight: 600 }}>Nota al cliente:</p>
                            <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>{quote.nota_vendedor}</p>
                        </div>
                    )}
                    {quote.motivo_rechazo && (
                        <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>Motivo de rechazo:</p>
                            <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>{quote.motivo_rechazo}</p>
                        </div>
                    )}
                </div>

                {/* Tabla de productos */}
                <div className="card-dark" style={{ overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>Productos</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-bg-elevated)' }}>
                                {['Producto', 'SKU', 'Cantidad', 'Precio unit.', 'Descuento', 'Subtotal'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {quote.items?.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                {(item as any).producto?.imagen_url
                                                    ? <img src={`${API_URL}${(item as any).producto.imagen_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                    {/* Totales */}
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Subtotal', value: formatPrice(quote.subtotal) },
                                ...(Number(quote.descuento_extra) > 0 ? [{ label: `Descuento extra (${quote.descuento_extra}%)`, value: `-${formatPrice(Number(quote.subtotal) * Number(quote.descuento_extra) / 100)}` }] : []),
                                { label: `IVA (${quote.iva_porcentaje}%)`, value: formatPrice(quote.iva_monto) },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--color-content-secondary)' }}>{label}</span>
                                    <span style={{ color: '#fff' }}>{value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                                <span style={{ fontWeight: 700, color: '#fff' }}>Total</span>
                                <span style={{ fontWeight: 900, color: 'var(--color-brand)', fontSize: '20px' }}>{formatPrice(quote.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminCotizacionDetallePage() {
    return <AuthGuard roles={['admin', 'vendedor']}><DetalleAdminContent /></AuthGuard>;
}