import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    ClipboardList,
    Handshake,
    ShieldCheck,
    Calendar,
    ChevronRight,
    ArrowLeft,
    Loader2,
    XCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { fetchBE } from '../lib/api';
import { toast } from 'sonner';

export const PricingInspection: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const postingId = searchParams.get('postingId') || '0';
    const packageId = searchParams.get('packageId') || '0';
    const duration = searchParams.get('duration') || '0';
    const baseAmount = parseInt(searchParams.get('amount') || '0');

    const [withInspection, setWithInspection] = useState<boolean | null>(null);
    const INSPECTION_FEE = 99000;

    const handleSubmit = async (isInspected: boolean) => {
        setIsSubmitting(true);
        try {
            const pendingListing = JSON.parse(localStorage.getItem('pendingListing') || '{}');
            let finalPostingId = postingId;

            if (finalPostingId && finalPostingId !== '0') {
                // Scenario A: Existing draft/post - Update it
                await fetchBE(`/seller/postings/${finalPostingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ IsInspected: isInspected })
                });

                // Lock the pricing for this existing post
                if (packageId !== '0') {
                    await fetchBE(`/seller/postings/${finalPostingId}/lock-pricing`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            packageId: Number(packageId),
                            durationDays: Number(duration)
                        })
                    });
                }
            } else {
                // Scenario B: New post (rare if coming from Review page)
                const payload = {
                    title: pendingListing.title,
                    description: pendingListing.description,
                    price: Number(pendingListing.price?.toString().replace(/\./g, '') || 0),
                    location: pendingListing.location,
                    categoryId: Number(pendingListing.categoryId),
                    brand: pendingListing.brand,
                    condition: pendingListing.condition,
                    bicycle: {
                        model: pendingListing.specs?.model || "",
                        year: Number(pendingListing.year) || new Date().getFullYear(),
                        specs: pendingListing.specs || {}
                    },
                    packageId: packageId !== '0' ? Number(packageId) : pendingListing.packageId,
                    duration: duration !== '0' ? Number(duration) : pendingListing.duration,
                    isInspected: isInspected,
                    imageUrls: pendingListing.images || [],
                    videoUrls: pendingListing.videos || []
                };

                const response = await fetchBE('/seller/postings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.statusCode === 200 || response.statusCode === 201) {
                    finalPostingId = response.data.id;
                } else {
                    throw new Error(response.message || "Đăng tin thất bại");
                }
            }

            toast.success("Đã xác nhận thông tin gói đăng tin!");
            
            // Clear drafts
            localStorage.removeItem('sell_draft');
            localStorage.removeItem('pendingListing');
            
            // Navigate to checkout or overview
            if (baseAmount > 0 || (isInspected && INSPECTION_FEE > 0)) {
                const finalAmount = isInspected ? baseAmount + INSPECTION_FEE : baseAmount;
                const desc = `Thanh toan VIP posting ${finalPostingId}`;
                navigate(`/checkout?type=vip&packageId=${packageId}&duration=${duration}&amount=${finalAmount}&postingId=${finalPostingId}&withInspection=${isInspected}&desc=${encodeURIComponent(desc)}`);
            } else {
                navigate('/account/seller/my-post');
            }
        } catch (error: any) {
            console.error("Failed to submit posting", error);
            toast.error(error.message || "Đã có lỗi xảy ra khi xử lý. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full flex justify-center items-center py-12 bg-gray-50 min-h-[80vh]">
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 max-w-3xl w-full mx-4">
                <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">Dịch vụ kiểm định xe chuyên gia</h1>
                <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">Nâng cao độ uy tín cho bài đăng của bạn. Tăng cơ hội bán xe nhanh gấp 3 lần với chứng nhận chất lượng từ Chợ Xe Đạp.</p>

                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    {/* Không kiểm định */}
                    <div
                        className={`flex-1 border-2 rounded-2xl p-6 cursor-pointer transition-all ${withInspection === false ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setWithInspection(false)}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <XCircle className={`w-10 h-10 ${withInspection === false ? 'text-gray-900' : 'text-gray-400'}`} />
                            <div className="text-right">
                                <p className="font-bold text-lg text-gray-900">0 đ</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Tự bán cơ bản</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2"><span>•</span> Người mua tự đánh giá xe</li>
                            <li className="flex gap-2"><span>•</span> Phù hợp với xe giá trị thấp</li>
                            <li className="flex gap-2"><span>•</span> Không có huy hiệu chứng nhận</li>
                        </ul>
                    </div>

                    {/* Có kiểm định */}
                    <div
                        className={`flex-1 border-2 rounded-2xl p-6 cursor-pointer transition-all relative overflow-hidden ${withInspection === true ? 'border-[#2E7D32] bg-green-50 shadow-md' : 'border-green-100 hover:border-green-300'}`}
                        onClick={() => setWithInspection(true)}
                    >
                        {withInspection === true && (
                            <div className="absolute top-0 right-0 bg-[#2E7D32] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                Khuyên dùng
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ShieldCheck className={`w-8 h-8 ${withInspection === true ? 'text-[#2E7D32]' : 'text-green-600'}`} />
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-[#2E7D32]">{INSPECTION_FEE.toLocaleString()} đ</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#2E7D32]">Kiểm định chuyên gia</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex gap-2 font-medium"><span>✓</span> Kỹ thuật viên đến tận nhà kiểm tra 35 hạng mục</li>
                            <li className="flex gap-2 font-medium"><span>✓</span> Cấp huy hiệu "Đã kiểm định" nổi bật</li>
                            <li className="flex gap-2 font-medium"><span>✓</span> Hỗ trợ bảo hành 3 tháng cho người mua</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl mb-8">
                    <div className="flex justify-between mb-3 text-gray-600">
                        <span>Phí gói đăng tin (VIP):</span>
                        <span className="font-semibold text-gray-900">{baseAmount.toLocaleString()} đ</span>
                    </div>
                    {withInspection && (
                        <div className="flex justify-between mb-3 text-[#2E7D32] font-medium">
                            <span>Phí kiểm định xe:</span>
                            <span>+{INSPECTION_FEE.toLocaleString()} đ</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-4 mt-2">
                        <span className="font-bold text-gray-900 text-lg">Tổng thanh toán:</span>
                        <span className="font-bold text-2xl text-red-600">
                            {((withInspection ? INSPECTION_FEE : 0) + baseAmount).toLocaleString()} đ
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="sm:w-1/3 h-14 rounded-xl font-semibold border-gray-300"
                        onClick={() => navigate(-1)}
                    >
                        Trở lại
                    </Button>
                    <Button
                        size="lg"
                        className="sm:w-2/3 h-14 rounded-xl font-bold text-lg bg-[#2E7D32] hover:bg-[#1B5E20]"
                        disabled={withInspection === null || isSubmitting}
                        onClick={() => handleSubmit(withInspection!)}
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Tiếp hành đăng tin
                    </Button>
                </div>
            </div>
        </div>
    );
};
