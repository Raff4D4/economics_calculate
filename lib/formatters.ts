export function formatIDR(value: number): string {
  if (!Number.isFinite(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactIDR(value: number): string {
  if (!Number.isFinite(value)) return "Rp 0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(2)} T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(2)} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(1)} Rb`;
  }
  return formatIDR(value);
}

export function formatNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 1_000_000_000) {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

