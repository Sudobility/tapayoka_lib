import { useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorDeviceCreateRequest,
  VendorDeviceUpdateRequest,
} from '@sudobility/tapayoka_types';
import { useVendorDevices } from '@sudobility/tapayoka_client';
import { useVendorDevicesStore } from '../stores';
import type { FirebaseIdToken } from '@sudobility/tapayoka_client';

export const useVendorDevicesManager = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  offeringId: string | null
) => {
  const store = useVendorDevicesStore();
  const hook = useVendorDevices(
    networkClient,
    baseUrl,
    entitySlug,
    token,
    offeringId,
    { enabled: !!token && !!offeringId }
  );

  useEffect(() => {
    store.reset();
  }, [entitySlug]);

  useEffect(() => {
    if (hook.devices.length > 0 && offeringId) {
      store.setDevices(hook.devices, offeringId, entitySlug ?? undefined);
    }
  }, [hook.devices, offeringId, entitySlug]);

  const addDevice = useCallback(
    async (data: VendorDeviceCreateRequest) => {
      const device = await hook.createDevice(data);
      if (device) store.addDevice(device);
      return device;
    },
    [hook.createDevice]
  );

  const updateDevice = useCallback(
    async (walletAddress: string, data: VendorDeviceUpdateRequest) => {
      const device = await hook.updateDevice(walletAddress, data);
      if (device) store.updateDevice(walletAddress, device);
      return device;
    },
    [hook.updateDevice]
  );

  const deleteDevice = useCallback(
    async (walletAddress: string) => {
      const ok = await hook.deleteDevice(walletAddress);
      if (ok) store.removeDevice(walletAddress);
      return ok;
    },
    [hook.deleteDevice]
  );

  const lookupDevice = useCallback(
    (walletAddress: string) => hook.lookupDevice(walletAddress),
    [hook.lookupDevice]
  );

  return {
    devices: store.isLoaded ? store.devices : hook.devices,
    isLoading: hook.isLoading,
    error: hook.error,
    refresh: hook.refresh,
    addDevice,
    updateDevice,
    deleteDevice,
    lookupDevice,
    clearError: hook.clearError,
  };
};
