import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";

export function BannerAd() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1200px] mx-auto my-12 px-4 md:px-6">
      <div className="relative w-full overflow-hidden rounded-[24px] bg-[#EAF5ED] shadow-sm border border-[#2E9147]/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row md:px-12 md:py-12">
          {/* Left Content */}
          <div className="max-w-xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-[#2E9147]/20 shadow-sm">
              <Star className="h-4 w-4 text-[#F5B015] fill-[#F5B015]" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#2E9147]">Đặc quyền Hội Viên</span>
            </div>

            <h2 className="mb-3 text-2xl font-black leading-tight text-gray-900 md:text-4xl">
              Nâng cấp Hội Viên - <span className="text-[#2E9147]">Giảm 25%</span> phí
            </h2>

            <p className="mb-8 text-sm md:text-base text-gray-600 font-medium leading-relaxed max-w-[90%] mx-auto md:mx-0">
              Bán xe nhanh hơn với các tính năng đẩy tin tự động và hiển thị huy hiệu xác thực uy tín với người mua.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button 
                onClick={() => navigate("/sell/pricing")}
                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95"
              >
                Tham gia ngay
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => navigate("/sell/pricing/inspection")}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/5"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          {/* Right Content: Stats/Badges */}
          <div className="flex gap-4 shrink-0 mt-2 md:mt-0">
            <div className="flex flex-col items-center justify-center bg-white rounded-[20px] w-28 h-28 shadow-sm border border-[#2E9147]/10 transition-transform hover:-translate-y-1">
              <Zap className="mb-2 h-8 w-8 text-[#F5B015] fill-[#F5B015]/20" />
              <span className="text-2xl font-black text-gray-900 leading-none mb-1">x5</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Lượt xem</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white rounded-[20px] w-28 h-28 shadow-sm border border-[#2E9147]/10 transition-transform hover:-translate-y-1">
              <ShieldCheck className="mb-2 h-8 w-8 text-[#2E9147]" />
              <span className="text-[15px] font-black text-gray-900 leading-none mb-1">Xác thực</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Uy tín</span>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-[#2E9147]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-[#2E9147]/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
}
