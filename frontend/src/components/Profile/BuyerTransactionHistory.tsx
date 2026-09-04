import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, Inbox, Star, X, Loader2, Flag, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { SubmittedReview } from "../../types/review";
import { fetchBE, orderApi } from "../../lib/api";
import { formatDate } from "../../lib/utils";

const statusFilters: { label: string, value: string }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đã lấy hàng", value: "PICKUP" },
    { label: "Đang giao", value: "IN_TRANSIT" },
    { label: "Đã giao", value: "DELIVERED" },
    { label: "Đã hủy", value: "CANCELLED" },
];

const getStatusConfig = (status: string, isReported?: boolean) => {
    const s = status?.toUpperCase();
    switch (s) {
        case "CREATED":
        case "PAID":
        case "DEPOSITED":
        case "AWAITING_SELLER_CONFIRMATION":
            return {
                label: "Chờ duyệt",
                color: "bg-amber-100 text-amber-700 border-amber-200",
                icon: <Clock className="w-4 h-4 mr-1" />
            };
        case "PENDING_FULFILLMENT":
        case "PICKUP_SCHEDULED":
            return {
                label: "Đang chờ hàng",
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: <Package className="w-4 h-4 mr-1" />
            };
        case "IN_TRANSIT":
            return {
                label: "Đang vận chuyển",
                color: "bg-purple-100 text-purple-700 border-purple-200",
                icon: <Truck className="w-4 h-4 mr-1" />
            };
        case "DELIVERED":
            return {
                label: "Đã giao hàng",
                color: "bg-green-100 text-green-700 border-green-200",
                icon: <CheckCircle2 className="w-4 h-4 mr-1" />
            };
        case "COMPLETED":
            return {
                label: "Tất toán",
                color: "bg-green-150 text-green-700 border-green-200",
                icon: <CheckCircle2 className="w-4 h-4 mr-1" />
            };
        case "CANCELLED":
            return {
                label: "Đã hủy",
                color: "bg-red-100 text-red-700 border-red-200",
                icon: <XCircle className="w-4 h-4 mr-1" />
            };
        default:
            return {
                label: status,
                color: "bg-gray-100 text-gray-700 border-gray-200",
                icon: <Clock className="w-4 h-4 mr-1" />
            };
    }
};

interface BuyerTransactionHistoryProps {
    submittedReviews?: SubmittedReview[];
    onReviewSubmit?: (review: SubmittedReview) => void;
}

