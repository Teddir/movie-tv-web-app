import { AdUnit } from "./ad-unit";

interface AdWrapperProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdWrapper({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
  style,
}: AdWrapperProps) {
  const publisherId = process.env.GOOGLE_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    return null;
  }

  return (
    <AdUnit
      adSlot={adSlot}
      adFormat={adFormat}
      fullWidthResponsive={fullWidthResponsive}
      className={className}
      style={style}
      publisherId={publisherId}
    />
  );
}

