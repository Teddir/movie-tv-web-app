# Google AdSense Components

This directory contains components for integrating Google AdSense into your Next.js application.

## Components

### `GoogleAdSense`
The main script loader component that should be added to your root layout. It automatically loads the AdSense script when a publisher ID is configured.

### `AdUnit`
A reusable component for displaying AdSense ad units throughout your application.

## Usage

### 1. Setup Environment Variable

Add your AdSense publisher ID to `.env.local`:

```bash
GOOGLE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 2. The script is automatically loaded

The `GoogleAdSense` component is already integrated in `src/app/layout.tsx` and will automatically load when the publisher ID is set.

### 3. Add Ad Units to Your Pages

```tsx
import { AdUnit } from "@/components/ads/ad-unit";

// In your page component
<AdUnit 
  adSlot="1234567890" 
  adFormat="auto" 
  fullWidthResponsive={true}
/>
```

## Props

### AdUnit Props

- `adSlot` (required): Your AdSense ad slot ID
- `adFormat`: Ad format - `"auto"` | `"rectangle"` | `"vertical"` | `"horizontal"` (default: `"auto"`)
- `fullWidthResponsive`: Enable responsive ads (default: `true`)
- `className`: Additional CSS classes
- `style`: Inline styles

## Example Placements

### Between Content Sections

```tsx
<section>
  <h2>Popular Movies</h2>
  {/* Your content */}
</section>

<AdUnit adSlot="1234567890" className="my-8" />

<section>
  <h2>Top Rated</h2>
  {/* Your content */}
</section>
```

### Sidebar Ad

```tsx
<aside>
  <AdUnit 
    adSlot="1234567890" 
    adFormat="vertical"
    className="sticky top-4"
  />
</aside>
```

### Inline Banner

```tsx
<AdUnit 
  adSlot="1234567890" 
  adFormat="horizontal"
  className="my-4"
/>
```

## Important Notes

- AdSense requires your site to be live and approved before ads will display
- Make sure your site complies with AdSense policies
- Test ads may appear during the approval process
- The component will return `null` if the publisher ID is not configured, so it's safe to use in development

