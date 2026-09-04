import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Package, 
    Truck, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ArrowLeft, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Store,
    Loader2,
    Hash,
    X,
    AlertTriangle,
    ShieldAlert,
    RefreshCcw,
    RefreshCw,
    Flag,
    FileText,
    CheckCircle,
    HelpCircle
} from "lucide-react";
import { fetchBE, orderApi } from "../lib/api";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/ui/tooltip";

const getStatusConfig = (status: string, isReported?: boolean) => {
    console.log(isReported)
    const s = status?.toUpperCase();
    
    switch (s) {
        case "PAID":
            return {
                label: "Chờ duyệt",
                color: "bg-amber-100 text-amber-700 border-amber-200",
                icon: <Clock className="w-5 h-5 mr-2" />,
                tooltip: "Người bán đã nhận được thông báo thanh toán và đang kiểm tra tình trạng xe."
            };
        case "CONFIRMED":
            return {
                label: "Chờ lấy hàng",
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: <Package className="w-5 h-5 mr-2" />,
                tooltip: "Người bán đã đồng ý bán. Shipper đang được điều phối đến lấy xe."
            };
        case "CREATED":
        case "DEPOSITED":
        case "AWAITING_SELLER_CONFIRMATION":
            return {
                label: "Chờ duyệt",
                color: "bg-amber-100 text-amber-700 border-amber-200",
                icon: <Clock className="w-5 h-5 mr-2" />
            };
        case "PENDING_FULFILLMENT":
        case "PICKUP_SCHEDULED":
            return {
                label: "Đã lấy hàng",
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: <Package className="w-5 h-5 mr-2" />
            };
        case "IN_TRANSIT":
            return {
                label: "Đang vận chuyển",
                color: "bg-purple-100 text-purple-700 border-purple-200",
                icon: <Truck className="w-5 h-5 mr-2" />
            };
        case "DELIVERED":
        case "SETTLED":
        case "COMPLETED":
            return {
                label: "Đã giao hàng",
                color: "bg-green-100 text-green-700 border-green-200",
                icon: <CheckCircle2 className="w-5 h-5 mr-2" />
            };
        case "CANCELLED":
            return {
                label: "Đã hủy",
                color: "bg-red-100 text-red-700 border-red-200",
                icon: <XCircle className="w-5 h-5 mr-2" />
            };
        case "REPORTED":
            return {
                label: "Đang khiếu nại",
                color: "bg-amber-100 text-amber-700 border-amber-200",
                icon: <AlertTriangle className="w-5 h-5 mr-2" />
            };
        default:
            return {
                label: status,
                color: "bg-gray-100 text-gray-700 border-gray-200",
                icon: <Clock className="w-5 h-5 mr-2" />
            };
    }
};

