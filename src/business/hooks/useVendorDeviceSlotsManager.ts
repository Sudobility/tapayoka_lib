import { useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorDeviceSlotCreateRequest,
  VendorDeviceSlotUpdateRequest,
  VendorDeviceSlotBulkCreateRequest,
} from '@sudobility/tapayoka_types';
import { useVendorDeviceSlots } from '@sudobility/tapayoka_client';
import { useVendorDeviceSlotsStore } from '../stores';
import type { FirebaseIdToken } from '@sudobility/tapayoka_client';

export const useVendorDeviceSlotsManager = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  deviceWalletAddress: string | null
) => {
  const store = useVendorDeviceSlotsStore();
  const hook = useVendorDeviceSlots(
    networkClient,
    baseUrl,
    entitySlug,
    token,
    deviceWalletAddress,
    { enabled: !!token && !!deviceWalletAddress }
  );

  useEffect(() => {
    store.reset();
  }, [entitySlug, deviceWalletAddress]);

  useEffect(() => {
    if (hook.slots.length > 0 && deviceWalletAddress) {
      store.setSlots(hook.slots, deviceWalletAddress);
    }
  }, [hook.slots, deviceWalletAddress]);

  const addSlot = useCallback(
    async (data: VendorDeviceSlotCreateRequest) => {
      const slot = await hook.createSlot(data);
      if (slot) store.addSlot(slot);
      return slot;
    },
    [hook.createSlot]
  );

  const bulkCreateSlots = useCallback(
    async (data: VendorDeviceSlotBulkCreateRequest) => {
      const slots = await hook.bulkCreateSlots(data);
      if (slots) {
        store.clearSlots();
        store.setSlots(slots, deviceWalletAddress!);
      }
      return slots;
    },
    [hook.bulkCreateSlots, deviceWalletAddress]
  );

  const updateSlot = useCallback(
    async (slotId: string, data: VendorDeviceSlotUpdateRequest) => {
      const slot = await hook.updateSlot(slotId, data);
      if (slot) store.updateSlot(slotId, slot);
      return slot;
    },
    [hook.updateSlot]
  );

  const deleteSlot = useCallback(
    async (slotId: string) => {
      const ok = await hook.deleteSlot(slotId);
      if (ok) store.removeSlot(slotId);
      return ok;
    },
    [hook.deleteSlot]
  );

  const deleteAllSlots = useCallback(async () => {
    const ok = await hook.deleteAllSlots();
    if (ok) store.clearSlots();
    return ok;
  }, [hook.deleteAllSlots]);

  return {
    slots: store.isLoaded ? store.slots : hook.slots,
    isLoading: hook.isLoading,
    error: hook.error,
    refresh: hook.refresh,
    addSlot,
    bulkCreateSlots,
    updateSlot,
    deleteSlot,
    deleteAllSlots,
    clearError: hook.clearError,
  };
};
