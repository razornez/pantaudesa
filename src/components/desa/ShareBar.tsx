"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import {
  WhatsappShareButton,
  WhatsappIcon,
  XShareButton,
  XIcon,
  FacebookShareButton,
  FacebookIcon,
} from "react-share";

interface ShareBarProps {
  desaNama: string;
  kabupaten: string;
  provinsi: string;
}

const ICON_SIZE = 32;
const ICON_RADIUS = 6;

export default function ShareBar({ desaNama, kabupaten, provinsi }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Cek data desa ${desaNama}, ${kabupaten}, ${provinsi} di PantauDesa`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-2.5 border-b border-slate-100">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 mr-1">Bagikan:</span>

        <WhatsappShareButton url={url} title={text}>
          <div className="flex items-center gap-1.5 group">
            <WhatsappIcon size={ICON_SIZE} borderRadius={ICON_RADIUS} />
            <span className="hidden sm:inline text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              WhatsApp
            </span>
          </div>
        </WhatsappShareButton>

        <XShareButton url={url} title={text}>
          <div className="flex items-center gap-1.5 group">
            <XIcon size={ICON_SIZE} borderRadius={ICON_RADIUS} />
            <span className="hidden sm:inline text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              X / Twitter
            </span>
          </div>
        </XShareButton>

        <FacebookShareButton url={url}>
          <div className="flex items-center gap-1.5 group">
            <FacebookIcon size={ICON_SIZE} borderRadius={ICON_RADIUS} />
            <span className="hidden sm:inline text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              Facebook
            </span>
          </div>
        </FacebookShareButton>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 group"
          aria-label="Salin tautan"
        >
          <span
            className={`w-8 h-8 rounded-[6px] flex items-center justify-center transition-colors ${
              copied
                ? "bg-emerald-500"
                : "bg-slate-200 group-hover:bg-slate-300"
            }`}
          >
            {copied ? (
              <Check size={14} className="text-white" />
            ) : (
              <Link2 size={14} className="text-slate-600" />
            )}
          </span>
          <span className="hidden sm:inline text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
            {copied ? "Tersalin!" : "Salin tautan"}
          </span>
        </button>
      </div>
    </div>
  );
}
