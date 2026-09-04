import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    LogOut,
    Bike,
    History,
    Star,
    User,
    ShoppingBag,
    Store,
    Heart,
    MessageSquare,
    Camera,
    Loader2,
    BadgeCheck,
    CheckCircle2,
    CreditCard,
    AlertCircle,
    ClipboardList
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { SellerOverview } from "../components/Profile/SellerOverview";
import { SellerTransactionHistory } from "../components/Profile/SellerTransactionHistory";
import { SellerMembership } from "../components/Profile/SellerMembership";
import { SellerMyAds } from "../components/Profile/SellerMyAds";
import { SellerOrderManagement } from "../components/Profile/SellerOrderManagement";
import { SellerReviews } from "../components/Profile/SellerReviews";
import { BuyerTransactionHistory } from "../components/Profile/BuyerTransactionHistory";
import { BuyerFinancialHistory } from "../components/Profile/BuyerFinancialHistory";
import { BuyerFavorites } from "../components/Profile/BuyerFavorites";
import { BuyerReviews } from "../components/Profile/BuyerReviews";
import type { SubmittedReview } from "../types/review";
import { reviewApi, userApi } from "../lib/api";
import { uploadToCloudinary } from "../services/cloudinary";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "../components/ui/input-otp";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { PhoneAuthService } from "../services/phoneAuthService";

type Section = "buyer" | "seller" | "profile";

