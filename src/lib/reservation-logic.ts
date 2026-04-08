import type {
  OpeningHour,
  ReservationConfig,
  ReservationTableConfig,
} from "@/types";

export type ReservationSlotRow = { time: string; guests: number };

export const GERMAN_DAYS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

export function parseTimeToMinutes(t: string): number {
  const s = t.trim();
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return NaN;
  return h * 60 + min;
}

export function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function normalizeTimeToSlotKey(t: string): string {
  const m = parseTimeToMinutes(t);
  if (Number.isNaN(m)) return "";
  return minutesToHHMM(m);
}

export function normalizeOpeningHours(
  raw: OpeningHour[] | Record<string, unknown> | null | undefined
): OpeningHour[] {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is OpeningHour =>
      item != null &&
      typeof item === "object" &&
      "day" in item &&
      "closed" in item
  );
}

export function getGermanWeekday(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return "";
  const [y, mo, d] = parts;
  if (!y || !mo || !d) return "";
  const dt = new Date(y, mo - 1, d);
  return GERMAN_DAYS[dt.getDay()];
}

export function isValidDateYYYYMMDD(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, mo, d] = s.split("-").map(Number);
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d
  );
}

/** Datum ist heute oder in der Zukunft (lokal). */
export function isTodayOrFutureDate(dateStr: string): boolean {
  if (!isValidDateYYYYMMDD(dateStr)) return false;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, mo - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  return dt.getTime() >= today.getTime();
}

export function parseReservationConfig(raw: unknown): ReservationConfig | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const interval = Number(o.slot_interval_minutes);
  const buffer = Number(o.buffer_minutes);
  const dining = Number(o.avg_dining_minutes);
  const tablesRaw = o.tables;
  if (
    !Number.isFinite(interval) ||
    interval <= 0 ||
    !Number.isFinite(buffer) ||
    buffer < 0 ||
    !Number.isFinite(dining) ||
    dining <= 0 ||
    !Array.isArray(tablesRaw) ||
    tablesRaw.length === 0
  ) {
    return null;
  }

  const tables: ReservationTableConfig[] = [];
  for (const row of tablesRaw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const seats = Number(r.seats);
    const count = Number(r.count);
    if (!Number.isFinite(seats) || seats <= 0) continue;
    if (!Number.isFinite(count) || count <= 0) continue;
    tables.push({ seats, count });
  }
  if (tables.length === 0) return null;

  const maxRaw = Number(o.max_party_size);
  const max_party_size =
    Number.isFinite(maxRaw) && maxRaw >= 1 && maxRaw <= 50
      ? Math.floor(maxRaw)
      : undefined;

  const totalSeatsRaw = Number(o.total_seats);
  const total_seats =
    Number.isFinite(totalSeatsRaw) && totalSeatsRaw > 0
      ? Math.floor(totalSeatsRaw)
      : undefined;

  return {
    slot_interval_minutes: interval,
    buffer_minutes: buffer,
    avg_dining_minutes: dining,
    tables,
    ...(max_party_size !== undefined ? { max_party_size } : {}),
    ...(total_seats !== undefined ? { total_seats } : {}),
  };
}

export function generateSlotsInRange(
  openMin: number,
  closeMin: number,
  interval: number
): number[] {
  const slots: number[] = [];
  if (closeMin <= openMin || interval <= 0) return slots;
  const lastStart = closeMin - interval;
  for (let t = openMin; t <= lastStart; t += interval) {
    slots.push(t);
  }
  return slots;
}

export function getValidSlotMinutesForDate(
  dateStr: string,
  hours: OpeningHour[],
  config: ReservationConfig
): number[] {
  const weekdayName = getGermanWeekday(dateStr);
  const dayRow = hours.find((h) => h.day === weekdayName);
  if (!dayRow || dayRow.closed || !dayRow.times?.length) return [];

  const slotMinutesSet = new Set<number>();
  for (const range of dayRow.times) {
    const openMin = parseTimeToMinutes(range.open);
    const closeMin = parseTimeToMinutes(range.close);
    if (Number.isNaN(openMin) || Number.isNaN(closeMin)) continue;
    const rangeSlots = generateSlotsInRange(
      openMin,
      closeMin,
      config.slot_interval_minutes
    );
    for (const m of rangeSlots) slotMinutesSet.add(m);
  }
  return [...slotMinutesSet].sort((a, b) => a - b);
}

