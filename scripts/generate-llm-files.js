#!/usr/bin/env node
// Generates LLM-friendly markdown from public/colors.json into build/.
// Runs as `postbuild`. No dependencies.
const fs = require("fs");
const path = require("path");

const SITE = "https://colors.treasurechest.design";
const root = path.join(__dirname, "..");
const outDir = path.join(root, "build");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "public", "colors.json"), "utf8"),
);

// Same naive CMYK->RGB formula the UI uses, so values match what users see.
const toRgb = ([c, m, y, k]) =>
  [c, m, y].map((v) => Math.round(255 * (1 - v / 100) * (1 - k / 100)));
const toHex = (rgb) =>
  "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const colorNames = Object.keys(data.colors);
const slugs = new Map(colorNames.map((n) => [n, slug(n)]));
if (new Set(slugs.values()).size !== colorNames.length) {
  throw new Error("Color slug collision");
}

const palettes = Object.entries(data.palettes).sort(
  (a, b) => Number(a[0]) - Number(b[0]),
);

// Derive palette membership from palettes (source of truth), not `references`.
const usedIn = new Map(colorNames.map((n) => [n, []]));
for (const [id, p] of palettes) {
  for (const c of p.colors) {
    if (!usedIn.has(c)) throw new Error(`Palette ${id} uses unknown color ${c}`);
    usedIn.get(c).push(id);
  }
}

const colorInfo = (name) => {
  const cmyk = data.colors[name].CMYK;
  const rgb = toRgb(cmyk);
  return { cmyk, rgb, hex: toHex(rgb) };
};
const colorLink = (name) => `[${name}](${SITE}/colors/${slugs.get(name)}.md)`;
const paletteLink = (id) => `[Palette ${id}](${SITE}/palettes/${id}.md)`;

const NOTE =
  "HEX/RGB are derived from CMYK with a naive conversion (R = 255·(1−C)·(1−K), etc.), so they approximate the printed colors.";

const paletteMd = (id, p) =>
  [
    `# Palette ${id}`,
    "",
    `- Section: ${p.section}`,
    `- Source: Volume ${p.volume} of *A Dictionary of Color Combinations*`,
    "",
    "## Colors",
    "",
    ...p.colors.map((c) => {
      const { cmyk, rgb, hex } = colorInfo(c);
      return `- ${colorLink(c)}: ${hex}, rgb(${rgb.join(", ")}), CMYK ${cmyk.join("/")}`;
    }),
    "",
    `> ${NOTE}`,
    "",
    `Back to [index](${SITE}/index.md)`,
    "",
  ].join("\n");

const colorMd = (name) => {
  const { cmyk, rgb, hex } = colorInfo(name);
  const ids = usedIn.get(name);
  return [
    `# ${name}`,
    "",
    `- HEX: ${hex}`,
    `- RGB: ${rgb.join(", ")}`,
    `- CMYK: ${cmyk.join("/")}`,
    `- Source: Volume ${data.colors[name].volume} of *A Dictionary of Color Combinations*`,
    "",
    `## Used in ${ids.length} palette${ids.length === 1 ? "" : "s"}`,
    "",
    ids.map(paletteLink).join(", ") || "None",
    "",
    `> ${NOTE}`,
    "",
    `Back to [index](${SITE}/index.md)`,
    "",
  ].join("\n");
};

const sections = [...new Set(palettes.map(([, p]) => p.section))];

const indexMd = [
  "# Japanese Color Combinations",
  "",
  "> A browsable version of *A Dictionary of Color Combinations* (Sanzo Wada): " +
    `${palettes.length} palettes built from ${colorNames.length} named colors, grouped by use (kimono, clothes, lacquerware, months of the year, etc.).`,
  "",
  `The web app at ${SITE}/ is a JavaScript single-page app. Everything in it is available as plain text here.`,
  "",
  "## Palettes by section",
  "",
  ...sections.map((s) => {
    const ids = palettes.filter(([, p]) => p.section === s).map(([id]) => id);
    return `- **${s}**: ${ids.map(paletteLink).join(", ")}`;
  }),
  "",
  "## Colors",
  "",
  colorNames
    .slice()
    .sort()
    .map(colorLink)
    .join(", "),
  "",
  "## Machine-readable",
  "",
  `- [colors.json](${SITE}/colors.json): canonical dataset (colors with CMYK, palettes with color lists)`,
  `- [llms-full.txt](${SITE}/llms-full.txt): every palette and color in one file`,
  "",
].join("\n");

const llmsTxt = [
  "# Japanese Color Combinations",
  "",
  `> ${palettes.length} color palettes from *A Dictionary of Color Combinations*, built from ${colorNames.length} named colors with CMYK/RGB/HEX values. The site is a JS app; these are plain-text equivalents.`,
  "",
  "Any page URL also returns markdown if requested with `Accept: text/markdown`, or by appending `.md`.",
  "",
  "## Data",
  "",
  `- [Index](${SITE}/index.md): palettes grouped by section, and all colors`,
  `- [colors.json](${SITE}/colors.json): canonical structured dataset`,
  `- [Full content](${SITE}/llms-full.txt): every palette and color in one file`,
  "",
  "## Pages",
  "",
  `- Palette: \`${SITE}/palettes/<number>.md\` (numbers run 1–${palettes[palettes.length - 1][0]}, with gaps; see index)`,
  `- Color: \`${SITE}/colors/<slug>.md\` (lowercase, hyphenated name, e.g. \`${SITE}/colors/${slugs.get(colorNames[0])}.md\`)`,
  "",
].join("\n");

const fullTxt = [
  "# Japanese Color Combinations: full content",
  "",
  `> ${NOTE}`,
  "",
  "# Palettes",
  "",
  ...palettes.flatMap(([id, p]) => [
    `## Palette ${id} (${p.section})`,
    "",
    ...p.colors.map((c) => {
      const { cmyk, hex } = colorInfo(c);
      return `- ${c}: ${hex}, CMYK ${cmyk.join("/")}`;
    }),
    "",
  ]),
  "# Colors",
  "",
  ...colorNames.flatMap((n) => {
    const { cmyk, rgb, hex } = colorInfo(n);
    return [
      `## ${n}`,
      "",
      `- HEX ${hex}, RGB ${rgb.join(", ")}, CMYK ${cmyk.join("/")}`,
      `- Palettes: ${usedIn.get(n).join(", ")}`,
      "",
    ];
  }),
].join("\n");

const write = (rel, content) => {
  const file = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

if (!fs.existsSync(outDir)) throw new Error("build/ missing; run after build");
write("index.md", indexMd);
write("llms.txt", llmsTxt);
write("llms-full.txt", fullTxt);
for (const [id, p] of palettes) write(`palettes/${id}.md`, paletteMd(id, p));
for (const n of colorNames) write(`colors/${slugs.get(n)}.md`, colorMd(n));
console.log(
  `LLM files: ${palettes.length} palettes, ${colorNames.length} colors, llms.txt, llms-full.txt, index.md`,
);
