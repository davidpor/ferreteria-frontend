import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sos el asistente virtual de ObraMaestra, una plataforma de e-commerce B2B mayorista de herramientas y materiales de ferretería ubicada en Mendoza, Argentina.

Tu rol es ayudar a los clientes mayoristas (constructoras, ferreterías, distribuidores) con preguntas sobre:
- Cómo registrarse y crear una cuenta empresa
- Cómo funciona el proceso de cotización (carrito → cotización → aprobación → pedido)
- Métodos de pago disponibles (transferencia, cheque, cuenta corriente, Mercado Pago, efectivo)
- Estados de pedidos y seguimiento
- Precios mayoristas y listas de precios personalizadas
- Stock y disponibilidad de productos
- Datos de contacto y soporte

Información importante del sistema:
- Los clientes primero generan una COTIZACIÓN desde el carrito
- La cotización es revisada y aprobada por un vendedor (en hasta 24hs hábiles)
- Una vez aprobada, el cliente la convierte en PEDIDO eligiendo método de pago
- Los pedidos pasan por estados: Confirmado → En preparación → Despachado → Entregado
- Las cuentas nuevas se activan en 24hs hábiles tras el registro
- Horario de atención: Lunes a Viernes de 8 a 17hs

Reglas de comportamiento:
- Respondé siempre en español argentino, de forma amigable y profesional
- Sé conciso: máximo 3-4 oraciones por respuesta
- Si no sabés algo específico (como stock exacto o precios), decí que van a ser contactados por un vendedor
- No inventes información que no tenés
- Si el cliente tiene un problema urgente, sugerí que llame al (0261) 400-1234`;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
        }

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 400,
                system: SYSTEM_PROMPT,
                messages: messages.slice(-10), // últimos 10 mensajes para contexto
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Chatbot] Error Anthropic:', res.status, err);
            return NextResponse.json({ error: 'Error al procesar tu consulta' }, { status: 500 });
        }

        const data = await res.json();
        const respuesta = data.content?.[0]?.text?.trim() || 'No pude procesar tu consulta. Por favor intentá de nuevo.';

        return NextResponse.json({ respuesta });
    } catch (err: any) {
        console.error('[Chatbot] Error:', err.message);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}