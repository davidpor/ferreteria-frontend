'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, CheckCircle2, XCircle, Save, Loader2 } from 'lucide-react';
import { companiesApi, pricingApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

function DetalleClienteContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [empresa, setEmpresa] = useState<any>(null);
    const [listas, setListas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState<any>({});

    const cargar = async () => {
        try {
            const [eRes, lRes] = await Promise.all([
                companiesApi.getById(Number(id)),
                pricingApi.list(),
            ]);
            const e = eRes.data.empresa;
            setEmpresa(e);
            setListas(lRes.data.listas || []);
            setForm({
                razon_social: e.razon_social,
                condicion_iva: e.condicion_iva,
                telefono: e.telefono || '',
                email_contacto: e.email_contacto || '',
                direccion: e.direccion || '',
                ciudad: e.ciudad || '',
                provincia: e.provincia || '',
                descuento_base: e.descuento_base || 0,
                limite_credito: e.limite_credito || 0,
                price_list_id: e.price_list_id || '',
            });
        } catch {
            router.push('/admin/clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [id]);

    const handleGuardar = async () => {
        setGuardando(true);
        try {
            await companiesApi.update(Number(id), {
                ...form,
                descuento_base: parseFloat(form.descuento_base) || 0,
                limite_credito: parseFloat(form.limite_credito) || 0,
                price_list_id: form.price_list_id || null,
            });
            toast.success('Empresa actualizada');
            setEditando(false);
            cargar();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    const handleToggle = async () => {
        try {
            await companiesApi.activate(Number(id));
            toast.success(`Empresa ${empresa.activa ? 'desactivada' : 'activada'}`);
            cargar();
        } catch {
            toast.error('Error al cambiar estado');
        }
    };

    if (loading) return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={36} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (!empresa) return null;

    const Campo = ({ label, name, type = 'text', children }: any) => (
        <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-content-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </label>
            {editando
                ? children || <input type={type} value={form[name] ?? ''} onChange={e => setForm((p: any) => ({ ...p, [name]: e.target.value }))} className="input-dark" style={{ fontSize: '13px' }} />
                : <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{form[name] || '—'}</p>
            }
        </div>
    );

    return (
        <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
                    <Link href="/admin/clientes" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-content-secondary)', textDecoration: 'none', fontSize: '14px' }}>
                        <ArrowLeft size={16} /> Clientes
                    </Link>
                    <span style={{ color: 'var(--color-border)' }}>/</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{empresa.razon_social}</span>
                </div>

                {/* Header empresa */}
                <div className="card-dark" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(245,166,35,0.1)', border: '2px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={24} color="var(--color-brand)" />
                            </div>
                            <div>
                                <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#fff', marginBottom: '4px' }}>{empresa.razon_social}</h1>
                                <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                                    CUIT: <span style={{ fontFamily: 'monospace', color: '#fff' }}>{empresa.cuit}</span>
                                    {' · '}Registrada el {formatDate(empresa.createdAt || empresa.created_at)}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: empresa.activa ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: empresa.activa ? '#22C55E' : '#F59E0B', border: `1px solid currentColor` }}>
                                {empresa.activa ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                {empresa.activa ? 'Activa' : 'Pendiente'}
                            </span>
                            <button onClick={handleToggle}
                                style={{ padding: '8px 16px', background: empresa.activa ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${empresa.activa ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: '10px', color: empresa.activa ? '#EF4444' : '#22C55E', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                {empresa.activa ? 'Desactivar' : 'Aprobar empresa'}
                            </button>
                            {!editando
                                ? <button onClick={() => setEditando(true)} className="btn-brand" style={{ fontSize: '13px', padding: '8px 16px' }}>Editar</button>
                                : <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => setEditando(false)} className="btn-ghost" style={{ fontSize: '13px' }}>Cancelar</button>
                                    <button onClick={handleGuardar} disabled={guardando} className="btn-brand" style={{ fontSize: '13px' }}>
                                        {guardando ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={14} /> Guardar</>}
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                    {/* Datos fiscales y comerciales */}
                    <div className="card-dark" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1.25rem', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                            Datos fiscales y comerciales
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Campo label="Razón social" name="razon_social" />
                            <Campo label="Condición IVA" name="condicion_iva">
                                {editando && (
                                    <select value={form.condicion_iva} onChange={e => setForm((p: any) => ({ ...p, condicion_iva: e.target.value }))}
                                        className="input-dark" style={{ fontSize: '13px', cursor: 'pointer' }}>
                                        <option value="responsable_inscripto">Responsable Inscripto</option>
                                        <option value="monotributista">Monotributista</option>
                                        <option value="exento">Exento</option>
                                    </select>
                                )}
                            </Campo>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Campo label="Descuento base (%)" name="descuento_base" type="number" />
                                <Campo label="Límite de crédito ($)" name="limite_credito" type="number" />
                            </div>
                            <Campo label="Lista de precios" name="price_list_id">
                                {editando ? (
                                    <select value={form.price_list_id || ''} onChange={e => setForm((p: any) => ({ ...p, price_list_id: e.target.value }))}
                                        className="input-dark" style={{ fontSize: '13px', cursor: 'pointer' }}>
                                        <option value="">Lista general</option>
                                        {listas.map((l: any) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                                    </select>
                                ) : (
                                    <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>
                                        {empresa.listaPrecio?.nombre || 'Lista general'}
                                    </p>
                                )}
                            </Campo>
                        </div>
                    </div>

                    {/* Contacto y ubicación */}
                    <div className="card-dark" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1.25rem', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                            Contacto y ubicación
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Campo label="Email de contacto" name="email_contacto" type="email" />
                            <Campo label="Teléfono" name="telefono" />
                            <Campo label="Dirección" name="direccion" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Campo label="Ciudad" name="ciudad" />
                                <Campo label="Provincia" name="provincia" />
                            </div>
                        </div>
                    </div>

                    {/* Usuarios de la empresa */}
                    <div className="card-dark" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                        <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} color="var(--color-brand)" />
                            Usuarios ({empresa.usuarios?.length ?? 0})
                        </h3>
                        {empresa.usuarios?.length === 0 ? (
                            <p style={{ color: 'var(--color-content-muted)', fontSize: '13px' }}>Sin usuarios registrados</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {empresa.usuarios?.map((u: any) => (
                                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--color-bg-elevated)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '14px', flexShrink: 0 }}>
                                            {u.nombre?.[0]?.toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{u.nombre} {u.apellido}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-content-muted)' }}>{u.email}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: 'rgba(245,166,35,0.1)', color: 'var(--color-brand)', textTransform: 'uppercase' }}>
                                                {u.rol}
                                            </span>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.activo ? '#22C55E' : '#EF4444', display: 'block' }} />
                                        </div>
                                        {u.ultimo_login && (
                                            <p style={{ fontSize: '11px', color: 'var(--color-content-muted)', whiteSpace: 'nowrap' }}>
                                                Último acceso: {formatDate(u.ultimo_login)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminClienteDetallePage() {
    return <AuthGuard roles={['admin', 'vendedor']}><DetalleClienteContent /></AuthGuard>;
}