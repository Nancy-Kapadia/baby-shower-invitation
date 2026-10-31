# Baby Shower Invitation Website

A responsive baby shower invitation built with HTML, CSS and vanilla JavaScript. It includes an opening envelope, countdown, event details, photo gallery, calendar download, optional music and a guestbook where visitors leave blessings for the baby.

## Folder structure

```text
baby-shower-invitation/
├── index.html
├── README.md
├── supabase-setup.sql
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   └── script.js
└── assets/
    ├── images/
    └── audio/
```

## Run the website

1. Extract the ZIP and open this folder in VS Code.
2. Open `index.html` with VS Code Live Server, or open it directly in a browser.
3. Google Fonts and sample Unsplash photos need an internet connection.

## Change the invitation details

Edit `js/config.js`: parent names, event date, date/time text, venue, map link and optional music file. Replace the sample names, date and images before publishing.

## Baby blessings: how it works

The old RSVP/attendance form has been replaced. Visitors enter only their name and a blessing message. The website shows five messages per page, with next/previous arrows and one dot per page. The carousel slides horizontally and adapts to mobile screens.

### Option A — Preview without database

Leave `supabaseUrl` and `supabaseAnonKey` blank in `js/config.js`. Wishes are stored in the visitor's browser using localStorage. This is only for testing: other people on other devices will NOT see those wishes.

### Option B — Shared wishes for every visitor (recommended)

Use a Supabase project (the free tier is sufficient for a small demo; check its current limits):

1. Create a project at https://supabase.com/.
2. In the Supabase dashboard, open **SQL Editor** and run the complete contents of `supabase-setup.sql`.
3. Open **Project Settings → API** (or **Data API**, depending on dashboard layout) and copy the Project URL and the public anon/publishable key. Never use a `service_role` or secret key in a public website.
4. Paste the URL and public anon key into `js/config.js`:

```js
supabaseUrl: "https://YOUR-PROJECT.supabase.co",
supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
```

5. Save and reload the website. New blessings are stored in the shared database and displayed to all visitors. The page loads the newest 500 messages and shows five per carousel page.

**Important security note:** This simple public guestbook intentionally allows anyone to read and submit messages. The SQL validates name/message lengths, but it does not provide spam protection or moderation. For a real customer website, add CAPTCHA/rate limiting and an owner moderation workflow before public launch. Do not expose a Supabase service-role/secret key in browser code.

## Replace sample photos

Replace the sample image URLs in `index.html` with photos supplied with permission or licensed images. Example:

```html
<img src="assets/images/family-photo.jpg" alt="Family memory">
```

## Before delivering to a customer

- Confirm event details, countdown date, venue and map link.
- Replace fictional sample names and photos.
- Configure Supabase if wishes must be shared between all visitors.
- Test submitting a blessing from two different devices/browsers.
- Test the carousel on mobile and desktop.
- Obtain permission before displaying family photos or messages.
