const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const quickPicks = document.querySelectorAll(".chip");

async function searchImages(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image search failed (${response.status}).`);
  }

  const data = await response.json();
  return Object.values(data.query?.pages ?? {});
}

function renderResults(items, query) {
  const renderableItems = items.filter((item) => item.imageinfo?.[0]?.thumburl);
  results.innerHTML = "";
  emptyState.hidden = renderableItems.length > 0;

  if (renderableItems.length === 0) {
    resultCount.textContent = `No images found for “${query}”.`;
    return;
  }

  renderableItems.forEach((item) => {
    const imageInfo = item.imageinfo[0];
    const title = item.title.replace(/^File:/, "").replace(/\.[^.]+$/, "");
    const card = document.createElement("article");
    card.className = "image-card";

    const link = document.createElement("a");
    link.className = "image-card-link";
    link.href = imageInfo.descriptionurl || imageInfo.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open ${title} on Wikimedia Commons`);

    const image = document.createElement("img");
    image.className = "image-card-photo";
    image.src = imageInfo.thumburl;
    image.alt = title;
    image.loading = "lazy";
    image.decoding = "async";

    const caption = document.createElement("p");
    caption.className = "image-card-title";
    caption.textContent = title;

    link.appendChild(image);
    card.appendChild(link);
    card.appendChild(caption);
    results.appendChild(card);
  });

  resultCount.textContent = `Showing ${results.children.length} results for “${query}”.`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  try {
    const items = await searchImages(query);
    renderResults(items, query);
  } catch (error) {
    results.innerHTML = "";
    emptyState.hidden = false;
    resultCount.textContent = "Could not load results. Please try again.";
    console.error(error);
  }
});

quickPicks.forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent.replace("↗", "").trim();
    form.requestSubmit();
  });
});

form.addEventListener("reset", () => {
  results.innerHTML = "";
  emptyState.hidden = false;
  resultCount.textContent = "Your finds will live here";
});
