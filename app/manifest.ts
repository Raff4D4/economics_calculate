import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EconoBrutal — Kalkulator Ekonomi & Rumus Dinamis",
    short_name: "EconoBrutal",
    description:
      "Kalkulator Ekonomi, Margin Bersih, ROI, P/E, Compound Interest, Makro/Mikro & Sandbox Rumus Dinamis bergaya Neubrutalism.",
    start_url: "/",
    display: "standalone",
    background_color: "rgb(244, 240, 234)",
    theme_color: "rgb(255, 229, 0)",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

