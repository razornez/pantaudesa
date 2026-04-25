"use client";

import { useRef, useState } from "react";

interface Props {
  onComplete: (value: string) => void;
  disabled?:  boolean;
  error?:     boolean;
  reset?:     number;
}

export default function OtpInput({ onComplete, disabled, error, reset }: Props) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const prevReset = useRef(reset);
  if (reset !== prevReset.current) {
    prevReset.current = reset;
    setDigits(["", "", "", ""]);
    refs.current[0]?.focus();
  }

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = v;
    setDigits(next);
    if (v && i < 3) refs.current[i + 1]?.focus();
    if (next.join("").length === 4) onComplete(next.join(""));
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (text.length === 4) { setDigits(text.split("")); onComplete(text); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-14 h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none focus:scale-105 disabled:opacity-40 ${
            error
              ? "border-rose-400 bg-rose-50 text-rose-700"
              : d
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-800 focus:border-indigo-400 focus:bg-indigo-50/50"
          }`}
        />
      ))}
    </div>
  );
}
