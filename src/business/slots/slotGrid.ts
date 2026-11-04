/**
 * @fileoverview Slot grid layout derivation.
 */

import type { VendorDeviceSlot } from '@sudobility/tapayoka_types';

/** Number of columns for a 2D slot grid, derived from the slots' distinct columns (min 1). */
export function computeSlotGridColumns(
  slots: Pick<VendorDeviceSlot, 'column'>[]
): number {
  const uniqueColumns = [...new Set(slots.map(s => s.column).filter(Boolean))];
  return uniqueColumns.length || 1;
}
