// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, Menu, X, ChevronDown,
  LogOut, User, HardHat
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore  } from '@/store/cart.store';
import { authApi } from '@/lib/api';

export const Header = () => {
  const router   = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, logout, isAuthenticated } = useAuthStore();
  const totalItems = useCartStore(s => s.totalItems());

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push('/');
  };

  const navPublic = [
    { href: '/',         label: 'INICIO'   },
    { href: '/catalogo', label: 'CATÁLOGO' },
    { href: '/sectores', label: 'SECTORES' },
    { href: '/empresa',  label: 'EMPRESA'  },
  ];

  const navCliente = [
    { href: '/catalogo',         label: 'CATÁLOGO'     },
    { href: '/mis-cotizaciones', label: 'COTIZACIONES' },
    { href: '/mis-pedidos',      label: 'MIS PEDIDOS'  },
  ];

  const navAdmin = [
    { href: '/admin',               label: 'DASHBOARD'   },
    { href: '/admin/catalogo',      label: 'CATÁLOGO'    },
    { href: '/admin/clientes',      label: 'CLIENTES'    },
    { href: '/admin/cotizaciones',  label: 'COTIZACIONES'},
    { href: '/admin/pedidos',       label: 'PEDIDOS'     },
  ];

  const navLinks = !isAuthenticated
    ? navPublic
    : user?.rol === 'admin' || user?.rol === 'vendedor'
      ? navAdmin
      : navCliente;

  // Skeleton mientras hidrata
  if (!mounted) return (
    <header style={{
      background: 'var(--color-bg-base)',
      borderBottom: '1px solid var(--color-border)',
      height: '64px', position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', padding: '0 2rem',
      justifyContent: 'space-between'
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:36, height:36, background:'var(--color-brand)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <HardHat size={18} color="#000" />
        </div>
        <span style={{ fontWeight:900, color:'#fff', fontSize:'16px' }}>
          OBRA<span style={{ color:'var(--color-brand)' }}>MAESTRA</span>
        </span>
      </div>
    </header>
  );

  return (
    <header style={{
      background: 'var(--color-bg-base)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <div style={{ maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>

          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:36, height:36, background:'var(--color-brand)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <HardHat size={18} color="#000" />
            </div>
            <span style={{ fontWeight:900, color:'#fff', fontSize:'16px', letterSpacing:'-0.02em' }}>
              OBRA<span style={{ color:'var(--color-brand)' }}>MAESTRA</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav style={{ display:'flex', alignItems:'center', gap:'4px' }} className="desktop-nav">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  padding:'8px 12px',
                  fontSize:'12px', fontWeight:600, letterSpacing:'0.08em',
                  color: active ? 'var(--color-brand)' : 'var(--color-content-secondary)',
                  textDecoration:'none', borderRadius:'8px',
                  transition:'color 0.2s',
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones derecha */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {isAuthenticated ? (
              <>
                {/* Carrito solo clientes */}
                {user?.rol === 'cliente' && (
                  <Link href="/carrito" style={{ position:'relative', padding:'10px', borderRadius:'12px', color:'var(--color-content-secondary)', textDecoration:'none', display:'flex' }}>
                    <ShoppingCart size={20} />
                    {totalItems > 0 && (
                      <span style={{
                        position:'absolute', top:'-4px', right:'-4px',
                        background:'var(--color-brand)', color:'#000',
                        fontSize:'10px', fontWeight:900,
                        borderRadius:'50%', width:'20px', height:'20px',
                        display:'flex', alignItems:'center', justifyContent:'center'
                      }}>
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* Menú usuario */}
                <div style={{ position:'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display:'flex', alignItems:'center', gap:'8px',
                      padding:'6px 12px 6px 6px',
                      background:'transparent', border:'1px solid var(--color-border)',
                      borderRadius:'50px', cursor:'pointer'
                    }}
                  >
                    <div style={{
                      width:32, height:32, background:'var(--color-brand)',
                      borderRadius:'50%', display:'flex', alignItems:'center',
                      justifyContent:'center', color:'#000',
                      fontSize:'13px', fontWeight:900
                    }}>
                      {user?.nombre?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ color:'#fff', fontSize:'13px', fontWeight:500 }} className="hide-mobile">
                      {user?.nombre}
                    </span>
                    <ChevronDown size={13} color="var(--color-content-muted)"
                      style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
                  </button>

                  {userMenuOpen && (
                    <div className="animate-fade-in" style={{
                      position:'absolute', right:0, top:'calc(100% + 8px)',
                      width:'240px', background:'var(--color-bg-card)',
                      border:'1px solid var(--color-border)',
                      borderRadius:'var(--radius-card)', zIndex:100,
                      overflow:'hidden'
                    }}>
                      <div style={{ padding:'16px', borderBottom:'1px solid var(--color-border)' }}>
                        <p style={{ fontWeight:600, color:'#fff', fontSize:'14px' }}>
                          {user?.nombre} {user?.apellido}
                        </p>
                        <p style={{ color:'var(--color-content-muted)', fontSize:'12px', marginTop:'2px' }}>
                          {user?.email}
                        </p>
                        {user?.empresa && (
                          <p style={{ color:'var(--color-brand)', fontSize:'12px', fontWeight:600, marginTop:'6px' }}>
                            {user.empresa.razon_social}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        style={{
                          width:'100%', display:'flex', alignItems:'center', gap:'10px',
                          padding:'12px 16px', background:'transparent',
                          border:'none', cursor:'pointer',
                          color:'#f87171', fontSize:'14px'
                        }}
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Link href="/login" style={{
                  display:'flex', alignItems:'center', gap:'6px',
                  padding:'8px 16px', color:'var(--color-content-secondary)',
                  fontSize:'14px', fontWeight:500, textDecoration:'none',
                  borderRadius:'50px', border:'1px solid var(--color-border)'
                }}>
                  <User size={15} /> Ingresar
                </Link>
                <Link href="/registro" className="btn-brand" style={{ padding:'8px 20px', fontSize:'14px' }}>
                  Crear cuenta
                </Link>
                <Link href="/carrito" style={{ padding:'10px', color:'var(--color-content-secondary)', textDecoration:'none', display:'flex' }}>
                  <ShoppingCart size={20} />
                </Link>
              </div>
            )}

            {/* Hamburguesa mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{
                padding:'8px', background:'transparent',
                border:'1px solid var(--color-border)',
                borderRadius:'10px', cursor:'pointer',
                color:'var(--color-content-secondary)',
                display:'none'
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="animate-fade-in" style={{
          background:'var(--color-bg-card)',
          borderTop:'1px solid var(--color-border)'
        }}>
          <nav style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'4px' }}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding:'12px 16px', borderRadius:'10px',
                  fontSize:'13px', fontWeight:600, letterSpacing:'0.08em',
                  color:'var(--color-content-secondary)', textDecoration:'none'
                }}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <button onClick={handleLogout} style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'12px 16px', marginTop:'8px',
                borderTop:'1px solid var(--color-border)',
                background:'transparent', border:'none',
                cursor:'pointer', color:'#f87171', fontSize:'14px'
              }}>
                <LogOut size={15} /> Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};