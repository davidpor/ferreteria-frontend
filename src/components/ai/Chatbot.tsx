'use client';

import { useState, useRef, useEffect } from 'react';
import {
    MessageCircle, X, Send, Bot, User,
    Loader2, Minimize2, HardHat
} from 'lucide-react';

interface Mensaje {
    role: 'user' | 'assistant';
    content: string;
}

const SUGERENCIAS = [
    '¿Cómo funciona el proceso de cotización?',
    '¿Cuándo activan mi cuenta?',
    '¿Qué métodos de pago aceptan?',
    '¿Cómo hago seguimiento de mi pedido?',
];

export const Chatbot = () => {
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [input, setInput] = useState('');
    const [cargando, setCargando] = useState(false);
    const [minimizado, setMinimizado] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll automático al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, cargando]);

    // Focus en el input al abrir
    useEffect(() => {
        if (abierto && !minimizado) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [abierto, minimizado]);

    const enviar = async (texto?: string) => {
        const msg = (texto || input).trim();
        if (!msg || cargando) return;

        const nuevosMensajes: Mensaje[] = [
            ...mensajes,
            { role: 'user', content: msg }
        ];
        setMensajes(nuevosMensajes);
        setInput('');
        setCargando(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: nuevosMensajes.map(m => ({
                        role: m.role,
                        content: m.content,
                    }))
                }),
            });

            const data = await res.json();
            setMensajes(prev => [...prev, {
                role: 'assistant',
                content: data.respuesta || 'Hubo un error. Por favor intentá de nuevo.',
            }]);
        } catch {
            setMensajes(prev => [...prev, {
                role: 'assistant',
                content: 'No pude conectarme. Revisá tu conexión e intentá de nuevo.',
            }]);
        } finally {
            setCargando(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    };

    const reiniciar = () => {
        setMensajes([]);
        setInput('');
    };

    return (
        <>
            {/* Botón flotante */}
            {!abierto && (
                <button
                    onClick={() => setAbierto(true)}
                    style={{
                        position: 'fixed', bottom: '24px', right: '24px',
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'var(--color-brand)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 24px rgba(245,166,35,0.5)',
                        zIndex: 1000,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(245,166,35,0.7)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(245,166,35,0.5)';
                    }}
                >
                    <MessageCircle size={24} color="#000" />
                </button>
            )}

            {/* Panel del chat */}
            {abierto && (
                <div className="animate-fade-up" style={{
                    position: 'fixed', bottom: '24px', right: '24px',
                    width: '360px',
                    height: minimizado ? 'auto' : '520px',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', zIndex: 1000,
                }}>

                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '14px 16px',
                        background: 'var(--color-brand)',
                        flexShrink: 0,
                    }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <HardHat size={20} color="#000" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 800, color: '#000', fontSize: '14px', lineHeight: 1 }}>Asistente ObraMaestra</p>
                            <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginTop: '2px' }}>
                                {cargando ? 'Escribiendo...' : 'En línea'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setMinimizado(!minimizado)}
                                style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                                <Minimize2 size={14} />
                            </button>
                            <button onClick={() => { setAbierto(false); setMinimizado(false); }}
                                style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {!minimizado && (
                        <>
                            {/* Mensajes */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                {/* Mensaje de bienvenida */}
                                {mensajes.length === 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(245,166,35,0.1)', border: '2px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                            <Bot size={26} color="var(--color-brand)" />
                                        </div>
                                        <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '6px' }}>¡Hola! ¿En qué puedo ayudarte?</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-content-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                                            Soy el asistente de ObraMaestra. Puedo responderte dudas sobre tu cuenta, pedidos y cotizaciones.
                                        </p>

                                        {/* Sugerencias */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                                            {SUGERENCIAS.map(s => (
                                                <button key={s} onClick={() => enviar(s)}
                                                    style={{ padding: '8px 12px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-content-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,166,35,0.4)';
                                                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                                                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-content-secondary)';
                                                    }}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Historial de mensajes */}
                                {mensajes.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                                        {/* Avatar */}
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'user' ? 'var(--color-brand)' : 'var(--color-bg-elevated)', border: m.role === 'assistant' ? '1px solid var(--color-border)' : 'none' }}>
                                            {m.role === 'user'
                                                ? <User size={14} color="#000" />
                                                : <Bot size={14} color="var(--color-brand)" />
                                            }
                                        </div>

                                        {/* Burbuja */}
                                        <div style={{
                                            maxWidth: '78%', padding: '10px 14px',
                                            borderRadius: m.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                                            background: m.role === 'user' ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                                            border: m.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
                                        }}>
                                            <p style={{ fontSize: '13px', color: m.role === 'user' ? '#000' : '#fff', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {m.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Indicador de escritura */}
                                {cargando && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Bot size={14} color="var(--color-brand)" />
                                        </div>
                                        <div style={{ padding: '10px 14px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '4px 18px 18px 18px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {[0, 1, 2].map(i => (
                                                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div ref={bottomRef} />
                            </div>

                            {/* Footer con input */}
                            <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)', flexShrink: 0, background: 'var(--color-bg-base)' }}>
                                {mensajes.length > 0 && (
                                    <button onClick={reiniciar}
                                        style={{ fontSize: '11px', color: 'var(--color-content-muted)', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '8px', display: 'block' }}>
                                        ↺ Nueva conversación
                                    </button>
                                )}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Escribí tu consulta..."
                                        disabled={cargando}
                                        className="input-dark"
                                        style={{ flex: 1, fontSize: '13px', padding: '10px 14px' }}
                                    />
                                    <button
                                        onClick={() => enviar()}
                                        disabled={!input.trim() || cargando}
                                        style={{
                                            width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                                            background: input.trim() && !cargando ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                                            border: 'none', cursor: input.trim() && !cargando ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'background 0.2s',
                                        }}>
                                        {cargando
                                            ? <Loader2 size={16} color="var(--color-content-muted)" style={{ animation: 'spin 1s linear infinite' }} />
                                            : <Send size={16} color={input.trim() ? '#000' : 'var(--color-content-muted)'} />
                                        }
                                    </button>
                                </div>
                                <p style={{ fontSize: '10px', color: 'var(--color-content-muted)', textAlign: 'center', marginTop: '8px' }}>
                                    Powered by Claude AI · ObraMaestra 2026
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};