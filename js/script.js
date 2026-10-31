
// ============================================
// BABY SHOWER INVITATION WEBSITE
// Main JavaScript + Supabase Blessing Guestbook
// ============================================


// Read editable details from config.js
const config = window.INVITATION_CONFIG || {};

const eventDate = new Date(
  config.eventDate || "2026-11-15T16:00:00"
);


// Common text function
function setText(id, value) {
  const element = document.getElementById(id);

  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
}


// ============================================
// INVITATION DETAILS
// ============================================

setText(
  "heroDate",
  `${config.dateText || "Sunday, 15 November 2026"} · ${config.timeText || "4:00 PM onwards"}`
);

setText(
  "detailDate",
  config.dateText || "Sunday, 15 November 2026"
);

setText(
  "detailTime",
  config.timeText || "4:00 PM onwards"
);

setText(
  "venueName",
  config.venueName || "The Garden Banquet"
);

setText(
  "venueAddress",
  config.venueAddress || "Canal Road, Surat, Gujarat"
);

const mapLink = document.getElementById("mapLink");

if (mapLink && config.mapUrl) {
  mapLink.href = config.mapUrl;
}

document.title =
  `A Little Miracle Is On The Way | ${config.parentOne || "Baby"} & ${config.parentTwo || "Family"}`;


// ============================================
// OPENING ENVELOPE
// ============================================

const introScreen = document.getElementById("introScreen");
const envelope = document.getElementById("envelope");
const openInviteBtn = document.getElementById("openInviteBtn");

if (openInviteBtn) {
  openInviteBtn.addEventListener("click", () => {

    if (envelope) {
      envelope.classList.add("open");
    }

    window.setTimeout(() => {

      if (introScreen) {
        introScreen.classList.add("hidden");
      }

      document.body.classList.remove("locked");

    }, 650);
  });
}

document.body.classList.add("locked");


// ============================================
// COUNTDOWN TIMER
// ============================================

function updateCountdown() {

  const distance = eventDate.getTime() - Date.now();

  if (Number.isNaN(eventDate.getTime())) return;

  if (distance <= 0) {

    ["days", "hours", "minutes", "seconds"].forEach(id => {
      setText(id, "00");
    });

    setText(
      "countdownMessage",
      "Today is the special day! Let's celebrate ♡"
    );

    return;
  }

  const days = Math.floor(distance / 86400000);

  const hours = Math.floor(
    (distance % 86400000) / 3600000
  );

  const minutes = Math.floor(
    (distance % 3600000) / 60000
  );

  const seconds = Math.floor(
    (distance % 60000) / 1000
  );

  setText("days", String(days).padStart(2, "0"));
  setText("hours", String(hours).padStart(2, "0"));
  setText("minutes", String(minutes).padStart(2, "0"));
  setText("seconds", String(seconds).padStart(2, "0"));
}

updateCountdown();

window.setInterval(updateCountdown, 1000);


// ============================================
// MOBILE NAVIGATION
// ============================================

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {

  menuToggle.addEventListener("click", () => {

    const isOpen = navigation.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  navigation.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      navigation.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    });

  });
}


// ============================================
// SUPABASE BLESSING GUESTBOOK
// ============================================

// IMPORTANT:
// Supabase table name = baby_wishes
// Columns = id, name, message, created_at
//
// id and created_at are generated automatically.
// Website inserts only name and message.

const blessingForm = document.getElementById("blessingForm");

const blessingNameInput =
  document.getElementById("blessingName");

const blessingMessageInput =
  document.getElementById("blessingMessage");

const blessingStatus =
  document.getElementById("blessingStatus");

const blessingGrid =
  document.getElementById("blessingGrid");

const emptyBlessings =
  document.getElementById("emptyBlessings");

const carouselControls =
  document.getElementById("carouselControls");

const carouselDots =
  document.getElementById("carouselDots");

const carouselPageLabel =
  document.getElementById("carouselPageLabel");

const storageNote =
  document.getElementById("storageNote");

const submitButton =
  document.getElementById("blessingSubmit");

