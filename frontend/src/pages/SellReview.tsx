import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SellToolbar } from '../components/SellToolbar';
import { Button } from '../components/ui/button';
import { 
    Bike, 
    MapPin, 
    ShieldCheck, 
    AlertCircle, 
    Loader2, 
    Camera,
    Info,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Send,
    Rocket
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { aiApi, postingApi, userApi } from '../lib/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { toast } from 'sonner';

export function SellReview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { imageFiles, videoFiles } = (location.state as any) || { imageFiles: [], videoFiles: [] };
    
    const [pendingListing, setPendingListing] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAiChecking, setIsAiChecking] = useState(false);
    const [aiViolations, setAiViolations] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [aiStatus, setAiStatus] = useState<'idle' | 'processing' | 'passed' | 'failed'>('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const isUpdate = isEditMode;

    useEffect(() => {
        const saved = localStorage.getItem('pendingListing');
        if (saved) {
            const parsed = JSON.parse(saved);
            setPendingListing(parsed);
            // Nếu ban đầu đã có ID thì mới coi là Edit mode
            if (parsed.id) {
                setIsEditMode(true);
            }
        } else {
            toast.error("Không tìm thấy thông tin bản nháp.");
            navigate('/sell');
        }
    }, [navigate]);

    // Tự động chạy upload và AI check khi mount
    useEffect(() => {
        if (pendingListing && aiStatus === 'idle') {
            startReviewProcess();
        }
    }, [pendingListing, aiStatus]);

    const startReviewProcess = async () => {
        setAiStatus('processing');
        setIsUploading(true);
        setUploadProgress(10);

        try {
            // 1. Upload files to Cloudinary if we have them
            let imageUrls = pendingListing.images || []; // Use existing images if any
            let videoUrls = pendingListing.videos || []; // Use existing videos if any

            // Filter out blob URLs if we are updating, but keep them if we have new files
            // Actually, imageFiles contains the new ones.
            
            // Re-uploading only new files
            if (imageFiles && imageFiles.length > 0) {
                const imageUploadPromises = imageFiles.map((file: File) => uploadToCloudinary(file));
                const imageResults = await Promise.all(imageUploadPromises);
                const newImageUrls = imageResults.map(res => res.secure_url);
                // Combine existing (non-blob) with new
                imageUrls = [...imageUrls.filter((url: string) => !url.startsWith('blob:')), ...newImageUrls];
                setUploadProgress(60);
            }

            if (videoFiles && videoFiles.length > 0) {
                const videoUploadPromises = videoFiles.map((file: File) => uploadToCloudinary(file));
                const videoResults = await Promise.all(videoUploadPromises);
                const newVideoUrls = videoResults.map(res => res.secure_url);
                videoUrls = [...videoUrls.filter((url: string) => !url.startsWith('blob:')), ...newVideoUrls];
                setUploadProgress(90);
            }

            // Update pendingListing with real URLs
            const updatedListing = {
                ...pendingListing,
                imageUrls,
                videoUrls,
                images: imageUrls, 
                videos: videoUrls
            };
            
            const serializableListing = JSON.parse(JSON.stringify(updatedListing));
            
            setPendingListing(serializableListing);
            localStorage.setItem('pendingListing', JSON.stringify(serializableListing));
            
            setIsUploading(false);
            setUploadProgress(100);

            // 2. Save DRAFT or UPDATE to Backend
            setIsAiChecking(true); 
            let postingId = pendingListing.id;
            
            const categoryId = parseInt(updatedListing.categoryId_numeric || updatedListing.categoryId || pendingListing.categoryId_numeric || pendingListing.categoryId);
            
            if (!categoryId || isNaN(categoryId)) {
                throw new Error("Dữ liệu 'Dòng xe' không hợp lệ. Vui lòng quay lại bước chỉnh sửa.");
            }

            const dto = {
                title: updatedListing.title,
                price: parseFloat(updatedListing.price.toString().replace(/\./g, '')),
                description: updatedListing.description,
                isInspected: false,
                bicycle: {
                    categoryId: categoryId,
                    brand: updatedListing.brand,
                    model: updatedListing.model || updatedListing.specs?.model || "Standard",
                    frameSize: updatedListing.specs?.frameSize || "M",
                    year: parseInt(updatedListing.year) || 2024,
                    condition: updatedListing.condition,
                    color: updatedListing.specs?.color || "N/A",
                    frameMaterial: updatedListing.specs?.frameMaterial || "Alloy",
                    brakeSystem: updatedListing.specs?.brakeType || "Disc",
                    description: updatedListing.description
                },
                media: [
                    ...imageUrls.map((url: string, i: number) => ({ url, type: 'IMAGE', sortOrder: i })),
                    ...videoUrls.map((url: string, i: number) => ({ url, type: 'VIDEO', sortOrder: imageUrls.length + i }))
                ]
            };

            let finalPostingId = postingId;
            if (!finalPostingId) {
                const res = await postingApi.createPosting(dto);
                if (res && res.id) {
                    finalPostingId = res.id;
                    
                    // Update user profile address with the selected location so it can be filtered on Buy page
                    if (updatedListing.location) {
                        try {
                            const profileRes = await userApi.getProfile();
                            if (profileRes && (!profileRes.address || profileRes.address.trim() === "")) {
                                await userApi.updateProfile({
                                    fullName: profileRes.fullName,
                                    phoneNumber: profileRes.phoneNumber,
                                    address: updatedListing.location,
                                    avatar: profileRes.avatar,
                                    bankAccountNumber: profileRes.bankAccountNumber,
                                    bankName: profileRes.bankName,
                                    bankAccountHolderName: profileRes.bankAccountHolderName
                                });
                                console.log("Updated user profile address with location:", updatedListing.location);
                            }
                        } catch (err) {
                            console.warn("Failed to update user profile address automatically", err);
                        }
                    }
                } else {
                    throw new Error("Không thể tạo bản nháp tin đăng.");
                }
            } else {
                await postingApi.updatePosting(finalPostingId, dto);
            }

            // Update localStorage with saved ID
            const finalListing = { ...serializableListing, id: finalPostingId };
            setPendingListing(finalListing);
            localStorage.setItem('pendingListing', JSON.stringify(finalListing));

            // 3. AI Content Moderation
            const aiResult = await postingApi.moderatePosting(finalPostingId);

            if (aiResult && aiResult.isValid) {
                setAiStatus('passed');
                setAiViolations([]);
                toast.success(isUpdate ? "Đã cập nhật tin đăng thành công!" : "AI đã duyệt nội dung bản nháp của bạn!");
            } else {
                setAiStatus('failed');
                setAiViolations(aiResult?.violations || ["AI không phản hồi kết quả hợp lệ."]);
                toast.error("AI phát hiện một số vi phạm.");
            }
        } catch (error: any) {
            console.error("Review process failed", error);
            setAiStatus('failed');
            setAiViolations([error.message || "Lỗi kết nối khi kiểm duyệt AI. Vui lòng thử lại."]);
            toast.error("Không thể hoàn thành kiểm duyệt AI.");
        } finally {
            setIsUploading(false);
            setIsAiChecking(false);
        }
    };

    const handleBackToEdit = () => {
        navigate(`/sell${isUpdate ? `?id=${pendingListing.id}` : ''}`);
    };

    const handleSendToAdmin = async () => {
        if (isUpdate) {
            toast.success("Yêu cầu cập nhật của bạn đã được gửi và đang chờ Admin phê duyệt!");
            localStorage.removeItem('sell_draft');
            localStorage.removeItem('pendingListing');
            navigate('/account/seller/my-post');
            return;
        }
        const postingId = pendingListing?.id;
        navigate(`/sell/pricing?postingId=${postingId}&review=manual&aiStatus=${aiStatus}`);
    };

    const handlePostNow = async () => {
        if (aiStatus !== 'passed') return;
        if (isUpdate) {
            toast.success("Cập nhật tin đăng thành công! Các thay đổi đang chờ duyệt nội dung.");
            localStorage.removeItem('sell_draft');
            localStorage.removeItem('pendingListing');
            navigate('/account/seller/my-post');
            return;
        }
        const postingId = pendingListing?.id;
        navigate(`/sell/pricing?postingId=${postingId}&aiStatus=${aiStatus}`);
    };

    if (!pendingListing) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#2E9147]" /></div>;

    return (
        <div className="w-full flex flex-col items-center bg-gray-50/50 min-h-screen">
            <SellToolbar currentStep={2} />

            <div className="w-full max-w-[1440px] px-4 md:px-8 py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-[#2E9147] font-bold text-sm uppercase tracking-wider mb-2">
                                <Badge className="bg-green-100 text-[#2E9147] border-none hover:bg-green-100">
                                    {isUpdate ? "Cập nhật tin đăng" : "Bản nháp tin đăng"}
                                </Badge>
                                <span>•</span>
                                <span>{isUpdate ? "Kiểm tra lại thay đổi" : "Đang được AI review"}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">Giao diện xem trước</h2>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handleBackToEdit} className="h-12 rounded-xl border-gray-200 hover:bg-white hover:border-gray-900 transition-all font-semibold">
                                <ArrowLeft size={18} className="mr-2" /> Quay lại chỉnh sửa
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* AI Status Banner */}
                            <div className={`p-8 rounded-[32px] border-2 transition-all duration-500 ${
                                aiStatus === 'processing' ? 'bg-blue-50 border-blue-100' :
                                aiStatus === 'passed' ? 'bg-green-50 border-green-100' :
                                'bg-red-50 border-red-100'
                            }`}>
                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl shrink-0 ${
                                        aiStatus === 'processing' ? 'bg-blue-100 text-blue-600' :
                                        aiStatus === 'passed' ? 'bg-green-100 text-green-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {aiStatus === 'processing' ? <Loader2 size={32} className="animate-spin" /> :
                                         aiStatus === 'passed' ? <CheckCircle2 size={32} /> :
                                         <AlertCircle size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-2 ${
                                            aiStatus === 'processing' ? 'text-blue-900' :
                                            aiStatus === 'passed' ? 'text-green-900' :
                                            'text-red-900'
                                        }`}>
                                            {aiStatus === 'processing' ? 'Hệ thống AI đang đánh giá bài đăng của bạn...' :
                                             aiStatus === 'passed' ? 'Nội dung hợp lệ! AI đã phê duyệt bài đăng này.' :
                                             'Phát hiện nội dung không phù hợp'}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed mb-4">
                                            {aiStatus === 'processing' ? 'Vui lòng chờ trong giây lát. Chúng tôi đang kiểm tra hình ảnh và mô tả để đảm bảo tin đăng của bạn đạt chất lượng tốt nhất.' :
                                             aiStatus === 'passed' ? 'Bài viết của bạn đã vượt qua vòng kiểm duyệt tự động. Bạn có thể đăng tin ngay hoặc gửi Admin duyệt thủ công nếu muốn.' :
                                             'Bài đăng của bạn có một số điểm chưa phù hợp với quy định của sàn. Bạn có thể chỉnh sửa lại hoặc gửi cho Admin duyệt thủ công.'}
                                        </p>
                                        
                                        {aiStatus === 'processing' && (
                                            <div className="w-full bg-blue-100 h-3 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        )}

                                        {aiStatus === 'failed' && aiViolations.length > 0 && (
                                            <div className="bg-white/60 rounded-2xl p-6 border border-red-100 space-y-3 mt-4">
                                                {aiViolations.map((v, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-red-700 text-sm font-semibold leading-tight">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                                        {v}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bicycle Preview Card */}
                            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-10">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        {/* Preview Images */}
                                        <div className="w-full md:w-1/2 space-y-4">
                                            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 group relative">
                                                {pendingListing.images && pendingListing.images[0] ? (
                                                    <img src={pendingListing.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                        <Camera size={48} strokeWidth={1} className="mb-2" />
                                                        <span className="text-sm font-medium">Chưa có ảnh</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-black/50 backdrop-blur-md text-white border-none text-[10px] font-bold uppercase py-1">Ảnh bìa</Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-3">
                                                {pendingListing.images?.slice(1, 5).map((img: string, i: number) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                                        <img src={img} className="w-full h-full object-cover" alt={`Preview ${i+2}`} />
                                                    </div>
                                                ))}
                                                {pendingListing.images?.length > 5 && (
                                                    <div className="aspect-square rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                                                        +{pendingListing.images.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Preview Info */}
                                        <div className="w-full md:w-1/2 space-y-6">
                                            <div>
                                                <h3 className="text-3xl font-black text-gray-900 leading-tight mb-4">{pendingListing.title}</h3>
                                                <div className="flex items-baseline gap-2 text-3xl font-black text-[#2E9147]">
                                                    {pendingListing.price?.toLocaleString()}
                                                    <span className="text-xl font-bold">₫</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Thương hiệu</span>
                                                    <span className="font-bold text-gray-800">{pendingListing.brand}</span>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Tình trạng</span>
                                                    <span className="font-bold text-gray-800">{pendingListing.condition}</span>
                                                </div>
                                                
                                                {pendingListing.year && pendingListing.year !== "Không rõ" && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Năm sản xuất</span>
                                                        <span className="font-bold text-gray-800">{pendingListing.year}</span>
                                                    </div>
                                                )}

                                                {pendingListing.specs?.frameMaterial && pendingListing.specs.frameMaterial !== "N/A" && pendingListing.specs.frameMaterial !== "Alloy" && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Chất liệu khung</span>
                                                        <span className="font-bold text-gray-800">{pendingListing.specs.frameMaterial}</span>
                                                    </div>
                                                )}

                                                {pendingListing.specs?.color && pendingListing.specs.color !== "N/A" && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Màu sắc</span>
                                                        <span className="font-bold text-gray-800">{pendingListing.specs.color}</span>
                                                    </div>
                                                )}

                                                {pendingListing.specs?.brakeType && pendingListing.specs.brakeType !== "N/A" && pendingListing.specs.brakeType !== "Disc" && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Loại phanh</span>
                                                        <span className="font-bold text-gray-800">{pendingListing.specs.brakeType}</span>
                                                    </div>
                                                )}

                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2">
                                                    <MapPin size={16} className="text-[#2E9147]" />
                                                    <span className="font-bold text-gray-800">{pendingListing.location}</span>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Info size={18} className="text-gray-400" />
                                                    <h4 className="font-bold text-gray-900">Mô tả sản phẩm</h4>
                                                </div>
                                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-4 italic">
                                                    "{pendingListing.description}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Panel */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-32 space-y-6">
                                <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                    <h3 className="text-xl font-black text-gray-900 mb-6">Trạng thái tin đăng</h3>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">Trạng thái:</span>
                                            <Badge className="bg-amber-100 text-amber-700 border-none font-bold uppercase tracking-tighter">Bản nháp (Draft)</Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">Kiểm duyệt AI:</span>
                                            <span className={`font-bold flex items-center gap-1.5 ${
                                                aiStatus === 'processing' ? 'text-blue-600' :
                                                aiStatus === 'passed' ? 'text-green-600' :
                                                'text-red-600'
                                            }`}>
                                                {aiStatus === 'processing' ? <Loader2 size={16} className="animate-spin" /> :
                                                 aiStatus === 'passed' ? <ShieldCheck size={16} /> :
                                                 <XCircle size={16} />}
                                                {aiStatus === 'processing' ? 'Đang quét...' :
                                                 aiStatus === 'passed' ? 'Đã thông qua' :
                                                 'Không đạt'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50 text-sm">
                                            <span className="text-gray-400">Dự kiến hiển thị:</span>
                                            <span className="text-gray-500 font-semibold italic">Sau 24h</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button 
                                            disabled={aiStatus !== 'passed' || isAiChecking || isUploading}
                                            onClick={handlePostNow}
                                            className={`w-full h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all ${
                                                aiStatus === 'passed' 
                                                ? 'bg-[#2E9147] hover:bg-[#257a3b] shadow-lg shadow-green-100' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <Rocket size={20} /> Đăng tin ngay
                                        </Button>

                                        <Button 
                                            variant="outline"
                                            disabled={isAiChecking || isUploading}
                                            onClick={handleSendToAdmin}
                                            className="w-full h-16 rounded-2xl text-lg font-bold border-2 border-gray-100 hover:border-gray-900 transition-all gap-3"
                                        >
                                            <Send size={20} /> Gửi Admin duyệt
                                        </Button>

                                        <p className="text-[11px] text-gray-400 text-center px-4 leading-normal">
                                            Bằng cách nhấn nút trên, bạn đồng ý với <b>Điều khoản dịch vụ</b> của Chợ Xe Đạp.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#FFFBEB] rounded-3xl p-6 border border-amber-100 flex gap-4">
                                    <Info className="text-amber-600 shrink-0" size={24} />
                                    <div className="text-sm text-amber-900 leading-relaxed font-medium">
                                        <b>Mẹo:</b> Các tin đăng có AI thông qua sẽ được ưu tiên hiển thị nhanh hơn trong danh sách tìm kiếm.
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