export function BuyerTransactionHistory({ submittedReviews = [], onReviewSubmit }: BuyerTransactionHistoryProps) {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Review logic
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<any | null>(null);
    const [cancelReason, setCancelReason] = useState("Thay đổi ý định");
    const [otherReason, setOtherReason] = useState("");

    // Tracking logic
    const [expandedTrackingId, setExpandedTrackingId] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState<Record<string, { data?: any, loading: boolean, error?: string }>>({});

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await orderApi.getMyPurchases();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error("Không thể tải lịch sử đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleOpenReport = (order: any) => {
        navigate(`/account/buyer/report/${order.id}`);
    };

    const handleToggleTracking = async (orderId: string) => {
        if (expandedTrackingId === orderId) {
            setExpandedTrackingId(null);
            return;
        }

        setExpandedTrackingId(orderId);
        if (!trackingData[orderId]) {
            setTrackingData(prev => ({ ...prev, [orderId]: { loading: true } }));
            try {
                const response = await orderApi.getOrderTracking(orderId);
                setTrackingData(prev => ({
                    ...prev,
                    [orderId]: { data: response.data, loading: false }
                }));
            } catch (error) {
                setTrackingData(prev => ({
                    ...prev,
                    [orderId]: { loading: false, error: "Không thể tải thông tin vận chuyển" }
                }));
            }
        }
    };

    const cancelReasonsList = [
        "Thay đổi ý định",
        "Tìm thấy giá rẻ hơn ở nơi khác",
        "Thời gian giao hàng quá lâu",
        "Thay đổi địa chỉ giao hàng",
        "Khác"
    ];

    const handleOpenCancel = (order: any) => {
        setSelectedOrderForCancel(order);
        setCancelReason("Thay đổi ý định");
        setOtherReason("");
        setCancelModalOpen(true);
    };

    const handleCloseCancel = () => {
        setCancelModalOpen(false);
        setTimeout(() => setSelectedOrderForCancel(null), 200);
    };

    const handleSubmitCancel = async () => {
        const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
        if (!selectedOrderForCancel) return;

        try {
            await fetchBE(`/buyer/orders/${selectedOrderForCancel.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: finalReason })
            });
            toast.success("Đã hủy đơn hàng thành công");
            fetchOrders();
        } catch (error) {
            console.error("Failed to cancel order", error);
            toast.error("Không thể hủy đơn hàng");
        }
        handleCloseCancel();
    };

    const handleOpenReview = (order: any) => {
        setSelectedOrderForReview(order);
        setRating(0);
        setHoveredRating(0);
        setComment("");
        setReviewModalOpen(true);
    };

    const handleCloseReview = () => {
        setReviewModalOpen(false);
        setTimeout(() => setSelectedOrderForReview(null), 200);
    };

    const handleSubmitReview = async () => {
        if (!selectedOrderForReview) return;
        setIsSubmittingReview(true);
        try {
            await orderApi.submitReview(selectedOrderForReview.id, { rating, comment });

            onReviewSubmit?.({
                orderId: selectedOrderForReview.id,
                bikeName: selectedOrderForReview.bike?.name || selectedOrderForReview.postingTitle,
                image: selectedOrderForReview.bike?.image || "",
                shopName: selectedOrderForReview.shopName,
                rating,
                comment,
                date: new Date().toLocaleDateString('vi-VN'),
            });

            setReviewedOrderIds(prev => {
                const newSet = new Set(prev);
                newSet.add(selectedOrderForReview.id);
                return newSet;
            });
            handleCloseReview();
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const filteredOrders = activeFilter === "all"
        ? orders
        : orders.filter(order => {
            const s = order.status?.toUpperCase();
            switch (activeFilter) {
                case "PENDING":
                    return ["CREATED", "PAID", "DEPOSITED", "AWAITING_SELLER_CONFIRMATION"].includes(s);
                case "PICKUP":
                    return ["SELLER_CONFIRMED", "PENDING_FULFILLMENT"].includes(s);
                case "IN_TRANSIT":
                    return ["PICKUP_SCHEDULED", "IN_TRANSIT"].includes(s);
                case "DELIVERED":
                    return ["DELIVERED", "COMPLETED"].includes(s) || order.isSettled;
                default:
                    return s === activeFilter;
            }
        });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2E9147]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-gray-900">Lịch sử đơn hàng</h2>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi các đơn hàng bạn đã mua trên ChoXeDap</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1 flex overflow-x-auto scrollbar-hide gap-1">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`
                            px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex-1
                            ${activeFilter === filter.value
                                ? "bg-[#2E9147] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }
                        `}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status, order.isReported);
                        
                        // Filter out suspicious names like "77"
                        const isSuspicious = (name: string) => {
                            const lower = (name || "").toLowerCase();
                            return lower.includes("77") || lower.includes("quản trị viên") || lower.includes("admin");
                        };
                        const displaySellerName = isSuspicious(order.sellerName) ? "Người bán" : (order.sellerName || "N/A");

                        const isPending = ["CREATED", "PAID", "DEPOSITED", "AWAITING_SELLER_CONFIRMATION"].includes(order.status?.toUpperCase());

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-4 p-4 lg:px-6 bg-gray-50/50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{displaySellerName}</span>
                                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                        <span className="text-sm text-gray-500">{formatDate(order.date || order.createdAt)}</span>
                                        <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></div>
                                        <span className="text-sm font-medium text-gray-700 hidden sm:block">Mã ĐH: {order.id}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </span>
                                        {order.isReported && order.status?.toUpperCase() !== "CANCELLED" && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                                                <Flag className="w-3 h-3 mr-1" />
                                                Đang khiếu nại
                                            </span>
                                        )}
                                        {order.isRefunded && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Đã hoàn tiền
                                            </span>
                                        )}
                                        {order.isSettled && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Đã quyết toán
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-4 lg:p-6 flex flex-col md:flex-row gap-6">
                                    {/* Product Info */}
                                    <div 
                                        className="flex gap-4 flex-1 cursor-pointer group/item"
                                        onClick={() => navigate(`/account/buyer/order/${order.id}`)}
                                    >
                                        <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 transition-transform group-hover/item:scale-105">
                                            <img
                                                src={order.bike?.image || "https://images.unsplash.com/photo-1485965120184-e220f721d03e"}
                                                alt={order.postingTitle}
                                                className="w-full h-full object-contain p-2 mix-blend-multiply"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 text-base lg:text-lg group-hover/item:text-[#2E9147] transition-colors">
                                                {order.postingTitle}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">{order.bike?.variant || "Tiêu chuẩn"}</p>
                                            <div className="mt-auto hidden md:block">
                                                <span className="text-sm font-medium text-gray-400">1 sản phẩm</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing & Actions */}
                                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 md:pl-6 md:border-l shrink-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                                            <p className="text-lg lg:text-xl font-bold text-[#2E9147]">{order.totalAmount?.toLocaleString('vi-VN')} ₫</p>
                                        </div>

                                        <div className="flex gap-2 mt-0 md:mt-4">
                                            {(order.status === "COMPLETED" || order.status === "DELIVERED" || order.status === "SETTLED") && (
                                                <button
                                                    onClick={() => handleOpenReport(order)}
                                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1"
                                                >
                                                    <Flag className="w-3.5 h-3.5" />
                                                    Khiếu nại
                                                </button>
                                            )}
                                            {(order.status === "COMPLETED" || order.status === "DELIVERED" || order.status === "SETTLED") && !order.rating && !reviewedOrderIds.has(order.id) ? (
                                                <button
                                                    onClick={() => handleOpenReview(order)}
                                                    className="px-4 py-2 bg-white border border-[#2E9147] text-[#2E9147] text-sm font-bold rounded-xl hover:bg-[#F0FDF4] transition-colors"
                                                >
                                                    Đánh giá
                                                </button>
                                            ) : (order.rating || reviewedOrderIds.has(order.id)) && (
                                                <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-bold text-gray-700">{order.rating || "Đã đánh giá"}</span>
                                                </div>
                                            )}
                                            {isPending && (
                                                <button
                                                    onClick={() => handleOpenCancel(order)}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:text-red-500 transition-colors"
                                                >
                                                    Hủy đơn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Footer - Tracking info for active orders */}
                                {(order.status === "InTransit" || order.status === "PickupScheduled" || order.status === "PendingFulfillment") && (
                                    <>
                                        <div
                                            onClick={() => handleToggleTracking(order.id)}
                                            className="bg-[#F0FDF4] px-4 lg:px-6 py-3 border-t border-green-100 flex items-center justify-between cursor-pointer hover:bg-green-50/80 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                    <Truck className="w-3.5 h-3.5 text-[#2E9147]" />
                                                </div>
                                                <span className="text-sm font-medium text-green-800">
                                                    Thông tin vận chuyển
                                                </span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-green-600 transition-transform ${expandedTrackingId === order.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                                        </div>
                                        {expandedTrackingId === order.id && (
                                            <div className="bg-white border-t border-gray-100 p-4 lg:px-6">
                                                {trackingData[order.id]?.loading ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="w-5 h-5 animate-spin text-[#2E9147]" />
                                                    </div>
                                                ) : trackingData[order.id]?.error || !trackingData[order.id]?.data ? (
                                                    <div className="py-4 text-center">
                                                        <p className="text-sm text-gray-500">Chờ người bán xác nhận.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex gap-3">
                                                            <div className="flex flex-col items-center mt-1">
                                                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                                <div className="w-0.5 h-8 bg-gray-200 my-1" />
                                                                <div className="w-3 h-3 rounded-full bg-[#2E9147]" />
                                                            </div>
                                                            <div className="flex flex-col space-y-4 flex-1">
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-400 uppercase">Điểm lấy hàng</p>
                                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{trackingData[order.id].data.pickupAddress || 'Đang cập nhật'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-400 uppercase">Điểm giao hàng</p>
                                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{trackingData[order.id].data.deliveryAddress || 'Đang cập nhật'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center text-sm">
                                                            <span className="text-gray-500 font-medium">Trạng thái:</span>
                                                            <span className="font-bold text-[#2E9147]">{trackingData[order.id].data.status}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Không có đơn hàng nào</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                            Hiện không có đơn hàng nào trong trạng thái này. Thử chọn trạng thái khác nhé!
                        </p>
                        <button
                            onClick={() => setActiveFilter("all")}
                            className="mt-6 text-[#2E9147] font-bold text-sm hover:underline"
                        >
                            Xem tất cả đơn hàng
                        </button>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModalOpen && selectedOrderForReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseReview}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900">Đánh giá sản phẩm</h3>
                            <button
                                onClick={handleCloseReview}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex items-center gap-4 p-4 mb-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 p-1 shrink-0">
                                    <img
                                        src={selectedOrderForReview.bike?.image || ""}
                                        alt={selectedOrderForReview.bike?.name || selectedOrderForReview.postingTitle}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{selectedOrderForReview.bike?.name || selectedOrderForReview.postingTitle}</h4>
                                    <p className="text-sm text-gray-500 truncate">{selectedOrderForReview.bike?.variant}</p>
                                    <p className="text-xs font-medium text-gray-400 mt-1">Cửa hàng: {selectedOrderForReview.shopName}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center mb-8">
                                <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Chất lượng sản phẩm</p>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="p-1 transition-transform hover:scale-110 active:scale-95 text-yellow-400"
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_2px_4px_rgba(250,204,21,0.3)]"
                                                    : "fill-gray-100 text-gray-200"
                                                    } transition-all duration-200`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[#2E9147] font-semibold text-sm h-5 mt-2 transition-opacity">
                                    {rating === 1 && "Tệ"}
                                    {rating === 2 && "Không hài lòng"}
                                    {rating === 3 && "Bình thường"}
                                    {rating === 4 && "Hài lòng"}
                                    {rating === 5 && "Tuyệt vời"}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 px-1">Chia sẻ trải nghiệm của bạn (Tùy chọn)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Hoàn thiện đánh giá để giúp những người mua khác hiểu rõ hơn về chiếc xe này..."
                                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#2E9147]/20 focus:border-[#2E9147] transition-all resize-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={handleCloseReview}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || isSubmittingReview}
                                className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all flex items-center
                                    ${rating === 0 || isSubmittingReview
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-[#2E9147] hover:bg-[#257a3b] hover:shadow-md active:scale-95"
                                    }
                                `}
                            >
                                {isSubmittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Gửi đánh giá
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {cancelModalOpen && selectedOrderForCancel && (
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
                                <p className="text-sm font-bold text-gray-900">Mã ĐH: {selectedOrderForCancel.id}</p>
                            </div>
                            <div className="flex items-center gap-4 p-4 mb-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 p-1 shrink-0">
                                    <img
                                        src={selectedOrderForCancel.bike?.image || ""}
                                        alt={selectedOrderForCancel.bike?.name || selectedOrderForCancel.postingTitle}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{selectedOrderForCancel.bike?.name || selectedOrderForCancel.postingTitle}</h4>
                                    <p className="text-xs font-medium text-gray-400 mt-1">Cửa hàng: {selectedOrderForCancel.shopName}</p>
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