/** Dauer einer Belegung in Minuten: Essen + Puffer (Nachbereitung). */
export function getBlockDurationMinutes(
  avgDiningMinutes: number,
  bufferMinutes: number
): number {
  return avgDiningMinutes + bufferMinutes;
}

/**
 * Prüft, ob eine bestehende Reservierung (Start resStartMin) zeitlich mit einem
 * möglichen neuen Slot-Start kollidiert.
 * Belegungsintervall: [resStart, resStart + avg_dining + buffer).
 */
export function reservationBlockOverlapsSlotStart(
  resStartMin: number,
  candidateSlotStartMin: number,
  avgDiningMinutes: number,
  bufferMinutes: number
): boolean {
  const d = getBlockDurationMinutes(avgDiningMinutes, bufferMinutes);
  if (d <= 0) return resStartMin === candidateSlotStartMin;
  return (
    resStartMin < candidateSlotStartMin + d &&
    candidateSlotStartMin < resStartMin + d
  );
}

export function totalSeats(tables: ReservationTableConfig[]): number {
  return tables.reduce((sum, t) => sum + t.seats * t.count, 0);
}

/** Kapazität für Auslastung: total_seats aus Config oder Summe der Tischplätze */
export function occupancyDenominator(config: ReservationConfig): number {
  if (
    typeof config.total_seats === "number" &&
    config.total_seats > 0
  ) {
    return config.total_seats;
  }
  return totalSeats(config.tables);
}

export function occupiedSeatsForSlot(
  overlapping: ReservationSlotRow[],
  tables: ReservationTableConfig[]
): number {
  const sorted = [...overlapping].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
  );

  const remaining = tables.map((t) => ({ ...t }));
  let occupied = 0;

  for (const res of sorted) {
    const g = Math.max(1, Math.min(50, res.guests));
    const bySeats = [...remaining].sort((a, b) => a.seats - b.seats);
    let placed = false;
    for (const spec of bySeats) {
      if (spec.seats >= g && spec.count > 0) {
        spec.count -= 1;
        occupied += spec.seats;
        placed = true;
        break;
      }
    }
    if (!placed) {
      return totalSeats(tables);
    }
  }

  return occupied;
}

export function canSeatGuests(
  overlapping: ReservationSlotRow[],
  tables: ReservationTableConfig[],
  guests: number
): boolean {
  const remaining = tables.map((t) => ({ ...t }));
  const sorted = [...overlapping].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
  );

  for (const res of sorted) {
    const g = Math.max(1, Math.min(50, res.guests));
    const bySeats = [...remaining].sort((a, b) => a.seats - b.seats);
    let placed = false;
    for (const spec of bySeats) {
      if (spec.seats >= g && spec.count > 0) {
        spec.count -= 1;
        placed = true;
        break;
      }
    }
    if (!placed) return false;
  }

  const bySeats = [...remaining].sort((a, b) => a.seats - b.seats);
  for (const spec of bySeats) {
    if (spec.seats >= guests && spec.count > 0) return true;
  }
  return false;
}

/**
 * Kleinster freier Tisch (Sitzplatzanzahl) für die neue Reservierung,
 * nach Zuweisung aller überlappenden Buchungen.
 */
export function findSmallestTableSeatCount(
  overlapping: ReservationSlotRow[],
  tables: ReservationTableConfig[],
  guests: number
): number | null {
  const remaining = tables.map((t) => ({ ...t }));
  const sorted = [...overlapping].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
  );

  for (const res of sorted) {
    const g = Math.max(1, Math.min(50, res.guests));
    const bySeats = [...remaining].sort((a, b) => a.seats - b.seats);
    let placed = false;
    for (const spec of bySeats) {
      if (spec.seats >= g && spec.count > 0) {
        spec.count -= 1;
        placed = true;
        break;
      }
    }
    if (!placed) return null;
  }

  const gNew = Math.max(1, Math.min(50, guests));
  const bySeats = [...remaining].sort((a, b) => a.seats - b.seats);
  for (const spec of bySeats) {
    if (spec.seats >= gNew && spec.count > 0) return spec.seats;
  }
  return null;
}
