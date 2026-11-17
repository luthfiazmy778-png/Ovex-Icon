const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "build", "icons.json");
const cssPath = path.join(root, "css", "ovex-icon.css");

if (!fs.existsSync(jsonPath)) {
  console.error("build/icons.json tidak ditemukan. Jalankan build terlebih dahulu.");
  process.exit(1);
}

const icons = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

let css = `/*
 * Ovex Icon CSS
 * Total icons: ${icons.length}
 * Generated automatically.
 */

.ovex {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  background-color: currentColor;
  flex-shrink: 0;
}

`;

for (const icon of icons) {
  const category = icon.category;
  const name = icon.name;
  const file = `../icons/${category}/${name}.svg`;
  const className = `ovex-${category}-${name}`;

  css += `.${className} {
  -webkit-mask: url("${file}") center / contain no-repeat;
  mask: url("${file}") center / contain no-repeat;
}\n\n`;
}

fs.writeFileSync(cssPath, css);

console.log("OVEX ICON CSS GENERATED");
console.log("Total icons:", icons.length);
console.log("Output:", cssPath);
console.log("CSS size:", (Buffer.byteLength(css) / 1024).toFixed(2), "KB");
