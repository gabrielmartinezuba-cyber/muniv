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
  id: string; // generated unique id
  experienceId: string;
  type: string;
  title: string;
  price: number;
  status: string;
  eventDate: string | null;
  guests: number; // For non-caja it's persons, for caja it's number of boxes
  upSells: string[];
  wine_quantity?: number; // bottle count per box
  wine_options?: string[]; // varieties to choose from
  selected_wines?: string[]; // actual user choices (flat array of strings)
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  
  // Benefit logic
  benefit: { percentage: number; cap: number | null } | null;
  setBenefit: (benefit: { percentage: number; cap: number | null } | null) => void;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItemGuests: (id: string, guests: number) => void;
  updateItemWines: (id: string, newWinesArray: string[]) => void;
  toggleItemUpSell: (id: string, upsellId: string) => void;
  clearCart: () => void;
  
  openCart: () => void;
  closeCart: () => void;
  
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      benefit: null,

      setBenefit: (benefit) => set({ benefit }),

      addItem: (item) => set((state) => {
        // Prevent duplicate experience in cart if it's a Sorteo
        const existing = state.items.find((i) => i.experienceId === item.experienceId);
        
        if (existing && item.type === 'Sorteo') {
           return { isOpen: true }; 
        }

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
          items: [...state.items, { ...item, id: crypto.randomUUID(), selected_wines: [] }]
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),

      updateItemGuests: (id, guests) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, guests } : i)
      })),

      updateItemWines: (id, newWinesArray) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, selected_wines: newWinesArray } : i)
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

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          let itemTotal = item.price * item.guests;
          // Up-sells logic
          itemTotal += item.upSells.length * 20000; 
          return total + itemTotal;
        }, 0);
      },

      getDiscountAmount: () => {
        const state = get();
        const benefit = state.benefit;
        if (!benefit || benefit.percentage <= 0) return 0;
        
        let subtotalForDiscount = 0;
        
        state.items.forEach(item => {
          let itemDiscountable = item.price * item.guests;
          
          if (item.type?.trim().toLowerCase() === 'evento') {
            itemDiscountable = item.price; // Solo descuenta 1 unidad
          }
          
          subtotalForDiscount += itemDiscountable;
        });

        const rawDiscount = subtotalForDiscount * (benefit.percentage / 100);
        
        // Return calculated discount capped by the benefit limit if any
        return Math.min(rawDiscount, benefit.cap || Infinity);
      },

      getTotal: () => {
        const state = get();
        return state.getSubtotal() - state.getDiscountAmount();
      }
    }),
    {
      name: "muniv-cart-draft-v2",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        items: state.items,
        benefit: state.benefit
      }),
    }
  )
);
