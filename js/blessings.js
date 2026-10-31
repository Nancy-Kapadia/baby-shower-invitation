/* DreamLink Studio - Supabase blessing guestbook
   Configure SUPABASE_URL and SUPABASE_KEY in js/config.js.
   This file is intentionally separate from script.js so existing
   invitation features (countdown, gallery, music, envelope, etc.) remain intact.
*/
(() => {
  "use strict";

  const PAGE_SIZE = 5;
  const TABLE_NAME = "baby_wishes";

  const byId = (id) => document.getElementById(id);
  const form = byId("blessingForm");
  const grid = byId("blessingGrid");
  const carousel = byId("blessingCarousel");
  if (!form || !grid || !carousel) return;

  const nameInput = byId("blessingName");
  const messageInput = byId("blessingMessage");
  const submitButton = byId("blessingSubmit");
  const status = byId("blessingStatus");
  const count = byId("messageCount");
  const controls = byId("carouselControls");
  const dots = byId("carouselDots");
  const pageLabel = byId("carouselPageLabel");
  const emptyMessage = byId("emptyBlessings");
  const previousButton = byId("previousBlessings");
  const nextButton = byId("nextBlessings");

  let supabaseClient = null;
  let wishes = [];
  let page = 0;
  let isSubmitting = false;
  let touchStartX = 0;

  function showStatus(message, type) {
    status.textContent = message;
    status.dataset.state = type || "info";
  }

  function makeCard(wish) {
    const card = document.createElement("article");
    card.className = "blessing-card";

    const heart = document.createElement("span");
    heart.className = "blessing-card-heart";
    heart.setAttribute("aria-hidden", "true");
    heart.textContent = "♡";

    const message = document.createElement("p");
    message.className = "blessing-card-message";
    message.textContent = wish.message;

    const name = document.createElement("h3");
    name.className = "blessing-card-name";
    name.textContent = `— ${wish.name}`;

    card.append(heart, message, name);
    return card;
  }

  function animatePage() {
    grid.classList.remove("blessing-slide-in");
    // Force a reflow so the animation can replay on each page change.
    void grid.offsetWidth;
    grid.classList.add("blessing-slide-in");
  }

  function renderWishes(animate = false) {
    const totalPages = Math.ceil(wishes.length / PAGE_SIZE);

    if (totalPages === 0) {
      grid.replaceChildren();
      dots.replaceChildren();
      controls.hidden = true;
      emptyMessage.hidden = false;
      pageLabel.textContent = "";
      return;
    }

    page = Math.min(page, totalPages - 1);
    emptyMessage.hidden = true;

    const start = page * PAGE_SIZE;
    const visibleWishes = wishes.slice(start, start + PAGE_SIZE);
    const fragment = document.createDocumentFragment();

    visibleWishes.forEach((wish) => fragment.appendChild(makeCard(wish)));
    grid.replaceChildren(fragment);

    controls.hidden = totalPages <= 1;
    pageLabel.textContent = `Page ${page + 1} of ${totalPages}`;

    dots.replaceChildren();
    for (let index = 0; index < totalPages; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to blessing page ${index + 1}`);
      dot.setAttribute("aria-current", index === page ? "true" : "false");
      if (index === page) dot.classList.add("active");

      dot.addEventListener("click", () => {
        page = index;
        renderWishes(true);
      });

      dots.appendChild(dot);
    }

    previousButton.disabled = totalPages <= 1;
    nextButton.disabled = totalPages <= 1;
    if (animate) animatePage();
  }

  async function loadWishes() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase load error:", error);
      showStatus("Blessings could not be loaded. Please refresh and try again.", "error");
      return;
    }

    wishes = Array.isArray(data) ? data : [];
    renderWishes();
  }

  function changePage(direction) {
    const totalPages = Math.ceil(wishes.length / PAGE_SIZE);
    if (totalPages <= 1) return;
    page = (page + direction + totalPages) % totalPages;
    renderWishes(true);
  }

  previousButton.addEventListener("click", () => changePage(-1));
  nextButton.addEventListener("click", () => changePage(1));

  messageInput.addEventListener("input", () => {
    count.textContent = String(messageInput.value.length);
  });

  // Swipe left/right on touch screens to change blessing pages.
  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener("touchend", (event) => {
    const difference = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(difference) < 45) return;
    changePage(difference < 0 ? 1 : -1);
  }, { passive: true });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting || !supabaseClient) return;

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) {
      showStatus("Please enter your name and blessing.", "error");
      return;
    }
    if (name.length > 40 || message.length > 300) {
      showStatus("Your name or blessing is longer than the allowed limit.", "error");
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    showStatus("Sending your blessing...", "info");

    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .insert([{ name, message }]);

    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = "Send Blessing ♡";

    if (error) {
      console.error("Supabase insert error:", error);
      showStatus("Your blessing could not be sent. Please try again.", "error");
      return;
    }

    form.reset();
    count.textContent = "0";
    page = 0;
    showStatus("Thank you! Your blessing has been shared. ♡", "success");
    await loadWishes();
  });

  function initialize() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      showStatus("The database library could not load. Check your internet connection.", "error");
      return;
    }

    if (typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_KEY === "undefined" ||
        !SUPABASE_URL || !SUPABASE_KEY ||
        SUPABASE_URL.includes("YOUR_") ||
        SUPABASE_KEY.includes("YOUR_")) {
      showStatus("", "error");
      return;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    loadWishes();
  }

  initialize();
})();
