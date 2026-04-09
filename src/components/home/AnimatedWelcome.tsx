"use client";

import { useEffect, useMemo, useState } from "react";

const PHRASES = [
  "Hoş geldiniz",
  "Demir Dev Studio'ya hoş geldiniz",
  "Onaylı B2B tekstil ağına hoş geldiniz",
];

export default function AnimatedWelcome() {
  const [index, setIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);

  const current = useMemo(() => PHRASES[index], [index]);

  useEffect(() => {
    setVisibleChars(0);
    const forward = setInterval(() => {
      setVisibleChars((c) => {
        if (c >= current.length) return c;
        return c + 1;
      });
    }, 34);

    const swap = setTimeout(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, 2600);

    return () => {
      clearInterval(forward);
      clearTimeout(swap);
    };
  }, [current]);

  return (
    <p className="mb-3 inline-flex items-center rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-900 sm:text-sm">
      {current.slice(0, visibleChars)}
      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-emerald-700" />
    </p>
  );
}