const LOCAL_WISHES_KEY =
  "littleMomentsBabyBlessings";

const WISHES_PER_PAGE = 5;

let allBlessings = [];

let currentBlessingPage = 0;

let isSavingBlessing = false;


// Supabase configuration
const hasSharedDatabase = Boolean(
  config.supabaseUrl &&
  config.supabaseAnonKey
);


// Local preview if Supabase is not configured
if (!hasSharedDatabase && storageNote) {

  storageNote.textContent =
    "Preview mode: messages are saved only in this browser. Connect Supabase to share them with every visitor.";
}


// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

function getLocalWishes() {

  try {

    return JSON.parse(
      localStorage.getItem(LOCAL_WISHES_KEY) || "[]"
    );

  } catch (error) {

    return [];
  }
}


function saveLocalWishes(wishes) {

  localStorage.setItem(
    LOCAL_WISHES_KEY,
    JSON.stringify(wishes)
  );
}


// ============================================
// WISH CARD FUNCTIONS
// ============================================

function safeText(value) {

  return String(value ?? "");
}


function formatWishDate(value) {

  if (!value) {
    return "A special blessing";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "A special blessing";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}


function createWishCard(wish, index) {

  const card = document.createElement("article");

  card.className = "blessing-card";

  card.style.setProperty(
    "--card-order",
    index
  );


  const quote = document.createElement("div");

  quote.className = "blessing-quote";

  quote.textContent = "“";


  const message = document.createElement("p");

  message.className = "blessing-message";

  message.textContent = safeText(wish.message);


  const footer = document.createElement("div");

  footer.className = "blessing-card-footer";


  const name = document.createElement("strong");

  name.className = "blessing-author";

  name.textContent = safeText(wish.name);


  const date = document.createElement("span");

  date.className = "blessing-date";

  date.textContent = formatWishDate(wish.created_at);


  footer.append(name, date);

  card.append(quote, message, footer);

  return card;
}


// ============================================
// DISPLAY FIVE WISHES PER PAGE
// ============================================

function renderBlessingPage(direction = "next") {

  const totalPages = Math.ceil(
    allBlessings.length / WISHES_PER_PAGE
  );


  // No wishes available
  if (totalPages === 0) {

    blessingGrid.replaceChildren();

    emptyBlessings.hidden = false;

    carouselControls.hidden = true;

    carouselPageLabel.textContent = "";

    return;
  }


  // Keep current page within valid range
  currentBlessingPage = Math.min(
    Math.max(currentBlessingPage, 0),
    totalPages - 1
  );


  const startIndex =
    currentBlessingPage * WISHES_PER_PAGE;


  const pageItems = allBlessings.slice(
    startIndex,
    startIndex + WISHES_PER_PAGE
  );


  // Create cards
  const cards = pageItems.map(
    (wish, index) => createWishCard(wish, index)
  );


  // Right-to-left slide animation
  blessingGrid.classList.remove(
    "slide-from-right",
    "slide-from-left"
  );

  void blessingGrid.offsetWidth;

  blessingGrid.replaceChildren(...cards);

  blessingGrid.classList.add(
    direction === "previous"
      ? "slide-from-left"
      : "slide-from-right"
  );


  emptyBlessings.hidden = true;

  carouselControls.hidden = totalPages <= 1;


  // Page information
  carouselPageLabel.textContent =
    `Page ${currentBlessingPage + 1} of ${totalPages} · ${allBlessings.length} blessing${allBlessings.length === 1 ? "" : "s"}`;


  // Automatically create dots
  carouselDots.replaceChildren();

  for (
    let page = 0;
    page < totalPages;
    page += 1
  ) {

    const dot = document.createElement("button");

    dot.type = "button";

    dot.className =
      `carousel-dot${page === currentBlessingPage ? " active" : ""}`;

    dot.setAttribute(
      "aria-label",
      `Show blessing page ${page + 1}`
    );

    dot.setAttribute(
      "aria-current",
      page === currentBlessingPage ? "page" : "false"
    );


    dot.addEventListener("click", () => {

      const direction =
        page > currentBlessingPage
          ? "next"
          : "previous";

      currentBlessingPage = page;

      renderBlessingPage(direction);
    });


    carouselDots.append(dot);
  }


  // Previous and next buttons
  const previousButton =
    document.getElementById("previousBlessings");

  const nextButton =
    document.getElementById("nextBlessings");


  previousButton.disabled =
    currentBlessingPage === 0;

  nextButton.disabled =
    currentBlessingPage === totalPages - 1;
}


// ============================================
// LOAD WISHES FROM SUPABASE
// ============================================

async function loadBlessings() {

  try {

    if (hasSharedDatabase) {

      const url =
        `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/baby_wishes?select=id,name,message,created_at&order=created_at.desc&limit=500`;


      const response = await fetch(url, {

        method: "GET",

        headers: {

          apikey: config.supabaseAnonKey,

          Authorization:
            `Bearer ${config.supabaseAnonKey}`

        }

      });


      if (!response.ok) {

        const details = await response.text();

        throw new Error(
          `Could not load blessings (${response.status}): ${details}`
        );
      }


      allBlessings = await response.json();

    } else {

      // Local preview mode
      allBlessings = getLocalWishes().sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }


    renderBlessingPage("next");

  } catch (error) {

    emptyBlessings.hidden = false;

    emptyBlessings.textContent =
      "We couldn't load the blessings right now. Please refresh the page in a moment.";

    blessingStatus.textContent =
      "The blessing board could not connect. Check your database settings and permissions.";

    console.error("Blessing loading error:", error);
  }
}


// ============================================
// CHARACTER COUNTER
// ============================================

if (blessingMessageInput) {

  blessingMessageInput.addEventListener("input", () => {

    setText(
      "messageCount",
      blessingMessageInput.value.length
    );

  });
}


// ============================================
// PREVIOUS PAGE BUTTON
// ============================================

document
  .getElementById("previousBlessings")
  .addEventListener("click", () => {

    if (currentBlessingPage > 0) {

      currentBlessingPage -= 1;

      renderBlessingPage("previous");
    }
  });


// ============================================
// NEXT PAGE BUTTON
// ============================================

document
  .getElementById("nextBlessings")
  .addEventListener("click", () => {

    const totalPages = Math.ceil(
      allBlessings.length / WISHES_PER_PAGE
    );

    if (currentBlessingPage < totalPages - 1) {

      currentBlessingPage += 1;

      renderBlessingPage("next");
    }
  });


// ============================================
// SUBMIT BLESSING TO SUPABASE
// ============================================

blessingForm.addEventListener("submit", async event => {

  event.preventDefault();


  if (
    isSavingBlessing ||
    !blessingForm.reportValidity()
  ) {
    return;
  }


  const name = blessingNameInput.value.trim();

  const message = blessingMessageInput.value.trim();


  if (!name || !message) {

    blessingStatus.textContent =
      "Please enter your name and blessing.";

    return;
  }


  if (name.length > 40 || message.length > 300) {

    blessingStatus.textContent =
      "Your name or blessing is longer than the allowed limit.";

    return;
  }


  isSavingBlessing = true;

  submitButton.disabled = true;

  submitButton.textContent = "Sending...";

  blessingStatus.textContent = "";


  const newWish = {

    name: name,

    message: message,

    created_at: new Date().toISOString()

  };


  try {

    if (hasSharedDatabase) {

      // IMPORTANT: Correct table name baby_wishes
      const url =
        `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/baby_wishes`;


      const response = await fetch(url, {

        method: "POST",

        headers: {

          apikey: config.supabaseAnonKey,

          Authorization:
            `Bearer ${config.supabaseAnonKey}`,

          "Content-Type": "application/json",

          Prefer: "return=representation"

        },

        // Do not send id or created_at.
        // Supabase generates them automatically.
        body: JSON.stringify({

          name: name,

          message: message

        })

      });


      if (!response.ok) {

        const details = await response.text();

        throw new Error(
          `Could not save your blessing (${response.status}): ${details}`
        );
      }


      const saved = await response.json();

      allBlessings.unshift(
        saved[0] || newWish
      );


    } else {

      // Local storage preview
      const localWishes = getLocalWishes();

      localWishes.unshift({

        ...newWish,

        id: `local-${Date.now()}`

      });

      saveLocalWishes(localWishes);

      allBlessings = localWishes;
    }


    // Show newest blessing first
    currentBlessingPage = 0;

    renderBlessingPage("next");


    // Clear form
    blessingForm.reset();

    setText("messageCount", "0");


    blessingStatus.textContent =
      hasSharedDatabase
        ? "Your blessing has been added for everyone to see. Thank you! ♡"
        : "Your blessing is saved in this browser only. Connect Supabase to share it with every visitor. ♡";


  } catch (error) {

    console.error("Blessing submission error:", error);

    blessingStatus.textContent =
      "Sorry, your blessing could not be saved. Please try again.";

  } finally {

    isSavingBlessing = false;

    submitButton.disabled = false;

    submitButton.textContent = "Send Blessing ♡";
  }

});


// Load wishes when website opens
loadBlessings();


// ============================================
// ADD EVENT TO CALENDAR (.ICS DOWNLOAD)
// ============================================

const calendarBtn = document.getElementById("calendarBtn");

if (calendarBtn) {

  calendarBtn.addEventListener("click", () => {

    const start = new Date(eventDate);

    const end = new Date(
      start.getTime() + 3 * 60 * 60 * 1000
    );


    const toICS = date =>
      date.toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.000/, "");


    const ics = [

      "BEGIN:VCALENDAR",

      "VERSION:2.0",

      "PRODID:-//Little Moments//Baby Shower//EN",

      "BEGIN:VEVENT",

      `DTSTART:${toICS(start)}`,

      `DTEND:${toICS(end)}`,

      "SUMMARY:Baby Shower Celebration",

      `LOCATION:${config.venueName || "The Garden Banquet"}\\, ${config.venueAddress || "Surat"}`,

      "DESCRIPTION:Come celebrate a little miracle with us!",

      "END:VEVENT",

      "END:VCALENDAR"

    ].join("\r\n");


    const blob = new Blob(
      [ics],
      { type: "text/calendar;charset=utf-8" }
    );


    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = "baby-shower-invitation.ics";

    anchor.click();

    URL.revokeObjectURL(url);

  });

}


