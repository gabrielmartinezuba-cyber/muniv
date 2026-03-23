import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface CartItem {
  id: string; // generated unique id, e.g. timestamp or uuid for cart line item
  experienceId: string;
  title: string;
  price: number;
  status: string;
  eventDate: string | null;
  guests: number;
  upSells: string[];
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItemGuests: (id: string, guests: number) => void;
  toggleItemUpSell: (id: string, upsellId: string) => void;
  clearCart: () => void;
  
  openCart: () => void;
  closeCart: () => void;
  
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],

      addItem: (item) => set((state) => {
        // Prevent duplicate experience in cart unless we want to merge them
        const existing = state.items.find((i) => i.experienceId === item.experienceId);
        if (existing) {
          return {
            isOpen: true,
            items: state.items.map(i => 
              i.experienceId === item.experienceId 
                ? { ...i, guests: i.guests + item.guests }
                : i
            )
          };
        }
        return {
          isOpen: true,
          items: [...state.items, { ...item, id: crypto.randomUUID() }]
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),

      updateItemGuests: (id, guests) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, guests } : i)
      })),

      toggleItemUpSell: (id, upsellId) => set((state) => ({
        items: state.items.map((i) => {
          if (i.id !== id) return i;
          const hasUpsell = i.upSells.includes(upsellId);
          return {
            ...i,
            upSells: hasUpsell ? i.upSells.filter(u => u !== upsellId) : [...i.upSells, upsellId]
          }
        })
      })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          let itemTotal = item.price * item.guests;
          // Dummy logic for testing upsells add $20000 each
          itemTotal += item.upSells.length * 20000; 
          return total + itemTotal;
        }, 0);
      }
    }),
    {
      name: "muniv-cart-draft",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        items: state.items
      }),
    }
  )
);