export function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("Thay đổi ý định");
    const [otherReason, setOtherReason] = useState("");

    const cancelReasonsList = [
        "Thay đổi ý định",
        "Tìm thấy giá rẻ hơn ở nơi khác",
        "Thời gian giao hàng quá lâu",
        "Thay đổi địa chỉ giao hàng",
        "Khác"
    ];

    const fetchOrder = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await orderApi.getOrderDetail(id);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order details", error);
            toast.error("Không thể tải thông tin chi tiết đơn hàng");
            navigate("/account/buyer/history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id, navigate]);

    const handleOpenCancel = () => {
        setCancelReason("Thay đổi ý định");
        setOtherReason("");
        setCancelModalOpen(true);
    };

    const handleCloseCancel = () => {
        setCancelModalOpen(false);
    };

    const handleSubmitCancel = async () => {
        const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
        if (!order) return;

        try {
            await fetchBE(`/buyer/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: finalReason })
            });
            toast.success("Đã hủy đơn hàng thành công");
            fetchOrder();
        } catch (error) {
            console.error("Failed to cancel order", error);
            toast.error("Không thể hủy đơn hàng");
        }
        handleCloseCancel();
    };

    if (isLoading || isAuthLoading) {
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
            </div>
        );
    }

    if (!order) return null;

    const statusConfig = getStatusConfig(order.status, order.isReported);
    const isPending = ["CREATED", "PAID", "DEPOSITED", "AWAITING_SELLER_CONFIRMATION"].includes(order.status?.toUpperCase());
    const isReported = order.isReported;
    const isCancelled = order.status?.toUpperCase() === "CANCELLED";

    // Determine if current user is the buyer
    const isBuyer = user?.id && order?.buyerId && String(user.id) === String(order.buyerId);
    
    // Final name logic: Use the sanitized name from order object directly
    // This ensures consistency with the history page which also uses order.buyerName/sellerName
    const finalName = order?.buyerName || "Người mua";
    const finalAddress = order?.deliveryAddress || "Chưa cập nhật địa chỉ giao hàng";

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 font-['Inter',sans-serif]">
            {/* Header */}
            <div className="mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-[#2E9147] font-semibold transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại lịch sử đơn hàng
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Chi tiết đơn hàng</h1>
                        <div className="flex items-center gap-2 mt-2 text-gray-500">
                            <Hash className="w-4 h-4" />
                            <span className="font-medium">Mã đơn hàng: {order.id}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isPending && (
                            <button
                                onClick={handleOpenCancel}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-red-500 transition-colors"
                            >
                                Hủy đơn
                            </button>
                        )}
                        {!isPending && !isReported && !isCancelled && (
                            <button
                                onClick={() => navigate(`/account/buyer/report/${order.id}`)}
                                className="px-4 py-2 bg-white border border-red-100 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Báo cáo Đơn hàng
                            </button>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border cursor-help ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                            {statusConfig.tooltip && <HelpCircle className="w-3.5 h-3.5 ml-2 opacity-50" />}
                                        </div>
                                        {order.isReported && order.status?.toUpperCase() !== "CANCELLED" && (
                                            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border bg-amber-50 text-amber-600 border-amber-100">
                                                <Flag className="w-4 h-4 mr-2" />
                                                Đang khiếu nại
                                            </div>
                                        )}
                                        {order.isRefunded && (
                                            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border bg-blue-50 text-blue-600 border-blue-100">
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Đã hoàn tiền
                                            </div>
                                        )}
                                        {order.isSettled && (
                                            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border bg-green-50 text-green-600 border-green-100">
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Đã quyết toán
                                            </div>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                {statusConfig.tooltip && (
                                    <TooltipContent className="max-w-[200px] p-3 rounded-xl bg-gray-900 text-white border-0 shadow-xl">
                                        <p className="text-xs font-medium leading-relaxed">{statusConfig.tooltip}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Alert Box for REPORTED status */}
            {isReported && (
                <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-red-900 tracking-tight">Đơn hàng đang trong quá trình tranh chấp</h3>
                        <p className="text-red-700/80 font-medium mt-1 leading-relaxed">
                            Dòng tiền đang bị đóng băng để chờ Trọng tài xử lý. Chúng tôi sẽ xem xét minh chứng từ cả hai phía và đưa ra phán quyết cuối cùng trong vòng 24-48h.
                        </p>
                    </div>
                </div>
            )}

            {/* Refund Progress for CANCELLED status */}
            {isCancelled && order.totalAmount > 0 && (
                <div className="mb-8 p-2 bg-blue-900/[0.02] ring-1 ring-black/5 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                    <RefreshCcw className="w-5 h-5" />
                                </div>
                                Tiến trình hoàn tiền
                            </h3>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền hoàn trả</p>
                                <p className="text-xl font-black text-blue-600">{order.totalAmount?.toLocaleString('vi-VN')} ₫</p>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
                            
                            <div className="space-y-10">
                                {/* Step 1: Order Cancelled */}
                                <div className="relative flex items-start gap-6 group">
                                    <div className="relative z-10 w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-100 group-hover:scale-110 transition-transform">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Đơn hàng đã hủy</p>
                                        <p className="text-gray-500 text-sm font-medium mt-1">Đã xác nhận hủy vào {formatDate(order.updatedAt)}</p>
                                    </div>
                                </div>

                                {/* Step 2: Refund Processing */}
                                <div className="relative flex items-start gap-6 group">
                                    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${order.isRefunded ? "bg-green-500 text-white shadow-green-100" : "bg-blue-500 text-white shadow-blue-100 animate-pulse"}`}>
                                        {order.isRefunded ? <CheckCircle className="w-6 h-6" /> : <RefreshCcw className="w-6 h-6" />}
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Đang chờ hoàn tiền</p>
                                        <p className="text-gray-500 text-sm font-medium mt-1">Hệ thống đang thực hiện lệnh hoàn tiền tự động qua SePay.</p>
                                    </div>
                                </div>

                                {/* Step 3: Refund Completed */}
                                <div className={`relative flex items-start gap-6 group ${!order.isRefunded ? "opacity-40 grayscale" : ""}`}>
                                    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${order.isRefunded ? "bg-green-500 text-white shadow-green-100" : "bg-gray-100 text-gray-400"}`}>
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="pt-1 flex-1">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Hoàn tiền thành công</p>
                                        {order.isRefunded ? (
                                            <div className="mt-3 p-4 bg-green-50 rounded-2xl border border-green-100 space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-green-700 uppercase">Mã đối soát SePay</span>
                                                    <span className="font-black text-gray-900">{order.refundReference || "REF-AUTO-9921"}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-green-700 uppercase">Thời gian</span>
                                                    <span className="font-black text-gray-900">{order.refundAt ? formatDate(order.refundAt) : "Đang cập nhật"}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm font-medium mt-1 italic">Dự kiến hoàn thành trong 5-10 phút.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Info */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#2E9147]" />
                                Thông tin sản phẩm
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                    <img 
                                        src={order.thumbnailUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e"} 
                                        alt={order.postingTitle}
                                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                                        {order.postingTitle}
                                    </h3>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Store className="w-4 h-4 mr-2" />
                                            <span>Người bán: <span className="font-semibold text-gray-900">{order.sellerName || "N/A"}</span></span>
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Ngày đặt hàng: <span className="font-semibold text-gray-900">{formatDate(order.createdAt)}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#2E9147]" />
                                Địa chỉ nhận hàng
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-900 font-semibold mb-1">{finalName}</p>
                            <p className="text-gray-600 leading-relaxed">
                                {finalAddress}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Price Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#2E9147]" />
                                Thanh toán
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-gray-500">
                                <span>Giá sản phẩm</span>
                                <span className="font-medium text-gray-900">{order.totalAmount?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500">
                                <span>Phí vận chuyển</span>
                                <span className="font-medium text-gray-900">Miễn phí</span>
                            </div>
                            {order.depositAmount > 0 && (
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Đã đặt cọc</span>
                                    <span className="font-medium text-blue-600">-{order.depositAmount?.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-gray-900 font-bold">Tổng cộng</span>
                                <span className="text-xl font-black text-[#2E9147]">
                                    {(order.totalAmount - (order.depositAmount || 0))?.toLocaleString('vi-VN')} ₫
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseCancel}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900">Hủy đơn hàng</h3>
                            <button
                                onClick={handleCloseCancel}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6 space-y-1">
                                <p className="text-sm text-gray-600">Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
                                <p className="text-sm font-bold text-gray-900">Mã ĐH: {order.id}</p>
                            </div>
                            <div className="flex items-center gap-4 p-4 mb-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 p-1 shrink-0">
                                    <img
                                        src={order.thumbnailUrl || ""}
                                        alt={order.postingTitle}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{order.postingTitle}</h4>
                                    <p className="text-xs font-medium text-gray-400 mt-1">Người bán: {order.sellerName}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-gray-900 mb-2">Vui lòng chọn lý do hủy:</p>
                                {cancelReasonsList.map((reason) => (
                                    <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                                            <input
                                                type="radio"
                                                name="cancelReason"
                                                value={reason}
                                                checked={cancelReason === reason}
                                                onChange={() => setCancelReason(reason)}
                                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-red-500 transition-colors"
                                            />
                                            <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                                        </div>
                                        <span className={`text-sm ${cancelReason === reason ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}>
                                            {reason}
                                        </span>
                                    </label>
                                ))}
                                {cancelReason === "Khác" && (
                                    <textarea
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                        placeholder="Vui lòng cho chúng tôi biết lý do cụ thể..."
                                        className="w-full h-24 mt-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none placeholder:text-gray-400"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={handleCloseCancel}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Không, quay lại
                            </button>
                            <button
                                onClick={handleSubmitCancel}
                                disabled={cancelReason === "Khác" && !otherReason.trim()}
                                className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all
                                    ${cancelReason === "Khác" && !otherReason.trim()
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-red-500 hover:bg-red-600 hover:shadow-md active:scale-95"
                                    }
                                `}
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
