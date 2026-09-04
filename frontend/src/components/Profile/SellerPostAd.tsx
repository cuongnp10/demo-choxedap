
import { Bike, Upload, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SellerPostAd() {
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-[40px] border border-gray-100 p-8 lg:p-12 shadow-sm text-center">
                <div className="max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                        <Bike className="w-12 h-12 text-[#2E9147]" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Bạn muốn bán xe?</h2>
                    <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                        Chỉ mất 2 phút để đăng tin và tiếp cận hơn 10,000 người mua tiềm năng mỗi ngày trên Chợ Xe Đạp.
                    </p>
                    <button
                        onClick={() => navigate("/sell")}
                        className="bg-[#2E9147] text-white px-12 py-5 rounded-[24px] font-black text-lg hover:bg-[#257a3b] transition-all shadow-xl shadow-[#2E9147]/20 flex items-center gap-3 mx-auto active:scale-95"
                    >
                        Đăng tin mới ngay <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                        <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Đăng tin nhanh chóng</h4>
                    <p className="text-sm text-gray-500 font-medium">Giao diện đơn giản, dễ dàng tải ảnh và điền thông tin xe.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                        <Zap className="w-8 h-8 text-orange-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Tiếp cận tức thì</h4>
                    <p className="text-sm text-gray-500 font-medium">Tin đăng của bạn sẽ được hiển thị ngay lập tức sau khi được duyệt.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">An tâm giao dịch</h4>
                    <p className="text-sm text-gray-500 font-medium">Hệ thống bảo vệ người bán và hỗ trợ giải quyết tranh chấp.</p>
                </div>
            </div>
        </div>
    );
}
