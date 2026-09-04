import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

// Interface khớp chính xác với AdminOrderDetailDto từ Backend
interface OrderDetail {
  id: number;
  status: string;
  paymentType?: string;
  totalAmount: number;
  depositAmount?: number;
  remainingAmount?: number;
  shippingBuffer?: number;
  isSettled?: boolean;
  settlementReference?: string;
  settlementAt?: string;
  
  buyerId: number;
  buyerName: string;
  buyerBankAccount?: string;
  buyerBankName?: string;
  buyerBankAccountHolder?: string;

  sellerId: number;
  sellerName: string;
  sellerBankAccount?: string;
  sellerBankName?: string;

  postingId: number;
  postingTitle: string;
  deliveryAddress?: string;
  pickupAddress?: string;
  note?: string;
  createdAt: string;
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/admin/orders/${id}`);
        if (response.data.status === "Success") {
          setOrder(response.data.data);
        }
      } catch (error: any) {
        toast.error('Lỗi khi tải chi tiết đơn hàng');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetail();
  }, [id]);

  const handleSettle = async () => {
    if (!order) return;
    const reference = window.prompt('Nhập mã tham chiếu chuyển khoản (Banking Reference):');
    if (!reference) return;

    try {
      const response = await api.post(`/admin/orders/${order.id}/settle`, {
        transactionReference: reference
      });

      if (response.data.status === "Success") {
        toast.success('Đã xác nhận thanh toán hộ cho người bán');
        // Refresh data
        const refreshResponse = await api.get(`/admin/orders/${id}`);
        setOrder(refreshResponse.data.data);
      }
    } catch (error: any) {
      toast.error('Lỗi khi đối soát: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-[40px] shadow-clay">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-black">Không tìm thấy đơn hàng</h2>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="mt-6 text-primary font-bold flex items-center mx-auto"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="w-14 h-14 bg-white shadow-clay rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Đơn hàng #{order.id}</span>
              <span className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm",
                order.status === 'DELIVERED' ? "bg-amber-100 text-amber-600" : 
                order.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
              )}>
                {order.status}
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground mt-1">Chi tiết quyết toán</h1>
          </div>
        </div>
        
        {order.status === 'DELIVERED' && !order.isSettled && (
          <button 
            onClick={handleSettle}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center transition-all active:scale-95"
          >
            <ShieldCheck size={20} className="mr-2" />
            Xác nhận đã chuyển tiền
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-[40px] shadow-clay overflow-hidden">
            <div className="p-10 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
                    <Package size={36} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground line-clamp-2 leading-tight">{order.postingTitle}</h3>
                    <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">Mã tin: #{order.postingId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Tổng thanh toán</p>
                  <p className="text-4xl font-black text-primary tracking-tighter">
                    {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}
                    <span className="text-xl ml-1">₫</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Buyer Info */}
              <div className="space-y-6">
                <div className="flex items-center text-gray-400">
                  <User size={18} className="mr-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Thông tin người mua</span>
                </div>
                <div className="space-y-3">
                  <p className="text-xl font-black text-foreground">{order.buyerName}</p>
                  <p className="text-gray-500 font-bold flex items-center text-sm">
                    <span className="w-24 text-gray-400 uppercase text-[10px]">Mã khách:</span>
                    #{order.buyerId}
                  </p>
                  <p className="text-gray-500 font-bold flex items-center text-sm">
                    <span className="w-24 text-gray-400 uppercase text-[10px]">Thanh toán:</span>
                    {order.paymentType || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-6">
                <div className="flex items-center text-gray-400">
                  <MapPin size={18} className="mr-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Địa chỉ nhận hàng</span>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-gray-700 font-bold leading-relaxed">{order.deliveryAddress || 'N/A'}</p>
                  {order.note && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-400 font-black uppercase mb-1">Ghi chú từ khách:</p>
                      <p className="text-sm italic text-gray-500">{order.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Info Card */}
          <div className="bg-white rounded-[40px] shadow-clay p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center">
                <CreditCard size={24} className="mr-3 text-primary" />
                Thông tin quyết toán cho người bán
              </h3>
              {order.isSettled ? (
                <span className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-green-100 flex items-center">
                  <CheckCircle2 size={16} className="mr-2" /> Đã hoàn tất đối soát
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-100 flex items-center">
                  <Clock size={16} className="mr-2" /> Chờ xác nhận chuyển tiền
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-primary/5 rounded-[32px] p-8 space-y-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tài khoản thụ hưởng</p>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-foreground">{order.sellerName}</p>
                  <p className="text-primary font-black text-lg tracking-widest">{order.sellerBankAccount || 'Chưa cập nhật'}</p>
                  <div className="pt-2">
                    <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-500 shadow-sm">
                      Ngân hàng: {order.sellerBankName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 py-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold">Giá bán:</span>
                  <span className="font-black text-foreground">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)} ₫</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold">Phí nền tảng:</span>
                  <span className="font-black text-red-500">- 0 ₫ (Miễn phí)</span>
                </div>
                <div className="h-px bg-gray-100"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-black uppercase text-xs">Thực nhận:</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {new Intl.NumberFormat('vi-VN').format(order.totalAmount)} ₫
                  </span>
                </div>
              </div>
            </div>

            {order.isSettled && (
              <div className="mt-4 p-8 bg-green-50/50 rounded-[32px] border border-green-100 border-dashed grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Mã tham chiếu ngân hàng</p>
                  <p className="text-lg font-black text-foreground">{order.settlementReference}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Ngày đối soát thành công</p>
                  <p className="text-lg font-black text-foreground">
                    {order.settlementAt ? new Date(order.settlementAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Extras */}
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] shadow-clay p-10">
            <h3 className="text-xl font-black mb-8 flex items-center">
              <Calendar size={22} className="mr-3 text-gray-400" />
              Lịch sử đơn hàng
            </h3>
            
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
              
              <div className="flex items-start relative z-10">
                <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-sm flex-shrink-0 mt-1"></div>
                <div className="ml-6">
                  <p className="text-sm font-black text-foreground">Tạo đơn hàng</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              <div className="flex items-start relative z-10">
                <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-sm flex-shrink-0 mt-1"></div>
                <div className="ml-6">
                  <p className="text-sm font-black text-foreground">Người bán giao xe</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Đã hoàn tất</p>
                </div>
              </div>

              <div className="flex items-start relative z-10">
                <div className={cn(
                  "w-6 h-6 rounded-full border-4 border-white shadow-sm flex-shrink-0 mt-1",
                  order.status === 'DELIVERED' || order.status === 'COMPLETED' ? "bg-green-500" : "bg-gray-200"
                )}></div>
                <div className="ml-6">
                  <p className="text-sm font-black text-foreground">Người mua nhận hàng</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                    {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'Giao thành công' : 'Đang xử lý'}
                  </p>
                </div>
              </div>

              <div className="flex items-start relative z-10">
                <div className={cn(
                  "w-6 h-6 rounded-full border-4 border-white shadow-sm flex-shrink-0 mt-1",
                  order.isSettled ? "bg-primary shadow-lg shadow-primary/30" : "bg-gray-200"
                )}></div>
                <div className="ml-6">
                  <p className="text-sm font-black text-foreground">Admin đối soát</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                    {order.isSettled ? 'Đã thanh toán trả tiền' : 'Đang chờ Admin'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-[40px] shadow-clay p-10 text-white relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <CreditCard size={160} />
             </div>
             <div className="relative z-10">
                <h4 className="text-lg font-black tracking-tight">Cần hỗ trợ?</h4>
                <p className="text-white/70 text-sm mt-3 leading-relaxed font-medium">Nếu có sai sót trong quá trình đối soát, hãy liên hệ kỹ thuật để được hỗ trợ thủ công qua Database.</p>
                <div className="h-px bg-white/20 my-6"></div>
                <div className="flex items-center text-xs font-black uppercase tracking-widest">
                   Hỗ trợ nội bộ <ChevronRight size={14} className="ml-2" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
