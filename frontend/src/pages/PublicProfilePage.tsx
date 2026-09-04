import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    Bike, 
    Star, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Loader2, 
    MessageCircle, 
    ShieldCheck, 
    Share2, 
    MoreHorizontal,
    Award
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { BikeCard } from "../components/BikeCard";
import { bikeApi, fetchBE } from "../lib/api";
import type { UserProfile } from "../types/user";
import type { BikeProduct } from "../types/bike";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userBikes, setUserBikes] = useState<BikeProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBikesLoading, setIsBikesLoading] = useState(true);

    useEffect(() => {
        const fetchPublicData = async () => {
            if (!userId) return;
            
            try {
                const response = await fetchBE(`/user/profile/${userId}`);
                setProfile(response.data);
                setIsLoading(true);
                
                setIsBikesLoading(true);
                const bikesRes = await bikeApi.getProducts({ sellerId: userId, pageSize: 20 });
                setUserBikes(bikesRes.items);
            } catch (error) {
                console.error("Failed to fetch public profile data", error);
            } finally {
                setIsLoading(false);
                setIsBikesLoading(false);
            }
        };

        fetchPublicData();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2E9147]" />
                    <p className="text-gray-500 font-medium animate-pulse">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-clay max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy người dùng</h2>
                    <p className="text-gray-500 mb-8">Người dùng này không tồn tại hoặc tài khoản đã bị tạm khóa.</p>
                    <Link to="/buy">
                        <Button className="w-full bg-[#2E9147] hover:bg-[#277a3c] rounded-xl h-12 font-bold">
                            Quay lại cửa hàng
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F0F2F5] pb-20">
            {/* Header Section (Facebook Style) */}
            <div className="bg-white shadow-sm">
                <div className="max-w-[1100px] mx-auto">
                    {/* Cover Image */}
                    <div className="relative h-[200px] md:h-[350px] w-full bg-gradient-to-r from-[#2E9147] to-[#86efac] md:rounded-b-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                             <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-lg gap-2">
                                <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Chia sẻ</span>
                             </Button>
                        </div>
                    </div>

                    {/* Profile Basic Info */}
                    <div className="px-4 md:px-8 pb-4">
                        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-20 mb-4">
                            <div className="relative">
                                <Avatar className="w-32 h-32 md:w-44 md:h-44 border-[6px] border-white shadow-md bg-white">
                                    <AvatarImage src={profile.avatar} alt={profile.fullName} className="object-cover" />
                                    <AvatarFallback className="bg-[#2E9147] text-white font-bold text-5xl">
                                        {profile.fullName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {(profile.stats.rating ?? 0) >= 4.5 && (
                                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm" title="Người bán uy tín">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left md:mb-4">
                                <h1 className="text-2xl md:text-4xl font-black text-gray-900 flex items-center justify-center md:justify-start gap-3">
                                    {profile.fullName}
                                    {profile.stats.completedOrders > 10 && (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 rounded-full flex gap-1 items-center">
                                            <Award className="w-3 h-3" />
                                            Expert Seller
                                        </Badge>
                                    )}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-gray-900 font-bold">{(profile.stats.rating ?? 0).toFixed(1)}</span>
                                        <span>({profile.stats.completedOrders} giao dịch)</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 md:mb-4">
                                <Button className="bg-[#1877F2] hover:bg-[#166fe5] rounded-lg font-bold gap-2 px-6">
                                    <MessageCircle className="w-5 h-5" /> Nhắn tin
                                </Button>
                                <Button variant="secondary" className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="h-[1px] bg-gray-200 w-full" />
                        
                        {/* Tabs Navigation */}
                        <div className="flex items-center justify-center md:justify-start">
                             <div className="flex gap-1 py-1">
                                {['Giới thiệu', 'Tin đăng', 'Đánh giá'].map((tab, i) => (
                                    <div key={i} className={`px-4 py-4 font-bold text-gray-600 cursor-pointer border-b-4 transition-all ${i === 1 ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent hover:bg-gray-50 hover:rounded-lg'}`}>
                                        {tab}
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-[1100px] mx-auto px-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* Left Column - Intro */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h2 className="text-xl font-black text-gray-900 mb-4">Giới thiệu</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Sống tại</p>
                                        <p className="font-bold text-gray-800">{profile.address || "Hồ Chí Minh, Việt Nam"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-bold text-gray-800">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Xác minh</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-800">{profile.phoneNumber ? "Đã xác thực SĐT" : "Chưa xác thực SĐT"}</p>
                                            {profile.phoneNumber && <ShieldCheck className="w-4 h-4 text-green-500" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-6 rounded-lg font-bold border-gray-200">
                                Xem chi tiết
                            </Button>
                        </div>

                        {/* Summary Stats */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                             <div className="grid grid-cols-2 gap-2">
                                <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
                                    <p className="text-2xl font-black text-[#2E9147]">{profile.stats.activeListings}</p>
                                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Đang bán</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                                    <p className="text-2xl font-black text-blue-600">{profile.stats.completedOrders}</p>
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Đã chốt</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Column - Wall/Postings */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-gray-900">Tin đăng công khai</h2>
                                <Button variant="ghost" className="text-[#1877F2] font-bold hover:bg-blue-50">
                                    Xem tất cả
                                </Button>
                            </div>

                            {isBikesLoading ? (
                                <div className="flex flex-col items-center py-20 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                    <p className="text-gray-400">Đang tìm xe...</p>
                                </div>
                            ) : userBikes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {userBikes.map((bike) => (
                                        <div key={bike.id} className="hover:scale-[1.02] transition-transform duration-300">
                                            <BikeCard {...bike} onClick={() => navigate(`/listing/${bike.id}`)} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bike className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Chưa có tin đăng nào</h3>
                                    <p className="text-gray-500 text-sm mt-1 max-w-[250px] mx-auto">
                                        Hiện tại {profile.fullName} chưa có tin đăng bán xe đạp nào công khai.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Seller Reviews Preview */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h2 className="text-xl font-black text-gray-900 mb-6">Đánh giá từ người mua</h2>
                            <div className="space-y-6">
                                <div className="flex flex-col items-center py-8 bg-gray-50 rounded-2xl">
                                    <div className="text-5xl font-black text-gray-900">{(profile.stats.rating ?? 0).toFixed(1)}</div>
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-5 h-5 ${s <= Math.round(profile.stats.rating ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-500 mt-2 font-medium">Dựa trên {profile.stats.completedOrders} lượt đánh giá</p>
                                </div>
                                <p className="text-center text-gray-400 text-sm italic">"Uy tín tạo nên thương hiệu. Luôn sẵn sàng hỗ trợ khách hàng."</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
