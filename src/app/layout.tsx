// src/app/layout.tsx
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'ObraMaestra — Distribuidor Mayorista B2B',
  description: 'Herramientas y materiales para el profesional de la construcción.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, backgroundColor: '#0A0A0A' }}>
        <Header />
        <main>{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1C1C1C',
              color: '#fff',
              border: '1px solid #2A2A2A',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
