import { create } from 'zustand';
import type { VendorDevice } from '@sudobility/tapayoka_types';

interface VendorDevicesState {
  devices: VendorDevice[];
  isLoaded: boolean;
  entitySlug: string | null;
  offeringId: string | null;
  setDevices: (
    devices: VendorDevice[],
    offeringId: string,
    entitySlug?: string
  ) => void;
  addDevice: (device: VendorDevice) => void;
  updateDevice: (walletAddress: string, updates: Partial<VendorDevice>) => void;
  removeDevice: (walletAddress: string) => void;
  reset: () => void;
}

export const useVendorDevicesStore = create<VendorDevicesState>(set => ({
  devices: [],
  isLoaded: false,
  entitySlug: null,
  offeringId: null,
  setDevices: (devices, offeringId, entitySlug) =>
    set({
      devices,
      isLoaded: true,
      offeringId,
      entitySlug: entitySlug ?? null,
    }),
  addDevice: device => set(state => ({ devices: [...state.devices, device] })),
  updateDevice: (walletAddress, updates) =>
    set(state => ({
      devices: state.devices.map(e =>
        e.walletAddress === walletAddress ? { ...e, ...updates } : e
      ),
    })),
  removeDevice: walletAddress =>
    set(state => ({
      devices: state.devices.filter(e => e.walletAddress !== walletAddress),
    })),
  reset: () =>
    set({
      devices: [],
      isLoaded: false,
      entitySlug: null,
      offeringId: null,
    }),
}));
