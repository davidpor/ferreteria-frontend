'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { quotesApi } from '@/lib/api';
import { Quote } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Eye, Search, Loader2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const ESTADO_CFG: Record<string, { label: string; color: string }> = {
    borrador: { label: 'Borrador', color: '#6B7280' },
    pendiente: { label: 'En revisión', color: '#F59E0B' },
    aprobada: { label: 'Aprobada', color: '#22C55E' },
    rechazada: { label: 'Rechazada', color: '#EF4444' },
    vencida: { label: 'Vencida', color: '#F97316' },
    convertida: { label: 'Convertida', color: '#3B82F6' },
};

function CotizacionesAdminContent() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [buscar, setBuscar] = useState('');

    const cargar = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 100 };
            if (filtro !== 'todos') params.estado = filtro;
            const res = await quotesApi.list(params);
            setQuotes(res.data.cotizaciones || []);
        } catch {
            toast.error('Error al cargar cotizaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [filtro]);

    const filtros = [
        { value: 'todos', label: 'Todas', count: null },
        { value: 'pendiente', label: 'En revisión', count: quotes.filter(q => q.estado === 'pendiente').length },
        { value: 'aprobada', label: 'Aprobadas', count: null },
        { value: 'rechazada', label: 'Rechazadas', count: null },
        { value: 'convertida', label: 'Convertidas', count: null },
    ];

    const filtradas = quotes.filter(q =>
        !buscar ||
        q.numero?.toLowerCase().includes(buscar.toLowerCase()) ||
        (q.empresa as any)?.razon_social?.toLowerCase().includes(buscar.toLowerCase())
    );

    const pendientes = quotes.filter(q => q.estado === 'pendiente').length;

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '26px', color: '#fff', marginBottom: '4px' }}>
                            Gestión de Cotizaciones
                        </h1>
                        <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
                            {quotes.length} cotizaciones en el sistema
                        </p>
                    </div>
                    {pendientes > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>
                                {pendientes} {pendientes === 1 ? 'cotización pendiente' : 'cotizaciones pendientes'} de revisión
                            </span>
                        </div>
                    )}
                </div>

                {/* Filtros + búsqueda */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                        {filtros.map(f => (
                            <button key={f.value} onClick={() => setFiltro(f.value)}
                                className={`badge-outline ${filtro === f.value ? 'badge-outline-active' : ''}`}
                                style={{ cursor: 'pointer', border: 'none', fontSize: '13px' }}>
                                {f.label}
                                {f.count !== null && f.count > 0 && (
                                    <span style={{ marginLeft: '5px', background: '#F59E0B', color: '#000', borderRadius: '999px', padding: '0 6px', fontSize: '11px', fontWeight: 800 }}>
                                        {f.count}
                                    </span>
                                )}
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

                {/* Tabla */}
                <div className="card-dark" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <Loader2 size={28} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : filtradas.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <ClipboardList size={40} color="var(--color-content-muted)" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ color: 'var(--color-content-muted)', fontSize: '14px' }}>No hay cotizaciones con estos filtros</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                                    {['Número', 'Empresa', 'Fecha', 'Productos', 'Total', 'Estado', 'Acciones'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtradas.map(q => {
                                    const cfg = ESTADO_CFG[q.estado] || ESTADO_CFG.borrador;
                                    return (
                                        <tr key={q.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{q.numero}</p>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <p style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                                                    {(q.empresa as any)?.razon_social || '—'}
                                                </p>
                                                <p style={{ fontSize: '11px', color: 'var(--color-content-muted)' }}>
                                                    {(q.empresa as any)?.cuit}
                                                </p>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-content-secondary)', whiteSpace: 'nowrap' }}>
                                                {formatDate((q as any).created_at || (q as any).createdAt)}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                                                {q.items?.length ?? '—'} productos
                                            </td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-brand)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                                {formatPrice(q.total)}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Link href={`/admin/cotizaciones/${q.id}`}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: q.estado === 'pendiente' ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)', border: `1px solid ${q.estado === 'pendiente' ? 'var(--color-brand)' : 'var(--color-border)'}`, borderRadius: '10px', color: q.estado === 'pendiente' ? '#000' : '#fff', fontSize: '13px', textDecoration: 'none', fontWeight: q.estado === 'pendiente' ? 700 : 500 }}>
                                                    <Eye size={14} />
                                                    {q.estado === 'pendiente' ? 'Revisar' : 'Ver'}
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

export default function AdminCotizacionesPage() {
    return <AuthGuard roles={['admin', 'vendedor']}><CotizacionesAdminContent /></AuthGuard>;
}