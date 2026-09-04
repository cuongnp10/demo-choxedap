import React from "react";
import { 
    ShieldCheck, 
    Star, 
    ShoppingBag, 
    CheckCircle2, 
    AlertCircle, 
    Timer, 
    Award,
    TrendingUp,
    User
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

interface SellerTrustModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    seller: {
        userId: string;
        name: string;
        rating: number;
        reviews: number;
        avatar?: string;
        joinDate?: string;
        // Mocked or extended data for UI display
        reputationScore?: number;
        totalOrders?: number;
        successRate?: number;
        responseTime?: string;
    };
}

export function SellerTrustModal({ isOpen, onClose, seller }: SellerTrustModalProps) {
    // Use actual data from API, fallback to sensible defaults only if strictly necessary
    const reputationScore = seller.reputationScore ?? 50;
    const totalOrders = seller.totalOrders ?? 0;
    const successRate = seller.successRate ?? 0;
    const responseTime = seller.responseTime ?? "< 30 phút";

    const getReputationBadge = (score: number) => {
        if (score >= 75) return { label: "Xuất sắc", color: "bg-green-100 text-green-700 border-green-200", icon: <Award className="w-4 h-4" /> };
        if (score >= 50) return { label: "Tốt", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 className="w-4 h-4" /> };
        if (score >= 15) return { label: "Trung bình", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertCircle className="w-4 h-4" /> };
        return { label: "Cảnh báo", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle className="w-4 h-4" /> };
    };

    const badge = getReputationBadge(reputationScore);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                aria-describedby={undefined}
                className="sm:max-w-[480px] rounded-[2.5rem] border-0 shadow-clay p-0 overflow-hidden font-['Inter',sans-serif]"
            >
                <DialogHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <DialogDescription className="sr-only">
                        Thông tin chi tiết về độ tin cậy của người bán {seller.name}
                    </DialogDescription>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-white shadow-clay flex items-center justify-center overflow-hidden border border-gray-100">
                            {seller.avatar ? (
                                <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-gray-300" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">{seller.name}</DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-0 ${badge.color}`}>
                                    {badge.icon}
                                    <span className="ml-1">{badge.label}</span>
                                </Badge>
                                <span className="text-xs font-bold text-gray-400">Tham gia từ {seller.joinDate || "2024"}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100/50 space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Đánh giá
                            </p>
                            <p className="text-xl font-black text-gray-900">{seller.rating || 5.0} <span className="text-sm font-bold text-gray-400">/ 5.0</span></p>
                            <p className="text-xs font-bold text-gray-500">{seller.reviews || 0} nhận xét</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100/50 space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ShoppingBag className="w-3 h-3 text-blue-500" /> Đã bán
                            </p>
                            <p className="text-xl font-black text-gray-900">{totalOrders} <span className="text-sm font-bold text-gray-400">đơn</span></p>
                            <p className="text-xs font-bold text-gray-500">Thành công {successRate}%</p>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Chỉ số tin cậy</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Điểm uy tín</p>
                                        <p className="text-xs text-gray-500">Dựa trên lịch sử giao dịch</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-green-600">{reputationScore}</p>
                                </div>
                            </div>

                            {/* <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Timer className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Phản hồi</p>
                                        <p className="text-xs text-gray-500">Thời gian trả lời trung bình</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{responseTime}</p>
                                </div>
                            </div> */}

                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Tỉ lệ chốt đơn</p>
                                        <p className="text-xs text-gray-500">Đơn hàng hoàn thành thực tế</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{successRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            <span className="font-bold block mb-1">💡 Mẹo an toàn:</span>
                            Người bán có nhãn <span className="font-bold">Xuất sắc</span> luôn cam kết chất lượng và có tỉ lệ hoàn tiền thấp nhất hệ thống.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
