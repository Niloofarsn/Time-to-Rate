/** Format an ISO date (YYYY-MM-DD) to DD/MM/YY for the Italian UI. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y.slice(2)}`;
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  return `${formatDate(start)} → ${formatDate(end)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
