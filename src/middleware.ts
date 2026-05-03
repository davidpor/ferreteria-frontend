// src/middleware.ts  ← va en la raíz de src/, NO dentro de app/
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren estar logueado
const RUTAS_PROTEGIDAS = [
  '/catalogo', '/carrito', '/checkout',
  '/mis-cotizaciones', '/mis-pedidos', '/perfil',
  '/admin',
];

// Rutas solo para admin/vendedor
const RUTAS_ADMIN = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '');

  const esRutaProtegida = RUTAS_PROTEGIDAS.some(r => pathname.startsWith(r));
  const esRutaAdmin     = RUTAS_ADMIN.some(r => pathname.startsWith(r));

  // Si no tiene token y quiere acceder a ruta protegida → login
  if (esRutaProtegida && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};