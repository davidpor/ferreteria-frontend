// src/store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items:      CartItem[];
  addItem:    (item: CartItem) => void;
  updateItem: (productId: number, cantidad: number) => void;
  removeItem: (productId: number) => void;
  clearCart:  () => void;
  total:      () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items  = get().items;
        const existe = items.find(i => i.product_id === newItem.product_id);
        if (existe) {
          const nuevaCantidad = existe.cantidad + newItem.cantidad;
          set({ items: items.map(i =>
            i.product_id === newItem.product_id
              ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.precio_unitario }
              : i
          )});
        } else {
          set({ items: [...items, newItem] });
        }
      },

      updateItem: (productId, cantidad) =>
        set({ items: get().items.map(i =>
          i.product_id === productId
            ? { ...i, cantidad, subtotal: cantidad * i.precio_unitario }
            : i
        )}),

      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.product_id !== productId) }),

      clearCart: () => set({ items: [] }),

      total:      () => get().items.reduce((acc, i) => acc + i.subtotal, 0),
      totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'cart-storage' }
  )
);