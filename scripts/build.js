const fs = require("fs");
const path = require("path");

async function build() {
  const sources = [
    ["solid", await import("@fortawesome/free-solid-svg-icons")],
    ["regular", await import("@fortawesome/free-regular-svg-icons")],
    ["brands", await import("@fortawesome/free-brands-svg-icons")]
  ];

  const root = path.join(__dirname, "..");
  const icons = [];

  for (const [category, mod] of sources) {
    const pack = mod["fa" + category.charAt(0).toUpperCase() + category.slice(1)] ||
      mod.fas || mod.far || mod.fab;

    const definitions = Object.values(pack || {}).filter(item =>
      item && item.iconName && Array.isArray(item.icon)
    );

    const folder = path.join(root, "icons", category);
    fs.mkdirSync(folder, { recursive: true });

    for (const oldFile of fs.readdirSync(folder)) {
      if (oldFile.endsWith(".svg")) {
        fs.unlinkSync(path.join(folder, oldFile));
      }
    }

    for (const item of definitions) {
      const [width, height, , , pathData] = item.icon;
      const name = item.iconName;
      const paths = Array.isArray(pathData) ? pathData : [pathData];

      const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
        ...paths.map(d => `<path fill="currentColor" d="${d}"/>`),
        "</svg>"
      ].join("");

      fs.writeFileSync(path.join(folder, `${name}.svg`), svg);

      icons.push({
        name,
        category,
        width,
        height,
        file: `../icons/${category}/${name}.svg`
      });
    }
  }

  if (icons.length < 1000) {
    throw new Error(`Ikon baru ${icons.length}. Target minimal 1000 belum tercapai.`);
  }

  const buildFolder = path.join(root, "build");
  fs.mkdirSync(buildFolder, { recursive: true });

  fs.writeFileSync(
    path.join(buildFolder, "icons.json"),
    JSON.stringify(icons, null, 2)
  );

  const summary = {
    total: icons.length,
    categories: {
      solid: icons.filter(x => x.category === "solid").length,
      regular: icons.filter(x => x.category === "regular").length,
      brands: icons.filter(x => x.category === "brands").length
    },
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(buildFolder, "summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log("\nOVEX ICON BUILD BERHASIL");
  console.log("========================");
  console.log("Total ikon :", summary.total);
  console.log("Solid      :", summary.categories.solid);
  console.log("Regular    :", summary.categories.regular);
  console.log("Brands     :", summary.categories.brands);
  console.log("========================\n");
}

build().catch(error => {
  console.error("BUILD ERROR:", error.message);
  process.exit(1);
});
