/**
 * @fileoverview Order display helpers. Shared by the vendor dashboard and the
 * buyer order history so amounts, timestamps, and status colors render
 * identically across surfaces.
 */

import type { OrderStatus } from '@sudobility/tapayoka_types';

/** Format a cents amount as a currency string, e.g. `250` → `"$2.50"`. */
export function formatOrderAmount(cents: number, currencySymbol = '$'): string {
  return `${currencySymbol}${(cents / 100).toFixed(2)}`;
}

/** Truncate a long id for display, e.g. `"abcd1234efgh"` → `"abcd1234..."`. */
export function truncateId(id: string, length = 8): string {
  return id.length > length ? `${id.slice(0, length)}...` : id;
}

/** Format an order timestamp, e.g. `"Jun 30, 2026, 02:15 PM"`; empty for null. */
export function formatOrderTimestamp(
  date: Date | string | null | undefined
): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Badge color variant for an order status. The union matches the shared Badge
 * components (web `@sudobility/components` and RN `@sudobility/components-rn`),
 * so both apps can pass the result straight to `<Badge variant=... />`.
 */
export type OrderStatusBadgeVariant =
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const ORDER_STATUS_BADGE: Record<OrderStatus, OrderStatusBadgeVariant> = {
  CREATED: 'default', // awaiting payment — neutral
  PAID: 'info', // payment captured
  AUTHORIZED: 'purple', // funds held
  RUNNING: 'warning', // session in progress
  DONE: 'success', // completed
  FAILED: 'danger',
};

/** Map an order status to its Badge color variant. */
export function orderStatusBadgeVariant(
  status: OrderStatus
): OrderStatusBadgeVariant {
  return ORDER_STATUS_BADGE[status] ?? 'default';
}
