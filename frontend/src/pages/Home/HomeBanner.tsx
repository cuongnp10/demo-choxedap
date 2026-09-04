import React from "react";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

interface HomeBannerProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  onButtonClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  image?: string;
}

export function HomeBanner({ 
  title, 
  subtitle, 
  buttonText, 
  onButtonClick, 
  variant = 'primary',
  image
}: HomeBannerProps) {
  const bgStyles = {
    primary: "bg-[#EAF5ED] border-[#2E9147]/10",
    secondary: "bg-[#F0F7FF] border-[#0066CC]/10",
    accent: "bg-[#FFF9E6] border-[#F5B015]/10",
  };

  const textStyles = {
    primary: "text-[#15803D]", // Forest Green
    secondary: "text-[#0066CC]",
    accent: "text-[#D97706]", // Amber-600
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto my-8 px-4 md:px-5 lg:px-0">
      <div className={`relative w-full overflow-hidden rounded-[24px] border ${bgStyles[variant]} shadow-sm`}>
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-12 md:py-10">
          <div className="w-full text-center md:text-left">
            <h2 className="mb-2 text-2xl font-black leading-tight text-gray-900 md:text-3xl lg:text-4xl whitespace-normal md:whitespace-nowrap">
              {title.split('-').map((part, i) => (
                <span key={i} className="inline-block">
                  {i === 1 ? <span className={textStyles[variant]}>{part.trim()}</span> : part.trim()}
                  {i === 0 && title.includes('-') ? <span className="mx-2">-</span> : ''}
                </span>
              ))}
            </h2>

            {subtitle && (
              <p className="mb-6 text-sm md:text-base text-gray-600 font-medium leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}

            <button 
              onClick={onButtonClick}
              className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95 mx-auto md:mx-0"
            >
              {buttonText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {image && (
            <div className="hidden lg:block shrink-0">
              <ImageWithFallback src={image} alt="" className="h-32 lg:h-40 w-auto object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
