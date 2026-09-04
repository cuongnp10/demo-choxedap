import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    CheckCircle2, 
    ArrowRight, 
    Loader2, 
    Clock, 
    AlertCircle, 
    ShieldCheck, 
    Info, 
    RefreshCcw,
    ChevronRight,
    Truck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { paymentsApi } from '../lib/api';

export const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'UNPAID' | 'PAID' | 'ERROR'>('UNPAID');

    const paymentCode = searchParams.get('code');
    const amount = searchParams.get('amount');

    useEffect(() => {
        if (!paymentCode) {
            setStatus('ERROR');
            return;
        }

        let pollInterval: ReturnType<typeof setInterval>;

        const checkStatus = async () => {
            try {
                const response = await paymentsApi.getStatus(paymentCode);
                if (response.status === 'PAID') {
                    setStatus('PAID');
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        };

        checkStatus();
        pollInterval = setInterval(checkStatus, 3000);

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [paymentCode]);

    if (status === 'PAID') {
        return (
            <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7] py-20 font-['Inter',sans-serif]">
                <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                
                <div className="w-full max-w-2xl relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-[2rem] bg-green-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-green-200 animate-bounce-slow">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Thanh toán hoàn tất!</h1>
                        <p className="text-gray-500 text-lg font-medium">Giao dịch của bạn đã được sàn ghi nhận và bảo vệ.</p>
                    </div>

                    <Card className="rounded-[2.5rem] border-0 shadow-clay overflow-hidden bg-white">
                        <div className="p-8 space-y-8">
                            {/* Process Steps */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Quy trình tiếp theo
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-3">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <p className="font-black text-gray-900 leading-tight">Chờ Người bán duyệt</p>
                                        <p className="text-xs text-amber-700/70 font-medium leading-relaxed">Người bán có 24h để xác nhận tình trạng xe và đồng ý giao hàng.</p>
                                    </div>

                                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                            <RefreshCcw className="w-5 h-5" />
                                        </div>
                                        <p className="font-black text-gray-900 leading-tight">Hoàn tiền 100%</p>
                                        <p className="text-xs text-blue-700/70 font-medium leading-relaxed">Nếu Người bán từ chối hoặc hết hạn, tiền sẽ được hoàn tự động vào tài khoản của bạn.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details Mini Box */}
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Mã giao dịch</span>
                                    <span className="font-mono font-black text-gray-900">{paymentCode}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Số tiền</span>
                                    <span className="font-black text-[#2E9147] text-lg">{Number(amount).toLocaleString()} ₫</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button asChild className="flex-1 rounded-full py-8 text-lg font-black bg-gray-900 hover:bg-gray-800 text-white shadow-2xl transition-all active:scale-95">
                                    <Link to="/account/buyer/history">
                                        Xem đơn hàng của tôi <ChevronRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1 rounded-full py-8 text-lg font-black border-2 border-gray-100 hover:bg-gray-50 text-gray-600 transition-all active:scale-95">
                                    <Link to="/buy">
                                        Tiếp tục mua sắm
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="bg-gray-900 p-4 text-center">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Secured by Cho Xe Dap Arbitration System</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-t-4 border-t-blue-500 shadow-xl text-center rounded-3xl overflow-hidden">
                <CardHeader className="pt-12">
                    <div className="flex justify-center mb-6">
                        {status === 'ERROR' ? (
                            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-12 h-12 text-red-500" />
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                                    <Clock className="w-12 h-12 text-blue-500" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-24 h-24 text-blue-200 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    <CardTitle className={`text-3xl font-black tracking-tight ${status === 'ERROR' ? 'text-red-600' : 'text-blue-600'}`}>
                        {status === 'ERROR' ? 'Có lỗi xảy ra' : 'Đang xác thực...'}
                    </CardTitle>

                    <CardDescription className="text-lg font-medium pt-2">
                        {status === 'ERROR'
                            ? 'Không tìm thấy thông tin giao dịch hoặc có lỗi xảy ra.'
                            : 'Hệ thống đang chờ tín hiệu phản hồi từ ngân hàng qua SePay.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-12 space-y-8 px-8">
                    <div className="bg-gray-50 p-6 rounded-2xl text-left text-sm space-y-3 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Mã giao dịch</span>
                            <span className="font-mono font-bold text-gray-900">{paymentCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Trạng thái</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                status === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800 animate-pulse'
                            }`}>
                                {status === 'ERROR' ? 'THẤT BẠI' : 'CHỜ TÍN HIỆU...'}
                            </span>
                        </div>
                    </div>

                    {status === 'ERROR' && (
                        <Button asChild variant="outline" className="w-full py-6 rounded-xl font-bold">
                            <Link to="/buy">
                                Quay lại trang mua hàng
                            </Link>
                        </Button>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium justify-center">
                        <ShieldCheck className="w-4 h-4" />
                        Giao dịch được bảo mật bởi SePay
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

