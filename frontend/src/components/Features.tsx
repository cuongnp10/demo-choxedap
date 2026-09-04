import React from "react";
import { assets } from "../lib/assets";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const features = [
  {
    icon: assets.features[0],
    title: "Đảm bảo chất lượng",
    desc: "Tất cả xe đạp đều được kiểm tra kỹ lưỡng trước khi bán",
  },
  {
    icon: assets.features[1],
    title: "Thanh toán an toàn",
    desc: "Nhiều phương thức thanh toán linh hoạt và bảo mật",
  },
  {
    icon: assets.features[2],
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ",
  },
  {
    icon: assets.features[3],
    title: "Giá tốt nhất",
    desc: "Cam kết giá cả cạnh tranh và minh bạch",
  },
];

export function Features() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-0 pb-16">
      <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm w-full py-12 px-6 md:px-12 flex flex-col items-center gap-12">
        <div className="text-center flex flex-col space-y-3 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Cam kết mang đến trải nghiệm mua sắm tốt nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 w-full max-w-[1400px]">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-3 text-center max-w-[320px]">
              <div className="w-[80px] h-[80px] relative shrink-0">
                <ImageWithFallback
                  src={feature.icon}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-black leading-tight whitespace-pre-wrap">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
