import React from "react";
import { useNavigate } from "react-router-dom";
import { BikeSection } from "../../components/BikeSection";
import { Features } from "../../components/Features";
import { HomeBanner } from "./HomeBanner";
import type { BikeProduct } from "../../types/bike";

interface BodyProps {
  prominentBikes: BikeProduct[];
  certifiedBikes: BikeProduct[];
  outstandingBikes: BikeProduct[];
  randomBikes: BikeProduct[];
  isLoading: boolean;
  onBikeClick: (bike: BikeProduct) => void;
}

export const Body = ({ 
  prominentBikes, 
  certifiedBikes, 
  outstandingBikes,
  randomBikes,
  isLoading, 
  onBikeClick 
}: BodyProps): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <main className="w-full flex flex-col">
      {/* 4. Xe đạp Nổi trội (Prominent) */}
      <div className="mt-12 lg:mt-16 w-full px-4 md:px-5">
        <div className="max-w-[1440px] mx-auto bg-gradient-to-br from-white to-blue-50/30 rounded-[2.5rem] border-2 border-blue-600/20 shadow-2xl shadow-blue-600/5 overflow-hidden ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-600/40 hover:border-blue-600 hover:ring-4 hover:ring-blue-600/10 hover:from-white hover:to-blue-100/40 group/section">
          <BikeSection
            title="Xe đạp nổi trội"
            subtitle="Những mẫu xe tốt nhất đang chờ bạn khám phá"
            bikes={prominentBikes.slice(0, 5)}
            isLoading={isLoading}
            onBikeClick={onBikeClick}
            containerClassName="!max-w-none px-6 md:px-10 lg:px-12 py-10 lg:py-14"
            buttonColorClass="text-blue-600"
          />
        </div>
      </div>

      {/* 5. Banner 1 (Hành động) */}
      <HomeBanner 
        title="Mua xe ngay - Free ship toàn quốc"
        subtitle="Tiết kiệm chi phí vận chuyển, an tâm mua sắm từ mọi nơi trên đất nước."
        buttonText="Khám phá ngay"
        onButtonClick={() => navigate("/buy")}
        variant="primary"
      />

      {/* 6. Xe đạp đã kiểm định (Certified) */}
      <div className="mt-12 lg:mt-16 w-full px-4 md:px-5">
        <div className="max-w-[1440px] mx-auto bg-gradient-to-br from-white to-green-50/30 rounded-[2.5rem] border-2 border-green-600/20 shadow-2xl shadow-green-600/5 overflow-hidden ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-green-600/40 hover:border-green-600 hover:ring-4 hover:ring-green-600/10 hover:from-white hover:to-green-100/40 group/section">
          <BikeSection
            title="Xe đạp đã được kiểm định"
            subtitle="Đã được chứng nhận chất lượng bởi đội ngũ chuyên gia"
            bikes={certifiedBikes}
            isCertified={true}
            isLoading={isLoading}
            onBikeClick={onBikeClick}
            containerClassName="!max-w-none px-6 md:px-10 lg:px-12 py-10 lg:py-14"
            buttonColorClass="text-green-600"
          />
        </div>
      </div>

      {/* 7. Banner 2 (Đăng tin) */}
      <HomeBanner 
        title="Đăng tin bán xe ngay - AI hỗ trợ báo giá"
        subtitle="Công nghệ AI tiên tiến giúp định giá xe chính xác, bán nhanh hơn x3 lần."
        buttonText="Đăng tin ngay"
        onButtonClick={() => navigate("/sell")}
        variant="secondary"
      />

      {/* 8. Xe đạp Nổi bật (Outstanding) */}
      <div className="mt-12 lg:mt-16 w-full px-4 md:px-5">
        <div className="max-w-[1440px] mx-auto bg-gradient-to-br from-white to-amber-50/30 rounded-[2.5rem] border-2 border-amber-500/20 shadow-2xl shadow-amber-500/5 overflow-hidden ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/40 hover:border-amber-500 hover:ring-4 hover:ring-amber-500/10 hover:from-white hover:to-amber-100/40 group/section">
          <BikeSection
            title="Xe đạp nổi bật"
            subtitle="Đừng bỏ lỡ những chiếc xe đạp đang được quan tâm nhiều nhất"
            bikes={outstandingBikes}
            isLoading={isLoading}
            onBikeClick={onBikeClick}
            containerClassName="!max-w-none px-6 md:px-10 lg:px-12 py-10 lg:py-14"
            buttonColorClass="text-amber-600"
          />
        </div>
      </div>

      {/* 9. Sản phẩm khác (Random Products) */}
      <div className="w-full">
        <BikeSection
          title="Sản phẩm khác"
          subtitle="Khám phá thêm nhiều lựa chọn đa dạng tại Cho Xe Dap"
          bikes={randomBikes}
          isLoading={isLoading}
          onBikeClick={onBikeClick}
        />
      </div>

      {/* 10. Banner 3 (Giá trị cốt lõi) */}
      <Features />
    </main>
  );
};
