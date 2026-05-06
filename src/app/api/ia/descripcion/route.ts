// src/app/api/ia/descripcion/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nombre, sku, marca, categoria } = await req.json();

    const prompt = `Generá una descripción técnica profesional para el siguiente producto de ferretería mayorista:

Nombre: ${nombre}
SKU: ${sku}
${marca ? `Marca: ${marca}` : ''}
${categoria ? `Categoría: ${categoria}` : ''}

La descripción debe:
- Tener entre 60 y 120 palabras
- Destacar las características técnicas más importantes
- Usar lenguaje profesional y técnico
- Ser útil para compradores mayoristas (constructoras, ferreterías)
- No incluir precio ni disponibilidad
- Estar en español argentino

Respondé SOLO con la descripción, sin títulos ni explicaciones adicionales.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const descripcion = data.content?.[0]?.text?.trim() || '';

    return NextResponse.json({ descripcion });
  } catch (err) {
    return NextResponse.json({ error: 'Error al generar descripción' }, { status: 500 });
  }
}