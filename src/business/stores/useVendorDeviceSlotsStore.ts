import { create } from 'zustand';
import type { VendorDeviceSlot } from '@sudobility/tapayoka_types';

interface VendorDeviceSlotsState {
  slots: VendorDeviceSlot[];
  isLoaded: boolean;
  deviceWalletAddress: string | null;
  setSlots: (slots: VendorDeviceSlot[], deviceWalletAddress: string) => void;
  addSlot: (slot: VendorDeviceSlot) => void;
  addSlots: (slots: VendorDeviceSlot[]) => void;
  updateSlot: (slotId: string, updates: Partial<VendorDeviceSlot>) => void;
  removeSlot: (slotId: string) => void;
  clearSlots: () => void;
  reset: () => void;
}

export const useVendorDeviceSlotsStore = create<VendorDeviceSlotsState>(
  set => ({
    slots: [],
    isLoaded: false,
    deviceWalletAddress: null,
    setSlots: (slots, deviceWalletAddress) =>
      set({ slots, isLoaded: true, deviceWalletAddress }),
    addSlot: slot => set(state => ({ slots: [...state.slots, slot] })),
    addSlots: slots => set(state => ({ slots: [...state.slots, ...slots] })),
    updateSlot: (slotId, updates) =>
      set(state => ({
        slots: state.slots.map(s =>
          s.id === slotId ? { ...s, ...updates } : s
        ),
      })),
    removeSlot: slotId =>
      set(state => ({
        slots: state.slots.filter(s => s.id !== slotId),
      })),
    clearSlots: () => set({ slots: [] }),
    reset: () =>
      set({
        slots: [],
        isLoaded: false,
        deviceWalletAddress: null,
      }),
  })
);
