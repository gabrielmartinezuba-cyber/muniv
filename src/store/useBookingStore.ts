import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

// IndexedDB storage adapter for Zustand
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

export type BookingStep = 1 | 2 | 3 | 4;

interface BookingState {
  isOpen: boolean;
  step: BookingStep;
  experienceId: string | null;
  experienceTitle: string | null;
  
  // Form Data Draft
  date: string | null;
  time: string | null;
  guests: number;
  upSells: string[]; // e.g. ["SOMMELIER_BILINGUE", "MARIDAJE_PREMIUM"]
  
  // Actions
  openBooking: (expId: string, title: string) => void;
  closeBooking: () => void;
  setStep: (step: BookingStep) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setGuests: (guests: number) => void;
  toggleUpSell: (upsellId: string) => void;
  resetDraft: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      isOpen: false,
      step: 1,
      experienceId: null,
      experienceTitle: null,
      date: null,
      time: null,
      guests: 2,
      upSells: [],

      openBooking: (expId, title) => 
        set({ isOpen: true, experienceId: expId, experienceTitle: title }),
      
      closeBooking: () => set({ isOpen: false }),
      
      setStep: (step) => set({ step }),
      
      setDate: (date) => set({ date }),
      
      setTime: (time) => set({ time }),
      
      setGuests: (guests) => set({ guests }),
      
      toggleUpSell: (upsellId) => set((state) => {
        if (state.upSells.includes(upsellId)) {
          return { upSells: state.upSells.filter((id) => id !== upsellId) };
        }
        return { upSells: [...state.upSells, upsellId] };
      }),
      
      resetDraft: () => set({
        step: 1,
        date: null,
        time: null,
        guests: 2,
        upSells: [],
      })
    }),
    {
      name: "muniv-booking-draft",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        // We only persist the draft data, NOT the drawer state (isOpen)
        step: state.step,
        experienceId: state.experienceId,
        experienceTitle: state.experienceTitle,
        date: state.date,
        time: state.time,
        guests: state.guests,
        upSells: state.upSells
      }),
    }
  )
);
