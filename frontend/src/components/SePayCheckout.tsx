import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentsApi } from '../lib/api';
import { useNotifications } from '../contexts/NotificationContext';
import { toast } from 'sonner';

type PaymentContext = 'ORDER' | 'MEMBERSHIP' | 'VIP_PACKAGE';

interface SePayCheckoutProps {
    className?: string;
    initialAmount?: number;
    initialDescription?: string;

    paymentType?: PaymentContext;
    referenceId?: number;
    secondaryId?: number;
    purpose?: 'DEPOSIT' | 'FULL_PAYMENT';
    existingPaymentCode?: string;
}

export const SePayCheckout: React.FC<SePayCheckoutProps> = ({
    className,
    initialAmount,
    initialDescription,
    paymentType,
    referenceId,
    secondaryId,
    purpose,
    existingPaymentCode
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { connection, joinPaymentGroup, isConnected } = useNotifications();

    const [formData, setFormData] = useState({
        order_amount: initialAmount || 0,
        order_description: initialDescription || (existingPaymentCode ? `Thanh toan ${existingPaymentCode}` : 'Thanh toán đơn hàng'),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);

    // Trạng thái hiển thị QR
    const [showQR, setShowQR] = useState(!!existingPaymentCode);
    const [generatedCode, setGeneratedCode] = useState(existingPaymentCode || '');
    const [backendQRUrl, setBackendQRUrl] = useState<string | null>(null);

    // 1. Đồng bộ SignalR khi có mã thanh toán
    useEffect(() => {
        if (showQR && generatedCode && isConnected) {
            joinPaymentGroup(generatedCode);
        }
    }, [showQR, generatedCode, isConnected, joinPaymentGroup]);

    // 2. Lắng nghe sự kiện từ SignalR
    useEffect(() => {
        if (!connection) return;

        const handleSuccess = () => {
            setIsPaid(true);
            toast.success("Thanh toán thành công!");
            
            // Chuyển hướng linh hoạt theo loại thanh toán
            setTimeout(() => {
                if (paymentType === 'ORDER') {
                    navigate(`/account/buyer/history`);
                } else if (paymentType === 'VIP_PACKAGE' || paymentType === 'POSTING' as any) {
                    navigate(`/account/seller/my-post`);
                } else if (paymentType === 'MEMBERSHIP') {
                    navigate(`/account/profile`);
                } else {
                    navigate(`/`);
                }
            }, 2000);
        };

        connection.on("PaymentUpdate", (data: any) => {
            console.log("Payment Update received via SignalR:", data);
            if (data.status === "PAID") {
                handleSuccess();
            }
        });

        return () => {
            connection.off("PaymentUpdate");
        };
    }, [connection, generatedCode, navigate, paymentType]);

    // 3. Cơ chế Polling dự phòng (mỗi 5 giây)
    useEffect(() => {
        if (!showQR || !generatedCode || isPaid) return;

        const interval = setInterval(async () => {
            try {
                const statusRes = await paymentsApi.getStatus(generatedCode);
                console.log("Polling status for", generatedCode, ":", statusRes?.status);
                
                // FIX: statusRes đã là object chứa status, không cần .data
                if (statusRes?.status === 'PAID') {
                    setIsPaid(true);
                    clearInterval(interval);
                    toast.success("Thanh toán thành công!");
                    
                    // Phát sự kiện để các component khác (như SellerMembership) biết để refresh
                    if (paymentType === 'MEMBERSHIP') {
                        window.dispatchEvent(new Event('refreshMembership'));
                    }
                    
                    // Chuyển hướng linh hoạt theo loại thanh toán
                    setTimeout(() => {
                        if (paymentType === 'ORDER') {
                            navigate(`/account/buyer/history`);
                        } else if (paymentType === 'VIP_PACKAGE' || paymentType === 'POSTING' as any) {
                            navigate(`/account/seller/postings`);
                        } else if (paymentType === 'MEMBERSHIP') {
                            // Chuyển về trang cá nhân để xem trạng thái hội viên mới
                            navigate(`/account/profile`);
                        } else {
                            navigate(`/`);
                        }
                    }, 2000);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [showQR, generatedCode, isPaid, navigate, paymentType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (existingPaymentCode) {
            setShowQR(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let invoiceNumber = '';
            let amount = 0;
            let qrUrl = '';

            if (paymentType === 'ORDER' && referenceId !== undefined) {
                const res = await paymentsApi.createOrderPayment(referenceId, purpose || 'FULL_PAYMENT');
                if (!res || !res.paymentCode) throw new Error("Lỗi khởi tạo thanh toán.");
                invoiceNumber = res.paymentCode;
                amount = res.expectedAmount;
                qrUrl = res.qrImageUrl;
            } else if (paymentType === 'MEMBERSHIP' && referenceId !== undefined) {
                const res = await paymentsApi.createMembershipPayment(referenceId);
                if (!res || !res.paymentCode) throw new Error("Lỗi khởi tạo thanh toán.");
                invoiceNumber = res.paymentCode;
                amount = res.expectedAmount;
                qrUrl = res.qrImageUrl;
            } else if (paymentType === 'VIP_PACKAGE' && referenceId !== undefined && secondaryId !== undefined) {
                const withInspection = searchParams.get('withInspection') === 'true';
                const duration = parseInt(searchParams.get('duration') || '7');
                
                const res = await paymentsApi.createVipPayment(
                    secondaryId,
                    referenceId,
                    duration,
                    true,
                    withInspection
                );
                if (!res || !res.paymentCode) throw new Error("Lỗi khởi tạo thanh toán.");
                invoiceNumber = res.paymentCode;
                amount = res.expectedAmount;
                qrUrl = res.qrImageUrl;
            } else {
                throw new Error("Thông tin thanh toán không đầy đủ.");
            }

            setGeneratedCode(invoiceNumber);
            setFormData(prev => ({ ...prev, order_amount: amount }));
            if (qrUrl) setBackendQRUrl(qrUrl);
            setShowQR(true);
            setIsLoading(false);
            
        } catch (err: any) {
            console.error('Checkout Error:', err);
            setError(err.message || 'Lỗi xử lý thanh toán');
            setIsLoading(false);
        }
    };

    if (isPaid) {
        return (
            <Card className={`w-full max-w-md mx-auto shadow-xl border-t-4 border-t-green-500 ${className}`}>
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Thanh toán thành công!</CardTitle>
                    <p className="text-gray-500 text-center">Đang chuyển hướng bạn tới trang đơn hàng...</p>
                    <Loader2 className="animate-spin text-green-500" />
                </CardContent>
            </Card>
        );
    }

    if (showQR) {
        const bank = import.meta.env.VITE_SEPAY_BANK_BIN || '970423';
        const acc = import.meta.env.VITE_SEPAY_BANK_ACC || '00005349268';
        const testAmount = parseInt(import.meta.env.VITE_SEPAY_TEST_AMOUNT || '0');
        const finalAmount = testAmount > 0 ? testAmount : formData.order_amount * 0.1;
        const des = generatedCode;
        
        const qrUrl = backendQRUrl || `https://qr.sepay.vn/img?bank=${bank}&acc=${acc}&template=compact&amount=${finalAmount * 0.1 }&des=${encodeURIComponent(des)}`;

        return (
            <Card className={`w-full max-w-md mx-auto shadow-xl border-t-4 border-t-[#2E9147] ${className}`}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">Quét mã VietQR</CardTitle>
                    <CardDescription>Sử dụng ứng dụng Ngân hàng hoặc Ví điện tử để quét</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="p-4 bg-white border-2 border-dashed border-green-200 rounded-3xl shadow-inner">
                        <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                    </div>
                    
                    <div className="w-full space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Số tiền:</span>
                            <span className="font-bold text-gray-900">{finalAmount.toLocaleString().slice(0, -1)}đ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Nội dung:</span>
                            <span className="font-mono font-bold text-[#2E9147]">{generatedCode}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-xs font-medium border border-amber-100">
                        <AlertCircle size={16} />
                        <span>Vui lòng giữ nguyên nội dung chuyển khoản để được xác nhận tự động.</span>
                    </div>

                    <div className="flex items-center gap-2 text-blue-600 text-xs animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang chờ thanh toán... Hệ thống sẽ tự cập nhật.</span>
                    </div>

                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                        <Button 
                            variant="secondary" 
                            className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            onClick={async () => {
                                if (!generatedCode) {
                                    toast.error("Chưa có mã thanh toán để Bypass!");
                                    return;
                                }
                                try {
                                    setIsLoading(true);
                                    const result = await paymentsApi.bypassSepayPayment(generatedCode);
                                    console.log("Bypass result:", result);
                                    toast.success("Đã gửi yêu cầu Bypass thành công!");
                                    // Status will be updated via SignalR or polling
                                } catch (err: any) {
                                    console.error("Bypass error details:", err);
                                    toast.error("Bypass thất bại: " + (err.message || "Lỗi không xác định"));
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Bypass Payment (Test Only)"}
                        </Button>
                    )}

                    <Button variant="outline" className="w-full border-gray-200 text-gray-500" onClick={() => setShowQR(false)} disabled={!!existingPaymentCode}>
                        {existingPaymentCode ? "Hóa đơn đã chốt" : "Quay lại chỉnh sửa"}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full max-w-md mx-auto shadow-xl border-t-4 border-t-[#2E9147] ${className}`}>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Hoàn tất thanh toán</CardTitle>
                <CardDescription>
                    {paymentType === 'ORDER' && `Đang ${purpose === 'DEPOSIT' ? 'đặt cọc' : 'mua'} xe`}
                    {paymentType === 'MEMBERSHIP' && 'Đang mua gói thành viên'}
                    {paymentType === 'VIP_PACKAGE' && 'Đang mua gói VIP đẩy tin'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <Label className="text-gray-500">Tổng tiền cần thanh toán</Label>
                        <div className="text-3xl font-bold text-[#2E9147]">
                            {formData.order_amount > 0 ? formData.order_amount.toLocaleString() : '---'} <span className="text-sm font-normal">VND</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-500 font-medium">Phương thức thanh toán</Label>
                        <div className="flex items-center gap-3 p-4 bg-white border border-green-200 rounded-xl shadow-sm">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#2E9147]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Chuyển khoản ngân hàng</div>
                                <div className="text-xs text-gray-500">Quét mã VietQR để thanh toán nhanh</div>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#2E9147] hover:bg-[#257a3b] text-white font-bold py-7 text-lg rounded-xl transition-all shadow-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang khởi tạo...</>
                        ) : (
                            'Tiến hành thanh toán'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
