import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../lib/assets";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const SocialIcon = ({ path, viewBox = "0 0 24 24" }: { path: string; viewBox?: string }) => (
  <svg className="w-6 h-6" fill="none" viewBox={viewBox}>
    <path d={path} fill="rgba(0,0,0,0.45)" />
  </svg>
);

const socialPaths = {
  facebook: "M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12C5.838 15.403 8.597 18.163 12 18.163C15.403 18.163 18.162 15.404 18.162 12C18.162 8.597 15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM18.406 4.155C17.61 4.155 16.965 4.8 16.965 5.595C16.965 6.39 17.61 7.035 18.406 7.035C19.201 7.035 19.845 6.39 19.845 5.595C19.845 4.8 19.201 4.155 18.406 4.155Z",
  twitter: "M18.9 1.15283H22.582L14.54 10.3418L24 22.8478H16.595L10.791 15.2648L4.157 22.8478H0.469L9.069 13.0168L0 1.15283H7.593L12.834 8.08383L18.9 1.15283ZM17.607 20.6468H19.646L6.482 3.23883H4.292L17.607 20.6468Z",
  linkedin: "M6.88157 8.37402H2.86157V20.466H6.88157V8.37402Z M4.899 2.54395C3.52364 2.54395 2.625 3.44816 2.625 4.6333C2.625 5.79355 3.49631 6.72271 4.8458 6.72271H4.87177C6.27347 6.72271 7.14595 5.79355 7.14595 4.6333C7.11994 3.44816 6.27356 2.54395 4.899 2.54395Z M16.7475 8.08984C14.6151 8.08984 13.66 9.26252 13.1252 10.0862V8.37419H9.1062C9.1595 9.50842 9.1062 20.4661 9.1062 20.4661H13.1251V13.7131C13.1251 13.3517 13.1511 12.9903 13.2576 12.732C13.5477 12.0101 14.2094 11.2623 15.3198 11.2623C16.7735 11.2623 17.3559 12.3716 17.3559 13.9964V20.4661H21.375V13.5319C21.375 9.81766 19.3919 8.08984 16.7475 8.08984Z"
};

export function Footer() {
  return (
    <footer className="w-full bg-white pt-10 pb-10 border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
             <div className="w-[76px] h-[70px] relative shrink-0">
               <ImageWithFallback src={assets.logoFooter} alt="Logo Footer" className="w-full h-full object-cover" />
             </div>
             <span className="text-[#2e8b57] text-[18px] font-bold">Chợ Xe Đạp</span>
          </div>
          <div className="text-[#6b7280] text-[14px] leading-[20px] font-normal">
            <p>Sàn thương mại điện tử chuyên biệt về xe đạp hàng</p>
            <p>đầu Việt Nam. Kết nối đam mê, giao dịch an toàn.</p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4 pl-0 lg:pl-12">
          <h4 className="text-[#1f2937] text-base font-bold">Về chúng tôi</h4>
          <ul className="flex flex-col gap-2 text-[#6b7280] text-sm">
            <li className="hover:text-[#2e9147] cursor-pointer">Giới thiệu</li>
            <Link to="/terms-of-service" className="hover:text-[#2e9147] cursor-pointer">Quy chế hoạt động</Link>
            <Link to="/privacy-policy" className="hover:text-[#2e9147] cursor-pointer">Chính sách bảo mật</Link>
            <li className="hover:text-[#2e9147] cursor-pointer">Giải quyết tranh chấp</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4 pl-0 lg:pl-12">
          <h4 className="text-[#1f2937] text-base font-bold">Hỗ trợ khách hàng</h4>
          <ul className="flex flex-col gap-2 text-[#6b7280] text-sm cursor-pointer">
             <li className="hover:text-[#2e9147]">Trung tâm trợ giúp</li>
             <li className="hover:text-[#2e9147]">An toàn mua bán</li>
             <li className="hover:text-[#2e9147]">Liên hệ hỗ trợ</li>
             <li className="hover:text-[#2e9147]">Tuyển dụng</li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="flex flex-col gap-4 pl-0 lg:pl-12">
          <h4 className="text-[#1f2937] text-base font-bold">Kết nối</h4>
          <div className="flex gap-4">
            <SocialIcon path={socialPaths.facebook} />
            <SocialIcon path={socialPaths.linkedin} /> 
            <SocialIcon path={socialPaths.twitter} />
          </div>
          <div className="flex flex-col gap-1 text-[#6b7280] text-sm mt-1">
             <p>Hotline: 1900 1234</p>
             <p>Email: support@choxedap.vn</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Academic Project Disclaimer
        </div>
        <p className="text-[#6b7280] text-sm leading-relaxed font-medium">
          <span className="font-bold text-gray-900">Lưu ý quan trọng:</span> Đây là đồ án môn học (SWP391) của nhóm sinh viên trường <span className="text-gray-900 font-bold underline decoration-gray-300">Đại học FPT TP.HCM</span>. 
          Toàn bộ thông tin, sản phẩm và giao dịch trên website này chỉ phục vụ mục đích mô phỏng tính năng kỹ thuật, <span className="text-red-500 font-bold uppercase tracking-tighter">không có giá trị kinh doanh thật</span>. 
          Vui lòng không cung cấp thông tin thanh toán thật.
        </p>
        <p className="mt-6 text-gray-400 text-xs font-bold tracking-widest uppercase">© 2026 Chợ Xe Đạp • Built for Education</p>
      </div>
    </footer>
  );
}
