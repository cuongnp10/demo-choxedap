import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
    AlertTriangle, 
    Camera, 
    Video, 
    ChevronLeft, 
    Send, 
    CheckCircle2,
    X,
    UploadCloud,
    AlertCircle,
    ShieldAlert
} from "lucide-react";
import { fetchBE } from "../lib/api";
import { toast } from "sonner";
import { uploadToCloudinary } from "../services/cloudinary";

const orderReportReasons = [
    { id: "TECHNICAL", label: "Lỗi kỹ thuật / Hỏng hóc", description: "Sản phẩm không hoạt động đúng như mô tả kỹ thuật." },
    { id: "CONTENT", label: "Sai mô tả / Thiếu phụ kiện", description: "Sản phẩm khác với hình ảnh hoặc thiếu các bộ phận đi kèm." },
    { id: "SCAM", label: "Dấu hiệu lừa đảo", description: "Người bán có hành vi gian lận hoặc không gửi hàng đúng loại." },
    { id: "OTHER", label: "Lý do khác", description: "Các vấn đề khác không thuộc danh mục trên." }
];

const listingReportReasons = [
    { id: "FAKE_PRODUCT", label: "Hàng giả / Hàng nhái", description: "Sản phẩm có dấu hiệu không chính hãng, giả mạo thương hiệu." },
    { id: "WRONG_PRICE", label: "Giá không đúng thực tế", description: "Hình ảnh hoặc mô tả không khớp với thực tế xe." },
    { id: "SCAM", label: "Lừa đảo / Đa cấp", description: "Tin đăng có dấu hiệu lừa tiền cọc hoặc nội dung không lành mạnh." },
    { id: "SPAM", label: "Tin trùng lặp", description: "Xe này đã được đăng nhiều lần bởi cùng một người hoặc người khác." },
    { id: "INAPPROPRIATE", label: "Nội dung không phù hợp", description: "Nội dung bài viết vi phạm chuẩn mực cộng đồng." },
    { id: "OTHER", label: "Lý do khác", description: "Các vấn đề khác không thuộc danh mục trên." }
];

