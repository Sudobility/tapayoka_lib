/**
 * @fileoverview Slot range parsing.
 * @description Pure helper that expands a range string into discrete slot
 * labels, used when generating a grid of device slots. Shared business
 * logic so both vendor apps parse ranges identically.
 */

/**
 * Parse a range string into discrete labels.
 * - Letter range: `"A-D"` → `["A","B","C","D"]`
 * - Number range: `"1-5"` → `["1","2","3","4","5"]` (capped at 50 values)
 * - Single value: `"A"` → `["A"]`
 * Returns `[]` for empty or malformed input.
 */
export function parseSlotRange(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Letter range (e.g., "A-D")
  const letterMatch = trimmed.match(/^([A-Za-z])\s*-\s*([A-Za-z])$/);
  if (letterMatch) {
    const start = letterMatch[1].toUpperCase().charCodeAt(0);
    const end = letterMatch[2].toUpperCase().charCodeAt(0);
    if (end < start) return [];
    const result: string[] = [];
    for (let i = start; i <= end; i++) {
      result.push(String.fromCharCode(i));
    }
    return result;
  }

  // Number range (e.g., "1-5")
  const numMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (numMatch) {
    const start = parseInt(numMatch[1], 10);
    const end = parseInt(numMatch[2], 10);
    if (end < start || end - start > 49) return [];
    const result: string[] = [];
    for (let i = start; i <= end; i++) {
      result.push(String(i));
    }
    return result;
  }

  // Single value
  return [trimmed];
}
