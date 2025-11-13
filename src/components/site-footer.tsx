export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center sm:text-left">
          Built with love for film by ElemesCinema. Powered by the TMDB API.
        </p>
        <p className="text-center sm:text-right">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}

