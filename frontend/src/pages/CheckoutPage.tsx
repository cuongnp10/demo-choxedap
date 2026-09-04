import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SePayCheckout } from '../components/SePayCheckout';
import { userApi, paymentsApi } from '../lib/api';
import { Loader2, Receipt, ShieldCheck, Tag, Info, Gift, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export const CheckoutPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // PHÒNG THỦ: Sửa lỗi URL dính liền (checkoutpaymentCode=...)
    useEffect(() => {
        const fullUrl = window.location.href;
        if (fullUrl.includes('checkoutpaymentCode=')) {
            const correctedUrl = fullUrl.replace('checkoutpaymentCode=', 'checkout?paymentCode=');
            window.location.href = correctedUrl;
        }
    }, []);

    // Đọc các tham số từ URL
    const paymentCode = searchParams.get('paymentCode');
    const type = searchParams.get('type'); // full, deposit, membership, vip
    const postingId = parseInt(searchParams.get('postingId') || '0');
    const planId = parseInt(searchParams.get('planId') || '0');
    const packageId = parseInt(searchParams.get('packageId') || '0');
    const amountParam = parseInt(searchParams.get('amount') || '0');
    const desc = searchParams.get('desc') || '';
    const withInspection = searchParams.get('withInspection') === 'true';

    const [activeMembership, setActiveMembership] = useState<any>(null);
    const [isLoadingMembership, setIsLoadingMembership] = useState(false);
    const [paymentDetail, setPaymentDetail] = useState<any>(null);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);

    useEffect(() => {
        const fetchMembership = async () => {
            setIsLoadingMembership(true);
            try {
                const res = await userApi.getActiveMembership();
                setActiveMembership(res);
            } catch (e) {
                console.error("Failed to fetch membership", e);
            } finally {
                setIsLoadingMembership(false);
            }
        };
        fetchMembership();
    }, []);

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            if (!paymentCode) return;
            setIsLoadingPayment(true);
            try {
                const res = await paymentsApi.getStatus(paymentCode);
                setPaymentDetail(res);
            } catch (e) {
                console.error("Failed to fetch payment status", e);
            } finally {
                setIsLoadingPayment(false);
            }
        };
        fetchPaymentStatus();
    }, [paymentCode]);

    // Logic xác định Context thanh toán
    let paymentType: 'ORDER' | 'MEMBERSHIP' | 'VIP_PACKAGE' | undefined;
    let referenceId: number | undefined;
    let secondaryId: number | undefined;
    let purpose: 'DEPOSIT' | 'FULL_PAYMENT' | undefined;

    if (type === 'full' || type === 'deposit') {
        paymentType = 'ORDER';
        referenceId = postingId;
        purpose = type === 'full' ? 'FULL_PAYMENT' : 'DEPOSIT';
    } else if (type === 'membership' || (paymentDetail && paymentDetail.paymentCode?.includes('GOIHV'))) {
        paymentType = 'MEMBERSHIP';
        referenceId = planId || paymentDetail?.referenceId;
    } else if (type === 'vip' || (paymentDetail && paymentDetail.paymentCode?.includes('BANXE'))) {
        paymentType = 'VIP_PACKAGE';
        referenceId = packageId || paymentDetail?.referenceId;
        secondaryId = postingId;
    }

    // Detailed Invoice Calculation
    const POSTING_FEE = 59000;
    const INSPECTION_FEE = 99000;
    
    let subtotal = amountParam;
    let finalAmount = amountParam;

    if (paymentDetail) {
        finalAmount = paymentDetail.expectedAmount || paymentDetail.amount || 0;
    } else if (type === 'vip') {
        const adFee = amountParam - POSTING_FEE - (withInspection ? INSPECTION_FEE : 0);
        subtotal = POSTING_FEE + adFee + (withInspection ? INSPECTION_FEE : 0);
        
        if (activeMembership?.discountPercentage) {
            const discountAmount = subtotal * (activeMembership.discountPercentage / 100);
            finalAmount = subtotal - discountAmount;
        } else {
            finalAmount = subtotal;
        }
    }

    // TEST MODE: Override displayed amount if VITE_SEPAY_TEST_AMOUNT is set
    const testAmount = parseInt(import.meta.env.VITE_SEPAY_TEST_AMOUNT || '0');
    if (testAmount > 0) {
        finalAmount = testAmount;
    }

    if (isLoadingPayment) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#2E9147]" size={48} />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-gray-50/50 py-16 px-4">
            <div className="w-full max-w-5xl">
                {/* Student Project Warning Banner */}
                <div className="mb-10 p-6 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h3 className="text-xl font-black text-amber-900 tracking-tight uppercase">Cảnh báo: Dự án Sinh viên</h3>
                        <p className="text-amber-700 font-medium mt-1 leading-relaxed">
                            Đây là dự án học tập (SWP391). <span className="font-black underline decoration-amber-300">Vui lòng không thực hiện chuyển khoản tiền thật</span>. Mọi giao dịch chỉ mang tính chất minh họa tính năng kỹ thuật.
                        </p>
                    </div>
                    <div className="hidden md:block px-6 py-2 bg-white/50 rounded-2xl border border-amber-200 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        Technical Demo Only
                    </div>
                </div>

                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-green-100 text-[#2E9147] hover:bg-green-100 border-none px-4 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
                        {paymentCode ? 'Trạng thái thanh toán' : 'Bước 5: Thanh toán'}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        {paymentCode ? `Hóa đơn ${paymentCode}` : 'Xác nhận thanh toán'}
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                        {paymentCode ? 'Vui lòng thực hiện chuyển khoản theo thông tin bên dưới.' : 'Bạn đang thực hiện thanh toán an toàn qua cổng **SePay VietQR**. Tiền sẽ được chuyển trực tiếp vào tài khoản công ty.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Invoice Details */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-gray-900"><Receipt size={24} /></div>
                                <h3 className="text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h3>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {(type === 'vip' || (paymentDetail && paymentDetail.paymentCode?.includes('VIP'))) && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Tag size={18} /></div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Dịch vụ đăng tin</p>
                                                    <p className="text-xs text-gray-400 font-medium">Phí niêm yết & Gói đẩy tin</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {paymentDetail ? (paymentDetail.expectedAmount || 0).toLocaleString() : finalAmount.toLocaleString()}đ
                                            </span>
                                        </div>

                                        {withInspection && !paymentDetail && (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#2E9147]"><ShieldCheck size={18} /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">Dịch vụ kiểm định</p>
                                                        <p className="text-xs text-gray-400 font-medium">Chứng nhận xe chính chủ/tốt</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900">{INSPECTION_FEE.toLocaleString()}đ</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(type === 'membership' || (paymentDetail && paymentDetail.paymentCode?.includes('MEM'))) && (
                                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                        <p className="text-blue-700 font-bold mb-1 uppercase tracking-wider text-xs">Gói thành viên</p>
                                        <h4 className="text-2xl font-black text-blue-900 mb-2">Hội viên Chợ Xe Đạp</h4>
                                        <p className="text-blue-600/80 text-sm font-medium">Hưởng chiết khấu phí dịch vụ ưu đãi.</p>
                                    </div>
                                )}

                                {(paymentType === 'ORDER' || (paymentDetail && (paymentDetail.paymentCode?.includes('DEP') || paymentDetail.paymentCode?.includes('FULL')))) && (
                                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                        <p className="text-amber-700 font-bold mb-1 uppercase tracking-wider text-xs">Giao dịch mua xe</p>
                                        <h4 className="text-2xl font-black text-amber-900 mb-2">
                                            {paymentCode?.includes('DEP') ? 'Đặt cọc 10%' : 'Thanh toán đơn hàng'}
                                        </h4>
                                        <p className="text-amber-600/80 text-sm font-medium">Thanh toán an toàn, sàn giữ tiền trung gian.</p>
                                    </div>
                                )}

                                {paymentDetail && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-500 text-sm font-medium">Mã thanh toán:</span>
                                            <span className="font-mono font-bold text-gray-900">{paymentDetail.paymentCode}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-sm font-medium">Trạng thái:</span>
                                            <Badge className={paymentDetail.status === 'PAID' ? 'bg-green-500' : 'bg-amber-500'}>
                                                {paymentDetail.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Tổng cộng thanh toán</p>
                                    <p className="text-sm text-gray-500 italic font-medium">* Đã bao gồm VAT</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-white">{(Math.round(finalAmount)).toLocaleString()}</span>
                                    <span className="text-xl font-bold text-gray-400 ml-2">₫</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><Info size={20} /></div>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                <span className="text-gray-900 font-bold block mb-1">Lưu ý quan trọng:</span>
                                Hệ thống sử dụng cơ chế **VietQR động**. Vui lòng không thay đổi số tiền hoặc nội dung chuyển khoản để đơn hàng được xác nhận tự động ngay lập tức.
                            </p>
                        </div>
                    </div>

                    {/* Checkout Card */}
                    <div className="lg:sticky lg:top-8">
                        <SePayCheckout
                            initialAmount={Math.round(finalAmount)}
                            initialDescription={desc || (paymentCode ? `Thanh toan ${paymentCode}` : '')}
                            paymentType={paymentType}
                            referenceId={referenceId}
                            secondaryId={secondaryId}
                            purpose={purpose}
                            existingPaymentCode={paymentCode || undefined}
                        />
                        
                        <p className="mt-8 text-center text-gray-400 text-xs font-medium px-10">
                            Bằng cách nhấn nút thanh toán, bạn đồng ý tuân thủ **Quy định sàn** và **Chính sách bảo mật** của Chợ Xe Đạp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
