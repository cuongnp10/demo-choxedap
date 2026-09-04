import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Shield, Star, Clock, Loader2, AlertCircle } from "lucide-react";
import { userApi, membershipApi, paymentsApi } from "../../lib/api";
import { toast } from "sonner";

export function SellerMembership() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [activeMembership, setActiveMembership] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [plansData, activeData] = await Promise.all([
                membershipApi.getPlans(),
                userApi.getActiveMembership()
            ]);
            setPlans(plansData);
            setActiveMembership(activeData);
        } catch (error) {
            console.error("Failed to fetch membership data", error);
            toast.error("Không thể tải thông tin gói hội viên");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Lắng nghe sự kiện để refresh dữ liệu khi cần (tùy chọn)
        const handleRefresh = () => fetchData();
        window.addEventListener('refreshMembership', handleRefresh);
        return () => window.removeEventListener('refreshMembership', handleRefresh);
    }, []);

    const handleSubscribe = async (planId: number) => {
        setIsProcessing(true);
        try {
            const response = await paymentsApi.createMembershipPayment(planId);
            if (response && response.paymentCode) {
                toast.success("Đang chuyển hướng đến trang thanh toán...");
                // Chuyển hướng kèm theo type=membership để CheckoutPage xử lý đúng UI
                navigate(`/checkout?paymentCode=${response.paymentCode}&type=membership&planId=${planId}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tạo yêu cầu thanh toán");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRenew = () => {
        if (!activeMembership) return;
        
        // Tìm plan ID tương ứng với tier hiện tại (VD: BASIC, STANDARD, PREMIUM) để gia hạn
        const currentPlan = plans.find(p => p.tier === activeMembership.tier);
        if (currentPlan) {
            handleSubscribe(currentPlan.id);
        } else {
            toast.error("Không tìm thấy thông tin gói hội viên tương ứng để gia hạn.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147] mb-4" />
                <p className="text-gray-500 font-medium">Đang tải thông tin...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Current Status */}
            {activeMembership ? (
                <div className="bg-gradient-to-r from-[#2E9147] to-[#257a3b] rounded-[32px] p-8 lg:p-10 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                </span>
                                <span className="text-sm font-black uppercase tracking-widest opacity-80">Gói hiện tại</span>
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-black mb-2">Hội viên {activeMembership.tier}</h3>
                            <p className="text-white/70 font-medium">
                                Hết hạn vào: <span className="text-white font-bold">
                                    {activeMembership.expiresAt ? (
                                        (() => {
                                            const d = new Date(activeMembership.expiresAt);
                                            return isNaN(d.getTime()) ? "---" : d.toLocaleDateString('vi-VN');
                                        })()
                                    ) : "Đang cập nhật..."}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleRenew}
                                disabled={isProcessing}
                                className="px-8 py-4 bg-white text-[#2E9147] font-black rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing && <Loader2 size={18} className="animate-spin" />}
                                Gia hạn ngay
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]" />
                </div>
            ) : (
                <div className="bg-gray-50 rounded-[32px] p-8 lg:p-10 border-2 border-dashed border-gray-200 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Bạn chưa tham gia hội viên</h3>
                    <p className="text-gray-500 max-w-md">Hãy chọn một gói hội viên bên dưới để nhận được nhiều ưu đãi và chiết khấu hấp dẫn khi kinh doanh trên Chợ Xe Đạp.</p>
                </div>
            )}

            {/* Benefits Section */}
            <div>
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Quyền lợi hội viên</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Chiết khấu dịch vụ</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Giảm giá trực tiếp trên các dịch vụ đăng tin, đẩy tin và kiểm định xe.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Huy hiệu xác thực</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Tăng độ tin cậy với khách hàng thông qua huy hiệu người bán uy tín.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                            <Clock className="w-6 h-6 text-purple-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">Ưu tiên hiển thị</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Tin đăng của hội viên luôn được ưu tiên xử lý và hiển thị tốt hơn.</p>
                    </div>
                </div>
            </div>

            {/* Plans Section */}
            <div>
                <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Các gói hội viên</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white rounded-3xl border ${activeMembership?.tier === plan.tier ? 'border-[#2E9147] ring-2 ring-[#2E9147]/10' : 'border-gray-100'} p-8 flex flex-col hover:shadow-xl transition-all hover:-translate-y-1 relative`}>
                            {activeMembership?.tier === plan.tier && (
                                <div className="absolute top-4 right-4">
                                    <span className="bg-[#2E9147] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Đang dùng</span>
                                </div>
                            )}
                            <div className="mb-6">
                                <h4 className="text-2xl font-black text-gray-900 mb-2">{plan.tier}</h4>
                                <p className="text-sm text-gray-500 font-medium">{plan.description || `Tiết kiệm hơn với gói ${plan.tier}`}</p>
                            </div>
                            <div className="mb-8 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                    <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <Check className="w-4 h-4 text-[#2E9147]" />
                                    </div>
                                    <span>Giảm {plan.discountPercentage}% phí dịch vụ</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                    <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <Check className="w-4 h-4 text-[#2E9147]" />
                                    </div>
                                    <span>Thời hạn {plan.durationDays} ngày</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                    <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <Check className="w-4 h-4 text-[#2E9147]" />
                                    </div>
                                    <span>Hỗ trợ ưu tiên</span>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="mb-6">
                                    <span className="text-3xl font-black text-gray-900">{plan.price.toLocaleString('vi-VN')}đ</span>
                                    <span className="text-gray-400 font-bold ml-2">/ {plan.durationDays} ngày</span>
                                </div>
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={isProcessing || activeMembership?.tier === plan.tier}
                                    className={`w-full py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                        activeMembership?.tier === plan.tier
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[#2E9147] text-white hover:bg-[#257a3b] shadow-lg shadow-[#2E9147]/20"
                                    }`}
                                >
                                    {isProcessing && <Loader2 size={18} className="animate-spin" />}
                                    {activeMembership?.tier === plan.tier ? "Gói hiện tại" : "Đăng ký ngay"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
