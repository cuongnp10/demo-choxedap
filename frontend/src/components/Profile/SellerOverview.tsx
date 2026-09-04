import { Bike, Star, Eye, MessageCircle, AlertCircle, ShieldCheck, Crown, CheckCircle2 } from "lucide-react";
import type { UserProfile } from "../../types/user";
import { cn } from "../../lib/utils";

interface SellerOverviewProps {
    profile: UserProfile;
    onViewReviews?: () => void;
}

export function SellerOverview({ profile, onViewReviews }: SellerOverviewProps) {
    const getMembershipColor = (tier: string) => {
        switch (tier?.toUpperCase()) {
            case "PREMIUM": return "text-amber-600 bg-amber-50 border-amber-100";
            case "STANDARD": return "text-blue-600 bg-blue-50 border-blue-100";
            default: return "text-gray-600 bg-gray-50 border-gray-100";
        }
    };

    const stats = [
        { 
            label: "Hội viên", 
            value: profile.membershipTier || "BASIC", 
            icon: <Crown className="w-5 h-5 text-amber-500" />,
            isBadge: true
        },
        { 
            label: "Số đánh giá", 
            value: (profile.stats as any)?.totalReviews || 0, 
            icon: <MessageCircle className="w-5 h-5 text-orange-500" /> 
        },
        { 
            label: "Lượt xem tin", 
            value: profile.stats?.totalViews || 0, 
            icon: <Eye className="w-5 h-5 text-purple-500" /> 
        },
        { 
            label: "Tổng xe đã bán", 
            value: profile.stats?.completedOrders || 0, 
            icon: <ShieldCheck className="w-5 h-5 text-green-500" /> 
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-green-50 transition-colors">{stat.icon}</div>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            {stat.isBadge ? (
                                <div className={cn("inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border mb-1 tracking-tighter", getMembershipColor(stat.value.toString()))}>
                                    {stat.value} PLAN
                                </div>
                            ) : (
                                <h4 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h4>
                            )}
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reputation Box */}
                <div className="bg-[#2E9147] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-[#2E9147]/20">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <ShieldCheck className="w-48 h-48 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Tài khoản đang hoạt động
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-2 italic">Uy tín người bán</h3>
                            <p className="text-white/80 text-sm font-medium max-w-xs mb-6">
                                Dựa trên các hệ quả của báo cáo bài đăng và khiếu nại đơn hàng của bạn
                            </p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Điểm uy tín</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black">{profile.reputationScore}</span>
                                </div>
                            </div>
                            {/* <button 
                                onClick={onViewReviews}
                                className="bg-white text-[#2E9147] px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-green-50 transition-colors active:scale-95 shadow-lg"
                            >
                                Chi tiết
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Rating Box */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-green-100 transition-colors">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 italic">Đánh giá trung bình</h3>
                        <p className="text-gray-500 text-sm font-medium max-w-xs mb-6">
                            Dựa trên các đơn hàng đã giao thành công của bạn.
                        </p>
                    </div>

                    <div className="bg-gray-50 group-hover:bg-green-50/50 border border-gray-100 group-hover:border-green-100 rounded-3xl p-6 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Số sao tích lũy</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-gray-900">{profile.stats?.rating || "0.0"}</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={cn("w-4 h-4", s <= Math.round(profile.stats?.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onViewReviews}
                            className="bg-[#2E9147] text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#257a3b] transition-colors active:scale-95 shadow-lg"
                        >
                            Chi tiết
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions/Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2E9147]" />
                        Thông tin quan trọng
                    </h3>
                    <div className="space-y-4 flex-1">
                        {profile.kycStatus !== "VERIFIED" ? (
                            <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-[24px] border border-amber-100">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Chưa xác thực KYC</h4>
                                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Hãy hoàn thiện thông tin xác thực để tăng độ tin cậy và bắt đầu bán hàng ngay.</p>
                                    <button className="text-amber-600 text-[10px] font-black mt-3 hover:underline uppercase tracking-wider">Xác thực ngay</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-[24px] border border-blue-100">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Hồ sơ đã xác minh</h4>
                                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Tài khoản của bạn đã đạt trạng thái tin cậy cao nhất trên sàn giao dịch.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2E9147]" />
                        Tiếp cận khách hàng
                    </h3>
                    <div className="flex items-start gap-4 p-5 bg-green-50 rounded-[24px] border border-green-100">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                            <MessageCircle className="w-5 h-5 text-[#2E9147]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Cơ hội bán hàng</h4>
                            <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Hơn 10,000 khách hàng tiềm năng đang tìm kiếm xe mới mỗi ngày.</p>
                            {/* <button className="text-[#2E9147] text-[10px] font-black mt-3 hover:underline uppercase tracking-wider">Tăng tốc bán hàng</button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
