import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload, Camera, MapPin, Bike, Tag, AlertCircle, Trash2, Video, Play, Loader2, Sparkles } from "lucide-react";
import { SellToolbar } from "../components/SellToolbar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { metadataApi, postingApi, aiApi } from "@/lib/api";
import { uploadToCloudinary } from "@/services/cloudinary";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

import { Combobox } from "../components/ui/combobox";
import { Helmet } from "react-helmet-async";

// UI Components
const PriceSuggestionUI = ({ suggestion }: { suggestion: string }) => {
    const lines = suggestion.split('\n');
    const priceLine = lines.find(l => l.toUpperCase().startsWith('GIÁ:'));
    const reasons = lines.filter(l => l.trim().startsWith('-'));

    return (
        <div className="mt-4 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                <Sparkles size={18} />
                <span>Gợi ý từ AI (Grounding)</span>
            </div>
            
            {priceLine && (
                <div className="text-xl font-black text-blue-900 mb-3">
                    {priceLine.replace(/GIÁ:/i, '').trim()}
                </div>
            )}
            
            {reasons.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Lý do từ thị trường:</p>
                    <ul className="space-y-1.5">
                        {reasons.map((r, i) => (
                            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                <span>{r.replace(/^-/, '').trim()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const CardSection = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8 overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
            {Icon && <div className="p-2 bg-green-50 rounded-xl text-[#2E9147]"><Icon size={24} /></div>}
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

const FormLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <label className="text-sm md:text-base font-semibold text-gray-700 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
);

export function SellPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const postingIdToEdit = searchParams.get("id");
    const { user } = useAuth();

    // Metadata states
    const [brands, setBrands] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [materials, setMaterials] = useState<string[]>([]);
    const [brakeTypes, setBrakeTypes] = useState<string[]>([]);
    const [isMetadataLoading, setIsMetadataLoading] = useState(true);

    const [isAiChecking, setIsAiChecking] = React.useState(false);
    const [isSuggestingContent, setIsSuggestingContent] = React.useState(false);
    const [isSuggestingPrice, setIsSuggestingPrice] = React.useState(false);
    const [priceSuggestion, setPriceSuggestion] = React.useState<string | null>(null);
    const [aiViolations, setAiViolations] = React.useState<string[]>([]);

    // Load draft from localStorage
    const getSavedDraft = () => {
        try {
            const saved = localStorage.getItem("sell_draft");
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            
            // Nếu đang edit (có postingIdToEdit), chỉ trả về draft nếu ID khớp
            if (postingIdToEdit) {
                if (parsed.id?.toString() === postingIdToEdit.toString()) {
                    return parsed;
                }
                return null;
            }
            
            // Nếu đang đăng mới, chỉ trả về draft không có ID
            if (!parsed.id) return parsed;
            return null;
        } catch (e) {
            console.error("Failed to load draft", e);
            return null;
        }
    };

    const draft = getSavedDraft();

    // Lưu cả File để upload và URL để preview
    const [imageFiles, setImageFiles] = React.useState<File[]>([]);
    const [videoFiles, setVideoFiles] = React.useState<File[]>([]);
    const [images, setImages] = React.useState<string[]>(draft?.images || []);
    const [videos, setVideos] = React.useState<string[]>(draft?.videos || []);
    
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [currentStep, _setCurrentStep] = React.useState(1);
    const [isDataLoaded, setIsDataLoaded] = React.useState(false);


    // Form states
    const [title, setTitle] = React.useState(draft?.title || "");
    const [brand, setBrand] = React.useState(draft?.brand || "");
    const [categoryId, setCategoryId] = React.useState(draft?.categoryId || "");
    const [condition, setCondition] = React.useState(draft?.condition || "");
    const [year, setYear] = React.useState(draft?.year || "");
    const [description, setDescription] = React.useState(draft?.description || "");
    const [price, setPrice] = React.useState(draft?.price || "");
    const [location, setLocation] = React.useState(draft?.location || "");

    const [specs, setSpecs] = React.useState({
        model: "",
        color: "",
        frameMaterial: "",
        brakeType: "",
        fork: "",
        cassette: "",
        crankset: "",
        shifters: "",
        frontDerailleur: "",
        rearDerailleur: "",
        speeds: "",
        rims: "",
        wheelSize: "",
        tires: "",
        internalRouting: "Có",
        frameSize: ""
    });

    const handleSpecChange = (field: string, value: string) => {
        setSpecs((prev: any) => ({ ...prev, [field]: value }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const number = e.target.value.replace(/\D/g, "");
        setPrice(number.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    };

    const handleSuggestContent = async () => {
        if (!categoryId) {
            toast.error("Vui lòng chọn 'Dòng xe' trước khi dùng AI gợi ý.");
            return;
        }
        
        setIsSuggestingContent(true);
        try {
            const categoryName = categories.find(c => c.id.toString() === categoryId.toString())?.name || "Xe đạp";
            
            // Thu thập toàn bộ ngữ cảnh sản phẩm hiện có
            const productContext = [
                `Thương hiệu: ${brand || 'Chưa rõ'}`,
                `Model: ${specs.model || 'Chưa rõ'}`,
                `Năm sản xuất: ${year || 'Chưa rõ'}`,
                `Tình trạng: ${condition || 'Chưa rõ'}`,
                `Kích thước khung: ${specs.frameSize || 'Chưa rõ'}`,
                `Chất liệu: ${specs.frameMaterial || 'Chưa rõ'}`,
                `Phanh: ${specs.brakeType || 'Chưa rõ'}`,
                `Màu sắc: ${specs.color || 'Chưa rõ'}`
            ].join(', ');

            const response = await aiApi.suggestContent(categoryName, description, productContext);
            if (response && response.suggestion) {
                setDescription(response.suggestion);
                toast.success(description ? "Đã tối ưu hóa nội dung dựa trên thông số" : "Đã tạo mô tả chi tiết từ thông số xe");
            }
        } catch (error) {
            console.error("AI Suggest Content Error:", error);
            toast.error("Không thể lấy gợi ý nội dung từ AI.");
        } finally {
            setIsSuggestingContent(false);
        }
    };

    const handleSuggestPrice = async () => {
        if (!brand || !specs.model) {
            toast.error("Vui lòng nhập Thương hiệu và Model để AI định giá chính xác.");
            return;
        }

        setIsSuggestingPrice(true);
        setPriceSuggestion(null);
        try {
            const categoryName = categories.find(c => c.id.toString() === categoryId.toString())?.name || "Xe đạp";
            const response = await aiApi.suggestPrice(brand, specs.model, year, categoryName, condition);
            if (response && response.suggestion) {
                setPriceSuggestion(response.suggestion);
                toast.success("Đã lấy thông tin giá thị trường");
            }
        } catch (error) {
            console.error("AI Suggest Price Error:", error);
            toast.error("Không thể lấy gợi ý giá từ AI.");
        } finally {
            setIsSuggestingPrice(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (images.length + filesArray.length > 10) {
                setErrorMsg("Bạn chỉ có thể đăng tối đa 10 hình ảnh.");
                return;
            }
            setImageFiles(prev => [...prev, ...filesArray]);
            const newUrls = filesArray.map(file => URL.createObjectURL(file));
            setImages((prev) => [...prev, ...newUrls]);
            setErrorMsg(null);
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 100 * 1024 * 1024) {
                setErrorMsg("Video quá lớn! Vui lòng chọn video dưới 100MB.");
                return;
            }
            setVideoFiles(prev => [...prev, file]);
            const url = URL.createObjectURL(file);
            setVideos((prev) => [...prev, url]);
            setErrorMsg(null);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index: number) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
        setVideoFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Auto-save draft
    useEffect(() => {
        if (isDataLoaded && !postingIdToEdit) {
            const draftData = {
                id: null,
                title, brand, categoryId, condition, year, description, price, location, specs, images, videos
            };
            localStorage.setItem("sell_draft", JSON.stringify(draftData));
        }
    }, [title, brand, categoryId, condition, year, description, price, location, specs, images, videos, isDataLoaded, postingIdToEdit]);

    // Initialize data (Metadata + Draft or Edit)
    useEffect(() => {
        const initialize = async () => {
            setIsMetadataLoading(true);
            try {
                // 1. Fetch Metadata
                const [b, c, cl, m, bt, locs] = await Promise.all([
                    metadataApi.getBrands().catch(() => [] as string[]),
                    metadataApi.getCategories().catch(() => [] as any[]),
                    metadataApi.getColors().catch(() => [] as any[]),
                    metadataApi.getMaterials().catch(() => [] as any[]),
                    metadataApi.getBrakeTypes().catch(() => [] as any[]),
                    metadataApi.getLocations().catch(() => [] as string[])
                ]);

                setBrands(b && b.length > 0 ? b : []);
                setLocations(locs && locs.length > 0 ? locs : ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"]);
                setCategories(c && c.length > 0 ? c : []);
                
                if (!c || c.length === 0) {
                    toast.error("Không thể tải danh sách Dòng xe từ hệ thống. Vui lòng tải lại trang.");
                }
                setColors(cl ? cl.map((item: any) => item.name || item) : []);
                setMaterials(m ? m.map((item: any) => item.name || item) : []);
                setBrakeTypes(bt ? bt.map((item: any) => item.name || item) : []);

                // 2. Fetch Posting Data if editing
                if (postingIdToEdit) {
                    const response = await postingApi.getById(postingIdToEdit);
                    if (response) {
                        setTitle(response.title || "");
                        setPrice(response.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "");
                        setDescription(response.description || "");
                        setLocation(response.location || "Hồ Chí Minh");
                        
                        const bike = response.bicycle || response.Bicycle;
                        if (bike) {
                            setBrand(bike.brand || bike.Brand || "");
                            setCategoryId(bike.categoryId?.toString() || bike.CategoryId?.toString() || "");
                            setCondition(bike.condition || bike.Condition || "");
                            setYear(bike.year?.toString() || bike.Year?.toString() || "");
                            setSpecs({
                                model: bike.model || bike.Model || "",
                                color: bike.color || bike.Color || "",
                                frameMaterial: bike.frameMaterial || bike.FrameMaterial || "",
                                brakeType: bike.brakeSystem || bike.BrakeSystem || "",
                                fork: bike.fork || bike.Fork || "",
                                cassette: bike.cassette || bike.Cassette || "",
                                crankset: bike.crankset || bike.Crankset || "",
                                shifters: bike.shifters || bike.Shifters || "",
                                frontDerailleur: bike.frontDerailleur || bike.FrontDerailleur || "",
                                rearDerailleur: bike.rearDerailleur || bike.RearDerailleur || "",
                                speeds: bike.speeds || bike.Speeds || "",
                                rims: bike.rims || bike.Rims || "",
                                wheelSize: bike.wheelSize || bike.WheelSize || "",
                                tires: bike.tires || bike.Tires || "",
                                internalRouting: bike.internalRouting || bike.InternalRouting || "Có",
                                frameSize: bike.frameSize || bike.FrameSize || ""
                            });
                        }
                        
                        if (response.media) {
                            const imgs = response.media.filter((m: any) => m.type === 'IMAGE' || m.type === 0).map((m: any) => m.url);
                            const vids = response.media.filter((m: any) => m.type === 'VIDEO' || m.type === 1).map((m: any) => m.url);
                            setImages(imgs);
                            setVideos(vids);
                        }
                    }
                } 
                else {
                    const savedDraft = getSavedDraft();
                    if (savedDraft) {
                        setTitle(savedDraft.title || "");
                        setBrand(savedDraft.brand || "");
                        setCategoryId(savedDraft.categoryId?.toString() || "");
                        setCondition(savedDraft.condition || "");
                        setYear(savedDraft.year?.toString() || "");
                        setDescription(savedDraft.description || "");
                        setPrice(savedDraft.price || "");
                        setLocation(savedDraft.location || "Hồ Chí Minh");
                        if (savedDraft.specs) setSpecs(savedDraft.specs);
                        setImages(savedDraft.images || []);
                        setVideos(savedDraft.videos || []);
                    }
                }
            } catch (error) {
                console.error("Initialization error", error);
                if (postingIdToEdit) toast.error("Không thể tải thông tin tin đăng");
            } finally {
                setIsMetadataLoading(false);
                setIsDataLoaded(true);
            }
        };

        initialize();
    }, [postingIdToEdit]);

    const MIN_YEAR = 1990;
    const MAX_YEAR = new Date().getFullYear();
    const numericYear = parseInt(year) || 0;
    const isYearValid = year === "" || (numericYear >= MIN_YEAR && numericYear <= MAX_YEAR);

    const MIN_PRICE = 500000;
    const numericPrice = parseInt(price.replace(/\./g, "")) || 0;
    const isPriceValid = numericPrice >= MIN_PRICE;

    const hasImages = images.length >= 3;
    const hasVideo = videos.length >= 1;
    const isFormValid = title.trim() !== "" && 
                       brand !== "" && 
                       categoryId !== "" && 
                       condition !== "" && 
                       description.trim() !== "" && 
                       price !== "" && 
                       isPriceValid && 
                       isYearValid && 
                       hasImages && 
                       hasVideo;

    const handleContinue = async () => {
        if (!isFormValid) return;
        setErrorMsg(null);

        try {
            const draftData = {
                id: postingIdToEdit,
                title, brand, categoryId, condition, year, description, price, location, specs,
                images,
                videos,
                categoryId_numeric: parseInt(categoryId)
            };
            localStorage.setItem("pendingListing", JSON.stringify(draftData));
            navigate("/sell/review", { 
                state: { 
                    imageFiles, 
                    videoFiles 
                } 
            });
        } catch (err: any) {
            console.error('Navigate error:', err);
            setErrorMsg(`Lỗi: ${err.message || 'Không thể tiếp tục. Vui lòng thử lại.'}`);
        }
    };

    if (isMetadataLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" /></div>;
    }

    return (
        <div className="w-full flex flex-col items-center bg-gray-50/50 min-h-screen font-['Inter',sans-serif]">
            <Helmet>
                <title>Đăng tin bán xe</title>
            </Helmet>
            <SellToolbar currentStep={currentStep} />

            <div className="w-full max-w-[1440px] px-4 md:px-8 py-10 md:py-16">
                <div className="max-w-5xl mx-auto">
                    {isSubmitting && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center text-white">
                            <Loader2 className="w-16 h-16 animate-spin mb-4" />
                            <h2 className="text-2xl font-bold text-center px-4">
                                {isAiChecking ? "Đang kiểm duyệt nội dung bằng AI..." : "Đang tải ảnh và tạo tin đăng..."}
                            </h2>
                            <p className="mt-2 text-gray-200">Vui lòng không đóng trình duyệt</p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Chào mừng bạn!</h2>
                            <p className="text-lg text-gray-500 max-w-2xl">Đưa chiếc xe của bạn đến gần hơn với những người yêu xe.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-xl"
                            onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xóa bản nháp và làm lại từ đầu?")) {
                                    localStorage.removeItem("sell_draft");
                                    localStorage.removeItem("pendingListing");
                                    window.location.reload();
                                }
                            }}
                        >
                            <Trash2 size={18} className="mr-2" /> Xóa bản nháp
                        </Button>
                    </div>

                    <CardSection title="Hình ảnh xe đạp" icon={Camera}>
                        <p className="text-sm md:text-base text-gray-500 mb-6 -mt-4">
                            Vui lòng cung cấp <span className="font-bold text-amber-600 underline">ít nhất 3 hình ảnh và 1 video</span> thực tế của xe.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {videos.map((vid, idx) => (
                                <div key={`vid-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500 group shadow-sm">
                                    <video src={vid} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => removeVideo(idx)} className="bg-white/90 text-red-600 rounded-full p-2.5 shadow-lg"><Trash2 size={20} /></button>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Video</div>
                                </div>
                            ))}

                            {images.map((img, idx) => (
                                <div key={`img-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => removeImage(idx)} className="bg-white/90 text-red-600 rounded-full p-2.5 shadow-lg"><Trash2 size={20} /></button>
                                    </div>
                                    {idx === 0 && <div className="absolute top-2 left-2 bg-[#2E9147] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Ảnh bìa</div>}
                                </div>
                            ))}

                            {videos.length < 1 && (
                                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all">
                                    <Video className="w-6 h-6 text-blue-400 mb-2" />
                                    <span className="text-xs font-semibold text-blue-500">Thêm video</span>
                                    <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                                </label>
                            )}

                            {images.length < 10 && (
                                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#2E9147] hover:bg-green-50/30 cursor-pointer transition-all">
                                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs font-semibold text-gray-500">Thêm ảnh</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </CardSection>

                    <CardSection title="Thông số kỹ thuật (Gợi ý)" icon={Bike}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-3">
                                <FormLabel label="Tiêu đề tin đăng" required />
                                <Input 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="Ví dụ: Xe đạp Trek Marlin 7 đời 2023 mới 98%" 
                                    className={`h-12 rounded-xl ${!title && "border-red-200"}`}
                                />
                            </div>
                            <div>
                                <FormLabel label="Model xe" />
                                <Input value={specs.model} onChange={(e) => handleSpecChange("model", e.target.value)} placeholder="Ví dụ: Marlin 7" className="h-12 rounded-xl" />
                            </div>
                            <div>
                                <FormLabel label="Thương hiệu" required />
                                <Combobox options={brands} value={brand} onChange={setBrand} placeholder="Chọn hoặc nhập thương hiệu" />
                            </div>
                            <div>
                                <FormLabel label="Màu sắc" />
                                <Combobox options={colors} value={specs.color} onChange={(val) => handleSpecChange("color", val)} placeholder="Chọn hoặc nhập màu" />
                            </div>
                            <div>
                                <FormLabel label="Chất liệu khung" />
                                <Combobox options={materials} value={specs.frameMaterial} onChange={(val) => handleSpecChange("frameMaterial", val)} placeholder="Chọn hoặc nhập chất liệu" />
                            </div>
                            <div>
                                <FormLabel label="Loại phanh" />
                                <Combobox options={brakeTypes} value={specs.brakeType} onChange={(val) => handleSpecChange("brakeType", val)} placeholder="Chọn hoặc nhập loại phanh" />
                            </div>
                            <div>
                                <FormLabel label="Kích thước khung" />
                                <Select value={specs.frameSize} onValueChange={(val) => handleSpecChange("frameSize", val)}>
                                    <SelectTrigger className="h-12 rounded-xl text-left">
                                        <SelectValue placeholder="Chọn kích thước phù hợp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="XS">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Size XXS - XS (Dưới 155cm)</span>
                                                <span className="text-[10px] text-gray-500">MTB: 14-15" | Road: 42-47cm</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="S">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Size S (155 - 165cm)</span>
                                                <span className="text-[10px] text-gray-500">MTB: 15-16" | Road: 48-52cm</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="M">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Size M (165 - 175cm)</span>
                                                <span className="text-[10px] text-gray-500">MTB: 17-18" | Road: 53-55cm</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="L">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Size L (175 - 183cm)</span>
                                                <span className="text-[10px] text-gray-500">MTB: 19-20" | Road: 56-58cm</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="XL">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Size XL - XXL (Trên 183cm)</span>
                                                <span className="text-[10px] text-gray-500">MTB: 21-22" | Road: 59-62cm</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <FormLabel label="Năm sản xuất" />
                                <Input 
                                    value={year} 
                                    onChange={(e) => setYear(e.target.value)} 
                                    type="number" 
                                    placeholder="Ví dụ: 2022" 
                                    className={`h-12 rounded-xl ${year && !isYearValid ? "border-red-500 bg-red-50" : ""}`}
                                />
                            </div>
                            <div>
                                <FormLabel label="Dòng xe" required />
                                <Select onValueChange={setCategoryId} value={categoryId}>
                                    <SelectTrigger className={`h-12 rounded-xl ${!categoryId && "border-red-200"}`}><SelectValue placeholder="Chọn dòng xe" /></SelectTrigger>
                                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <FormLabel label="Tình trạng xe" required />
                                <Select onValueChange={setCondition} value={condition}>
                                    <SelectTrigger className={`h-12 rounded-xl ${!condition && "border-red-200"}`}><SelectValue placeholder="Chọn tình trạng" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NEW">Mới 100% (New)</SelectItem>
                                        <SelectItem value="LIKE_NEW">Như mới 99% (Like New)</SelectItem>
                                        <SelectItem value="GOOD">Tốt 80-95% (Good)</SelectItem>
                                        <SelectItem value="FAIR">Khá 70-80% (Fair)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-50 pt-8">
                            <div className="flex items-center justify-between mb-2">
                                <FormLabel label="Mô tả chi tiết" required />
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-[#2E9147] hover:text-[#257a3b] hover:bg-green-50 rounded-lg gap-2"
                                    onClick={handleSuggestContent}
                                    disabled={isSuggestingContent}
                                >
                                    {isSuggestingContent ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {description ? "Tối ưu mô tả" : "Gợi ý nội dung"}
                                </Button>
                            </div>
                            <Textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder="Hãy mô tả chi tiết về tình trạng xe, các phụ tùng đã thay thế, lịch sử bảo dưỡng..." 
                                className={`min-h-[150px] rounded-2xl p-4 resize-none ${!description && "border-red-200"}`}
                            />
                        </div>
                    </CardSection>

                    <CardSection title="Giá & Khu vực" icon={Tag}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel label="Giá bán mong muốn (VNĐ)" required />
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg gap-2"
                                        onClick={handleSuggestPrice}
                                        disabled={isSuggestingPrice}
                                    >
                                        {isSuggestingPrice ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        Báo giá thị trường
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input 
                                        value={price} 
                                        onChange={handlePriceChange} 
                                        type="text" 
                                        inputMode="numeric" 
                                        placeholder="Ví dụ: 15.000.000" 
                                        className={`h-14 rounded-xl pl-12 text-xl font-bold text-[#2E9147] ${price && !isPriceValid ? "border-red-500 bg-red-50" : ""}`} 
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₫</span>
                                </div>
                                {priceSuggestion && <PriceSuggestionUI suggestion={priceSuggestion} />}
                            </div>
                            <div>
                                <FormLabel label="Khu vực bán" required />
                                <Select onValueChange={setLocation} value={location}>
                                    <SelectTrigger className="h-14 rounded-xl bg-white"><SelectValue placeholder="Khu vực" /></SelectTrigger>
                                    <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardSection>

                    <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-10 border-t border-gray-200">
                        <Button className={`w-full md:w-auto px-12 h-14 rounded-2xl text-lg font-bold transition-all ${isFormValid ? "bg-[#2E9147] hover:bg-[#257a3b] shadow-lg" : "bg-gray-300 text-gray-500"}`} onClick={handleContinue} disabled={!isFormValid || isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang đăng tin...</> : "Đăng tin ngay"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
