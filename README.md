# ElemesCinema

A responsive Next.js 16 application that showcases top movies, TV shows, and people using data from the [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api). Built with Tailwind CSS v4 and shadcn/ui-inspired components.

## ✨ Features

- Browse curated shelves for top-rated, now playing, popular, and upcoming **movies**
- Explore popular, top-rated, airing today, and currently on-air **TV shows**
- View **popular people** with quick access to their work
- **Search** across movies, TV shows, and people with instant suggestions
- Add titles to a persistent **watchlist** and record personal **ratings**
- Responsive layout optimized for mobile, tablet, and desktop
- Accessible, keyboard-friendly interactions with meaningful aria labels
- Elegant loading skeletons and empty states for improved UX

## 🛠️ Technology

- [Next.js 16 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- shadcn/ui-style component primitives
- [Radix UI](https://www.radix-ui.com/) for accessible overlays
- [Lucide Icons](https://lucide.dev/) for crisp SVG icons

## 📦 Project Structure

```
src/
  app/                # Next.js routes (app router)
    movies/           # Movies index page + loading state
    tv/               # TV index page + loading state
    people/           # People index page + loading state
    search/           # Search results page + loading state
    layout.tsx        # Root layout with providers and global chrome
    page.tsx          # Home page with curated shelves
  components/
    providers/        # Watchlist context provider
    search/           # Search bar component
    sections/         # Reusable section layouts (e.g., media shelf)
    ui/               # shadcn-style primitives (button, card, etc.)
    media-card.tsx    # Interactive card for movies + TV
    person-card.tsx   # Card for talent/people
    site-header.tsx   # App header with navigation and search
    site-footer.tsx   # App footer and TMDB attribution
    watchlist-drawer.tsx # Watchlist overlay
  lib/
    tmdb.ts           # Typed TMDB API client helpers
    utils.ts          # UI helper utilities (class merging, formatters)
```

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18.18+ or 20+
- npm 9+ (or pnpm/yarn/bun if preferred)
- TMDB API credentials (either a v3 API key or v4 access token)

### 2. Clone & Install

```bash
git clone https://github.com/your-org/movie-tv-web-app.git
cd movie-tv-web-app
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the project root and add your TMDB credentials. You can use either the v4 token or v3 API key—supplying both is fine.

```bash
# .env.local
TMDB_ACCESS_TOKEN=your_tmdb_v4_read_token   # preferred
# or
TMDB_API_KEY=your_tmdb_v3_api_key

# Google Search Console verification (optional)
GOOGLE_SITE_VERIFICATION=your_google_verification_code

# Google AdSense (optional)
GOOGLE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
```

> 💡 Need credentials? Generate them from your TMDB account at https://www.themoviedb.org/settings/api.
> 
> 🔍 **Google Search Console**: To verify your site with Google Search Console, add the `GOOGLE_SITE_VERIFICATION` environment variable with the verification code provided by Google. The verification meta tag will be automatically added to your site's head section.
> 
> 📢 **Google AdSense**: To enable ads on your site, add the `GOOGLE_ADSENSE_PUBLISHER_ID` environment variable with your AdSense publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`). Once configured, you can use the `<AdUnit>` component to display ads throughout your site.

### 4. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser. The app uses Next.js hot reloading for a smooth development experience.

### 5. Production Build

```bash
npm run build
npm start
```

## ✅ Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the local development server |
| `npm run build` | Create a production build          |
| `npm run start` | Serve the production build         |
| `npm run lint`  | Run ESLint on the project          |

## ♿ Accessibility Notes

- Semantic HTML tags (`header`, `main`, `section`, `nav`, etc.) structure each page
- All interactive elements are reachable via keyboard and include visible focus styles
- Buttons and overlays include descriptive `aria-*` attributes
- Color choices pass WCAG contrast guidelines for both light and dark preferences

## 🔐 TMDB Guest Sessions

The app uses TMDB guest sessions to persist watchlists and ratings without a full account login.

- Provide a valid `TMDB_API_KEY` in `.env.local`
- The app automatically provisions a guest session and stores it locally
- Ratings are forwarded to TMDB with the guest session id; watchlist items are stored locally per session

## 📢 Google AdSense Integration

The app includes built-in support for Google AdSense. To use ads:

1. **Get your AdSense Publisher ID** from [Google AdSense](https://www.google.com/adsense/)
2. **Add the environment variable** to your `.env.local`:
   ```bash
   GOOGLE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```
3. **Use the AdUnit component** in your pages:
   ```tsx
   import { AdUnit } from "@/components/ads/ad-unit";
   
   <AdUnit adSlot="1234567890" adFormat="auto" />
   ```

The AdSense script will automatically load when the publisher ID is configured. Ad units are responsive and will adapt to different screen sizes.

## 📄 TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Please ensure you comply with TMDB's terms of use when deploying this application publicly.

---

Crafted with ❤️ to spotlight amazing stories across film and television. Enjoy building on top of ElemesCinema!
