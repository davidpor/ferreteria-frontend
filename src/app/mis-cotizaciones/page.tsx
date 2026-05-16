'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, ArrowRight, Eye, ShoppingCart,
  Clock, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, Plus, Loader2, Send
} from 'lucide-react';
import { quotesApi, ordersApi } from '@/lib/api';
import { Quote } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';


// Config visual de cada estado
const ESTADO_CFG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  borrador: { label: 'Borrador', color: '#6B7280', icon: <Clock size={14} /> },
  pendiente: { label: 'En revisión', color: '#F59E0B', icon: <Clock size={14} /> },
  aprobada: { label: 'Aprobada', color: '#22C55E', icon: <CheckCircle2 size={14} /> },
  rechazada: { label: 'Rechazada', color: '#EF4444', icon: <XCircle size={14} /> },
  vencida: { label: 'Vencida', color: '#F97316', icon: <AlertTriangle size={14} /> },
  convertida: { label: 'Convertida', color: '#3B82F6', icon: <CheckCircle2 size={14} /> },
};

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.borrador;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function CotizacionesContent() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
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

  const handleConvertir = async (quote: Quote) => {
    setConvirtiendo(quote.id);
    try {
      const res = await ordersApi.fromQuote(quote.id, {
        metodo_pago: 'transferencia',
        direccion_entrega: '',
      });
      const pedidoId = res.data.pedido.id;
      toast.success(`Pedido ${res.data.pedido.numero} generado`);
      router.push(`/mis-pedidos/${pedidoId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al generar pedido');
    } finally {
      setConvirtiendo(null);
    }
  };

  const filtros = [
    { value: 'todos', label: 'Todas' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'pendiente', label: 'En revisión' },
    { value: 'aprobada', label: 'Aprobadas' },
    { value: 'rechazada', label: 'Rechazadas' },
    { value: 'convertida', label: 'Convertidas' },
  ];

  // Estado para manejar el envío
  const [enviando, setEnviando] = useState<number | null>(null);

  // Función para enviar
  const handleEnviar = async (id: number) => {
    setEnviando(id);
    try {
      await quotesApi.submit(id);
      toast.success('Cotización enviada para revisión');
      cargar();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Error al enviar');
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '4px' }}>
              Mis Cotizaciones
            </h1>
            <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
              {quotes.length} cotizaciones en tu cuenta
            </p>
          </div>
          <Link href="/carrito" className="btn-brand" style={{ fontSize: '14px', padding: '10px 20px' }}>
            <ShoppingCart size={16} /> Ir al carrito
          </Link>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {filtros.map(f => (
            <button key={f.value} onClick={() => setFiltro(f.value)}
              className={`badge-outline ${filtro === f.value ? 'badge-outline-active' : ''}`}
              style={{ cursor: 'pointer', border: 'none', fontSize: '13px' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={32} color="var(--color-brand)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : quotes.length === 0 ? (
          <div className="card-dark" style={{ padding: '4rem', textAlign: 'center' }}>
            <ClipboardList size={48} color="var(--color-content-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {filtro === 'todos' ? 'No tenés cotizaciones aún' : 'No hay cotizaciones con este estado'}
            </h3>
            <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px', marginBottom: '1.5rem' }}>
              Agregá productos al carrito para generar tu primera cotización mayorista.
            </p>
            <Link href="/catalogo" className="btn-brand" style={{ justifyContent: 'center' }}>
              <Plus size={16} /> Explorar catálogo
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quotes.map(q => (
              <div key={q.id} className="card-dark" style={{
                padding: '1.25rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                flexWrap: 'wrap',
              }}>
                {/* Número y fecha */}
                <div style={{ minWidth: '140px' }}>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '3px' }}>
                    {q.numero}
                  </p>

                  <p style={{ fontSize: '12px', color: 'var(--color-content-muted)' }}>
                    {formatDate((q as any).created_at || (q as any).createdAt)}
                  </p>
                </div>

                {/* Estado */}
                <div style={{ minWidth: '130px' }}>
                  <EstadoBadge estado={q.estado} />
                </div>

                {/* Items */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
                    {q.items?.length ?? '—'} {q.items?.length === 1 ? 'producto' : 'productos'}
                  </p>
                  {q.estado === 'rechazada' && q.motivo_rechazo && (
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '3px' }}>
                      ✕ {q.motivo_rechazo}
                    </p>
                  )}
                  {q.estado === 'aprobada' && q.nota_vendedor && (
                    <p style={{ fontSize: '12px', color: '#22C55E', marginTop: '3px' }}>
                      ✓ {q.nota_vendedor}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <p style={{ fontWeight: 900, fontSize: '18px', color: 'var(--color-brand)' }}>
                    {formatPrice(q.total)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-content-muted)' }}>IVA incluido</p>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/mis-cotizaciones/${q.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: '10px', color: '#fff', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>
                    <Eye size={14} /> Ver
                  </Link>

                  {q.estado === 'aprobada' && (
                    <button
                      onClick={() => handleConvertir(q)}
                      disabled={convirtiendo === q.id}
                      className="btn-brand"
                      style={{ fontSize: '13px', padding: '8px 16px' }}>
                      {convirtiendo === q.id
                        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        : <><ShoppingCart size={14} /> Confirmar pedido</>
                      }
                    </button>
                  )}
                </div>
                {q.estado === 'borrador' && (
                  <button
                    onClick={(e) => { e.preventDefault(); handleEnviar(q.id); }}
                    disabled={enviando === q.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 14px',
                      background: 'rgba(245,166,35,0.12)',
                      border: '1px solid rgba(245,166,35,0.3)',
                      borderRadius: '10px', color: 'var(--color-brand)',
                      fontSize: '13px', cursor: 'pointer', fontWeight: 600,
                    }}>
                    {enviando === q.id
                      ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <><Send size={14} /> Enviar</>
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MisCotizacionesPage() {
  return (
    <AuthGuard roles={['cliente']}>
      <CotizacionesContent />
    </AuthGuard>
  );
}