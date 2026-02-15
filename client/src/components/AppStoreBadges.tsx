import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppStoreBadgesProps {
  appleUrl?: string;
  googleUrl?: string;
  className?: string;
}

export default function AppStoreBadges({ appleUrl, googleUrl, className = "" }: AppStoreBadgesProps) {
  const { t } = useLanguage();

  const handleClick = (store: string, url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info(t(`Coming soon on ${store}!`, `Em breve na ${store}!`));
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {/* Apple App Store Badge */}
      <button
        onClick={() => handleClick("App Store", appleUrl)}
        className="inline-flex items-center gap-2.5 bg-black border border-white/20 rounded-xl px-5 py-3 hover:bg-white/10 transition-colors group"
        aria-label="Download on the App Store"
      >
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <div className="text-left">
          <div className="text-[10px] text-white/70 leading-tight">
            {t("Download on the", "Baixar na")}
          </div>
          <div className="text-base font-semibold text-white leading-tight">App Store</div>
        </div>
      </button>

      {/* Google Play Badge */}
      <button
        onClick={() => handleClick("Google Play", googleUrl)}
        className="inline-flex items-center gap-2.5 bg-black border border-white/20 rounded-xl px-5 py-3 hover:bg-white/10 transition-colors group"
        aria-label="Get it on Google Play"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" />
          <path fill="#34A853" d="M16.247 15.055l-2.455-2.455L3.609 22.186c.33.154.718.16 1.055.02l11.583-7.15z" />
          <path fill="#FBBC04" d="M20.827 10.637l-3.18-1.963-1.4 1.37 2.455 2.456 2.125-1.312a.75.75 0 0 0 0-1.275v.724z" />
          <path fill="#EA4335" d="M3.609 1.814l10.183 10.186 2.455-2.455L4.664 1.834a1.09 1.09 0 0 0-1.055-.02z" />
        </svg>
        <div className="text-left">
          <div className="text-[10px] text-white/70 leading-tight">
            {t("GET IT ON", "DISPONÍVEL NO")}
          </div>
          <div className="text-base font-semibold text-white leading-tight">Google Play</div>
        </div>
      </button>
    </div>
  );
}
