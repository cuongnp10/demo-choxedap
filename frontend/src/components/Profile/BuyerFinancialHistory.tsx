import { useState, useEffect } from "react";
import { 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Loader2,
    Search,
    Filter,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { fetchBE } from "../../lib/api";
import { formatDate } from "../../lib/utils";

interface Transaction {
    paymentCode: string;
    status: string;
    amount: number;
    expectedAmount: number;
    purpose: string;
    referenceType: string;
    referenceId: number;
    paidAt: string | null;
    createdAt: string;
    sepayReferenceCode: string | null;
}

interface PendingRefund {
    orderId: number;
    amount: number;
    status: string;
    createdAt: string;
    postingTitle: string;
}

export function BuyerFinancialHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pendingRefunds, setPendingRefunds] = useState<PendingRefund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const fetchData = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const [historyRes, ordersRes] = await Promise.all([
                fetchBE(`/payments/history?page=${pageNum}&pageSize=${pageSize}`),
                fetchBE('/buyer/orders')
            ]);

            const allOrders = ordersRes?.data || ordersRes || [];
            const orderMap = new Map();
            allOrders.forEach((o: any) => {
                orderMap.set(o.id, o);
                orderMap.set(`post-${o.postingId}`, o); // Map posting ID as well for reserved payments
            });

            const historyData = historyRes?.data || historyRes;
            const historyItems = historyData?.items || (Array.isArray(historyData) ? historyData : []);

            // Enrich transactions with order information (bike titles)
            const enriched = historyItems.map((txn: any) => {
                let bikeTitle = "";
                if (txn.referenceType === "ORDER") {
                    const order = orderMap.get(txn.referenceId) || orderMap.get(`post-${txn.referenceId}`);
                    bikeTitle = order?.postingTitle ? `: ${order.postingTitle}` : "";
                }
                return { ...txn, bikeTitle };
            });
            setTransactions(enriched);
            setTotalItems(historyData?.totalCount || enriched.length);

            // Extract pending refunds from cancelled orders
            const pending = allOrders
                .filter((o: any) => o.status === "CANCELLED" && !o.isRefunded && (o.totalAmount > 0))
                .map((o: any) => ({
                    orderId: o.id,
                    amount: o.totalAmount,
                    status: "REFUND_REQUIRED",
                    createdAt: o.updatedAt || o.createdAt,
                    postingTitle: o.postingTitle
                }));
            setPendingRefunds(pending);

        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Không thể tải lịch sử giao dịch");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const getPurposeLabel = (purpose: string, referenceType?: string, bikeTitle?: string) => {
        const p = purpose?.toUpperCase();
        if (referenceType === "VIP" || p?.startsWith("VIP") || p?.startsWith("V:")) return `Nâng cấp tin đăng VIP${bikeTitle || ""}`;
        if (p?.startsWith("DEPOSIT")) return `Đặt cọc mua xe${bikeTitle || ""}`;
        if (p?.startsWith("FULL_PAYMENT")) return `Thanh toán mua xe${bikeTitle || ""}`;
        if (p?.startsWith("MEM")) return "Đăng ký hội viên";
        if (p?.startsWith("POST")) return `Phí đăng tin${bikeTitle || ""}`;
        if (p?.startsWith("INSP")) return `Phí kiểm định xe${bikeTitle || ""}`;
        if (p?.startsWith("REFUND")) return `Hoàn tiền (Cash back)${bikeTitle || ""}`;
        return purpose;
    };

    const getStatusConfig = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case "PAID":
                return {
                    label: "Thành công",
                    color: "text-green-600 bg-green-50 border-green-100",
                    icon: <CheckCircle2 className="w-4 h-4" />
                };
            case "REFUND_REQUIRED":
                return {
                    label: "Chờ hoàn tiền",
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                    icon: <Clock className="w-4 h-4" />
                };
            case "RESERVED":
            case "UNPAID":
                return {
                    label: "Đang chờ",
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                    icon: <Clock className="w-4 h-4" />
                };
            case "ERROR":
            case "EXPIRED":
                return {
                    label: "Thất bại",
                    color: "text-red-600 bg-red-50 border-red-100",
                    icon: <XCircle className="w-4 h-4" />
                };
            default:
                return {
                    label: status,
                    color: "text-gray-600 bg-gray-50 border-gray-100",
                    icon: <AlertCircle className="w-4 h-4" />
                };
        }
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#2E9147]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 uppercase tracking-tight">
                    Lịch sử giao dịch
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Quản lý các khoản thanh toán và hoàn tiền của bạn trên hệ thống.
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Giao dịch</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Số tiền</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ngày thực hiện</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* Render Pending Refunds First */}
                            {pendingRefunds.map((refund) => {
                                const statusConfig = getStatusConfig(refund.status);
                                return (
                                    <tr key={`pending-${refund.orderId}`} className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-tight">
                                                        Hoàn tiền: {refund.postingTitle}
                                                    </p>
                                                    <p className="text-[10px] text-amber-600 mt-1 font-black uppercase tracking-widest">
                                                        Đơn hàng #{refund.orderId} (Đang xử lý)
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-black text-base text-amber-600">
                                                +{refund.amount?.toLocaleString('vi-VN')}₫
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-sm font-bold text-gray-900">
                                                {formatDate(refund.createdAt)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                Hệ thống ghi nhận
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Render Normal Transactions */}
                            {transactions.length > 0 ? (
                                transactions.map((txn) => {
                                    const statusConfig = getStatusConfig(txn.status);
                                    const isRefund = txn.purpose?.toUpperCase().includes("REFUND");
                                    
                                        return (
                                            <tr key={txn.paymentCode} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                            isRefund ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-[#2E9147]'
                                                        }`}>
                                                            {isRefund ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm leading-tight group-hover:text-[#2E9147] transition-colors">
                                                                {getPurposeLabel(txn.purpose, txn.referenceType, (txn as any).bikeTitle)}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest">
                                                                Mã: {txn.paymentCode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusConfig.color}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`font-black text-base ${isRefund ? 'text-blue-600' : 'text-[#2E9147]'}`}>
                                                    {isRefund ? '+' : '-'}{txn.amount?.toLocaleString('vi-VN')}₫
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatDate(txn.paidAt || txn.createdAt)}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                    {new Date(txn.paidAt || txn.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : pendingRefunds.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                                            <CreditCard className="w-10 h-10 text-gray-200" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Chưa có giao dịch</h3>
                                        <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2 font-medium">
                                            Các khoản thanh toán và hoàn tiền của bạn sẽ xuất hiện tại đây.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalItems > pageSize && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Trang {page} / {Math.ceil(totalItems / pageSize)}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-6 py-2 text-xs font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(totalItems / pageSize)}
                                className="px-6 py-2 text-xs font-black uppercase tracking-widest text-[#2E9147] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                            >
                                Tiếp theo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Note about Refunds */}
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-3xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-50">
                    <ArrowDownLeft className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Về các khoản hoàn tiền (Refund)</h4>
                    <p className="text-blue-700/80 text-sm mt-1 leading-relaxed">
                        Các khoản hoàn tiền từ việc hủy đơn hàng sẽ được Admin xử lý và chuyển trực tiếp vào tài khoản ngân hàng của bạn. 
                        Số tiền này sẽ được chuyển vào tài khoản bạn đã đăng ký trong hồ sơ. Thời gian xử lý từ 1-3 ngày làm việc.
                    </p>
                </div>
            </div>
        </div>
    );
}
