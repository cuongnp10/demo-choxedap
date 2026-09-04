import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchBE, postingApi, paymentsApi, userApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { 
    Check, 
    Zap, 
    Crown, 
    Star, 
    ShieldCheck, 
    Loader2, 
    CreditCard,
    Bike,
    Clock,
    Tag,
    Gift
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { SellToolbar } from '../components/SellToolbar';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';

interface PricingPackage {
    id: string;
    level: string;
    name: string;
    description: string;
    pricePerDay: number;
    color: string;
    icon: React.ReactNode;
}

const INSPECTION_FEE = 99000;
const POSTING_FEE = 59000;

export function PricingServiceFees() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // Support both ?id= and ?postingId=
    const postingId = searchParams.get('id') || searchParams.get('postingId') || '0';
    const isAiFailed = searchParams.get('aiStatus') === 'failed';
    
    const [packages, setPackages] = useState<PricingPackage[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const [durationDays, setDurationDays] = useState<number>(7);
    const [withInspection, setWithInspection] = useState(false);
    const [manualReview, setManualReview] = useState(isAiFailed || searchParams.get('review') === 'manual');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeMembership, setActiveMembership] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch from BE: /postings/packages and active membership
                const [pkgRes, memberRes] = await Promise.all([
                    fetchBE('/postings/packages').catch(() => null),
                    userApi.getActiveMembership().catch(() => null)
                ]);
                
                if (pkgRes && pkgRes.data && Array.isArray(pkgRes.data)) {
                    const mapped = pkgRes.data.map((p: any) => ({
                        id: p.id.toString(),
                        level: p.level,
                        name: p.level === 'THUONG' || p.level === 'THƯỜNG' ? 'Thường (Miễn phí)' : 
                              p.level === 'DE_THAY' || p.level === 'DỄ THẤY' ? 'Dễ thấy' :
                              p.level === 'NOI_BAT' || p.level === 'NỔI BẬT' ? 'Nổi bật' :
                              p.level === 'NOI_TROI' || p.level === 'NỔI TRỘI' ? 'Nổi trội' : p.level,
                        description: p.description,
                        pricePerDay: p.pricePerDay || p.price || 0,
                        color: p.level === 'THUONG' || p.level === 'THƯỜNG' ? '#9CA3AF' :
                               p.level === 'DE_THAY' || p.level === 'DỄ THẤY' ? '#60A5FA' :
                               p.level === 'NOI_BAT' || p.level === 'NỔI BẬT' ? '#F59E0B' : '#10B981',
                        icon: p.level === 'THUONG' || p.level === 'THƯỜNG' ? <Bike size={24} /> :
                              p.level === 'DE_THAY' || p.level === 'DỄ THẤY' ? <Zap size={24} /> :
                              p.level === 'NOI_BAT' || p.level === 'NỔI BẬT' ? <Star size={24} /> : <Crown size={24} />

                    }));

                    setPackages(mapped);
                    // Default select "THUONG" or first
                    const thuong = mapped.find((p: any) => p.level === 'THUONG');
                    if (thuong) {
                        setSelectedPackageId(thuong.id);
                    } else if (mapped.length > 0) {
                        setSelectedPackageId(mapped[0].id);
                    }
                }

                if (memberRes) {
                    setActiveMembership(memberRes);
                }
            } catch (error) {
                console.error("Error fetching data", error);
                toast.error("Không thể tải thông tin gói dịch vụ.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const selectedPackage = packages.find(p => p.id === selectedPackageId);
    const isFreePackage = selectedPackage?.level === 'THUONG';
    
    const vipFee = isFreePackage ? 0 : (selectedPackage?.pricePerDay || 0) * durationDays;
    const inspectionFee = withInspection ? INSPECTION_FEE : 0;
    const subtotal = POSTING_FEE + inspectionFee + vipFee;
    
    const discountPercentage = activeMembership?.discountPercentage || 0;
    const discountAmount = Math.round(subtotal * (discountPercentage / 100));
    const totalAmount = subtotal - discountAmount;

    const handleContinue = async () => {
        if (!selectedPackageId) return;
        setIsSubmitting(true);

        try {
            // Update pendingListing in localStorage
            const pendingListing = JSON.parse(localStorage.getItem('pendingListing') || '{}');
            pendingListing.packageId = parseInt(selectedPackageId);
            pendingListing.packageName = selectedPackage?.name;
            pendingListing.duration = isFreePackage ? 0 : durationDays;
            pendingListing.adAmount = vipFee;
            pendingListing.withInspection = withInspection;
            pendingListing.inspectionFee = inspectionFee;
            pendingListing.postingFee = POSTING_FEE;
            pendingListing.discountPercentage = discountPercentage;
            pendingListing.discountAmount = discountAmount;
            pendingListing.totalAmount = totalAmount;
            
            localStorage.setItem('pendingListing', JSON.stringify(pendingListing));

            let finalPostingId = postingId;

            // 1. If we don't have a postingId from URL, check localStorage
            if (!finalPostingId || finalPostingId === '0') {
                if (pendingListing.id) {
                    finalPostingId = pendingListing.id.toString();
                }
            }

            // 2. If still no postingId, create it now (DRAFT)
            if (!finalPostingId || finalPostingId === '0') {
                const numericPrice = typeof pendingListing.price === 'string' 
                    ? parseFloat(pendingListing.price.replace(/\./g, "")) 
                    : pendingListing.price;
                
                const createDto = {
                    title: pendingListing.title,
                    price: numericPrice,
                    description: pendingListing.description,
                    isInspected: withInspection,
                    bicycle: {
                        categoryId: pendingListing.categoryId_numeric || parseInt(pendingListing.categoryId) || 1,
                        brand: pendingListing.brand,
                        model: pendingListing.specs?.model || "",
                        frameSize: pendingListing.specs?.frameSize || "M",
                        year: parseInt(pendingListing.year) || null,
                        condition: pendingListing.condition,
                        color: pendingListing.specs?.color || "",
                        frameMaterial: pendingListing.specs?.frameMaterial || "",
                        drivetrain: pendingListing.specs?.drivetrain || "",
                        description: pendingListing.description,
                        wheelsAndTires: `${pendingListing.specs?.wheelSize || ""} ${pendingListing.specs?.tires || ""}`.trim(),
                        brakeSystem: pendingListing.specs?.brakeType || ""
                    },
                    media: [
                        ...(pendingListing.imageUrls || []).map((url: string, i: number) => ({ url, type: "IMAGE", sortOrder: i })),
                        ...(pendingListing.videoUrls || []).map((url: string, i: number) => ({ url, type: "VIDEO", sortOrder: (pendingListing.imageUrls?.length || 0) + i }))
                    ]
                };

                const response = await postingApi.createPosting(createDto);
                if (response && response.id) {
                    finalPostingId = response.id.toString();
                } else {
                    throw new Error("Không thể tạo tin đăng trên hệ thống.");
                }
            }

            // 2. Create Payment Intent via the new createVipPayment API
            const paymentResult = await paymentsApi.createVipPayment(
                parseInt(finalPostingId),
                parseInt(selectedPackageId),
                isFreePackage ? 0 : durationDays,
                true, // includePostingFee
                withInspection,
                manualReview
            );

            if (paymentResult && (paymentResult.paymentCode || paymentResult.PaymentCode)) {
                const code = paymentResult.paymentCode || paymentResult.PaymentCode;
                navigate(`/checkout?paymentCode=${code}`);
            } else {
                console.error("Payment Result Mismatch:", paymentResult);
                throw new Error("Không thể tạo yêu cầu thanh toán.");
            }

        } catch (error: any) {
            console.error("Error in handleContinue", error);
            toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#2E9147]" /></div>;

    return (
        <div className="w-full flex flex-col items-center bg-gray-50/50 min-h-screen">
            <SellToolbar currentStep={3} />

            <div className="w-full max-w-[1440px] px-4 md:px-8 py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Gói dịch vụ & Đẩy tin</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Lựa chọn gói hiển thị phù hợp để tiếp cận hàng ngàn người mua tiềm năng nhanh chóng nhất.
                        </p>
                    </div>

                    {activeMembership && (
                        <div className="mb-8 bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-6 text-white flex items-center gap-6 shadow-lg shadow-green-100 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Gift size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Đặc quyền Hội viên {activeMembership.tier}</h3>
                                    <Badge className="bg-yellow-400 text-gray-900 hover:bg-yellow-400 border-none font-black text-[10px]">ĐÃ KÍCH HOẠT</Badge>
                                </div>
                                <p className="text-white/80 font-medium">Bạn được giảm trực tiếp <span className="text-white font-black underline decoration-yellow-400 decoration-2 underline-offset-2">{discountPercentage}%</span> trên toàn bộ hóa đơn dịch vụ bài đăng.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Package Selection */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {packages.map((pkg) => (
                                    <div 
                                        key={pkg.id}
                                        onClick={() => setSelectedPackageId(pkg.id)}
                                        className={`relative p-6 rounded-[32px] border-2 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                                            selectedPackageId === pkg.id 
                                            ? 'border-[#2E9147] bg-white ring-4 ring-green-50 shadow-green-100/50' 
                                            : 'border-white bg-white/50 hover:bg-white hover:border-gray-200'
                                        }`}
                                    >
                                        {selectedPackageId === pkg.id && (
                                            <div className="absolute top-4 right-4 bg-[#2E9147] text-white p-1 rounded-full">
                                                <Check size={16} />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${pkg.color}20`, color: pkg.color }}>
                                                {pkg.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">{pkg.name}</h4>
                                                <div className="text-[#2E9147] font-bold">
                                                    {pkg.pricePerDay === 0 ? 'Miễn phí' : `${pkg.pricePerDay.toLocaleString()} ₫/ngày`}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {pkg.description || 'Gói hiển thị tiêu chuẩn trên sàn giao dịch.'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Duration Input - Hidden if Free */}
                            {!isFreePackage && (
                                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">Thời gian duy trì</h4>
                                                <p className="text-sm text-gray-500">Nhập số ngày bạn muốn đẩy tin bài đăng này</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input 
                                                type="number" 
                                                min={1} 
                                                max={365}
                                                value={durationDays}
                                                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-32 h-14 text-center text-xl font-bold rounded-2xl border-2 border-gray-100 focus:border-[#2E9147] transition-all"
                                            />
                                            <span className="text-lg font-bold text-gray-700">ngày</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Inspection Option */}
                            <div className="bg-[#F0FDF4] p-8 rounded-[32px] border-2 border-green-100 relative overflow-hidden group">
                                <div className="absolute -right-10 -bottom-10 text-green-100/50 group-hover:scale-110 transition-transform duration-700">
                                    <ShieldCheck size={180} />
                                </div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white text-[#2E9147] rounded-2xl shadow-sm">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-xl font-bold text-gray-900">Dịch vụ giám định</h4>
                                                <Badge className="bg-green-600 text-white border-none text-[10px] font-bold">KHUYÊN DÙNG</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                                                Chuyên gia của Chợ Xe Đạp sẽ kiểm tra trực tiếp tình trạng kỹ thuật của xe. Tin đăng sẽ có tick xanh "Đã giám định", tăng 80% tỷ lệ chốt đơn thành công.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center md:items-end gap-3">
                                        <div className="text-2xl font-black text-[#2E9147]">{INSPECTION_FEE.toLocaleString()} ₫</div>
                                        <Button 
                                            onClick={() => setWithInspection(!withInspection)}
                                            variant={withInspection ? "default" : "outline"}
                                            className={`h-12 px-8 rounded-xl font-bold transition-all ${
                                                withInspection 
                                                ? 'bg-[#2E9147] hover:bg-[#257a3b] shadow-lg shadow-green-100' 
                                                : 'border-2 border-green-600 text-green-600 bg-white hover:bg-green-50'
                                            }`}
                                        >
                                            {withInspection ? 'Đã thêm' : 'Thêm dịch vụ'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-32 bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="bg-gray-900 p-8 text-white">
                                    <h3 className="text-xl font-black mb-1">Tóm tắt thanh toán</h3>
                                    <p className="text-gray-400 text-xs">Mã tin đăng: {postingId === '0' ? 'Đang tạo...' : postingId}</p>
                                </div>
                                
                                <div className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Phí đăng bài:</span>
                                            <span className="font-bold text-gray-900">{POSTING_FEE.toLocaleString()} ₫</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-start text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-gray-500 font-medium">Gói {selectedPackage?.name}:</span>
                                                {!isFreePackage && (
                                                    <span className="text-[10px] text-gray-400 italic">
                                                        {selectedPackage?.pricePerDay.toLocaleString()} ₫ × {durationDays} ngày
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-900">{vipFee.toLocaleString()} ₫</span>
                                        </div>

                                        {withInspection && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Phí giám định:</span>
                                                <span className="font-bold text-gray-900">{INSPECTION_FEE.toLocaleString()} ₫</span>
                                            </div>
                                        )}

                                        {discountPercentage > 0 && (
                                            <div className="pt-2 flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-1.5 text-green-600 font-bold">
                                                    <Tag size={14} />
                                                    <span>Giảm giá Hội viên ({discountPercentage}%):</span>
                                                </div>
                                                <span className="font-bold text-green-600">-{discountAmount.toLocaleString()} ₫</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t-2 border-dashed border-gray-100">
                                        <div className="flex justify-between items-baseline mb-8">
                                            <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Tổng cộng</span>
                                            <div className="flex flex-col items-end">
                                                <div className="text-3xl font-black text-[#2E9147]">
                                                    {totalAmount.toLocaleString()} ₫
                                                </div>
                                                <span className="text-[10px] text-gray-400">Đã bao gồm VAT</span>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleContinue}
                                            disabled={isSubmitting}
                                            className="w-full h-16 rounded-2xl text-lg font-bold bg-[#2E9147] hover:bg-[#257a3b] shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all"
                                        >
                                            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                                                <>
                                                    <CreditCard size={20} /> Thanh toán ngay
                                                </>
                                            )}
                                        </Button>
                                        
                                        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
                                            <ShieldCheck size={14} className="text-[#2E9147]" />
                                            Giao dịch an toàn & Bảo mật tuyệt đối
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
