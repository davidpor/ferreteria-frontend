// src/types/index.ts

export type Rol = 'admin' | 'vendedor' | 'cliente';

export interface Company {
  id: number;
  razon_social: string;
  cuit: string;
  condicion_iva: string;
  descuento_base: number;
  limite_credito: number;
  activa: boolean;
  price_list_id: number | null;
  email_contacto?: string;
  telefono?: string;
  ciudad?: string;
  provincia?: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  company_id: number | null;
  empresa?: Company;
}

export interface Category {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
}

export interface Product {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  slug: string;
  marca?: string;
  precio_lista: number;
  precio_cliente?: number;   // precio calculado para el cliente logueado
  stock_actual: number;
  stock_minimo: number;
  unidad_venta: string;
  cantidad_minima: number;
  contenido_por_unidad: number;
  peso_kg?: number;
  activo: boolean;
  destacado: boolean;
  imagen_url?: string;
  categoria?: Category;
  category_id?: number;
}

export interface CartItem {
  product_id: number;
  sku: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  unidad_venta: string;
  cantidad_minima: number;
  subtotal: number;
  imagen_url?: string;
}

export interface QuoteItem {
  id: number;
  product_id: number;
  nombre_producto: string;
  sku_producto: string;
  cantidad: number;
  precio_unitario: number;
  descuento_aplicado: number;
  subtotal: number;
  producto?: Product;
}

export interface Quote {
  id: number;
  numero: string;
  estado: 'borrador' | 'pendiente' | 'aprobada' | 'rechazada' | 'vencida' | 'convertida';
  subtotal: number;
  iva_porcentaje: number;
  iva_monto: number;
  total: number;
  descuento_extra: number;
  observaciones_cliente?: string;
  nota_vendedor?: string;
  motivo_rechazo?: string;
  fecha_vencimiento: string;
  created_at: string;
  items: QuoteItem[];
  empresa?: Company;
  creador?: User;
  revisor?: User;
}

export interface OrderStatusLog {
  id: number;
  estado_anterior: string;
  estado_nuevo: string;
  nota?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  nombre_producto: string;
  sku_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Order {
  id: number;
  numero: string;
  estado: 'confirmado' | 'en_preparacion' | 'despachado' | 'entregado' | 'cancelado';
  estado_pago: 'pendiente' | 'pagado' | 'parcial';
  metodo_pago: string;
  subtotal: number;
  iva_monto: number;
  iva_porcentaje: number;
  total: number;
  descuento_extra: number;
  numero_remito?: string;
  numero_factura?: string;
  direccion_entrega?: string;
  observaciones?: string;
  created_at: string;
  items: OrderItem[];
  historial?: OrderStatusLog[];
  empresa?: Company;
  creador?: User;
  vendedor?: User;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}