const grid = document.getElementById("iconGrid");
const search = document.getElementById("iconSearch");
const filters = document.getElementById("styleFilters");
const count = document.getElementById("iconCount");

let icons = [];
let active = "all";
let selectedIcon = null;

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

async function initialize() {
  try {
    const response = await fetch("../build/icons.json?v=20261117", { cache: "no-store" });
    if (!response.ok) throw new Error("File ikon tidak ditemukan.");

    icons = await response.json();

    const available = new Set(icons.map(icon => icon.category));

    filters.querySelectorAll("button[data-style]").forEach(button => {
      const category = button.dataset.style;
      button.hidden = category !== "all" && !available.has(category);
    });

    render();
  } catch (error) {
    grid.innerHTML = `<div class="empty">${escapeHTML(error.message)} Jalankan build.js terlebih dahulu.</div>`;
  }
}

function render() {
  const term = search.value.trim().toLowerCase();

  const filtered = icons.filter(icon => {
    const matchesCategory = active === "all" || icon.category === active;
    const matchesSearch =
      icon.name.toLowerCase().includes(term) ||
      icon.category.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  count.textContent = `${filtered.length.toLocaleString()} icons`;

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty">No icons found. Try another search.</div>';
    return;
  }

  grid.innerHTML = filtered.map(icon => `
    <article class="icon-card"
      data-name="${escapeHTML(icon.name)}"
      data-category="${escapeHTML(icon.category)}">
      <div class="preview">
        <img src="${escapeHTML(icon.file)}"
          alt="${escapeHTML(icon.name)} icon"
          loading="lazy">
      </div>
      <div class="icon-info">
        <div class="icon-name">${escapeHTML(icon.name)}</div>
        <div class="icon-category">${escapeHTML(icon.category)}</div>
      </div>
    </article>
  `).join("");
}

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-style]");
  if (!button) return;

  active = button.dataset.style;

  filters.querySelectorAll("button[data-style]").forEach(item => {
    item.classList.toggle("active", item === button);
  });

  render();
});

search.addEventListener("input", render);

grid.addEventListener("click", event => {
  const card = event.target.closest(".icon-card");
  if (!card) return;

  selectedIcon = icons.find(icon =>
    icon.name === card.dataset.name &&
    icon.category === card.dataset.category
  );

  if (!selectedIcon) return;

  document.getElementById("modalName").textContent = selectedIcon.name;
  document.getElementById("modalCategory").textContent =
    `${selectedIcon.category} · ${selectedIcon.width} × ${selectedIcon.height}`;

  document.getElementById("modalImage").src = selectedIcon.file;
  document.getElementById("modal").classList.add("show");

  const copyButton = document.getElementById("copyClass");
  copyButton.textContent = "Copy SVG HTML";
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").classList.remove("show");
});

document.getElementById("modal").addEventListener("click", event => {
  if (event.target.id === "modal") {
    event.currentTarget.classList.remove("show");
  }
});

document.getElementById("copyClass").addEventListener("click", async () => {
  if (!selectedIcon) return;

  const html = `<img src="${selectedIcon.file}" alt="${selectedIcon.name}">`;

  try {
    await navigator.clipboard.writeText(html);
    document.getElementById("copyClass").textContent = "Copied!";
  } catch {
    document.getElementById("copyClass").textContent = "Copy unavailable";
  }
});

initialize();
