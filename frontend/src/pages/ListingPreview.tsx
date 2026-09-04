import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../lib/assets';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { MapPin, Calendar, ShieldCheck, Heart, Share2, MessageCircle, ArrowLeft, Eye, Play, Loader2 } from 'lucide-react';
import { bikeApi } from '../lib/api';

export default function ListingPreview() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load data from localStorage
    const savedData = JSON.parse(localStorage.getItem('pendingListing') || '{}');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Mapping frontend model to backend PostingDTO if needed, 
            // but for now passing the whole object as requested.
            const response = await bikeApi.createPosting(savedData);
            const postingId = response.id;
            
            // Clear drafts
            localStorage.removeItem('pendingListing');
            localStorage.removeItem('sell_draft');
            
            // Redirect to checkout
            const amount = savedData.packagePrice || 0;
            const desc = `Thanh toan goi ${savedData.packageId} cho tin dang ${postingId}`;
            navigate(`/checkout?postingId=${postingId}&amount=${amount}&type=full&desc=${encodeURIComponent(desc)}`);
        } catch (error) {
            console.error("Failed to create posting", error);
            alert("Đã xảy ra lỗi khi tạo tin đăng. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Product data merged with saved data
    const parsePrice = (val: string) => Number(val.replace(/\./g, ''));
    const displayPrice = savedData.price ? `${savedData.price} đ` : "16.999.000 đ";
    const originalPrice = savedData.price 
        ? `${(parsePrice(savedData.price) * 1.2).toLocaleString('vi-VN').replace(/,/g, '.')} đ` 
        : "20.000.000 đ";

    const product = {
        name: savedData.title || "Granavol SLE 7 - Dòng xe đua cao cấp 2020",
        price: displayPrice,
        originalPrice: originalPrice,
        location: savedData.location || "TP. Hồ Chí Minh",
        postedDate: "Đang chờ đăng",
        description: savedData.description ? [savedData.description] : [
            "Xe đạp đua Granavol SLE 7 là dòng xe cao cấp được thiết kế cho những người đam mê tốc độ. Khung sườn carbon siêu nhẹ giúp xe đạt hiệu suất tối đa.",
            "Được trang bị bộ truyền động Shimano 105 R7000 2x11 tốc độ, mang lại trải nghiệm chuyển số mượt mà và chính xác trên mọi cung đường.",
            "Xe còn rất mới, mới đi được khoảng 500km, bảo dưỡng định kỳ tại hãng. Cam kết không đâm đụng, nứt gãy."
        ],
        specs: savedData.specs ? [
            { label: "Model", value: savedData.specs.model },
            { label: "Màu sắc", value: savedData.specs.color },
            { label: "Chất liệu khung", value: savedData.specs.frameMaterial },
            { label: "Loại phanh", value: savedData.specs.brakeType },
            { label: "Phuộc giảm xóc", value: savedData.specs.fork },
            { label: "Líp", value: savedData.specs.cassette },
            { label: "Giò đĩa", value: savedData.specs.crankset },
            { label: "Tay đề", value: savedData.specs.shifters },
            { label: "Đề trước", value: savedData.specs.frontDerailleur },
            { label: "Đề sau", value: savedData.specs.rearDerailleur },
            { label: "Tốc độ", value: savedData.specs.speeds },
            { label: "Vành xe", value: savedData.specs.rims },
            { label: "Kích cỡ bánh xe", value: savedData.specs.wheelSize },
            { label: "Lốp xe", value: savedData.specs.tires },
            { label: "Dây âm sườn", value: savedData.specs.internalRouting },
        ].filter(s => s.value) : [
            { label: "Thương hiệu", value: "Giant" },
            { label: "Loại xe", value: "Road Bike" },
            { label: "Chất liệu khung", value: "Carbon Fiber" },
            { label: "Kích thước bánh", value: '700c' },
            { label: "Năm sản xuất", value: "2020" },
            { label: "Tình trạng", value: "Đã qua sử dụng (95%)" },
        ],
        seller: {
            name: "Nguyễn Văn A",
            joinDate: "Tham gia 2 năm trước",
        },
        images: savedData.images?.length > 0 ? savedData.images : [assets.bikes.featured[0], assets.bikes.featured[1], assets.bikes.featured[2]],
        videos: savedData.videos?.length > 0 ? savedData.videos : []
    };

    const [mainMedia, setMainMedia] = React.useState({ type: product.videos.length > 0 ? 'video' : 'image', url: product.videos.length > 0 ? product.videos[0] : product.images[0] });

    return (
        <div className="w-full bg-white min-h-screen font-['Inter',sans-serif]">
            {/* Preview Header Banner */}
            <div className="w-full bg-[#111827] text-white py-4 px-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#34A853] p-2 rounded-full">
                            <Eye size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[#34A853]">Chế độ xem trước</p>
                            <p className="text-xs text-gray-400">Đây là cách bản tin của bạn sẽ hiển thị với người mua.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                            className="bg-[#374151] hover:bg-[#4B5563] text-gray-200 rounded-xl h-10 px-6 border-none"
                        >
                            <ArrowLeft size={18} className="mr-2" /> Quay lại chỉnh sửa
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#34A853] hover:bg-[#2E9147] text-white rounded-xl h-10 px-8 font-bold border-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : "Tiếp tục thanh toán"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Media */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="aspect-[4/3] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-sm relative group">
                            {mainMedia.type === 'video' ? (
                                <video src={mainMedia.url} controls className="w-full h-full object-cover" />
                            ) : (
                                <ImageWithFallback src={mainMedia.url} alt={product.name} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                                <ShieldCheck size={14} className="text-[#34A853]" />
                                Tin đăng đã được xác minh
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-3">
                            {/* Videos Thumbnails */}
                            {product.videos.map((vid, i) => (
                                <div 
                                    key={`v-${i}`} 
                                    onClick={() => setMainMedia({ type: 'video', url: vid })}
                                    className={`aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-[#34A853]/50 transition-all relative ${mainMedia.url === vid ? 'ring-2 ring-[#34A853]' : ''}`}
                                >
                                    <video src={vid} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <Play className="text-white w-6 h-6 fill-white" />
                                    </div>
                                </div>
                            ))}

                            {/* Images Thumbnails */}
                            {product.images.map((img, i) => (
                                <div 
                                    key={`i-${i}`} 
                                    onClick={() => setMainMedia({ type: 'image', url: img })}
                                    className={`aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-[#34A853]/50 transition-all ${mainMedia.url === img ? 'ring-2 ring-[#34A853]' : ''}`}
                                >
                                    <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#FEF3C7] text-[#92400E] text-[12px] font-bold px-2.5 py-0.5 rounded-full uppercase">VIP Diamond</span>
                                <span className="text-gray-400 text-sm">• {product.postedDate}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] leading-tight mb-3">
                                {product.name}
                            </h1>

                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-[#34A853]">{product.price}</span>
                                <span className="text-lg line-through text-gray-400 mb-1">{product.originalPrice}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-100 rounded-md">
                                        <MapPin size={16} className="text-gray-600" />
                                    </div>
                                    {product.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-100 rounded-md">
                                        <Calendar size={16} className="text-gray-600" />
                                    </div>
                                    Đời xe: 2020
                                </div>
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white border border-[#F3F4F6] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-500 font-bold text-xl border border-white shadow-inner">
                                    {product.seller.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[17px] font-bold text-[#111827]">{product.seller.name}</p>
                                        <div className="bg-[#EFF6FF] text-[#1D4ED8] p-0.5 rounded-full">
                                            <ShieldCheck size={12} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{product.seller.joinDate}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-xl text-sm font-semibold border-gray-200 hover:bg-gray-50 h-10 px-4">
                                Xem trang
                            </Button>
                        </div>

                        {/* Actions (Disabled or for Demo) */}
                        <div className="space-y-4 opacity-70 pointer-events-none">
                            <div className="flex gap-4">
                                <Button className="flex-1 text-lg font-bold rounded-2xl py-8 bg-[#34A853] text-white">
                                    Mua ngay
                                </Button>
                                <Button className="flex-1 text-lg font-bold rounded-2xl py-8 bg-white border-2 border-[#34A853] text-[#34A853]">
                                    Đặt cọc
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 py-7 rounded-2xl text-base font-semibold border-gray-200 bg-gray-50 text-gray-700">
                                    <MessageCircle className="mr-2 h-5 w-5" /> Chat ngay
                                </Button>
                                <Button variant="outline" size="icon" className="h-[58px] w-[58px] rounded-2xl border-gray-200 bg-gray-50 shrink-0">
                                    <Heart className="h-5 w-5 text-gray-400" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-[58px] w-[58px] rounded-2xl border-gray-200 bg-gray-50 shrink-0">
                                    <Share2 className="h-5 w-5 text-gray-400" />
                                </Button>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-[#F0FDF4] p-5 rounded-2xl flex gap-4 items-start text-[#166534] border border-[#DCFCE7]">
                            <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 text-[#22C55E]" />
                            <div className="text-[15px] leading-relaxed">
                                <span className="font-bold block mb-1">Tin đăng an toàn</span>
                                Bản tin của bạn sẽ được đội ngũ kiểm định xét duyệt trong vòng 24h sau khi bạn hoàn tất thanh toán.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Specs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-16 pt-16 border-t border-[#F3F4F6]">
                    <div className="lg:col-span-7">
                        <h2 className="text-2xl font-bold mb-6 text-[#111827]">Mô tả sản phẩm</h2>
                        <div className="space-y-4 text-[17px] text-[#4B5563] leading-[1.6]">
                            {product.description.map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <h2 className="text-2xl font-bold mb-6 text-[#111827]">Thông số kỹ thuật</h2>
                        <div className="border border-[#F3F4F6] rounded-2xl overflow-hidden bg-white shadow-sm">
                            {product.specs
                                .filter(spec => 
                                    spec.value && 
                                    spec.value !== 'N/A' && 
                                    spec.value !== 'Không rõ' && 
                                    spec.value !== 'Standard' && 
                                    spec.value !== ''
                                )
                                .map((spec, i, filteredSpecs) => (
                                    <div key={i} className={`flex justify-between items-center p-4 ${i !== filteredSpecs.length - 1 ? 'border-b border-[#F3F4F6]' : ''} hover:bg-[#F9FAFB] transition-colors`}>
                                        <span className="text-[15px] text-[#6B7280] font-medium">{spec.label}</span>
                                        <span className="text-[15px] font-bold text-[#111827] text-right">{spec.value}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
