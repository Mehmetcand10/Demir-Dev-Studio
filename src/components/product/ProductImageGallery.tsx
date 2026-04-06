"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.08;
const FALLBACK =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Props = {
  images: string[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const list = images?.length ? images : [];
  const src = list[activeImageIndex] ?? FALLBACK;

  useEffect(() => {
    setZoom(1);
  }, [activeImageIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => clamp(Number((z + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm">
        <span className="font-medium text-anthracite-500 dark:text-anthracite-400">
          Görünüm
        </span>
        <div className="inline-flex rounded-lg border border-anthracite-200 bg-white p-0.5 dark:border-anthracite-700 dark:bg-anthracite-900/50">
          <button
            type="button"
            onClick={() => setFitMode("contain")}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              fitMode === "contain"
                ? "bg-anthracite-900 text-white dark:bg-white dark:text-anthracite-900"
                : "text-anthracite-600 hover:bg-anthracite-50 dark:text-anthracite-300 dark:hover:bg-anthracite-800"
            }`}
          >
            Tam sığdır
          </button>
          <button
            type="button"
            onClick={() => setFitMode("cover")}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              fitMode === "cover"
                ? "bg-anthracite-900 text-white dark:bg-white dark:text-anthracite-900"
                : "text-anthracite-600 hover:bg-anthracite-50 dark:text-anthracite-300 dark:hover:bg-anthracite-800"
            }`}
          >
            Alanı doldur
          </button>
        </div>
        <span className="hidden sm:inline text-anthracite-300 dark:text-anthracite-600">
          |
        </span>
        <span className="font-medium text-anthracite-500 dark:text-anthracite-400">
          Yakınlaştırma
        </span>
        <button
          type="button"
          aria-label="Azalt"
          onClick={() =>
            setZoom((z) =>
              clamp(Number((z - ZOOM_STEP * 2).toFixed(2)), MIN_ZOOM, MAX_ZOOM)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-anthracite-200 bg-white text-lg font-semibold text-anthracite-800 hover:bg-anthracite-50 dark:border-anthracite-600 dark:bg-anthracite-800 dark:text-white dark:hover:bg-anthracite-700"
        >
          −
        </button>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={zoom}
          onChange={(e) =>
            setZoom(clamp(parseFloat(e.target.value), MIN_ZOOM, MAX_ZOOM))
          }
          className="h-1.5 w-28 max-w-[40vw] cursor-pointer accent-anthracite-800 sm:w-36"
        />
        <button
          type="button"
          aria-label="Artır"
          onClick={() =>
            setZoom((z) =>
              clamp(Number((z + ZOOM_STEP * 2).toFixed(2)), MIN_ZOOM, MAX_ZOOM)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-anthracite-200 bg-white text-lg font-semibold text-anthracite-800 hover:bg-anthracite-50 dark:border-anthracite-600 dark:bg-anthracite-800 dark:text-white dark:hover:bg-anthracite-700"
        >
          +
        </button>
        <span className="min-w-[3rem] tabular-nums text-anthracite-700 dark:text-anthracite-200">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-anthracite-600 underline-offset-2 hover:underline dark:text-anthracite-300"
        >
          Sıfırla
        </button>
      </div>

      <div
        ref={scrollRef}
        className="relative w-full overflow-auto rounded-2xl border border-anthracite-200/70 bg-zinc-100 dark:bg-anthracite-900/90"
        style={{ height: "min(75vh, 720px)", touchAction: "pan-x pan-y" }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `${zoom * 100}%`,
            aspectRatio: "3/4",
          }}
        >
          <Image
            src={src}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={
              fitMode === "contain" ? "object-contain" : "object-cover"
            }
          />
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-anthracite-700 shadow-sm backdrop-blur-sm dark:bg-black/80 dark:text-white">
          <ZoomIn className="h-3 w-3" strokeWidth={2} />
          Kaydır · tekerlek
        </div>
        {list.length > 1 && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {activeImageIndex + 1} / {list.length}
          </div>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar mt-2">
          {list.map((img: string, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-32 w-24 shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-white transition-all ${
                activeImageIndex === idx
                  ? "border-anthracite-800 shadow-sm dark:border-white"
                  : "border-transparent opacity-55 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} — küçük ${idx + 1}`}
                fill
                sizes="96px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
