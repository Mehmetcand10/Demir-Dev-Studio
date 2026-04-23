"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    title: "Sezonun en iyi toptan tekstil ürünleri",
    caption: "Yeni sezon, net MOQ, merkezi sipariş",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop",
  },
  {
    title: "Merter fiyatlarıyla hemen al",
    caption: "Toptan birim fiyat, vitrine hazır stok",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1920&auto=format&fit=crop",
  },
  {
    title: "Doğrulanmış tedarikçi, güvenli operasyon",
    caption: "Siparişten teslimata tek ekran",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1920&auto=format&fit=crop",
  },
];

export function HomeHeroSlider() {
  const [i, setI] = useState(0);
  const n = SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-md">
      <div className="relative aspect-[16/6] w-full min-h-[200px]">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.title}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? "auto" : "none" }}
            aria-hidden={idx !== i}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, min(100vw, 1200px)"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/45 to-slate-900/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8">
              <h2 className="max-w-2xl text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
                {slide.title}
              </h2>
              <p className="mt-2 max-w-lg text-sm font-medium text-white/90 sm:text-base">{slide.caption}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/katalog"
                  className="inline-flex min-h-12 min-w-[180px] items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-extrabold text-white shadow-lg transition hover:bg-orange-600"
                >
                  Kataloğa geç
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/80 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  İşletme hesabı
                </Link>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className={`h-2 w-2 rounded-full transition ${idx === i ? "bg-white" : "bg-white/40"}`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setI((p) => (p - 1 + n) % n)}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30"
          aria-label="Önceki"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setI((p) => (p + 1) % n)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
