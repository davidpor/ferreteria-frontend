import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sos el asistente virtual de ObraMaestra, una plataforma de e-commerce B2B mayorista de herramientas y materiales de ferretería ubicada en Mendoza, Argentina.

Tu rol es ayudar a los clientes mayoristas con preguntas sobre:
- Cómo registrarse y crear una cuenta empresa
- Cómo funciona el proceso de cotización (carrito → cotización → aprobación → pedido)
- Métodos de pago (transferencia, cheque, cuenta corriente, Mercado Pago, efectivo)
- Estados de pedidos y seguimiento
- Precios mayoristas y listas de precios personalizadas

Información del sistema:
- Los clientes generan una COTIZACIÓN desde el carrito
- La cotización es revisada por un vendedor en hasta 24hs hábiles
- Una vez aprobada, el cliente la convierte en PEDIDO
- Los pedidos pasan por: Confirmado → En preparación → Despachado → Entregado
- Las cuentas nuevas se activan en 24hs hábiles tras el registro
- Horario: Lunes a Viernes 8 a 17hs — Teléfono: (0261) 400-1234

Reglas:
- Respondé en español argentino, amigable y profesional
- Máximo 3-4 oraciones por respuesta
- Si no sabés algo específico, decí que van a ser contactados por un vendedor`;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // gratuito y rápido
                max_tokens: 400,
                temperature: 0.7,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages.slice(-10).map((m: any) => ({
                        role: m.role,  // Groq usa 'user' y 'assistant' igual que OpenAI
                        content: m.content,
                    })),
                ],
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Chatbot] Error Groq:', res.status, err);
            return NextResponse.json({ error: 'Error al procesar tu consulta' }, { status: 500 });
        }

        const data = await res.json();
        const respuesta = data.choices?.[0]?.message?.content?.trim()
            || 'No pude procesar tu consulta. Por favor intentá de nuevo.';

        return NextResponse.json({ respuesta });

    } catch (err: any) {
        console.error('[Chatbot] Error:', err.message);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}