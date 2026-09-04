import { useEffect, useState } from "react";
import { 
    Eye, 
    EyeOff,
    MessageCircle, 
    Edit3, 
    Trash2, 
    ExternalLink, 
    Search, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Clock,
    ShoppingBag,
    CheckSquare,
    Video,
    RefreshCw,
    Lock,
    Zap,
    BadgeCheck
} from "lucide-react";
import { Badge } from "../ui/badge";
import { postingApi, mapVipTier } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { BikeDetail, PostingStatus } from "../../types/bike";

export function SellerMyAds() {
    const navigate = useNavigate();
    const [ads, setAds] = useState<BikeDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [inspectionFilter, setInspectionFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);

    // Selected Target Data
    const [selectedAd, setSelectedAd] = useState<BikeDetail | null>(null);

    const fetchAds = async () => {
        setIsLoading(true);
        try {
            const data = await postingApi.getMyPostings();
            console.log("Fetched ads data:", data); // For debugging countdown issues
            
            // Map to a structure that resembles BikeDetail for clearer property access
            const mappedAds: BikeDetail[] = data.map((item: any) => ({
                id: item.id.toString(),
                name: item.title,
                price: item.price.toLocaleString('vi-VN') + ' ₫',
                location: item.location || 'N/A',
                postedDate: new Date(item.createdAt).toLocaleDateString('vi-VN'),
                description: [],
                specs: [],
                seller: { userId: '', name: '', rating: 0, reviews: 0 },
                images: [item.thumbnailUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e'],
                videos: [],
                videoUrl: item.videoUrl,
                videoStatus: item.videoStatus,
                bicycle: { 
                    id: '', 
                    categoryId: 0, 
                    model: '', 
                    frameSize: '', 
                    condition: '', 
                    year: 0 
                },
                posting: { 
                    id: item.id.toString(), 
                    accountId: '', 
                    bicycleId: '', 
                    title: item.title, 
                    price: item.price, 
                    description: '', 
                    status: item.status as PostingStatus,
                    isInspected: item.isInspected || false,
                    isCertified: item.isCertified || false,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt || item.createdAt,
                    inspectionStatus: item.inspectionStatus,
                    inspectionResult: item.inspectionResult,
                    adsEndDate: item.adsEndDate || item.AdsEndDate, // Try both cases
                    viewCount: item.viewCount ?? item.ViewCount ?? 0,
                    isVisible: item.isVisible !== undefined ? item.isVisible : (item.IsVisible !== undefined ? item.IsVisible : true)
                },
                isCertified: item.isCertified || false,
                vipTier: mapVipTier(item.vipTier) || "THUONG",
                adminNote: item.adminNote
            }));
            setAds(mappedAds);
        } catch (error) {
            console.error("Failed to fetch seller ads", error);
            toast.error("Không thể tải danh sách tin đăng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    // --- Action Handlers --- 

    const openDeleteModal = (ad: BikeDetail) => {
        setSelectedAd(ad);
        setDeleteModalOpen(true);
    };

    const toggleVisibility = async (ad: BikeDetail) => {
        const newVisibility = !ad.posting.isVisible;
        try {
            await postingApi.updatePosting(parseInt(ad.id), { isVisible: newVisibility });
            setAds(prev => prev.map(a => a.id === ad.id ? { 
                ...a, 
                posting: { ...a.posting, isVisible: newVisibility } 
            } : a));
            toast.success(newVisibility ? "Đã hiện bài đăng" : "Đã ẩn bài đăng");
        } catch (error) {
            console.error("Failed to toggle visibility", error);
            toast.error("Không thể thay đổi trạng thái hiển thị");
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedAd) return;
        try {
            await postingApi.deletePosting(parseInt(selectedAd.id));
            setAds(prev => prev.filter(a => a.id !== selectedAd.id));
            toast.success("Đã xóa tin đăng!");
        } catch (error) {
            console.error("Failed to delete posting", error);
            toast.error("Không thể xóa tin đăng");
        }
        setDeleteModalOpen(false);
    };

    const showAdminNote = (ad: BikeDetail) => {
        setSelectedAd(ad);
        setNoteModalOpen(true);
    };

    // Helper to check if a listing is verified/inspected
    const isVerifiedListing = (ad: BikeDetail) => {
        // Use the same logic that determines the "Verified" category
        return ad.isCertified === true || ad.posting.isCertified === true || ad.posting.isInspected === true;
    };

    // Filter Logic
    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.name.toLowerCase().includes(searchTerm.toLowerCase());
        const status = ad.posting.status;
        const isVisible = ad.posting.isVisible;
        
        const matchesStatus = statusFilter === "all" || 
            (statusFilter === "active" && (status === "APPROVED" || status === "ACTIVE") && isVisible) ||
            (statusFilter === "hidden" && !isVisible) ||
            (statusFilter === "rejected" && status === "REJECTED") ||
            (statusFilter === "pending" && (status === "PENDING" || status === "WAITING" as any)) ||
            (statusFilter === "draft" && status === "DRAFT");

        const inspStatus = ad.posting.inspectionStatus;
        const inspResult = ad.posting.inspectionResult;

        const matchesInspection = inspectionFilter === "all" ||
            (inspectionFilter === "none" && !inspStatus) ||
            (inspectionFilter === "pending" && inspStatus === "PENDING") ||
            (inspectionFilter === "inspecting" && inspStatus === "ACCEPTED") ||
            (inspectionFilter === "passed" && inspStatus === "COMPLETED" && inspResult === "PASSED") ||
            (inspectionFilter === "failed" && inspStatus === "COMPLETED" && inspResult === "FAILED");
        
        const matchesPackage = packageFilter === "all" || ad.vipTier === packageFilter;
        const isSoldOrReserved = status === "SOLD" || status === "RESERVED_FOR_ORDER" as any || status === "DELETED" as any;

        return matchesSearch && matchesStatus && matchesInspection && matchesPackage && !isSoldOrReserved;
    });

    const getStatusTag = (status: string) => {
        const base = "font-bold flex items-center gap-1 text-[10px] px-2 py-1 h-6 shrink-0 rounded-md border transition-colors";
        switch (status) {
            case "APPROVED":
            case "ACTIVE":
                return <Badge className={cn(base, "bg-green-50/30 border-[#2E9147] text-[#2E9147]")}>Đã duyệt</Badge>;
            case "PENDING":
                return <Badge className={cn(base, "bg-amber-50/30 border-amber-500 text-amber-600")}>Chờ duyệt</Badge>;
            case "REJECTED":
                return <Badge className={cn(base, "bg-red-50/30 border-red-500 text-red-600")}>Bị từ chối</Badge>;
            case "DRAFT":
                return <Badge className={cn(base, "bg-gray-50/30 border-gray-400 text-gray-500")}>Bản nháp</Badge>;
            case "EXPIRED":
                return <Badge className={cn(base, "bg-orange-50/30 border-orange-500 text-orange-600")}>Hết hạn</Badge>;
            case "SOLD":
                return <Badge className={cn(base, "bg-blue-50/30 border-blue-500 text-blue-600")}>Đã bán</Badge>;
            case "HIDDEN_BY_REPORT":
                return <Badge className={cn(base, "bg-red-50/30 border-red-600 text-red-700")}>Vi phạm (Ẩn)</Badge>;
            case "LOCKED_BY_ADMIN":
                return <Badge className={cn(base, "bg-red-100 border-red-700 text-red-800")}>Khóa bởi Admin</Badge>;
            case "RESERVED_FOR_ORDER":
                return <Badge className={cn(base, "bg-amber-50/30 border-amber-600 text-amber-700")}>Đang đặt hàng</Badge>;
            case "REQUESTED_INFO":
                return <Badge className={cn(base, "bg-blue-50/30 border-blue-400 text-blue-500")}>Cần bổ sung TT</Badge>;
            default:
                return <Badge className={cn(base, "bg-gray-50/30 border-gray-400 text-gray-500")}>{status}</Badge>;
        }
    };

    const getInspectionTag = (ad: BikeDetail) => {
        const base = "font-bold flex items-center gap-1 text-[10px] px-2 py-1 h-6 shrink-0 rounded-md border transition-colors";
        const status = ad.posting.inspectionStatus;
        const result = ad.posting.inspectionResult;

        if (!status) {
            return <Badge className={cn(base, "bg-gray-50/30 border-gray-200 text-gray-400")}>Không kiểm định</Badge>;
        }

        switch (status) {
            case "PENDING":
                return <Badge className={cn(base, "bg-yellow-50/30 border-yellow-500 text-yellow-600")}>Chờ kiểm định</Badge>;
            case "ACCEPTED":
                return <Badge className={cn(base, "bg-blue-50/30 border-blue-500 text-blue-600")}>Đang kiểm định</Badge>;
            case "COMPLETED":
                if (result === "PASSED") {
                    return <Badge className={cn(base, "bg-green-50/30 border-[#2E9147] text-[#2E9147]")}>Đã kiểm định</Badge>;
                } else {
                    return <Badge className={cn(base, "bg-red-50/30 border-red-500 text-red-600")}>Kiểm định thất bại</Badge>;
                }
            default:
                // Fallback for any other status
                return <Badge className={cn(base, "bg-gray-50/30 border-gray-200 text-gray-400")}>{status}</Badge>;
        }
    };

    const getVipBadge = (tier: string) => {
        const base = "font-bold flex items-center gap-1 text-[10px] px-2 py-1 h-6 shrink-0 rounded-md border transition-colors";
        switch (tier) {
            case "NOI_TROI":
                return <Badge className={cn(base, "bg-purple-50/30 border-purple-600 text-purple-600")}>Gói: Nổi trội</Badge>;
            case "NOI_BAT":
                return <Badge className={cn(base, "bg-orange-50/30 border-orange-500 text-orange-500")}>Gói: Nổi bật</Badge>;
            case "DE_THAY":
                return <Badge className={cn(base, "bg-blue-50/30 border-blue-500 text-blue-500")}>Gói: Dễ thấy</Badge>;
            default:
                return <Badge className={cn(base, "bg-gray-50/30 border-gray-200 text-gray-400")}>Gói: Thường</Badge>;
        }
    };

    const getVideoApprovalTag = (status: string | undefined) => {
        if (status !== "PENDING") return null;
        const base = "font-bold flex items-center gap-1 text-[10px] px-2 py-1 h-6 shrink-0 rounded-md border transition-colors";
        return <Badge className={cn(base, "bg-indigo-50/30 border-indigo-500 text-indigo-600")}>Chờ duyệt video</Badge>;
    };

    const getTimeRemaining = (endDate: string | undefined) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return "Đã hết hạn";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `Còn ${days} ngày ${hours}h`;
        return `Còn ${hours} giờ`;
    };

    const getVideoStatusBadge = (status: string | undefined) => {
        if (!status) return null;
        const baseClass = "flex items-center gap-1 text-[10px] font-bold h-6 shrink-0 whitespace-nowrap";
        switch (status) {
            case "APPROVED":
                return <span className={cn(baseClass, "text-green-600")}><Video className="w-3.5 h-3.5" /> [Video: APPROVED]</span>;
            case "REJECTED":
                return <span className={cn(baseClass, "text-red-600")}><Video className="w-3.5 h-3.5" /> [Video: REJECTED]</span>;
            default:
                return <span className={cn(baseClass, "text-amber-600")}><Video className="w-3.5 h-3.5" /> [Video: PENDING]</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
                <p className="text-gray-500 font-medium animate-pulse">Đang tải tin đăng của bạn...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Bài đăng</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#2E9147]/20 cursor-pointer"
                        >
                            <option value="all">Tất cả bài đăng</option>
                            <option value="draft">Nháp</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="active">Đã duyệt</option>
                            <option value="rejected">Bị từ chối</option>
                            <option value="hidden">Đang ẩn</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Kiểm định</label>
                        <select 
                            value={inspectionFilter}
                            onChange={(e) => setInspectionFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#2E9147]/20 cursor-pointer"
                        >
                            <option value="all">Tất cả kiểm định</option>
                            <option value="none">Không kiểm định</option>
                            <option value="pending">Chờ kiểm định</option>
                            <option value="inspecting">Đang kiểm định</option>
                            <option value="passed">Đã kiểm định</option>
                            <option value="failed">Kiểm định thất bại</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Gói tin đăng</label>
                        <select 
                            value={packageFilter}
                            onChange={(e) => setPackageFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#2E9147]/20 cursor-pointer"
                        >
                            <option value="all">Gói tin đăng (Tất cả)</option>
                            <option value="NOI_TROI">Nổi trội</option>
                            <option value="NOI_BAT">Nổi bật</option>
                            <option value="DE_THAY">Dễ thấy</option>
                            <option value="THUONG">Thường</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tiêu đề..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#2E9147]/20 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {filteredAds.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tin đăng nào</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAds.map((ad) => {
                        const expired = ad.posting.status === "EXPIRED" as any; // Simplified check
                        const isLocked = ad.posting.status === "LOCKED_BY_ADMIN" as any;
                        const isVerified = isVerifiedListing(ad);

                        return (
                            <div key={ad.id} className={cn(
                                "bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 group relative overflow-hidden",
                                isLocked && "opacity-80 bg-gray-50/50"
                            )}>
                                <div className="w-full sm:w-[220px] h-[160px] rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                                    <img src={ad.images[0]} alt={ad.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {getStatusTag(ad.posting.status)}
                                                    {getInspectionTag(ad)}
                                                    {getVideoApprovalTag(ad.videoStatus)}
                                                    {getVipBadge(ad.vipTier || "THUONG")}
                                                    {expired && (
                                                        <Badge variant="destructive" className="font-bold text-[10px] px-2 py-1 h-6 shrink-0 animate-pulse border-none">
                                                            Gói Ads đã hết hạn
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 truncate pr-4 group-hover:text-[#2E9147] transition-colors cursor-pointer" onClick={() => !isLocked && navigate(`/listing/${ad.id}`)}>
                                                    {ad.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!isLocked && (
                                                    <>
                                                        <button
                                                            onClick={() => toggleVisibility(ad)}
                                                            className={cn(
                                                                "p-2 rounded-lg transition-colors",
                                                                ad.posting.isVisible ? "text-gray-400 hover:bg-gray-100 hover:text-[#2E9147]" : "text-amber-500 bg-amber-50 hover:bg-amber-100"
                                                            )}
                                                            title={ad.posting.isVisible ? "Ẩn tin đăng" : "Hiện tin đăng"}
                                                        >
                                                            {ad.posting.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/sell?id=${ad.id}`)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#2E9147]"
                                                            title="Chỉnh sửa tin đăng"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => openDeleteModal(ad)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group/trash text-gray-400"
                                                    title="Xóa tin đăng"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover/trash:text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[#2E9147] font-black text-2xl mb-3">{ad.price}</p>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> Lượt xem: {ad.posting.viewCount}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(ad.posting.createdAt).toLocaleDateString('vi-VN')}</span>
                                            {!ad.posting.isVisible && (
                                                <span className="flex items-center gap-1.5 text-amber-600 font-bold"><EyeOff className="w-4 h-4" /> Đang ẩn với người mua</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {(ad as any).adminNote && (ad.posting.status === "REJECTED" || ad.posting.status === "LOCKED_BY_ADMIN" as any || ad.posting.status === "PENDING" || ad.posting.status === "WAITING" as any) && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="h-9 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold rounded-xl"
                                                    onClick={() => showAdminNote(ad)}
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Phản hồi Admin
                                                </Button>
                                            )}

                                            {expired && !isLocked && (
                                                <Button 
                                                    size="sm" 
                                                    className="h-9 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200"
                                                    onClick={() => navigate(`/sell/pricing?id=${ad.id}`)}
                                                >
                                                    <Zap className="w-3.5 h-3.5 mr-1.5" /> Gia hạn ngay
                                                </Button>
                                            )}

                                            {!expired && !isLocked && (
                                                ad.vipTier === "THUONG" ? (
                                                    <Button 
                                                        size="sm" 
                                                        className="h-9 bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold rounded-xl shadow-lg shadow-[#2E9147]/10"
                                                        onClick={() => navigate(`/sell/pricing?id=${ad.id}`)}
                                                    >
                                                        <Zap className="w-3.5 h-3.5 mr-1.5" /> Nâng cấp gói tin
                                                    </Button>
                                                ) : ad.posting.adsEndDate && (
                                                    <div className="flex items-center gap-2 text-xs font-black text-amber-600 bg-amber-50/50 px-3 py-2 rounded-xl border border-amber-200 animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> 
                                                        <span>Thời gian gói: {getTimeRemaining(ad.posting.adsEndDate)}</span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        
                                        {!isLocked && (ad.posting.status === "APPROVED" || ad.posting.status === "ACTIVE" as any) && (
                                            <button 
                                                onClick={() => navigate(`/listing/${ad.id}`)}
                                                className="flex items-center gap-1.5 text-sm font-bold text-[#2E9147] hover:underline"
                                            >
                                                Xem tin đăng <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Note/Reason Modal */}
            <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <MessageCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            Thông tin từ Admin
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-gray-700 font-medium leading-relaxed italic">
                                "{(selectedAd as any)?.adminNote || "Đang chờ Admin xử lý. Vui lòng kiểm tra lại sau."}"
                            </p>
                        </div>
                        {selectedAd?.posting.status === "REJECTED" && (
                            <p className="mt-4 text-sm text-amber-600 font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Bạn có thể chỉnh sửa tin đăng để gửi duyệt lại.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button 
                            className="w-full bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold py-6 rounded-2xl"
                            onClick={() => setNoteModalOpen(false)}
                        >
                            Đã hiểu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-10 h-10 text-red-500" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900 text-center">Xóa tin đăng?</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium pt-2 text-center">
                            Bạn có chắc chắn muốn xóa tin <span className="font-black text-gray-900">"{selectedAd?.name}"</span>? Thao tác này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button 
                            onClick={handleConfirmDelete} 
                            className="w-full py-6 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200"
                        >
                            CÓ, XÓA VĨNH VIỄN
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => setDeleteModalOpen(false)}
                            className="w-full py-6 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl"
                        >
                            KHÔNG, GIỮ LẠI
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
