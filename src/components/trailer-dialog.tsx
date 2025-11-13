"use client";

import { useMemo, useState } from "react";
import { PlayIcon } from "lucide-react";

import type { VideoResult } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrailerDialogProps {
  videos?: VideoResult[];
  title: string;
  className?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
}

export function TrailerDialog({
  videos = [],
  title,
  className,
  buttonVariant = "default",
  buttonSize = "lg",
}: TrailerDialogProps) {
  const [open, setOpen] = useState(false);

  const trailer = useMemo(() => pickBestTrailer(videos), [videos]);

  if (!trailer) {
    return (
      <Button
        className={cn("rounded-full", className)}
        variant="outline"
        size={buttonSize}
        disabled
      >
        <PlayIcon className="mr-2 h-4 w-4" aria-hidden="true" />
        Trailer unavailable
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("gap-2 rounded-full", className)}
          variant={buttonVariant}
          size={buttonSize}
        >
          <PlayIcon className="h-4 w-4" aria-hidden="true" />
          Play Trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl gap-6 bg-black/90 p-0 sm:p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
          <iframe
            key={`${trailer.key}-${open}`}
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1`}
            title={`${title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="space-y-2 px-6 pb-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {trailer.name} · Hosted on {trailer.site}
            </DialogDescription>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function pickBestTrailer(videos: VideoResult[]) {
  if (!videos?.length) return null;
  const youtubeVideos = videos.filter((video) => video.site === "YouTube");
  if (!youtubeVideos.length) return null;

  const trailers = youtubeVideos.filter(
    (video) => video.type === "Trailer" || video.type === "Teaser",
  );

  const official = trailers.find((video) => video.official) ?? trailers[0];
  if (official) return official;

  return youtubeVideos[0];
}

