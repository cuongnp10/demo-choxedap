import { useEffect, useState } from "react";
import { 
    ShoppingBag, 
    Search, 
    Loader2, 
    CheckCircle2, 
    Clock, 
    Truck, 
    XCircle, 
    ChevronRight,
    MapPin,
    Calendar as CalendarIcon,
    CreditCard,
    ClipboardList,
    AlertCircle,
    MessageCircle,
    Info,
    RefreshCw,
    Flag
} from "lucide-react";
import { Badge } from "../ui/badge";
import { fetchBE } from "../../lib/api";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type OrderTab = "all" | "paid" | "shipping" | "completed" | "cancelled";

export function SellerOrderManagement() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<OrderTab>("all");
    const [searchTerm, setSearchTerm] = useState("");

    // State cho Modal xác nhận
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    
    // Form state
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("09:00");
    const [pickupAddress, setPickupAddress] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await fetchBE('/seller/orders');
            // Filter out settled orders as they go to Transactions
            const rawOrders = response?.data || response || [];
            setOrders(rawOrders.filter((o: any) => !o.isSettled));
        } catch (error) {
            console.error("Failed to fetch seller orders", error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusInfo = (status: string, isReported?: boolean) => {
        const s = status?.toUpperCase();

        switch (s) {
            case "PAID":
            case "DEPOSITED": 
            case "AWAITINGSELLERCONFIRMATION":
            case "AWAITING_SELLER_CONFIRMATION":
                return { 
                    label: (s === "AWAITINGSELLERCONFIRMATION" || s === "AWAITING_SELLER_CONFIRMATION") ? "Chờ xác nhận" : "Chờ lấy hàng", 
                    color: "bg-blue-100 text-blue-700", 
                    category: "paid",
                    icon: <CreditCard className="w-3 h-3" />
                };
            case "PICKUPSCHEDULED":
            case "PICKUP_SCHEDULED":
            case "INTRANSIT":
            case "IN_TRANSIT":
            case "PENDINGFULFILLMENT":
            case "PENDING_FULFILLMENT":
                return { 
                    label: "Đang vận chuyển", 
                    color: "bg-orange-100 text-orange-700", 
                    category: "shipping",
                    icon: <Truck className="w-3 h-3" />
                };
            case "DELIVERED":
                return { 
                    label: "Giao thành công", 
                    color: "bg-green-100 text-green-700", 
                    category: "delivered",
                    icon: <CheckCircle2 className="w-3 h-3" />
                };
            case "COMPLETED":
                return { 
                    label: "Tất toán", 
                    color: "bg-green-150 text-green-700", 
                    category: "delivered",
                    icon: <CheckCircle2 className="w-3 h-3" />
                };
            case "CANCELLED":
                return { 
                    label: "Đã hủy", 
                    color: "bg-red-100 text-red-700", 
                    category: "cancelled",
                    icon: <XCircle className="w-3 h-3" />
                };
            default:
                return { 
                    label: status, 
                    color: "bg-gray-100 text-gray-700", 
                    category: "other",
                    icon: <Clock className="w-3 h-3" />
                };
        }
    };

    const handleOpenConfirmModal = (order: any) => {
        setSelectedOrder(order);
        setPickupAddress(order.pickupAddress || "");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setPickupDate(tomorrow.toISOString().split('T')[0]);
        setIsConfirmModalOpen(true);
    };

    const handleOpenRejectModal = (order: any) => {
        setSelectedOrder(order);
        setRejectReason("");
        setIsRejectModalOpen(true);
    };

    const handleConfirmOrder = async () => {
        if (!selectedOrder || !pickupDate || !pickupTime || !pickupAddress) {
            toast.error("Vui lòng điền đầy đủ thông tin lấy hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            const scheduledTime = new Date(pickupDate);
            const [hours, minutes] = pickupTime.split(':').map(Number);
            scheduledTime.setHours(hours, minutes, 0, 0);

            await fetchBE(`/seller/orders/${selectedOrder.id}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scheduledPickupTime: scheduledTime.toISOString(),
                    pickupAddress: pickupAddress
                })
            });

            toast.success("Đã xác nhận đơn hàng! Shipper sẽ sớm liên hệ.");
            setIsConfirmModalOpen(false);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || "Xác nhận đơn hàng thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectOrder = async () => {
        if (!selectedOrder || !rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        setIsSubmitting(true);
        try {
            await fetchBE(`/seller/orders/${selectedOrder.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });

            toast.success("Đã từ chối đơn hàng");
            setIsRejectModalOpen(false);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || "Từ chối đơn hàng thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const statusInfo = getStatusInfo(order.status, order.isReported);
        const matchesTab = activeTab === "all" || statusInfo.category === activeTab;
        const matchesSearch = (order.id?.toString() || "").includes(searchTerm) || 
                             (order.postingTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { id: "all", label: "Tất cả", icon: <ClipboardList className="w-4 h-4" /> },
        { id: "paid", label: "Chờ xác nhận", icon: <CreditCard className="w-4 h-4" /> },
        { id: "shipping", label: "Đang vận chuyển", icon: <Truck className="w-4 h-4" /> },
        { id: "delivered", label: "Đã giao", icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: "cancelled", label: "Đã hủy", icon: <XCircle className="w-4 h-4" /> },
    ];

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
                <p className="text-gray-500 font-medium">Đang tải đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Tabs Bar */}
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as OrderTab)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2",
                            activeTab === tab.id
                                ? "bg-[#2E9147] text-white shadow-lg shadow-[#2E9147]/20"
                                : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}

                <div className="flex-1 min-w-[200px] relative ml-auto px-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Mã đơn, tên xe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2E9147]/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-[32px] border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không có đơn hàng nào</h3>
                        <p className="text-gray-500 max-w-xs">Các đơn hàng thuộc trạng thái này sẽ hiển thị tại đây.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const status = getStatusInfo(order.status, order.isReported);
                        const isAwaiting = order.status?.toUpperCase().includes("AWAITING");
                        const fee = order.serviceFee || 0;
                        const netAmount = (order.totalAmount || 0) - fee;

                        return (
                            <div key={order.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-5">
                                        <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden shrink-0">
                                            <img 
                                                src={order.thumbnailUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e"} 
                                                alt={order.postingTitle} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Đơn hàng #{order.id}</span>
                                                <span className={cn("px-2 py-1 text-[10px] flex items-center gap-1 font-bold shadow-none border-0 rounded-full", status.color)}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                                {order.isReported && order.status?.toUpperCase() !== "CANCELLED" && (
                                                    <span className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 shadow-none rounded-full uppercase">
                                                        <Flag className="w-3 h-3" />
                                                        Đang khiếu nại
                                                    </span>
                                                )}
                                                {order.isRefunded && (
                                                    <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1 shadow-none rounded-full uppercase">
                                                        <RefreshCw className="w-3 h-3" />
                                                        Đã hoàn tiền
                                                    </span>
                                                )}
                                                {order.isSettled && (
                                                    <span className="px-2 py-1 text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 flex items-center gap-1 shadow-none rounded-full uppercase">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Đã quyết toán
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#2E9147] transition-colors">{order.postingTitle}</h4>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {order.pickupAddress || "Chưa có địa chỉ"}</span>
                                            </div>
                                            <div className="pt-1 text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Cập nhật lần cuối: {new Date(order.updatedAt || order.createdAt).toLocaleString('vi-VN')}
                                            </div>

                                            {/* Action Buttons for AwaitingSellerConfirmation */}
                                            {isAwaiting && (
                                                <div className="pt-4 flex items-center gap-3">
                                                    <Button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenConfirmModal(order);
                                                        }}
                                                        className="h-10 px-6 rounded-xl bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold shadow-lg shadow-green-100 flex items-center gap-2 relative z-10"
                                                    >
                                                        <CheckCircle2 size={16} /> Đồng ý bán
                                                    </Button>
                                                    <Button 
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenRejectModal(order);
                                                        }}
                                                        className="h-10 px-6 rounded-xl border-red-100 text-red-600 hover:bg-red-50 font-bold relative z-10"
                                                    >
                                                        <XCircle size={16} /> Từ chối
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end text-right">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thực nhận (sau phí)</p>
                                            <p className="text-2xl font-black text-[#2E9147]">{netAmount.toLocaleString('vi-VN')}đ</p>
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 font-medium">
                                                <Info size={10} /> Đã trừ {fee.toLocaleString('vi-VN')}đ phí sàn
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-[#2E9147] font-bold hover:bg-green-50 rounded-xl group/btn" onClick={() => toast.info("Tính năng xem chi tiết đơn hàng đang phát triển")}>
                                            Chi tiết <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal Xác nhận đơn hàng */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900">Xác nhận đơn hàng</DialogTitle>
                        <DialogDescription className="font-medium">Vui lòng cung cấp thông tin để Shipper đến lấy xe.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-6">
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                            <AlertCircle className="text-amber-600 shrink-0" size={20} />
                            <p className="text-sm text-amber-900 leading-relaxed">
                                Đơn hàng sẽ được chuyển cho đơn vị vận chuyển sau khi bạn xác nhận. Hãy chuẩn bị xe sạch sẽ và sẵn sàng.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="address" className="font-bold text-gray-700">Địa chỉ lấy hàng</Label>
                                <Input 
                                    id="address"
                                    value={pickupAddress}
                                    onChange={(e) => setPickupAddress(e.target.value)}
                                    placeholder="Số nhà, tên đường, phường/xã..."
                                    className="h-12 rounded-xl border-gray-100 focus:border-[#2E9147]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date" className="font-bold text-gray-700">Ngày lấy hàng</Label>
                                    <Input 
                                        id="date"
                                        type="date"
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                        className="h-12 rounded-xl border-gray-100 focus:border-[#2E9147]"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time" className="font-bold text-gray-700">Giờ dự kiến</Label>
                                    <Input 
                                        id="time"
                                        type="time"
                                        value={pickupTime}
                                        onChange={(e) => setPickupTime(e.target.value)}
                                        className="h-12 rounded-xl border-gray-100 focus:border-[#2E9147]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="h-12 rounded-xl border-gray-100 font-bold"
                        >
                            Quay lại
                        </Button>
                        <Button 
                            onClick={handleConfirmOrder}
                            disabled={isSubmitting}
                            className="h-12 rounded-xl bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold px-8 shadow-lg shadow-green-100"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 size={18} className="mr-2" />}
                            Xác nhận & Hẹn lấy hàng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Từ chối đơn hàng */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-red-600">Từ chối bán</DialogTitle>
                        <DialogDescription className="font-medium">Chúng tôi sẽ thông báo tới người mua và hoàn tiền cho họ.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-gray-700 flex items-center gap-2">
                                <MessageCircle size={16} /> Lý do từ chối
                            </Label>
                            <Textarea 
                                placeholder="Ví dụ: Xe đã bán qua kênh khác, Tôi có việc bận không thể giao hàng..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="rounded-2xl border-gray-100 bg-gray-50 focus:ring-red-100 min-h-[120px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsRejectModalOpen(false)}
                            className="h-12 rounded-xl border-gray-100 font-bold"
                        >
                            Hủy
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleRejectOrder}
                            disabled={isSubmitting}
                            className="h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold px-8"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle size={18} className="mr-2" />}
                            Xác nhận từ chối
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
