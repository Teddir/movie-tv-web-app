import Script from "next/script";

export function AdSenseScript() {
  const publisherId = process.env.GOOGLE_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    return null;
  }

  // Using beforeInteractive strategy injects the script into <head>
  // This makes it visible to Google's crawler for verification
  return (
    <Script
      id="adsbygoogle-init"
      strategy="beforeInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
    />
  );
}

