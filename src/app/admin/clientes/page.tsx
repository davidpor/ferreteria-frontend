'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { companiesApi, pricingApi } from '@/lib/api';
import { Company } from '@/types';
import { formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Search, Building2, Users, CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function ClientesContent() {
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [filtro, setFiltro] = useState('todos');
    const [toggling, setToggling] = useState<number | null>(null);

    const cargar = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filtro === 'activas') params.activa = 'true';
            if (filtro === 'inactivas') params.activa = 'false';
            if (buscar) params.buscar = buscar;
            const res = await companiesApi.list(params);
            setEmpresas(res.data.empresas || []);
        } catch {
            toast.error('Error al cargar empresas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [filtro]);

    // Búsqueda con debounce
    useEffect(() => {
        const t = setTimeout(() => cargar(), 400);
        return () => clearTimeout(t);
    }, [buscar]);

    const handleToggle = async (empresa: any) => {
        setToggling(empresa.id);
        try {
            await companiesApi.activate(empresa.id);
            toast.success(`Empresa ${empresa.activa ? 'desactivada' : 'activada'}`);
            cargar();
        } catch {
            toast.error('Error al cambiar estado');
        } finally {
            setToggling(null);
        }
    };

    const filtros = [
        { value: 'todos', label: 'Todas' },
        { value: 'activas', label: 'Activas' },
        { value: 'inactivas', label: 'Pendientes' },
    ];

    const pendientes = empresas.filter(e => !e.activa).length;

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '26px', color: '#fff', marginBottom: '4px' }}>
                            Clientes Mayoristas
                        </h1>
                        <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
                            {empresas.length} empresas registradas
                        </p>
                    </div>
                    {pendientes > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>
                                {pendientes} {pendientes === 1 ? 'empresa pendiente' : 'empresas pendientes'} de aprobación
                            </span>
                        </div>
                    )}
                </div>

                {/* Filtros + búsqueda */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {filtros.map(f => (
                            <button key={f.value} onClick={() => setFiltro(f.value)}
                                className={`badge-outline ${filtro === f.value ? 'badge-outline-active' : ''}`}
                                style={{ cursor: 'pointer', border: 'none', fontSize: '13px' }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-content-muted)', pointerEvents: 'none' }} />
                        <input type="text" placeholder="Buscar por empresa o CUIT..." value={buscar}
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
                    ) : empresas.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <Building2 size={40} color="var(--color-content-muted)" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ color: 'var(--color-content-muted)', fontSize: '14px' }}>No hay empresas con estos filtros</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                                    {['Empresa', 'CUIT', 'Condición IVA', 'Usuarios', 'Lista precios', 'Registrada', 'Estado', 'Acciones'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-content-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {empresas.map(empresa => (
                                    <tr key={empresa.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        {/* Empresa */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Building2 size={16} color="var(--color-brand)" />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{empresa.razon_social}</p>
                                                    {empresa.ciudad && (
                                                        <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', marginTop: '1px' }}>
                                                            {empresa.ciudad}, {empresa.provincia}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {/* CUIT */}
                                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                                            {empresa.cuit}
                                        </td>
                                        {/* Condición IVA */}
                                        <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-content-secondary)', textTransform: 'capitalize' }}>
                                            {empresa.condicion_iva?.replace('_', ' ')}
                                        </td>
                                        {/* Usuarios */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                                                <Users size={13} />
                                                {empresa.usuarios?.length ?? 0}
                                            </div>
                                        </td>
                                        {/* Lista precios */}
                                        <td style={{ padding: '12px 16px' }}>
                                            {empresa.listaPrecio
                                                ? <span className="badge-brand" style={{ fontSize: '10px', padding: '2px 8px' }}>{empresa.listaPrecio.nombre}</span>
                                                : <span style={{ fontSize: '12px', color: 'var(--color-content-muted)' }}>General</span>
                                            }
                                        </td>
                                        {/* Fecha */}
                                        <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-content-secondary)', whiteSpace: 'nowrap' }}>
                                            {formatDate(empresa.createdAt || empresa.created_at)}
                                        </td>
                                        {/* Estado */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: empresa.activa ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: empresa.activa ? '#22C55E' : '#F59E0B', border: `1px solid ${empresa.activa ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                                {empresa.activa ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {empresa.activa ? 'Activa' : 'Pendiente'}
                                            </span>
                                        </td>
                                        {/* Acciones */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <Link href={`/admin/clientes/${empresa.id}`}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: '10px', color: '#fff', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                                                    <Eye size={13} /> Ver
                                                </Link>
                                                <button onClick={() => handleToggle(empresa)}
                                                    disabled={toggling === empresa.id}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: empresa.activa ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${empresa.activa ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: '10px', color: empresa.activa ? '#EF4444' : '#22C55E', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                                                    {toggling === empresa.id
                                                        ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                                        : empresa.activa ? <><XCircle size={13} /> Desactivar</> : <><CheckCircle2 size={13} /> Aprobar</>
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminClientesPage() {
    return <AuthGuard roles={['admin', 'vendedor']}><ClientesContent /></AuthGuard>;
}