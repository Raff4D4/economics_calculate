export function parseSmartInput(raw: string): {
  numeric: number;
  isValid: boolean;
  displayBadge: string;
} {
  if (!raw || typeof raw !== "string") {
    return { numeric: 0, isValid: true, displayBadge: "0" };
  }

  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return { numeric: 0, isValid: true, displayBadge: "0" };
  }

  let cleaned = trimmed.replace(/^rp\.?\s*/i, "").trim();

  let multiplier = 1;
  let suffixLabel = "";

  if (/(triliun|trilyun|\bt)$/.test(cleaned)) {
    multiplier = 1_000_000_000_000;
    cleaned = cleaned.replace(/(triliun|trilyun|\bt)$/, "").trim();
    suffixLabel = "Triliun";
  } else if (/(miliar|milyar|milyard|\bm)$/.test(cleaned)) {
    multiplier = 1_000_000_000;
    cleaned = cleaned.replace(/(miliar|milyar|milyard|\bm)$/, "").trim();
    suffixLabel = "Miliar";
  } else if (/(juta|jt)$/.test(cleaned)) {
    multiplier = 1_000_000;
    cleaned = cleaned.replace(/(juta|jt)$/, "").trim();
    suffixLabel = "Juta";
  } else if (/(ribu|rb|\bk)$/.test(cleaned)) {
    multiplier = 1_000;
    cleaned = cleaned.replace(/(ribu|rb|\bk)$/, "").trim();
    suffixLabel = "Ribu";
  } else if (/(tahun|thn|th)$/.test(cleaned)) {
    multiplier = 1;
    cleaned = cleaned.replace(/(tahun|thn|th)$/, "").trim();
    suffixLabel = "Tahun";
  } else if (/(bulan|bln)$/.test(cleaned)) {
    multiplier = 1;
    cleaned = cleaned.replace(/(bulan|bln)$/, "").trim();
    suffixLabel = "Bulan";
  } else if (/(kali|\bx)$/.test(cleaned)) {
    multiplier = 1;
    cleaned = cleaned.replace(/(kali|\bx)$/, "").trim();
    suffixLabel = "Kali (x)";
  } else if (/(persen|%)$/.test(cleaned)) {
    multiplier = 0.01;
    cleaned = cleaned.replace(/(persen|%)$/, "").trim();
    suffixLabel = "% (Desimal)";
  }

  const normalizedNumberString = cleaned.replace(/,/g, ".");
  const parsed = Number(normalizedNumberString);

  if (!Number.isFinite(parsed)) {
    return { numeric: 0, isValid: false, displayBadge: "Format salah" };
  }

  const finalValue = parsed * multiplier;
  const badge = suffixLabel
    ? `${parsed} ${suffixLabel}`
    : formatSmartPreview(finalValue);

  return {
    numeric: finalValue,
    isValid: true,
    displayBadge: badge,
  };
}

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
    return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(2)} Triliun`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} Miliar`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(2)} Juta`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(1)} Ribu`;
  }
  return formatIDR(value);
}

export function formatNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(
      value
    );
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

export function formatSmartPreview(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) {
    return `${formatNumber(value / 1_000_000_000_000, 2)} Triliun (${formatIDR(value)})`;
  }
  if (abs >= 1_000_000_000) {
    return `${formatNumber(value / 1_000_000_000, 2)} Miliar (${formatIDR(value)})`;
  }
  if (abs >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 2)} Juta (${formatIDR(value)})`;
  }
  if (abs >= 10_000) {
    return formatIDR(value);
  }
  if (abs > 0 && abs < 1) {
    return `${formatNumber(value, 4)} (${formatPercent(value * 100, 2)})`;
  }
  return formatNumber(value, 4);
}
