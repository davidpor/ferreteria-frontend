// src/app/page.tsx
import Link from 'next/link';
import { ArrowRight, HardHat, Factory, ShieldCheck } from 'lucide-react';

const sectores = [
  { nombre: 'Herramientas Eléctricas', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', grande: true  },
  { nombre: 'Seguridad Industrial',    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', grande: false },
  { nombre: 'Medición y Control',      img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80', grande: false },
  { nombre: 'Equipamiento Pesado',     img: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=800&q=80', grande: false },
];

const features = [
  { icon: HardHat,     titulo: 'Equipamiento Profesional', desc: 'Marcas líderes en el sector para asegurar la máxima durabilidad.'   },
  { icon: Factory,     titulo: 'Stock por Mayor',          desc: 'Volúmenes industriales para abastecer obras de cualquier escala.'    },
  { icon: ShieldCheck, titulo: 'Compra Segura y Rápida',   desc: 'Facturación B2B, atención personalizada y logística eficiente.'     },
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-base)' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position:'relative', minHeight:'calc(100vh - 4rem)', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <img
            src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1600&q=80"
            alt="Ferretería industrial"
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.4 }}
          />
          <div className="bg-hero-gradient" style={{ position:'absolute', inset:0 }} />
        </div>

        <div style={{ position:'relative', zIndex:10, maxWidth:'80rem', margin:'0 auto', padding:'5rem 1.5rem', width:'100%' }}>
          <div style={{ maxWidth:'42rem' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'6px 14px', borderRadius:'var(--radius-pill)',
              border:'1px solid rgba(245,166,35,0.4)',
              background:'rgba(245,166,35,0.1)',
              color:'var(--color-brand)',
              fontSize:'12px', fontWeight:600,
              textTransform:'uppercase', letterSpacing:'0.1em',
              marginBottom:'2rem'
            }}>
              <HardHat size={14} />
              Distribuidor Mayorista
            </div>

            <h1 style={{ fontWeight:900, textTransform:'uppercase', lineHeight:1, marginBottom:'1.5rem' }}>
              <span style={{ display:'block', color:'#fff', fontSize:'clamp(3rem,8vw,6rem)' }}>CONSTRUYE</span>
              <span style={{ display:'block', color:'var(--color-brand)', fontSize:'clamp(3rem,8vw,6rem)' }}>EN GRANDE.</span>
            </h1>

            <p style={{ color:'var(--color-content-secondary)', fontSize:'18px', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:'28rem' }}>
              Abastecemos tu proyecto con herramientas y materiales de primera calidad.
              Precios mayoristas, envíos directos a obra y stock garantizado.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem' }}>
              <Link href="/catalogo" className="btn-brand" style={{ fontSize:'16px', padding:'14px 32px' }}>
                Catálogo Mayorista <ArrowRight size={18} />
              </Link>
              <Link href="/registro" className="btn-outline" style={{ fontSize:'16px', padding:'14px 32px' }}>
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ background:'var(--color-bg-overlay)', padding:'4rem 0' }}>
        <div style={{ maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem' }}>
            {features.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="card-dark" style={{ padding:'1.5rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                <div style={{
                  width:48, height:48, borderRadius:12, flexShrink:0,
                  background:'rgba(245,166,35,0.1)',
                  border:'1px solid rgba(245,166,35,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <Icon size={22} color="var(--color-brand)" />
                </div>
                <div>
                  <h3 style={{ fontWeight:700, color:'#fff', marginBottom:'4px' }}>{titulo}</h3>
                  <p style={{ fontSize:'14px', color:'var(--color-content-secondary)', lineHeight:1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORES — usamos CSS hover en vez de JS handlers ─────── */}
      <section style={{ padding:'5rem 0' }}>
        <div style={{ maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 className="section-title">COMPRAR POR SECTOR</h2>
            <div className="accent-line" style={{ margin:'1rem auto 0' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'repeat(2,220px)', gap:'1rem' }}>
            {/* Card grande */}
            <Link href="/catalogo" className="sector-card" style={{ gridRow:'span 2', gridColumn:'1' }}>
              <img src={sectores[0].img} alt={sectores[0].nombre} className="sector-img" />
              <div className="bg-card-gradient" style={{ position:'absolute', inset:0 }} />
              <div style={{ position:'absolute', bottom:0, left:0, padding:'1.5rem' }}>
                <h3 style={{ fontWeight:900, fontSize:'20px', textTransform:'uppercase', color:'#fff', marginBottom:'6px' }}>
                  {sectores[0].nombre}
                </h3>
                <span style={{ color:'var(--color-brand)', fontSize:'14px', fontWeight:600, display:'flex', alignItems:'center', gap:'4px' }}>
                  Abastecer ahora <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Cards pequeñas */}
            {sectores.slice(1).map(s => (
              <Link key={s.nombre} href="/catalogo" className="sector-card">
                <img src={s.img} alt={s.nombre} className="sector-img" />
                <div className="bg-card-gradient" style={{ position:'absolute', inset:0 }} />
                <div style={{ position:'absolute', bottom:0, left:0, padding:'1rem' }}>
                  <h3 style={{ fontWeight:900, fontSize:'13px', textTransform:'uppercase', color:'#fff' }}>{s.nombre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTACADOS ───────────────────────────────────────────── */}
      <section style={{ background:'var(--color-bg-overlay)', padding:'5rem 0' }}>
        <div style={{ maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <h2 className="section-title">HERRAMIENTAS DESTACADAS</h2>
              <p style={{ color:'var(--color-content-secondary)', marginTop:'8px' }}>
                Equipa a tu equipo con nuestra selección premium de herramientas industriales.
              </p>
            </div>
            <Link href="/catalogo" style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--color-brand)', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>
              Ver Catálogo Completo <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.25rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="card-dark" style={{ overflow:'hidden' }}>
                <div className="skeleton" style={{ height:'200px' }} />
                <div style={{ padding:'1rem' }}>
                  <div className="skeleton" style={{ height:'12px', width:'80px', marginBottom:'12px' }} />
                  <div className="skeleton" style={{ height:'20px', width:'100%', marginBottom:'8px' }} />
                  <div className="skeleton" style={{ height:'16px', width:'75%', marginBottom:'16px' }} />
                  <div className="skeleton" style={{ height:'24px', width:'96px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background:'var(--color-bg-base)', borderTop:'1px solid var(--color-border)', padding:'4rem 0' }}>
        <div style={{ maxWidth:'80rem', margin:'0 auto', padding:'0 1.5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'2.5rem', marginBottom:'3rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem' }}>
                <div style={{ width:36, height:36, background:'var(--color-brand)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <HardHat size={18} color="#000" />
                </div>
                <span style={{ fontWeight:900, color:'#fff' }}>OBRAMAESTRA</span>
              </div>
              <p style={{ fontSize:'14px', color:'var(--color-content-secondary)', lineHeight:1.7 }}>
                El proveedor mayorista líder en materiales y herramientas para el profesional de la construcción.
              </p>
            </div>

            {[
              { titulo:'Catálogo',          items:['Todos los Productos','Herramientas Eléctricas','Materiales Pesados','Seguridad Industrial'] },
              { titulo:'Soporte a Empresas',items:['Abrir Cuenta Corriente','Logística y Envíos','Contacto Comercial','Garantías'] },
            ].map(col => (
              <div key={col.titulo}>
                <h4 style={{ fontWeight:700, color:'#fff', marginBottom:'1rem' }}>{col.titulo}</h4>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {col.items.map(item => (
                    <li key={item}>
                      <Link href="/catalogo" className="footer-link">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 style={{ fontWeight:700, color:'#fff', marginBottom:'8px' }}>Boletín Mayorista</h4>
              <p style={{ fontSize:'14px', color:'var(--color-content-secondary)', marginBottom:'1rem', lineHeight:1.6 }}>
                Recibí actualizaciones de stock y listas de precios.
              </p>
              <div style={{ display:'flex', gap:'8px' }}>
                <input type="email" placeholder="email@empresa.com" className="input-dark" style={{ flex:1, padding:'10px 14px', fontSize:'13px' }} />
                <button className="btn-brand" style={{ padding:'10px 16px', fontSize:'13px', whiteSpace:'nowrap' }}>Suscribir</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <p style={{ fontSize:'12px', color:'var(--color-content-muted)' }}>
              © 2026 ObraMaestra Mayorista S.A. Todos los derechos reservados.
            </p>
            <div style={{ display:'flex', gap:'1.5rem' }}>
              {['Términos de Facturación','Privacidad'].map(item => (
                <Link key={item} href="#" className="footer-link" style={{ fontSize:'12px' }}>{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}