// ============================================
// GALLERY LIGHTBOX
// ============================================

const lightbox = document.getElementById("lightbox");

const lightboxImage =
  document.getElementById("lightboxImage");


document.querySelectorAll(".gallery-photo").forEach(button => {

  button.addEventListener("click", () => {

    lightboxImage.src = button.dataset.image;

    lightbox.classList.add("show");

    lightbox.setAttribute("aria-hidden", "false");

  });

});


function closeLightbox() {

  lightbox.classList.remove("show");

  lightbox.setAttribute("aria-hidden", "true");

  lightboxImage.src = "";
}


document
  .getElementById("lightboxClose")
  .addEventListener("click", closeLightbox);


lightbox.addEventListener("click", event => {

  if (event.target === lightbox) {

    closeLightbox();
  }

});


document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    closeLightbox();
  }

});


// ============================================
// BACKGROUND MUSIC
// ============================================

const audio =
  document.getElementById("backgroundMusic");

const musicButton =
  document.getElementById("musicToggle");


if (config.musicFile) {

  audio.src = config.musicFile;
}


let musicPlaying = false;


musicButton.addEventListener("click", async () => {

  if (!audio.src) {

    blessingStatus.textContent =
      "To add music, place an audio file in assets/audio/ and set musicFile in js/config.js.";

    return;
  }


  try {

    if (musicPlaying) {

      audio.pause();

      musicButton.textContent = "♫";

    } else {

      await audio.play();

      musicButton.textContent = "Ⅱ";
    }


    musicPlaying = !musicPlaying;

  } catch (error) {

    musicButton.textContent = "♫";

    console.error("Music playback error:", error);
  }

});
