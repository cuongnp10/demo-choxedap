import { useNavigate } from "react-router-dom";
import { BikeCard } from "./BikeCard";
import { BikeCardSkeleton } from "./BikeCardSkeleton";
import type { BikeProduct } from "../types/bike";
import { HelpCircle, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface BikeSectionProps {
  title: string;
  subtitle: string;
  bikes: BikeProduct[];
  isCertified?: boolean;
  isLoading?: boolean;
  onBikeClick?: (bike: BikeProduct) => void;
  containerClassName?: string;
  buttonColorClass?: string;
}

export function BikeSection({ 
  title, 
  subtitle, 
  bikes, 
  isCertified = false, 
  isLoading = false,
  onBikeClick,
  containerClassName = "",
  buttonColorClass = "text-primary"
}: BikeSectionProps) {
  const navigate = useNavigate();

  // Ẩn section nếu không đang load và không có xe nào
  if (!isLoading && (!bikes || bikes.length === 0)) {
    return null;
  }

  return (
    <div className={`w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-0 py-12 flex flex-col gap-8 ${containerClassName}`}>
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
              {title}
            </h2>
            {isCertified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help p-1 hover:bg-green-50 rounded-full transition-colors">
                      <HelpCircle size={20} className="text-green-600 opacity-60" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4 rounded-2xl bg-gray-900 text-white border-0 shadow-2xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-400">
                        <ShieldCheck size={16} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Quy trình 50 điểm</span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">
                        Mỗi chiếc xe trong mục này đã trải qua quy trình kiểm tra nghiêm ngặt gồm 50 hạng mục: Khung sườn, hệ thống truyền động, phanh và nguồn gốc pháp lý.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>
        <button 
          onClick={() => navigate("/buy")}
          className={`${buttonColorClass} hover:underline whitespace-nowrap text-lg font-semibold hidden md:block`}
        >
          Xem tất cả &gt;
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8 lg:gap-x-6 justify-items-center">
        {isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <BikeCardSkeleton key={`skeleton-${idx}`} />
            ))
          : bikes.map((bike, index) => (
            <BikeCard
              key={bike.id || index}
              {...bike}
              isCertified={bike.isCertified ?? isCertified}
              onClick={() => onBikeClick?.(bike)}
            />
          ))}      </div>
    </div>
  );
}
