import { create } from 'zustand';
import { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  collectionTime: { date: Date; time: string } | null;
  setCollectionTime: (date: Date, time: string) => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  collectionTime: null,

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.product.id === item.product.id
      );

      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.product.id === item.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }

      return { items: [...state.items, item] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(
        (item) => item.product.id !== productId
      ),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: quantity > 0
        ? state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        : state.items.filter(
            (item) => item.product.id !== productId
          ),
    }));
  },

  clearCart: () => set({ items: [], collectionTime: null }),

  setCollectionTime: (date, time) => set({ collectionTime: { date, time } }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  },
}));