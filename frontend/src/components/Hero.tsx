import React, { useState, useEffect, useCallback } from "react";
import { assets } from "../lib/assets";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockFetch } from "../lib/mockFetch";

type HeroProps = {
  initialQuery?: string;
  onSearch?: (query: string) => void;
};

const DEFAULT_SLIDES = [
  {
    image: assets.heroBg[0],
    title: "Tìm chiếc xe đạp hoàn hảo của bạn",
    subtitle: "Hơn 5.000+ xe đạp thể thao chính hãng đang chờ bạn"
  },
  {
    image: assets.heroBg[1],
    title: "Mua bán an toàn - Đã kiểm định",
    subtitle: "Yên tâm giao dịch với dịch vụ kiểm định 50 điểm của chúng tôi"
  },
  {
    image: assets.heroBg[2],
    title: "Nâng cấp gói VIP - Bán xe nhanh hơn",
    subtitle: "Tiếp cận khách hàng tiềm năng chỉ trong vài giờ"
  }
];

export function Hero({ initialQuery = "", onSearch }: HeroProps) {
  const [query, setQuery] = useState(initialQuery);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideData, setSlideData] = useState<{ image: string | null; title: string | null; subtitle: string | null }[]>([]);

  // Load hero images from system settings (admin-configurable)
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    mockFetch(`${apiUrl}/metadata/settings`)
      .then(r => r.json())
      .then(data => {
        const settings: any[] = data?.data ?? [];
        const slides = ['HeroSlide1', 'HeroSlide2', 'HeroSlide3'].map(key => {
          const s = settings.find(x => (x.settingKey || x.SettingKey || x.Key || x.key) === key);
          const val = s?.settingValue || s?.SettingValue || s?.Value || s?.value;
          if (!val) return { image: null, title: null, subtitle: null };
          try {
            const parsed = JSON.parse(val);
            return {
              image: parsed.url ?? null,
              title: parsed.title ?? null,
              subtitle: parsed.subtitle ?? null
            };
          }
          catch {
            return { image: val, title: null, subtitle: null };
          }
        });
        setSlideData(slides);
      })
      .catch(() => { /* fallback to defaults */ });
  }, []);

  const slides = DEFAULT_SLIDES.map((s, i) => {
    const dynamic = slideData[i];
    return {
      image: dynamic?.image ?? s.image,
      title: dynamic?.title ?? s.title,
      subtitle: dynamic?.subtitle ?? s.subtitle,
    };
  });

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleSearch = () => {
    onSearch?.(query.trim());
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden group flex items-center justify-center bg-gray-100">
      {/* Background Images with Transition */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
        >
          <ImageWithFallback
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center w-full max-w-[1678px] mx-auto px-4 text-center">

        {/* Animated Text */}
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-base md:text-xl text-white/90 font-medium drop-shadow-md max-w-2xl mx-auto">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Carousel Controls */}
        <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
          <button
            onClick={prevSlide}
            className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all pointer-events-auto text-white"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all pointer-events-auto text-white"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-3 absolute bottom-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all rounded-full ${idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
