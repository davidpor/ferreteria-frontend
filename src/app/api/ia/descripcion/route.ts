// src/app/api/ia/descripcion/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, sku, marca, categoria } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[IA] ANTHROPIC_API_KEY no configurada');
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
    }

    console.log('[IA] Generando descripción para:', nombre, sku);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role:    'user',
          content: `Generá una descripción técnica profesional de 60-100 palabras para este producto de ferretería mayorista:
Nombre: ${nombre}
SKU: ${sku}
${marca ? `Marca: ${marca}` : ''}
${categoria ? `Categoría: ${categoria}` : ''}

Solo la descripción, en español argentino, sin títulos.`,
        }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[IA] Error Anthropic:', res.status, errText);
      return NextResponse.json({ error: `Error API: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    const descripcion = data.content?.[0]?.text?.trim() || '';
    console.log('[IA] Descripción generada OK, chars:', descripcion.length);

    return NextResponse.json({ descripcion });
  } catch (err: any) {
    console.error('[IA] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}