export function OrderReport() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if reporting a listing or an order
    const isListingReport = location.pathname.includes('/report/listing/');
    const reportReasons = isListingReport ? listingReportReasons : orderReportReasons;
    
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [video, setVideo] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (images.length >= 5) {
            toast.error("Tối đa 5 ảnh bằng chứng");
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadToCloudinary(file);
            if (result.secure_url) {
                setImages([...images, result.secure_url]);
                toast.success("Đã tải lên ảnh bằng chứng");
            }
        } catch (error) {
            toast.error("Không thể tải lên ảnh. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            if (imageInputRef.current) imageInputRef.current.value = "";
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            toast.error("Video tối đa 50MB");
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadToCloudinary(file);
            if (result.secure_url) {
                setVideo(result.secure_url);
                toast.success("Đã tải lên video bằng chứng");
            }
        } catch (error) {
            toast.error("Không thể tải lên video. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            if (videoInputRef.current) videoInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!reason || description.length < 20 || (isListingReport ? images.length < 1 : images.length < 3)) {
            toast.error(isListingReport ? "Vui lòng chọn lý do, mô tả và ít nhất 1 ảnh" : "Vui lòng hoàn thiện đầy đủ thông tin (tối thiểu 3 ảnh)");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                orderId: isListingReport ? null : parseInt(id!),
                postingId: isListingReport ? parseInt(id!) : null,
                reason: reason,
                description,
                evidenceImages: [...images, video].filter(Boolean).join(",")
            };

            await fetchBE("/user/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            setIsSuccess(true);
            toast.success("Gửi báo cáo thành công");
        } catch (error) {
            console.error("Failed to submit report", error);
            toast.error("Không thể gửi báo cáo. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] w-full flex items-center justify-center px-4 py-24 bg-[#FDFBF7]">
                <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Đã gửi báo cáo</h1>
                        <p className="text-gray-500 text-lg font-medium leading-relaxed">
                            Cảm ơn bạn đã thông báo. Đội ngũ Trọng tài sẽ xem xét minh chứng và xử lý trong vòng 24-48h làm việc.
                        </p>
                    </div>
                    <div className="pt-8">
                        <button 
                            onClick={() => isListingReport ? navigate(`/listing/${id}`) : navigate(`/account/buyer/order/${id}`)}
                            className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-500 bg-gray-900 rounded-full hover:bg-gray-800 active:scale-95 shadow-xl hover:shadow-gray-200"
                        >
                            {isListingReport ? "Quay lại tin đăng" : "Quay lại đơn hàng"}
                            <div className="ml-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#FDFBF7] py-24 px-4 overflow-hidden selection:bg-gray-900 selection:text-white">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Hidden File Inputs */}
            <input 
                type="file" 
                ref={imageInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />
            <input 
                type="file" 
                ref={videoInputRef} 
                onChange={handleVideoUpload} 
                accept="video/*" 
                className="hidden" 
            />

            <div className="max-w-4xl mx-auto space-y-12 relative z-10 font-['Inter',sans-serif]">
                {/* Header Section */}
                <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <button 
                        onClick={() => navigate(-1)}
                        className="group flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em]"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Quay lại
                    </button>
                    <div className="space-y-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-4">
                            <ShieldAlert className="w-3 h-3 mr-2" />
                            Security & Trust Center
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                            Báo cáo <span className="text-red-500">{isListingReport ? "Tin đăng" : "Đơn hàng"}</span>
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl pt-2 leading-relaxed">
                            Mã {isListingReport ? "Tin" : "Đơn"}: <span className="text-gray-900 font-bold">#{id}</span>. Vui lòng cung cấp minh chứng xác thực để chúng tôi hỗ trợ bạn tốt nhất.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
                        <div className="p-2 bg-gray-900/[0.02] ring-1 ring-black/5 rounded-[2.5rem] shadow-sm">
                            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
                                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">1</div>
                                    Chọn lý do báo cáo
                                </h2>
                                <div className="space-y-4">
                                    {reportReasons.map((item) => (
                                        <label 
                                            key={item.id}
                                            className={`group relative flex items-center p-5 rounded-3xl border-2 transition-all cursor-pointer ${reason === item.id ? "border-gray-900 bg-gray-50/50 shadow-md scale-[1.02]" : "border-gray-100 hover:border-gray-200"}`}
                                        >
                                            <input type="radio" name="reason" value={item.id} checked={reason === item.id} onChange={(e) => setReason(e.target.value)} className="sr-only" />
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{item.label}</p>
                                                <p className="text-sm text-gray-500 mt-1 leading-snug">{item.description}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${reason === item.id ? "border-gray-900 bg-gray-900" : "border-gray-200"}`}>
                                                {reason === item.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-2 bg-gray-900/[0.02] ring-1 ring-black/5 rounded-[2.5rem] shadow-sm">
                            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
                                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">2</div>
                                    Mô tả chi tiết
                                </h2>
                                <textarea 
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Vui lòng mô tả cụ thể tình trạng bạn gặp phải (tối thiểu 20 ký tự)..."
                                    className="w-full min-h-[200px] bg-gray-50 border-0 rounded-[2rem] p-6 focus:ring-4 focus:ring-gray-900/5 transition-all text-gray-900 placeholder:text-gray-400 font-medium resize-none"
                                />
                                <div className="mt-4 flex items-center text-xs font-bold text-gray-400 tracking-widest uppercase">
                                    <AlertCircle className="w-3 h-3 mr-2" />
                                    {description.length} / 500 ký tự (Min: 20)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
                        <div className="p-2 bg-gray-900/[0.02] ring-1 ring-black/5 rounded-[2.5rem] shadow-sm">
                            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
                                <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">3</div>
                                    Ảnh bằng chứng
                                </h2>
                                <p className="text-sm text-gray-500 font-medium mb-6">Tải lên tối thiểu <span className="text-red-500 font-bold">{isListingReport ? "1 ảnh" : "3 ảnh"}</span> chi tiết.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="group relative aspect-square rounded-3xl overflow-hidden bg-gray-50 ring-1 ring-black/5">
                                            <img src={img} alt="Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <button 
                                            onClick={() => imageInputRef.current?.click()} 
                                            disabled={isUploading}
                                            className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-gray-900 hover:bg-gray-50 transition-all group disabled:opacity-50"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                                {isUploading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /> : <Camera className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                                                {isUploading ? "Đang tải..." : "Thêm ảnh"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-2 bg-gray-900/[0.02] ring-1 ring-black/5 rounded-[2.5rem] shadow-sm">
                            <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
                                <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs">4</div>
                                    Video (Tùy chọn)
                                </h2>
                                <p className="text-sm text-gray-500 font-medium mb-6">Giúp xác thực nhanh hơn.</p>
                                {video ? (
                                    <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-video ring-1 ring-black/5">
                                        <video src={video} className="w-full h-full object-cover opacity-80" autoPlay loop muted />
                                        <button onClick={() => setVideo(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"><X className="w-5 h-5" /></button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => videoInputRef.current?.click()} 
                                        disabled={isUploading}
                                        className="w-full py-12 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:border-gray-900 hover:bg-gray-50 transition-all group disabled:opacity-50"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            {isUploading ? <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" /> : <UploadCloud className="w-8 h-8 text-gray-300 group-hover:text-gray-900 transition-colors" />}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                                                {isUploading ? "Đang xử lý video..." : "Tải lên Video"}
                                            </p>
                                            <p className="text-[10px] font-medium text-gray-300 mt-1 uppercase">MP4, MOV (Max 50MB)</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading || !reason || description.length < 20 || (isListingReport ? images.length < 1 : images.length < 3)}
                                className={`w-full group relative flex items-center justify-center px-10 py-6 font-black text-white rounded-full transition-all duration-500 shadow-2xl active:scale-95
                                    ${isSubmitting || isUploading || !reason || description.length < 20 || (isListingReport ? images.length < 1 : images.length < 3)
                                        ? "bg-gray-200 cursor-not-allowed shadow-none" 
                                        : "bg-red-500 hover:bg-red-600 hover:shadow-red-200"
                                    }
                                `}
                            >
                                {isSubmitting ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <>Gửi báo cáo bảo mật<div className="ml-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform"><Send className="w-4 h-4" /></div></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
