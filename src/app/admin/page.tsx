// src/app/admin/page.tsx
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/store/auth.store';
import { Package, ClipboardList, Building2, ShoppingBag, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const user = useAuthStore(s => s.user);

  const acciones = [
    { label: 'Gestionar catálogo',   desc: 'Productos, categorías y stock',   href: '/admin/catalogo',     icon: Package       },
    { label: 'Ver cotizaciones',     desc: 'Aprobar o rechazar cotizaciones', href: '/admin/cotizaciones', icon: ClipboardList  },
    { label: 'Gestionar pedidos',    desc: 'Estados, remitos y facturas',     href: '/admin/pedidos',      icon: ShoppingBag    },
    { label: 'Clientes mayoristas',  desc: 'Empresas y listas de precios',    href: '/admin/clientes',     icon: Building2      },
  ];

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 64px)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: '28px', color: '#fff', marginBottom: '4px' }}>
            Bienvenido, {user?.nombre} 👋
          </h1>
          <p style={{ color: 'var(--color-content-secondary)', fontSize: '14px' }}>
            Panel de administración — ObraMaestra B2B
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {acciones.map(({ label, desc, href, icon: Icon }) => (
            <Link key={label} href={href} style={{ textDecoration: 'none' }}>
              <div className="card-dark card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color="var(--color-brand)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#fff', fontSize: '15px', marginBottom: '3px' }}>{label}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
          <AlertTriangle size={18} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-content-secondary)' }}>
            <strong style={{ color: 'var(--color-brand)' }}>Sistema en desarrollo — </strong>
            Los módulos están disponibles en el menú superior.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard roles={['admin', 'vendedor']}>
      <DashboardContent />
    </AuthGuard>
  );
}