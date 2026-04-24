"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp,
  Shield, Send, CheckCircle2, Clock, AlertCircle, ImageIcon,
} from "lucide-react";
import {
  CitizenVoice, VoiceReply,
  VOICE_CATEGORIES, STATUS_CONFIG,
  getAvatarBg, getInitial, relativeTime,
} from "@/lib/citizen-voice";

// ─── Reply bubble ─────────────────────────────────────────────────────────────

function ReplyBubble({ reply }: { reply: VoiceReply }) {
  const isOfficial = reply.isOfficialDesa;
  return (
    <div className={`flex items-start gap-2.5 ${isOfficial ? "pl-0" : "pl-4"}`}>
      {isOfficial ? (
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Shield size={13} className="text-white" />
        </div>
      ) : (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${getAvatarBg(reply.author)}`}>
          {getInitial(reply.author)}
        </div>
      )}

      <div className={`flex-1 min-w-0 rounded-xl px-3 py-2 text-sm ${
        isOfficial
          ? "bg-emerald-50 border border-emerald-200"
          : "bg-slate-50 border border-slate-100"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold ${isOfficial ? "text-emerald-700" : "text-slate-700"}`}>
            {reply.author}
          </span>
          {isOfficial && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
              Resmi Desa
            </span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">{relativeTime(reply.createdAt)}</span>
        </div>
        <p className={`text-xs leading-relaxed ${isOfficial ? "text-emerald-800" : "text-slate-600"}`}>
          {reply.text}
        </p>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CitizenVoice["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = status === "resolved" ? CheckCircle2 : status === "in_progress" ? Clock : AlertCircle;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={9} />
      {cfg.short}
    </span>
  );
}

// ─── Photo grid ───────────────────────────────────────────────────────────────

function PhotoGrid({ photos }: { photos: string[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={`grid gap-1.5 mt-2 mb-3 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {photos.slice(0, 4).map((src, i) => (
          <button
            key={src}
            onClick={() => setExpanded(src)}
            className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video group"
          >
            <Image
              src={src}
              alt={`Bukti foto ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {i === 3 && photos.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm">+{photos.length - 4}</span>
              </div>
            )}
            <div className="absolute top-1.5 left-1.5 bg-black/40 rounded px-1.5 py-0.5 flex items-center gap-1">
              <ImageIcon size={9} className="text-white" />
              <span className="text-[9px] text-white font-semibold">Bukti Foto</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {expanded && (
        <button
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <div className="relative w-full max-w-lg max-h-[80vh] rounded-2xl overflow-hidden">
            <Image src={expanded} alt="Foto bukti" fill className="object-contain" />
          </div>
        </button>
      )}
    </>
  );
}

// ─── Main VoiceCard ───────────────────────────────────────────────────────────

interface Props {
  voice:       CitizenVoice;
  onHelpful:   (id: string) => void;
  helpedIds:   Set<string>;
}

export default function VoiceCard({ voice, onHelpful, helpedIds }: Props) {
  const cfg = VOICE_CATEGORIES[voice.category];

  const [votedBenar,  setVotedBenar]  = useState(false);
  const [votedBohong, setVotedBohong] = useState(false);
  const [benarCount,  setBenarCount]  = useState(voice.votes.benar);
  const [bohongCount, setBohongCount] = useState(voice.votes.bohong);

  const [showReplies,   setShowReplies]   = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText,     setReplyText]     = useState("");
  const [replyName,     setReplyName]     = useState("");
  const [localReplies,  setLocalReplies]  = useState<VoiceReply[]>(voice.replies);

  const hasReplies    = localReplies.length > 0;
  const officialReply = localReplies.find(r => r.isOfficialDesa);

  const handleBenar = () => {
    if (votedBenar || votedBohong) return;
    setVotedBenar(true);
    setBenarCount(n => n + 1);
  };

  const handleBohong = () => {
    if (votedBenar || votedBohong) return;
    setVotedBohong(true);
    setBohongCount(n => n + 1);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const newReply: VoiceReply = {
      id:             `r-${Date.now()}`,
      voiceId:        voice.id,
      author:         replyName.trim() || "Anonim",
      isAnon:         !replyName.trim(),
      isOfficialDesa: false,
      text:           replyText.trim(),
      createdAt:      new Date(),
    };
    setLocalReplies(prev => [...prev, newReply]);
    setReplyText(""); setReplyName("");
    setShowReplyForm(false);
    setShowReplies(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getAvatarBg(voice.author)}`}>
          {getInitial(voice.author)}
        </div>

        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-800">{voice.author}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <StatusBadge status={voice.status} />
            <span className="text-[10px] text-slate-400 ml-auto">{relativeTime(voice.createdAt)}</span>
          </div>

          {/* Text */}
          <p className="text-sm text-slate-700 leading-relaxed mb-2">{voice.text}</p>

          {/* Photos */}
          <PhotoGrid photos={voice.photos} />

          {/* Official response highlight */}
          {officialReply && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="w-full text-left flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-3 hover:bg-emerald-100 transition-colors"
            >
              <Shield size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                  Respons Resmi Desa
                </p>
                <p className="text-xs text-emerald-800 leading-relaxed line-clamp-2">{officialReply.text}</p>
              </div>
            </button>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 mt-1">

            {/* Helpful */}
            <button
              onClick={() => onHelpful(voice.id)}
              disabled={helpedIds.has(voice.id)}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                helpedIds.has(voice.id)
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 cursor-default"
                  : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              <ThumbsUp size={11} />
              {voice.helpful + (helpedIds.has(voice.id) ? 1 : 0)} berguna
            </button>

            {/* Vote benar */}
            <button
              onClick={handleBenar}
              disabled={votedBenar || votedBohong}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                votedBenar
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 cursor-default"
                  : "bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              ✅ Benar <span className="font-semibold">{benarCount}</span>
            </button>

            {/* Vote bohong */}
            <button
              onClick={handleBohong}
              disabled={votedBenar || votedBohong}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                votedBohong
                  ? "bg-rose-50 border-rose-300 text-rose-700 cursor-default"
                  : "bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              ❌ Bohong <span className="font-semibold">{bohongCount}</span>
            </button>

            {/* Replies toggle */}
            <button
              onClick={() => setShowReplies(v => !v)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all ml-auto"
            >
              <MessageCircle size={11} />
              {localReplies.length > 0 ? `${localReplies.length} komentar` : "Komentar"}
              {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          </div>

          {/* Reply thread */}
          {showReplies && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {localReplies.map(r => <ReplyBubble key={r.id} reply={r} />)}

              {/* Reply form toggle */}
              {!showReplyForm ? (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 mt-2 transition-colors"
                >
                  <MessageCircle size={12} /> Tambah komentar
                </button>
              ) : (
                <form onSubmit={handleReplySubmit} className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={replyName}
                    onChange={e => setReplyName(e.target.value)}
                    placeholder="Namamu (kosongkan = anonim)"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  />
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Tulis komentarmu..."
                    rows={2}
                    maxLength={300}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40"
                    >
                      <Send size={11} /> Kirim
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowReplyForm(false); setReplyText(""); }}
                      className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