export function PageProfile() {
    const { user, logout, refreshUser } = useAuth();
    const [activeMenu, setActiveMenu] = useState<string>("history");
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<any>(null);

    // OTP State
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    useEffect(() => {
        // Chỉ khởi tạo khi đã load xong dữ liệu (DOM đã sẵn sàng)
        if (!isLoading) {
            PhoneAuthService.setupRecaptcha("recaptcha-container");
        }
    }, [isLoading]);

    // Password Change State
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Global Review State
    const [submittedReviews, setSubmittedReviews] = useState<SubmittedReview[]>([]);
    const [receivedReviews, setReceivedReviews] = useState<SubmittedReview[]>([]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const profileData = await userApi.getProfile();
            if (!profileData) throw new Error("Dữ liệu profile trống");

            // Map backend profile to frontend structure
            const mappedProfile = {
                id: profileData.id,
                name: profileData.fullName,
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                address: profileData.address,
                avatar: profileData.avatar,
                role: profileData.role,
                phoneVerified: profileData.phoneVerified,
                reputationScore: profileData.reputationScore || 0,
                bankAccountNumber: profileData.bankAccountNumber,
                bankName: profileData.bankName,
                bankAccountHolderName: profileData.bankAccountHolderName,
                kycStatus: profileData.kycStatus,
                membershipTier: profileData.membershipTier || "BASIC",
                createdAt: profileData.createdAt || new Date().toISOString(),
                stats: {
                    activeListings: profileData.stats?.activeListings || 0,
                    totalPostings: profileData.stats?.totalPostings || 0,
                    completedOrders: profileData.stats?.completedOrders || 0,
                    rating: profileData.stats?.rating || 0,
                    totalViews: profileData.stats?.totalViews || 0,
                    totalReviews: profileData.stats?.totalReviews || 0
                }
            };
            setFullProfile(mappedProfile);
            setEditedProfile(mappedProfile);

            // Fetch reviews in a separate try-catch so it doesn't break profile loading
            try {
                // Fetch both types of reviews
                const [myReviewsRes, receivedReviewsRes] = await Promise.all([
                    reviewApi.getMyReviews().catch(err => {
                        console.error("Error fetching my reviews:", err);
                        return [];
                    }),
                    reviewApi.getReceivedReviews().catch(err => {
                        console.error("Error fetching received reviews:", err);
                        return [];
                    })
                ]);

                // Map my reviews
                const mappedMyReviews: SubmittedReview[] = (myReviewsRes || []).map((review: any) => ({
                    orderId: review.orderId?.toString() || review.id?.toString() || "0",
                    bikeName: review.postingTitle || "Sản phẩm",
                    image: review.thumbnailUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
                    shopName: review.sellerName || (review.type === "ORDER_REVIEW" ? "Người bán" : "Thảo luận"),
                    rating: review.rating || 5,
                    comment: review.content || review.comment,
                    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : "N/A",
                    reviewType: review.type as "COMMENT" | "ORDER_REVIEW"
                }));
                setSubmittedReviews(mappedMyReviews);

                // Map received reviews
                const mappedReceivedReviews: SubmittedReview[] = (receivedReviewsRes || []).map((review: any) => ({
                    orderId: review.orderId?.toString() || review.id?.toString() || "0",
                    bikeName: review.postingTitle || "Sản phẩm",
                    image: review.thumbnailUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
                    shopName: review.buyerName || "Người dùng",
                    rating: review.rating || 5,
                    comment: review.comment || review.content,
                    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : "N/A",
                    reviewType: review.type as "COMMENT" | "ORDER_REVIEW"
                }));
                setReceivedReviews(mappedReceivedReviews);
            } catch (reviewError) {
                console.error("Outer Failed to fetch reviews", reviewError);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Không thể tải thông tin cá nhân. Vui lòng kiểm tra kết nối mạng.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAddReview = (review: SubmittedReview) => {
        setSubmittedReviews((prev) => [review, ...prev]);
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            let loadingToast;
            try {
                // Hiển thị toast loading
                loadingToast = toast.loading("Đang tải ảnh đại diện lên...");
                
                // 1. Tải ảnh lên Cloudinary
                const result = await uploadToCloudinary(file);
                if (!result || !result.secure_url) {
                    throw new Error("Không nhận được URL từ Cloudinary");
                }
                
                const imageUrl = result.secure_url;
                
                // 2. Cập nhật state local ngay lập tức để người dùng thấy
                setFullProfile((prev: any) => ({ ...prev, avatar: imageUrl }));
                if (isEditing) {
                    setEditedProfile((prev: any) => ({ ...prev, avatar: imageUrl }));
                }

                // 3. Nếu không ở chế độ chỉnh sửa HOẶC đang ở mục khác không phải Profile,
                // ta lưu luôn vào database để tránh mất khi refresh.
                if (!isEditing || activeSection !== "profile") {
                    const payload = {
                        fullName: profile.name,
                        phoneNumber: profile.phoneNumber,
                        address: profile.address,
                        avatar: imageUrl,
                        bankAccountNumber: profile.bankAccountNumber,
                        bankName: profile.bankName,
                        bankAccountHolderName: profile.bankAccountHolderName
                    };
                    await userApi.updateProfile(payload);
                    await refreshUser();
                    toast.success("Đã cập nhật ảnh đại diện thành công!");
                } else {
                    // Nếu đang ở chế độ chỉnh sửa Profile, chỉ cần update editedProfile, 
                    // người dùng sẽ nhấn "Lưu thay đổi" sau.
                    setEditedProfile((prev: any) => ({ ...prev, avatar: imageUrl }));
                    toast.success("Đã thay đổi ảnh đại diện (nhấn Lưu để hoàn tất)");
                }
            } catch (error: any) {
                console.error("Lỗi khi đổi avatar:", error);
                toast.error("Không thể tải ảnh đại diện: " + (error.message || "Lỗi không xác định"));
            } finally {
                if (loadingToast) toast.dismiss(loadingToast);
            }
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleToggleEdit = async () => {
        if (isEditing) {
            try {
                // Map frontend editedProfile to backend payload
                const payload = {
                    fullName: editedProfile.name,
                    phoneNumber: editedProfile.phoneNumber,
                    address: editedProfile.address,
                    avatar: editedProfile.avatar,
                    bankAccountNumber: editedProfile.bankAccountNumber,
                    bankName: editedProfile.bankName,
                    bankAccountHolderName: editedProfile.bankAccountHolderName
                };

                await userApi.updateProfile(payload);
                toast.success("Đã cập nhật thông tin cá nhân!");
                setIsEditing(false);

                // Refresh both local and global user state
                await Promise.all([
                    fetchProfile(),
                    refreshUser()
                ]);
            } catch (error: any) {
                console.error("Failed to update profile", error);
                toast.error(error.message || "Không thể cập nhật thông tin cá nhân");
            }
        } else {
            // Enter edit mode
            setEditedProfile({ ...profile });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
    };

    const handleInputChange = (field: string, value: string) => {
        setEditedProfile((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRequestOtp = async () => {
        if (!profile.phoneNumber) {
            toast.error("Vui lòng cập nhật số điện thoại trước khi xác thực.");
            return;
        }

        // Chuẩn hóa số điện thoại: 0772225379 -> +84772225379
        let cleaned = profile.phoneNumber.trim().replace(/\D/g, ''); // Xóa tất cả ký tự không phải số
        let formattedPhone = "";

        if (cleaned.startsWith("84")) {
            formattedPhone = "+" + cleaned;
        } else if (cleaned.startsWith("0")) {
            formattedPhone = "+84" + cleaned.slice(1);
        } else {
            formattedPhone = "+84" + cleaned;
        }

        console.log("[OTP] Requesting for:", formattedPhone);

        setIsSendingOtp(true);
        try {
            await PhoneAuthService.sendOtp(formattedPhone);
            setIsSendingOtp(false);
            toast.success(`Mã OTP đã được gửi đến số ${profile.phoneNumber}`);
            setIsOtpDialogOpen(true);
        } catch (error: any) {
            setIsSendingOtp(false);
            toast.error(error.message || "Không thể gửi mã OTP qua Firebase.");
        }
    };

    const handleVerifyOtp = async () => {
        if (otpValue.length !== 6) {
            toast.error("Vui lòng nhập đầy đủ mã OTP 6 chữ số.");
            return;
        }

        setIsVerifying(true);
        try {
            const firebaseIdToken = await PhoneAuthService.verifyOtp(otpValue);
            
            // Gửi firebaseIdToken lên backend thay vì otp code
            if (firebaseIdToken) {
                await userApi.verifyPhoneOtp(profile.phoneNumber, firebaseIdToken);
            }

            setIsVerifying(false);
            toast.success("Xác thực số điện thoại thành công!");
            setIsOtpDialogOpen(false);
            setOtpValue("");
            
            // Refresh both local and global user state to update KYC status
            await Promise.all([
                fetchProfile(),
                refreshUser()
            ]);
        } catch (error: any) {
            setIsVerifying(false);
            toast.error(error.message || "Mã OTP không chính xác");
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ các trường mật khẩu.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        setIsChangingPassword(true);
        try {
            await userApi.changePassword(passwordData);
            setIsChangingPassword(false);
            setIsPasswordDialogOpen(false);
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            toast.success("Đổi mật khẩu thành công!");
        } catch (error: any) {
            setIsChangingPassword(false);
            toast.error(error.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.");
        }
    };

    const handlePasswordInputChange = (field: string, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getActiveSection = (): Section => {
        const path = location.pathname;
        if (path.includes("/buyer")) return "buyer";
        if (path.includes("/seller")) return "seller";
        return "profile";
    };

    const activeSection = getActiveSection();

    useEffect(() => {
        const path = location.pathname.split("/").pop();
        if (activeSection === "buyer") {
            setActiveMenu(path === "buyer" ? "history" : (path || "history"));
        } else if (activeSection === "seller") {
            setActiveMenu(path === "seller" ? "overview" : (path || "overview"));
        } else {
            setActiveMenu("profile");
        }
    }, [location.pathname, activeSection]);

    const profile = fullProfile || {
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: "",
        address: "",
        bankAccountNumber: "",
        bankName: "",
        bankAccountHolderName: "",
        createdAt: new Date().toISOString(),
        stats: { activeListings: 0, completedOrders: 0, rating: 0, totalViews: 0 },
        phoneVerified: false
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
                <div id="recaptcha-container" className="hidden"></div>
            </div>
        );
    }

    const statCards = [
        {
            icon: <Bike className="w-6 h-6 text-[#2E9147]" />,
            label: "Tin đăng hoạt động",
            value: profile.stats.activeListings,
            color: "bg-green-50"
        },
        {
            icon: <History className="w-6 h-6 text-[#2E9147]" />,
            label: "Giao dịch hoàn tất",
            value: profile.stats.completedOrders,
            color: "bg-blue-50"
        },
        {
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            label: "Đánh giá",
            value: `${profile.stats.rating}/5.0`,
            color: "bg-yellow-50"
        },
    ];

    const sidebarLinks = [
        { id: "buyer", path: "/account/buyer/history", icon: <ShoppingBag className="w-5 h-5" />, label: "Người mua" },
        { id: "seller", path: "/account/seller/overview", icon: <Store className="w-5 h-5" />, label: "Người bán" },
        { id: "profile", path: "/account/profile", icon: <User className="w-5 h-5" />, label: "Tài khoản" },
    ];

    const buyerMenu = [
        { id: "history", icon: <History className="w-5 h-5" />, label: "Lịch sử đơn hàng" },
        { id: "financial", icon: <CreditCard className="w-5 h-5" />, label: "Lịch sử giao dịch" },
        { id: "favorites", icon: <Heart className="w-5 h-5" />, label: "Quan tâm" },
        { id: "review", icon: <MessageSquare className="w-5 h-5" />, label: "Lịch sử đánh giá" },
    ];

    const sellerMenu = [
        { id: "overview", icon: <Star className="w-5 h-5" />, label: "Tổng quan" },
        { id: "my-post", icon: <ShoppingBag className="w-5 h-5" />, label: "Quản lý tin đăng" },
        { id: "orders", icon: <ClipboardList className="w-5 h-5" />, label: "Đơn hàng đang bán" },
        { id: "transactions", icon: <CreditCard className="w-5 h-5" />, label: "Lịch sử giao dịch" },
        { id: "received-reviews", icon: <MessageSquare className="w-5 h-5" />, label: "Đánh giá từ khách hàng" },
    ];

    const handleSectionChange = (path: string) => {
        navigate(path);
    };

    const renderBuyerContent = () => {
        switch (activeMenu) {
            case "history":
                return <BuyerTransactionHistory
                    submittedReviews={submittedReviews}
                    onReviewSubmit={handleAddReview}
                />;
            case "financial":
                return <BuyerFinancialHistory />;
            case "favorites":
                return <BuyerFavorites />;
            case "review":
                return <BuyerReviews reviews={submittedReviews} />;
            default:
                return null;
        }
    };

    const renderSellerContent = () => {
        switch (activeMenu) {
            case "overview":
                return <SellerOverview 
                    profile={profile} 
                    onViewReviews={() => navigate("/account/seller/received-reviews")}
                />;
            case "my-post":
                return <SellerMyAds />;
            case "orders":
                return <SellerOrderManagement />;
            case "transactions":
                return <SellerTransactionHistory />;
            case "membership":
                return <SellerMembership />;
            case "received-reviews":
                return <SellerReviews reviews={receivedReviews} />;
            default:
                return <SellerOverview 
                    profile={profile}
                    onViewReviews={() => navigate("/account/seller/received-reviews")}
                />;
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] font-['Inter',sans-serif]">
            <div className="w-full h-[180px] bg-[#2E9147] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
            </div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 -mt-12 pb-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="w-full lg:w-[320px] shrink-0">
                        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sticky top-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative group">
                                    <Avatar className="w-16 h-16 border-2 border-[#2E9147]/20 transition-all group-hover:opacity-80">
                                        <AvatarImage src={profile.avatar} alt={profile.name} />
                                        <AvatarFallback className="bg-[#2E9147] text-white font-bold">{profile.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={triggerFileSelect}
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Đổi ảnh đại diện"
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{profile.name}</h3>
                                    <p className="text-xs text-gray-400 font-medium">Thành viên {profile.role || "User"}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                {sidebarLinks.map((link) => (
                                    <button
                                        key={link.id}
                                        onClick={() => handleSectionChange(link.path)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-semibold ${activeSection === link.id
                                            ? "bg-[#2E9147] text-white shadow-lg shadow-[#2E9147]/20"
                                            : "text-gray-500 hover:bg-gray-50 active:scale-[0.98]"
                                            }`}
                                    >
                                        {link.icon}
                                        <span className="text-[16px]">{link.label}</span>
                                    </button>
                                ))}
                            </div>

                            {(activeSection === "buyer" || activeSection === "seller") && (
                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-[14px] font-black text-gray-900 mb-4 px-2 uppercase tracking-widest">Menu</p>
                                    <div className="space-y-1">
                                        {(activeSection === "buyer" ? buyerMenu : sellerMenu).map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    navigate(`/account/${activeSection}/${item.id}`);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeMenu === item.id
                                                    ? "bg-[#F0FDF4] text-[#2E9147]"
                                                    : "text-gray-500 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                {activeMenu === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[#2E9147]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={logout}
                                className="w-full mt-12 flex items-center gap-3 px-4 py-4 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-4">
                        {activeSection === "profile" ? (
                            <>
                                <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 p-8 lg:p-10 mb-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-gray-50">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl lg:text-3xl font-black text-gray-900">Thông tin cá nhân</h2>
                                                {profile.kycStatus === "VERIFIED" ? (
                                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                                        <BadgeCheck className="w-3 h-3" />
                                                        ĐÃ XÁC MINH (KYC)
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                                                        <AlertCircle className="w-3 h-3" />
                                                        CHƯA XÁC MINH
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-500">Quản lý và cập nhật thông tin tài khoản của bạn</p>
                                        </div>
                                        <div className="flex gap-3">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={handleToggleEdit}
                                                        className="flex items-center gap-2 bg-[#2E9147] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#257a3b] transition-all shadow-md active:scale-95"
                                                    >
                                                        Lưu thay đổi
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setIsPasswordDialogOpen(true)}
                                                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                                                    >
                                                        Đổi mật khẩu
                                                    </button>
                                                    <button
                                                        onClick={handleToggleEdit}
                                                        className="flex items-center gap-2 bg-[#2E9147] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#257a3b] transition-all shadow-md active:scale-95"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Chỉnh sửa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        {[
                                            { id: 'name', icon: <User className="w-4 h-4" />, label: "Họ và tên", value: isEditing ? editedProfile?.name : profile?.name, required: true },
                                            { id: 'email', icon: <Mail className="w-4 h-4" />, label: "Email", value: isEditing ? editedProfile?.email : profile?.email },
                                            { id: 'phoneNumber', icon: <Phone className="w-4 h-4" />, label: "Số điện thoại", value: isEditing ? editedProfile?.phoneNumber : profile?.phoneNumber, isVerified: profile?.phoneVerified, required: true },
                                            { id: 'address', icon: <MapPin className="w-4 h-4" />, label: "Địa chỉ", value: isEditing ? editedProfile?.address : profile?.address, required: true },
                                            { id: 'bankName', icon: <CreditCard className="w-4 h-4" />, label: "Tên ngân hàng", value: isEditing ? editedProfile?.bankName : profile?.bankName, required: true },
                                            { id: 'bankAccountNumber', icon: <CreditCard className="w-4 h-4" />, label: "Số tài khoản", value: isEditing ? editedProfile?.bankAccountNumber : profile?.bankAccountNumber, required: true },
                                            { id: 'bankAccountHolderName', icon: <User className="w-4 h-4" />, label: "Tên chủ tài khoản", value: isEditing ? editedProfile?.bankAccountHolderName : profile?.bankAccountHolderName, required: true },
                                        ].map((item, idx) => (
                                            <div key={idx} className="group">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[12px] font-black text-[#2E9147] uppercase tracking-widest flex items-center gap-2 opacity-80">
                                                        {item.icon}
                                                        {item.label}
                                                        {item.required && <span className="text-red-500 font-bold">*</span>}
                                                        {item.id === 'phoneNumber' && item.isVerified && (
                                                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {isEditing && item.id !== 'email' ? (
                                                            <Input
                                                                value={item.value || ""}
                                                                onChange={(e) => handleInputChange(item.id, e.target.value)}
                                                                className="h-[48px] bg-[#F9FAFB] border-gray-200 rounded-xl focus:border-[#2E9147] focus:ring-[#2E9147]/20 font-semibold"
                                                            />
                                                        ) : (
                                                            <>
                                                                <div className={`h-[48px] flex-1 bg-[#F9FAFB] border border-gray-100 px-5 flex items-center rounded-xl text-[14px] font-semibold text-gray-800 group-hover:border-[#2E9147]/30 transition-colors shadow-sm ${item.id === 'email' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                                                    {item.value || "Chưa cập nhật"}
                                                                </div>
                                                                {item.id === 'phoneNumber' && item.value && !item.isVerified && !isEditing && (
                                                                    <Button
                                                                        id="otp-send-btn"
                                                                        onClick={handleRequestOtp}
                                                                        disabled={isSendingOtp}
                                                                        className="h-[48px] bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold px-4 rounded-xl shadow-md active:scale-95 transition-all"
                                                                    >
                                                                        {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác thực"}
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {!isEditing && (
                                            <div className="group">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[12px] font-black text-[#2E9147] uppercase tracking-widest flex items-center gap-2 opacity-80">
                                                        <Calendar className="w-4 h-4" />
                                                        Ngày tham gia
                                                    </span>
                                                    <div className="h-[48px] bg-[#F9FAFB] border border-gray-100 px-5 flex items-center rounded-xl text-[14px] font-semibold text-gray-800 group-hover:border-[#2E9147]/30 transition-colors shadow-sm">
                                                        {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                                    {statCards.map((stat, idx) => (
                                        <div key={idx} className="bg-white group p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-xl hover:shadow-[#2E9147]/5 hover:-translate-y-1">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${stat.color}`}>
                                                {stat.icon}
                                            </div>
                                            <span className="text-3xl font-black text-gray-900 mb-1">{stat.value}</span>
                                            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : activeSection === "seller" ? (
                            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 p-8 lg:p-10">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                                                {sellerMenu.find(m => m.id === activeMenu)?.label}
                                            </h2>
                                            <p className="text-gray-500 font-medium">Quản lý hoạt động bán hàng của bạn</p>
                                        </div>
                                        <button
                                            onClick={() => navigate("/sell")}
                                            className="bg-[#2E9147] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#257a3b] transition-all shadow-lg shadow-[#2E9147]/20 active:scale-95"
                                        >
                                            + Đăng tin mới
                                        </button>
                                    </div>
                                    {renderSellerContent()}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 p-8 lg:p-10">
                                {renderBuyerContent()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OTP Verification Dialog */}
            <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-center text-gray-900">Xác thực số điện thoại</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Chúng tôi đã gửi mã xác thực 6 chữ số đến <span className="font-bold text-[#2E9147]">{profile.phoneNumber}</span>.
                            Vui lòng nhập mã để hoàn tất.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-8">
                        <InputOTP
                            maxLength={6}
                            value={otpValue}
                            onChange={(value: string) => setOtpValue(value)}
                        >
                            <InputOTPGroup className="gap-2">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className="w-12 h-14 text-xl font-bold border-gray-200 rounded-xl focus:border-[#2E9147] focus:ring-[#2E9147]/20"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifying || otpValue.length !== 6}
                            className="w-full bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold py-6 rounded-2xl shadow-lg shadow-[#2E9147]/20 active:scale-95 transition-all"
                        >
                            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                            Xác nhận mã OTP
                        </Button>
                    </DialogFooter>
                    <div className="text-center mt-4">
                        <button
                            onClick={handleRequestOtp}
                            disabled={isSendingOtp}
                            className="text-[14px] font-bold text-[#2E9147] hover:underline disabled:opacity-50"
                        >
                            Gửi lại mã
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-center text-gray-900">Đổi mật khẩu</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật bảo mật tài khoản.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2E9147] uppercase tracking-widest">Mật khẩu hiện tại</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.oldPassword}
                                onChange={(e) => handlePasswordInputChange("oldPassword", e.target.value)}
                                className="h-[48px] bg-[#F9FAFB] border-gray-200 rounded-xl focus:border-[#2E9147] focus:ring-[#2E9147]/20 font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2E9147] uppercase tracking-widest">Mật khẩu mới</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                                className="h-[48px] bg-[#F9FAFB] border-gray-200 rounded-xl focus:border-[#2E9147] focus:ring-[#2E9147]/20 font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2E9147] uppercase tracking-widest">Xác nhận mật khẩu mới</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                                className="h-[48px] bg-[#F9FAFB] border-gray-200 rounded-xl focus:border-[#2E9147] focus:ring-[#2E9147]/20 font-semibold"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center flex-col gap-3">
                        <Button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="w-full bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold py-6 rounded-2xl shadow-lg shadow-[#2E9147]/20 active:scale-95 transition-all"
                        >
                            {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Cập nhật mật khẩu"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsPasswordDialogOpen(false)}
                            className="w-full font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl py-6"
                        >
                            Hủy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden Recaptcha Container */}
            <div id="recaptcha-container" className="hidden"></div>
        </div>
    );
}
