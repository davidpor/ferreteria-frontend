// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combina clases de Tailwind sin conflictos
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Formatea precios en pesos argentinos
export const formatPrice = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style:                 'currency',
    currency:              'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Formatea fechas en español
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
};

// Colores y labels para los estados de cotización
export const estadoQuoteConfig: Record<string, { label: string; color: string }> = {
  borrador:   { label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  aprobada:   { label: 'Aprobada',   color: 'bg-green-100 text-green-700' },
  rechazada:  { label: 'Rechazada',  color: 'bg-red-100 text-red-700' },
  vencida:    { label: 'Vencida',    color: 'bg-orange-100 text-orange-700' },
  convertida: { label: 'Convertida', color: 'bg-blue-100 text-blue-700' },
};

// Colores y labels para los estados de pedido
export const estadoOrderConfig: Record<string, { label: string; color: string; icon: string }> = {
  confirmado:     { label: 'Confirmado',     color: 'bg-blue-100 text-blue-700',   icon: '✓' },
  en_preparacion: { label: 'En preparación', color: 'bg-yellow-100 text-yellow-700', icon: '⚙' },
  despachado:     { label: 'Despachado',     color: 'bg-purple-100 text-purple-700', icon: '🚚' },
  entregado:      { label: 'Entregado',      color: 'bg-green-100 text-green-700',  icon: '✅' },
  cancelado:      { label: 'Cancelado',      color: 'bg-red-100 text-red-700',      icon: '✗' },
};

// Valida formato CUIT argentino
export const validarCuit = (cuit: string): boolean => {
  const regex = /^\d{2}-\d{8}-\d{1}$/;
  if (!regex.test(cuit)) return false;

  const nums = cuit.replace(/-/g, '');
  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let total  = 0;

  for (let i = 0; i < mult.length; i++) {
    total += parseInt(nums[i]) * mult[i];
  }

  const resto = total % 11;
  const dv    = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return dv === parseInt(nums[10]);
};

// Trunca texto largo
export const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max) + '...' : text;