import type { NetworkClient } from '@sudobility/types';
import { useVendorAllDevices } from '@sudobility/tapayoka_client';
import type { FirebaseIdToken } from '@sudobility/tapayoka_client';

/**
 * Org-wide device list manager: every device across the entity, enriched with
 * location/model/offering names for a flat list. Read + delete only — devices
 * are created through the offering-scoped add flow (the add-device wizard),
 * then this list is refreshed. A thin pass-through over the client hook; no
 * store, since the Devices screen owns the only view of this data.
 */
export const useVendorAllDevicesManager = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null
) => {
  const hook = useVendorAllDevices(networkClient, baseUrl, entitySlug, token, {
    enabled: !!token && !!entitySlug,
  });

  return {
    devices: hook.devices,
    isLoading: hook.isLoading,
    error: hook.error,
    refresh: hook.refresh,
    deleteDevice: hook.deleteDevice,
    clearError: hook.clearError,
  };
};
