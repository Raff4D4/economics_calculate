import { EconomicPreset } from "../types";
import { formatIDR, formatNumber, formatPercent } from "../formatters";

export const ECONOMIC_PRESETS: EconomicPreset[] = [
  {
    id: "bep-unit",
    category: "Mikroekonomi",
    title: "Break-Even Point (BEP Unit & Rp)",
    shortCode: "BEP",
    formula: "BEP = FC / (P - VC)",
    description:
      "Menghitung jumlah unit minimal yang wajib terjual agar bisnis mencapai titik impas (tidak untung dan tidak rugi).",
    resultUnit: "unit",
    variables: [
      {
        symbol: "FC",
        label: "Biaya Tetap (Fixed Cost)",
        unit: "Rp",
        defaultValue: 15000000,
        min: 0,
        max: 200000000,
        step: 500000,
      },
      {
        symbol: "P",
        label: "Harga Jual per Unit (Price)",
        unit: "Rp",
        defaultValue: 50000,
        min: 1000,
        max: 1000000,
        step: 1000,
      },
      {
        symbol: "VC",
        label: "Biaya Variabel per Unit (Variable Cost)",
        unit: "Rp",
        defaultValue: 30000,
        min: 0,
        max: 1000000,
        step: 1000,
      },
    ],
    interpret: (result, vars) => {
      const marginPerUnit = vars.P - vars.VC;
      if (marginPerUnit <= 0) {
        return {
          status: "Margin Kontribusi Negatif",
          color: "coral",
          summary:
            "Harga jual per unit (P) harus lebih besar dari biaya variabel per unit (VC) agar titik impas dapat tercapai.",
        };
      }
      const bepRupiah = result * vars.P;
      return {
        status: `Impas pada ${formatNumber(Math.ceil(result), 0)} Unit`,
        color: "mint",
        summary: `Margin kontribusi Rp ${formatNumber(marginPerUnit, 0)}/unit. Titik impas omzet berada di angka ${formatIDR(bepRupiah)}.`,
      };
    },
  },
  {
    id: "price-elasticity",
    category: "Mikroekonomi",
    title: "Elastisitas Harga Permintaan",
    shortCode: "ELASTISITAS",
    formula: "Ed = ((Q2 - Q1) / Q1) / ((P2 - P1) / P1)",
    description:
      "Mengukur tingkat kepekaan perubahan jumlah barang yang diminta konsumen terhadap perubahan harga jual.",
    resultUnit: "angka",
    variables: [
      {
        symbol: "P1",
        label: "Harga Awal (P1)",
        unit: "Rp",
        defaultValue: 20000,
        min: 1000,
        max: 500000,
        step: 500,
      },
      {
        symbol: "P2",
        label: "Harga Baru (P2)",
        unit: "Rp",
        defaultValue: 24000,
        min: 1000,
        max: 500000,
        step: 500,
      },
      {
        symbol: "Q1",
        label: "Permintaan Awal (Q1)",
        unit: "unit",
        defaultValue: 1000,
        min: 1,
        max: 50000,
        step: 10,
      },
      {
        symbol: "Q2",
        label: "Permintaan Baru (Q2)",
        unit: "unit",
        defaultValue: 700,
        min: 1,
        max: 50000,
        step: 10,
      },
    ],
    interpret: (result) => {
      const absEd = Math.abs(result);
      if (absEd > 1) {
        return {
          status: `Permintaan Elastis (|Ed| = ${formatNumber(absEd, 2)})`,
          color: "yellow",
          summary:
            "Konsumen sangat sensitif terhadap harga. Kenaikan harga sedikit dapat menurunkan volume penjualan secara signifikan.",
        };
      }
      if (absEd < 1) {
        return {
          status: `Permintaan Inelastis (|Ed| = ${formatNumber(absEd, 2)})`,
          color: "mint",
          summary:
            "Konsumen tidak terlalu sensitif terhadap perubahan harga (karakteristik barang kebutuhan pokok atau produk dengan loyalitas tinggi).",
        };
      }
      return {
        status: "Elastis Uniter (|Ed| = 1)",
        color: "sky",
        summary: "Persentase perubahan permintaan sama persis dengan persentase perubahan harga.",
      };
    },
  },
  {
    id: "gdp-expenditure",
    category: "Makroekonomi",
    title: "PDB / GDP Pendekatan Pengeluaran",
    shortCode: "GDP MAKRO",
    formula: "GDP = C + I + G + (X - M)",
    description:
      "Menghitung Produk Domestik Bruto berdasarkan total konsumsi rumah tangga, investasi, belanja pemerintah, dan ekspor neto (dalam Triliun Rp).",
    resultUnit: "Rp",
    variables: [
      {
        symbol: "C",
        label: "Konsumsi Rumah Tangga (C - Triliun)",
        unit: "angka",
        defaultValue: 11500,
        min: 0,
        max: 50000,
        step: 100,
      },
      {
        symbol: "I",
        label: "Investasi / PMTB (I - Triliun)",
        unit: "angka",
        defaultValue: 6400,
        min: 0,
        max: 50000,
        step: 100,
      },
      {
        symbol: "G",
        label: "Belanja Pemerintah (G - Triliun)",
        unit: "angka",
        defaultValue: 1900,
        min: 0,
        max: 50000,
        step: 100,
      },
      {
        symbol: "X",
        label: "Total Ekspor (X - Triliun)",
        unit: "angka",
        defaultValue: 4500,
        min: 0,
        max: 50000,
        step: 100,
      },
      {
        symbol: "M",
        label: "Total Impor (M - Triliun)",
        unit: "angka",
        defaultValue: 3900,
        min: 0,
        max: 50000,
        step: 100,
      },
    ],
    interpret: (result, vars) => {
      const netExport = vars.X - vars.M;
      const consumptionShare = result > 0 ? (vars.C / result) * 100 : 0;
      return {
        status:
          netExport >= 0
            ? `Surplus Dagang (+${formatNumber(netExport, 0)} T)`
            : `Defisit Dagang (${formatNumber(netExport, 0)} T)`,
        color: netExport >= 0 ? "mint" : "coral",
        summary: `Total PDB sebesar Rp ${formatNumber(result, 0)} Triliun. Kontribusi konsumsi domestik (C) mencapai ${formatPercent(consumptionShare, 1)} dari total ekonomi.`,
      };
    },
  },
  {
    id: "fisher-real-rate",
    category: "Makroekonomi",
    title: "Suku Bunga Riil (Efek Fisher & Inflasi)",
    shortCode: "FISHER RATE",
    formula: "r_riil = (((1 + i / 100) / (1 + inf / 100)) - 1) * 100",
    description:
      "Menghitung imbal hasil atau suku bunga riil setelah dikoreksi oleh laju inflasi tahunan.",
    resultUnit: "%",
    variables: [
      {
        symbol: "i",
        label: "Bunga Nominal Tahunan (i %)",
        unit: "%",
        defaultValue: 7.5,
        min: 0,
        max: 30,
        step: 0.25,
      },
      {
        symbol: "inf",
        label: "Tingkat Inflasi Tahunan (inf %)",
        unit: "%",
        defaultValue: 3.5,
        min: -5,
        max: 30,
        step: 0.25,
      },
    ],
    interpret: (result) => {
      if (result > 0) {
        return {
          status: `Daya Beli Tumbuh (+${formatPercent(result, 2)})`,
          color: "mint",
          summary:
            "Bunga nominal melampaui laju inflasi sehingga nilai riil aset atau tabungan mengalami pertumbuhan positif.",
        };
      }
      return {
        status: `Tererosi Inflasi (${formatPercent(result, 2)})`,
        color: "coral",
        summary:
          "Tingkat inflasi lebih tinggi daripada bunga nominal sehingga daya beli riil uang menyusut.",
      };
    },
  },
  {
    id: "annuity-credit",
    category: "Perbankan",
    title: "Cicilan Anuitas Kredit Perbankan",
    shortCode: "ANUITAS",
    formula: "M = P * (i * (1 + i)^n) / ((1 + i)^n - 1)",
    description:
      "Menghitung angsuran bulanan tetap (M) berdasarkan pokok pinjaman (P), suku bunga bulanan desimal (i), dan tenor bulan (n).",
    resultUnit: "Rp",
    variables: [
      {
        symbol: "P",
        label: "Pokok Pinjaman (Principal P)",
        unit: "Rp",
        defaultValue: 100000000,
        min: 1000000,
        max: 2000000000,
        step: 1000000,
      },
      {
        symbol: "i",
        label: "Bunga per Bulan Desimal (i)",
        unit: "angka",
        defaultValue: 0.01,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        description: "Contoh: 0.01 setara bunga 1% per bulan (12% per tahun)",
      },
      {
        symbol: "n",
        label: "Tenor Pinjaman (n Bulan)",
        unit: "bulan",
        defaultValue: 36,
        min: 1,
        max: 240,
        step: 1,
      },
    ],
    interpret: (result, vars) => {
      const totalPayment = result * vars.n;
      const totalInterest = totalPayment - vars.P;
      return {
        status: `Cicilan ${formatIDR(result)} / bln`,
        color: "yellow",
        summary: `Total akumulasi pembayaran selama ${vars.n} bulan adalah ${formatIDR(totalPayment)} dengan total beban bunga ${formatIDR(totalInterest)}.`,
      };
    },
  },
  {
    id: "money-multiplier",
    category: "Perbankan",
    title: "Pengganda Uang (Money Multiplier)",
    shortCode: "MULTIPLIER",
    formula: "M_beredar = M0 * (1 / (rr / 100))",
    description:
      "Menghitung potensi ekspansi jumlah uang beredar dari uang primer (M0) berdasarkan rasio Giro Wajib Minimum (rr %).",
    resultUnit: "Rp",
    variables: [
      {
        symbol: "M0",
        label: "Uang Primer / Base Money (M0)",
        unit: "Rp",
        defaultValue: 100000000,
        min: 1000000,
        max: 1000000000,
        step: 1000000,
      },
      {
        symbol: "rr",
        label: "Giro Wajib Minimum / Reserve Ratio (rr %)",
        unit: "%",
        defaultValue: 8,
        min: 1,
        max: 50,
        step: 0.5,
      },
    ],
    interpret: (result, vars) => {
      const multiplier = 1 / (vars.rr / 100);
      return {
        status: `Koefisien Pengganda ${formatNumber(multiplier, 2)}x`,
        color: "lilac",
        summary: `Dengan GWM ${vars.rr}%, setiap Rp 1 uang primer dapat menciptakan hingga Rp ${formatNumber(multiplier, 2)} likuiditas di sistem perbankan.`,
      };
    },
  },
];

