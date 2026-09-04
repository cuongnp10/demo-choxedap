import { useEffect, useState } from "react";
import { 
    ShoppingBag, 
    Search, 
    Loader2, 
    CheckCircle2, 
    ExternalLink, 
    CalendarIcon, 
    CreditCard,
    DollarSign,
    FileCheck,
    Download,
    Clock,
    Info
} from "lucide-react";
import { Badge } from "../ui/badge";
import { fetchBE } from "../../lib/api";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function SellerTransactionHistory() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [servicePayments, setServicePayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersRes, paymentsRes] = await Promise.all([
                fetchBE('/seller/orders'),
                fetchBE('/payments/history?page=1&pageSize=50')
            ]);

            const allOrders = ordersRes?.data || ordersRes || [];
            // Show DELIVERED, COMPLETED, and Settled orders in transaction history
            const transactionOrders = allOrders.filter((o: any) => 
                o.isSettled || 
                o.status === "COMPLETED" || 
                o.status === "DELIVERED" ||
                o.isReported
            ).map((o: any) => ({ ...o, type: 'SALE' }));

            // Filter for service payments (Posting fees, VIP, Inspection)
            const payments = paymentsRes?.data?.items || [];
            const filteredPayments = payments.filter((p: any) => 
                p.status === "PAID" && 
                (p.referenceType === "VIP" || p.referenceType === "POSTING" || p.referenceType === "INSPECTION" || p.referenceType === "MEMBERSHIP")
            ).map((p: any) => ({
                id: p.paymentCode,
                postingTitle: getServiceLabel(p.purpose, p.referenceType),
                totalAmount: p.amount,
                isSettled: true,
                status: "PAID",
                createdAt: p.paidAt || p.createdAt,
                type: 'SERVICE_FEE',
                referenceCode: p.paymentCode
            }));

            // Combine and sort by date
            const combined = [...transactionOrders, ...filteredPayments].sort((a, b) => 
                new Date(b.settlementAt || b.updatedAt || b.createdAt).getTime() - 
                new Date(a.settlementAt || a.updatedAt || a.createdAt).getTime()
            );

            setTransactions(combined);
        } catch (error) {
            console.error("Failed to fetch transaction history", error);
            toast.error("Không thể tải lịch sử giao dịch");
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceLabel = (purpose: string, referenceType?: string) => {
        const p = purpose?.toUpperCase();
        if (referenceType === "VIP" || p?.startsWith("VIP") || p?.startsWith("V:")) return "Nâng cấp tin đăng VIP";
        if (referenceType === "MEMBERSHIP" || p?.startsWith("MEMBERSHIP") || p?.startsWith("MEM:")) return "Gói thành viên";
        if (p?.startsWith("POST")) return "Phí đăng tin";
        if (p?.startsWith("INSP")) return "Phí kiểm định xe";
        return purpose;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredTransactions = transactions.filter(txn => 
        (txn.id?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (txn.postingTitle?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.settlementReference?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.referenceCode?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
                <p className="text-gray-500 font-medium">Đang tải lịch sử giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm mã đối soát, tên xe..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#2E9147]/20 transition-all outline-none shadow-sm"
                    />
                </div>
                {/* <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                    <Download className="w-4 h-4" /> Xuất báo cáo (CSV)
                </button> */}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin tất toán</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Giá bán</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Phí sàn (0%)</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Thực nhận</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Biên lai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.map((txn) => {
                                // According to FS-12: Seller pays fees upfront, so platform fee at this stage is 0
                                // But the backend might have recorded a serviceFee. 
                                // We follow the UI requirements from FS-12 and user prompt.
                                const isSettled = txn.isSettled;
                                const isReported = txn.isReported;
                                const isRefunded = txn.isRefunded;
                                const netAmount = txn.totalAmount; 
                                const settlementCode = txn.settlementReference || (isSettled ? `TRATIEN${txn.id}` : isReported ? "Đang tranh chấp" : "Đang xử lý...");

                                return (
                                    <tr key={txn.id || txn.paymentCode} className={cn("hover:bg-gray-50/30 transition-colors group", isReported && "bg-red-50/10", txn.type === 'SERVICE_FEE' && "bg-gray-50/20")}>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-black text-xs tracking-wider uppercase",
                                                        txn.type === 'SERVICE_FEE' ? "text-blue-500" : (isSettled ? "text-[#2E9147]" : isReported ? "text-red-600" : "text-amber-600")
                                                    )}>
                                                        {settlementCode}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">
                                                        {new Date(txn.settlementAt || txn.updatedAt || txn.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm">{txn.postingTitle}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">
                                                    {txn.type === 'SERVICE_FEE' ? `Mã GD: ${txn.id}` : `Mã đơn: #${txn.id}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {txn.type === 'SERVICE_FEE' ? '-' : ''}{txn.totalAmount.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-bold text-gray-400 text-sm">0đ</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className={cn("font-black text-lg", 
                                                isRefunded ? "text-gray-400 line-through" : 
                                                txn.type === 'SERVICE_FEE' ? "text-red-600" : "text-[#2E9147]"
                                            )}>
                                                {txn.type === 'SERVICE_FEE' ? '-' : ''}{netAmount.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {txn.type === 'SERVICE_FEE' ? (
                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold flex w-fit items-center gap-1 shadow-none">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
                                                </Badge>
                                            ) : isSettled ? (
                                                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-none font-bold flex w-fit items-center gap-1 shadow-none">
                                                    <CheckCircle2 className="w-3 h-3" /> Đã chuyển
                                                </Badge>
                                            ) : isReported ? (
                                                <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-none font-bold flex w-fit items-center gap-1 shadow-none">
                                                    <Clock className="w-3 h-3" /> Bị báo cáo
                                                </Badge>
                                            ) : isRefunded ? (
                                                <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-none font-bold flex w-fit items-center gap-1 shadow-none">
                                                    <Clock className="w-3 h-3" /> Đã hoàn tiền
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none font-bold flex w-fit items-center gap-1 shadow-none">
                                                    <Clock className="w-3 h-3" /> Chờ admin
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {txn.type === 'SERVICE_FEE' ? (
                                                <span className="text-xs text-blue-600 font-bold">
                                                    Dịch vụ
                                                </span>
                                            ) : txn.evidenceImageUrl ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 text-[#2E9147] font-bold hover:bg-green-50"
                                                    onClick={() => window.open(txn.evidenceImageUrl, '_blank')}
                                                >
                                                    <FileCheck className="w-3.5 h-3.5 mr-1" /> Xem ảnh
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-gray-300 font-bold italic">
                                                    {isSettled ? "Nội bộ" : "Chưa có"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {filteredTransactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <DollarSign className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {searchTerm ? "Không tìm thấy giao dịch" : "Chưa có tiền về ví"}
                        </h3>
                        <p className="text-gray-500 font-medium max-w-xs">
                            {searchTerm ? "Thử tìm kiếm với mã đối soát hoặc tên xe khác." : "Các đơn hàng đã hoàn tất và được admin tất toán sẽ hiển thị tại đây."}
                        </p>
                    </div>
                )}
            </div>

            {/* Financial Details (FS-12 requirement) */}
            <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Quy tắc tài chính</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Vì bạn đã thanh toán toàn bộ phí dịch vụ (đăng bài, Ads) ngay từ khi tạo tin, hệ thống <b>không khấu trừ thêm bất kỳ khoản phí nào</b> tại bước tất toán này. Số tiền bạn nhận được bằng đúng giá trị người mua đã thanh toán (bao gồm cả phí ship nếu có).
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Summary Card */}
            {filteredTransactions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tổng tiền chờ admin</p>
                        <h4 className="text-3xl font-black text-amber-600">
                            {transactions
                                .filter(t => !t.isSettled && !t.isRefunded)
                                .reduce((acc, curr) => acc + curr.totalAmount, 0)
                                .toLocaleString('vi-VN')}đ
                        </h4>
                    </div>
                    <div className="bg-[#2E9147] p-6 rounded-[32px] text-white shadow-lg shadow-[#2E9147]/20">
                        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Tổng đã tất toán</p>
                        <h4 className="text-3xl font-black">
                            {transactions
                                .filter(t => t.isSettled)
                                .reduce((acc, curr) => acc + curr.totalAmount, 0)
                                .toLocaleString('vi-VN')}đ
                        </h4>
                    </div>
                </div>
            )}
        </div>
    );
}
