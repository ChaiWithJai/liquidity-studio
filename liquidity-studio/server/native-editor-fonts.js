import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const publicDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/fonts",
);
const directory = fs.existsSync(publicDirectory)
  ? publicDirectory
  : "/usr/local/share/fonts/liquidity";
const entries = [
  [
    "Instrument Serif",
    "InstrumentSerif-Regular.ttf",
    "InstrumentSerif-OFL.txt",
    400,
  ],
  ["Mona Sans", "MonaSans-Regular.otf", "MonaSans-OFL.txt", 400],
  ["Inter", "InterVariable.ttf", "Inter-LICENSE.txt", 400],
  [
    "Noto Sans Devanagari",
    "NotoSansDevanagari.ttf",
    "NotoSansDevanagari-OFL.txt",
    400,
  ],
];
export function nativeFontRegistry() {
  return entries.map(([family, filename, license]) => ({
    family,
    sha256: createHash("sha256")
      .update(fs.readFileSync(path.join(directory, filename)))
      .digest("hex"),
    license: "OFL-1.1",
    source: `/fonts/${filename}`,
    // This explicit repertoire is the pinned adapter's badge requirement, not whole-font coverage.
    verifiedCodepoints:
      family === "Noto Sans Devanagari"
        ? ["U+0043", "U+0057", "U+004A", "U+0020", "U+002F", "U+0950"]
        : undefined,
    licenseUrl: `/fonts/${license}`,
  }));
}
export function nativeFontCatalog() {
  return entries.map(([family, filename, license, weight]) => ({
    id: family.toLowerCase().replaceAll(" ", "-"),
    family,
    category: family === "Instrument Serif" ? "serif" : "sans-serif",
    scripts:
      family === "Noto Sans Devanagari" ? ["devanagari", "latin"] : ["latin"],
    is_variable: family === "Inter",
    is_user_font: false,
    popularity: 1,
    variants: [
      { weight, style: "normal", url: `/fonts/${filename}` },
      ...(family === "Mona Sans"
        ? [{ weight: 700, style: "normal", url: "/fonts/MonaSans-Bold.otf" }]
        : []),
    ],
    license_url: `/fonts/${license}`,
  }));
}
