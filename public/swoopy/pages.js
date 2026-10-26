// Fills in icons on Swoopy's Support, Terms and Privacy pages, and shows the
// "Rate Swoopy" link only when the page is opened from the installed extension.
import { icon } from "./lib/icons.js";

// Match the panel's Appearance setting when opened from the extension.
globalThis.chrome?.storage?.sync.get({ theme: "dark" }).then(({ theme }) => {
  if (theme !== "system") document.documentElement.dataset.theme = theme;
}).catch(() => {});

for (const el of document.querySelectorAll("[data-icon]")) {
  el.replaceWith(icon(el.dataset.icon, Number(el.dataset.size) || 16));
}

const rate = document.getElementById("rate");
if (rate) {
  const id = globalThis.chrome?.runtime?.id;
  if (id) rate.href = `https://chromewebstore.google.com/detail/${id}/reviews`;
  else rate.hidden = true;
}

const share = document.getElementById("share");
share?.addEventListener("click", async (e) => {
  e.preventDefault();
  const text = "Swoopy: right-click to grab any image and its colors";
  const id = globalThis.chrome?.runtime?.id;
  const url = id ? `https://chromewebstore.google.com/detail/${id}` : location.href;
  try {
    if (navigator.share) await navigator.share({ title: "Swoopy", text, url });
    else { await navigator.clipboard.writeText(`${text} ${url}`); share.querySelector(".s-action").firstChild.textContent = "Link copied!"; }
  } catch {}
});
