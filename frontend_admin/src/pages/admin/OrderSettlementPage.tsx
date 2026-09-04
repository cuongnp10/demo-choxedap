import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { 
  CreditCard,
  Search,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Banknote,
  ClipboardList,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  ImagePlus,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";

interface Order {
  id: number;
  orderCode: string;
  postingTitle: string;
  postingId: string;
  buyerName: string;
  sellerName: string;
  sellerId: string;
  sellerBankName: string;
  sellerBankNumber: string;
  sellerBankAccountHolder: string;
  totalAmount: number;
  platformFee: number;
  shippingFee: number;
  amountToTransfer: number; // sellerReceivableAmount
  status: string;
  settlementStatus: 'PENDING_SETTLEMENT' | 'SETTLED';
  settlementType?: 'PAY_SELLER' | 'REFUND_BUYER';
  settlementReference?: string;
  settlementAt?: string;
  createdAt: string;
  deliveredAt?: string;
  
  // Beneficiary info (could be buyer if refund)
  recipientName?: string;
  recipientBankNumber?: string;
  recipientBankName?: string;
  recipientBankAccountHolder?: string;
}

const generateTransferContent = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRATIEN';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const OrderSettlementPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'SETTLED'>('PENDING');
  
  // Counts
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal states
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);
  const [transferContent, setTransferContent] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders', {
        params: {
          isSettled: statusFilter === 'SETTLED',
          page: 1,
          pageSize: 1000 // Tạm thời lấy hết để filter local, có thể tối ưu sau
        }
      });
      
      if (response.data.status === "Success") {
        const items = response.data.data.items || [];
        setOrders(items);
        setTotalCount(items.length);
        
        // Cập nhật số lượng chờ tất toán nếu đang ở tab PENDING
        if (statusFilter === 'PENDING') {
          setPendingCount(items.length);
        }
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending count once on mount regardless of initial tab
  useEffect(() => {
    const fetchInitialPendingCount = async () => {
      try {
        const response = await api.get('/admin/orders', { params: { isSettled: false, page: 1, pageSize: 1 } });
        if (response.data.status === "Success") {
          setPendingCount(response.data.data.totalCount || 0);
        }
      } catch (e) {}
    };
    fetchInitialPendingCount();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Reset page when filter or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, filter]);

  const handleStartTransfer = (order: Order) => {
    setSettlingOrder(order);
    setTransferContent(generateTransferContent());
    setIsConfirmed(false);
    setEvidenceFile(null);
    setEvidencePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!settlingOrder || !isConfirmed) return;
    setSubmitting(true);
    try {
      let evidenceImageUrl = '';
      if (evidenceFile) {
        const formData = new FormData();
        formData.append('file', evidenceFile);
        const uploadRes = await api.post('/media/upload-general?folder=settlements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        evidenceImageUrl = uploadRes.data.url;
      }

      const response = await api.post(`/admin/orders/${settlingOrder.id}/settle`, {
        settlementCode: transferContent,
        bankInfoSnapshot: JSON.stringify({
          bankName: settlingOrder.recipientBankName || settlingOrder.sellerBankName,
          bankNumber: settlingOrder.recipientBankNumber || settlingOrder.sellerBankNumber,
          accountHolder: settlingOrder.recipientBankAccountHolder || settlingOrder.sellerBankAccountHolder
        }),
        evidenceImageUrl: evidenceImageUrl
      });

      if (response.data.status === "Success") {
        toast.success(settlingOrder.settlementType === 'REFUND_BUYER' ? 'Đã hoàn tiền cho người mua' : 'Đã tất toán cho người bán');
        setSettlingOrder(null);
        fetchOrders();
      }
    } catch (error: any) {
      toast.error('Lỗi khi đối soát: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`Đã sao chép ${field}`);
  };

  const allFilteredOrders = orders.filter(o => 
    (o.postingTitle?.toLowerCase() || "").includes(filter.toLowerCase()) ||
    (o.sellerName?.toLowerCase() || "").includes(filter.toLowerCase()) ||
    (o.buyerName?.toLowerCase() || "").includes(filter.toLowerCase()) ||
    (o.orderCode?.toLowerCase() || "").includes(filter.toLowerCase()) ||
    (o.id.toString()).includes(filter)
  );

  // Apply local pagination
  const paginatedOrders = allFilteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Sync total count for pagination UI when filter changes
  useEffect(() => {
    setTotalCount(allFilteredOrders.length);
  }, [filter, orders]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Đối soát & Tất toán</h1>
          <p className="text-gray-500 mt-1">Quản lý dòng tiền trả cho Người bán và hoàn tiền Người mua</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, tiêu đề, tên khách..."
            className="pl-12 pr-6 py-4 bg-white border-0 shadow-clay rounded-2xl focus:ring-2 focus:ring-primary outline-none w-full sm:w-96 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex p-2 bg-gray-100/50 backdrop-blur-sm rounded-[28px] w-fit border border-gray-100">
        {[
          { key: 'PENDING', label: 'Chờ tất toán' },
          { key: 'SETTLED', label: 'Đã hoàn tất' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key as any);
            }}
            className={cn(
              "px-10 py-3.5 rounded-[22px] text-sm font-black transition-all duration-500 uppercase tracking-widest flex items-center gap-2",
              statusFilter === tab.key 
                ? "bg-white text-primary shadow-clay scale-100" 
                : "text-gray-400 hover:text-gray-600 scale-95"
            )}
          >
            {tab.label}
            {tab.key === 'PENDING' && pendingCount > 0 && (
              <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="p-32 bg-white rounded-[40px] shadow-clay flex flex-col items-center">
            <div className="w-16 h-16 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-32 bg-white rounded-[40px] shadow-clay flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform">
              <Banknote size={48} className="text-gray-200" />
            </div>
            <p className="text-2xl font-black text-foreground">Không có đơn hàng nào</p>
            <p className="text-gray-400 mt-3 font-medium text-lg">
              {statusFilter === 'PENDING' ? "Tất cả đơn hàng đã được đối soát!" : "Chưa có lịch sử tất toán."}
            </p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-[40px] shadow-clay border-0 p-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10 hover:shadow-clay-lg transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <ClipboardList className="text-gray-400 group-hover:text-primary transition-colors" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black tracking-widest uppercase">
                        {order.orderCode || `#${order.id}`}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
                        order.status === 'DELIVERED' ? "bg-amber-100 text-amber-600" : 
                        order.status === 'CANCELLED' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      )}>
                        {order.status === 'DELIVERED' ? 'GIAO THÀNH CÔNG' : order.status === 'CANCELLED' ? 'ĐÃ HỦY' : order.status}
                      </span>
                      {order.settlementType && (
                        <Badge variant="outline" className={cn(
                          "rounded-lg text-[10px] font-black tracking-widest uppercase border-0",
                          order.settlementType === 'PAY_SELLER' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                        )}>
                          {order.settlementType === 'PAY_SELLER' ? 'TRẢ TIỀN NGƯỜI BÁN' : 'HOÀN TIỀN NGƯỜI MUA'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-black text-2xl text-foreground mt-2 tracking-tight line-clamp-1">{order.postingTitle}</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Thông tin thụ hưởng</p>
                    <div className="bg-gray-50/50 p-6 rounded-[28px] space-y-3 relative group/bank">
                      <div>
                        <p className="font-black text-foreground text-lg">{order.recipientName || (order.settlementType === 'REFUND_BUYER' ? order.buyerName : order.sellerName)}</p>
                        <div className="flex items-center text-primary font-black mt-1">
                          <CreditCard size={18} className="mr-3" />
                          <span className="tracking-widest">{order.recipientBankNumber || order.sellerBankNumber || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <p className="text-xs font-bold text-gray-400 bg-white px-3 py-2 rounded-xl inline-block shadow-sm">
                          {order.recipientBankName || order.sellerBankName || 'N/A'}
                        </p>
                        <p className="text-xs font-bold text-gray-400 bg-white px-3 py-2 rounded-xl inline-block shadow-sm">
                          {order.recipientBankAccountHolder || order.sellerBankAccountHolder || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Số tiền quyết toán</p>
                    <div className="p-2 space-y-2">
                      <div className="flex justify-between text-sm font-bold text-gray-400">
                        <span>Tổng đơn hàng:</span>
                        <span>{new Intl.NumberFormat('vi-VN').format(order.totalAmount)} ₫</span>
                      </div>
                      {order.settlementType !== 'REFUND_BUYER' && (
                        <div className="flex justify-between text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg">
                          <span>Phí nền tảng:</span>
                          <span>Đã thanh toán trước (0 ₫)</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
                        <span className="text-xs font-black text-gray-400 uppercase">Thực chuyển:</span>
                        <p className="text-3xl font-black text-primary tracking-tighter">
                          {new Intl.NumberFormat('vi-VN').format(order.amountToTransfer || order.totalAmount)}
                          <span className="text-xl ml-1">₫</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {statusFilter === 'SETTLED' && (
                  <div className="mt-6 p-6 bg-green-50/50 rounded-[28px] border border-green-100 border-dashed grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] mb-1">Mã đối soát hệ thống</p>
                      <p className="text-base font-black text-foreground break-all">{order.settlementReference || 'N/A'}</p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] mb-1">Thời gian thực hiện</p>
                      <p className="text-base font-black text-foreground">
                        {order.settlementAt ? new Date(order.settlementAt).toLocaleString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:w-px lg:self-stretch bg-gray-100 hidden lg:block mx-10"></div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px]">
                {statusFilter === 'PENDING' ? (
                  <button 
                    onClick={() => handleStartTransfer(order)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-black py-5 px-8 rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center transition-all active:scale-95 group/btn"
                  >
                    Chuyển khoản
                    <ArrowRight size={20} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 text-green-600 font-black py-5 px-8 rounded-3xl flex items-center justify-center border border-green-100">
                    <CheckCircle2 size={24} className="mr-3" />
                    Đã hoàn tất
                  </div>
                )}
                <button 
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="flex-1 bg-white border-2 border-gray-100 text-gray-400 hover:border-primary hover:text-primary font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all group/detail"
                >
                  Chi tiết đơn
                  <ExternalLink size={20} className="ml-2 opacity-0 group-hover/detail:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination UI */}
      {!loading && totalCount > 0 && (
        <div className="mt-8 px-8 py-6 bg-white rounded-[32px] shadow-clay border-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-gray-500">
            Hiển thị <span className="text-primary">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> - <span className="text-primary">{Math.min(currentPage * pageSize, totalCount)}</span> trên tổng số <span className="text-primary">{totalCount}</span> lệnh
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-50 transition-all hover:text-primary hover:border-primary"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-50 transition-all hover:text-primary hover:border-primary"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center px-4 h-10 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20">
              Trang {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-50 transition-all hover:text-primary hover:border-primary"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-50 transition-all hover:text-primary hover:border-primary"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={!!settlingOrder} onOpenChange={(open) => !open && setSettlingOrder(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[40px] border-0 shadow-clay p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-8 bg-primary/5 flex-shrink-0">
            <DialogTitle className="text-2xl font-black tracking-tight text-primary">Thông tin chuyển khoản</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">Vui lòng kiểm tra kỹ thông tin ngân hàng trước khi thực hiện chuyển tiền.</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin người nhận</p>
              <div className="bg-gray-50 p-6 rounded-[28px] space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Chủ tài khoản</p>
                    <p className="font-black text-foreground text-lg uppercase tracking-tight">
                      {settlingOrder?.recipientBankAccountHolder || settlingOrder?.sellerBankAccountHolder || 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(settlingOrder?.recipientBankAccountHolder || settlingOrder?.sellerBankAccountHolder || '', 'Tên chủ tài khoản')}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-primary"
                  >
                    {copiedField === 'Tên chủ tài khoản' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Số tài khoản / Ngân hàng</p>
                    <p className="font-black text-primary text-xl tracking-widest">
                      {settlingOrder?.recipientBankNumber || settlingOrder?.sellerBankNumber}
                    </p>
                    <p className="text-xs font-bold text-gray-500">
                      {settlingOrder?.recipientBankName || settlingOrder?.sellerBankName}
                    </p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(settlingOrder?.recipientBankNumber || settlingOrder?.sellerBankNumber || '', 'Số tài khoản')}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-primary"
                  >
                    {copiedField === 'Số tài khoản' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="flex justify-between items-start pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Số tiền cần chuyển</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">
                      {new Intl.NumberFormat('vi-VN').format(settlingOrder?.amountToTransfer || settlingOrder?.totalAmount || 0)} ₫
                    </p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard((settlingOrder?.amountToTransfer || settlingOrder?.totalAmount || 0).toString(), 'Số tiền')}
                    className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-primary"
                  >
                    {copiedField === 'Số tiền' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} />
                  Nội dung chuyển khoản (Bắt buộc chính xác)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-red-50 text-red-600 font-black text-2xl py-5 px-6 rounded-2xl border-2 border-red-100 border-dashed tracking-[0.2em] text-center">
                  {transferContent}
                </div>
                <button 
                  onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                  className="p-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {copiedField === 'Nội dung chuyển khoản' ? <Check size={24} /> : <Copy size={24} />}
                </button>
              </div>
              <p className="text-[10px] font-bold text-gray-400 italic text-center">
                * Vui lòng copy và dán chính xác mã này vào phần Nội dung khi thực hiện trên App Ngân hàng
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Minh chứng chuyển khoản (Ảnh chụp màn hình/Biên lai)</p>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[28px] p-4 bg-gray-50 hover:bg-gray-100/50 transition-colors group/upload relative overflow-hidden min-h-[160px]">
                {evidencePreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={evidencePreview} alt="Evidence" className="max-h-[200px] rounded-xl shadow-sm" />
                    <button 
                      onClick={() => { setEvidenceFile(null); setEvidencePreview(null); }}
                      className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer w-full h-full py-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 group-hover/upload:scale-110 transition-transform">
                      <ImagePlus className="text-gray-400" size={24} />
                    </div>
                    <span className="text-sm font-black text-gray-400">Tải lên biên lai</span>
                    <span className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-wider">JPG, PNG, WEBP (MAX 10MB)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-[28px] border border-amber-100">
              <div className="flex items-start gap-4">
                <Checkbox 
                  id="confirm-settle" 
                  checked={isConfirmed} 
                  onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                  className="mt-1 w-6 h-6 rounded-lg data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="confirm-settle" 
                    className="text-sm font-black text-amber-900 cursor-pointer select-none"
                  >
                    Xác nhận đã chuyển khoản thành công
                  </Label>
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    Tôi xác nhận đã thực hiện giao dịch ngân hàng thực tế bên ngoài hệ thống với số tiền và nội dung chính xác như trên.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-4 pb-8 px-8">
              <Button variant="ghost" onClick={() => setSettlingOrder(null)} className="rounded-2xl font-black py-7 flex-1 border-2 border-transparent hover:bg-gray-100 transition-all">Hủy bỏ</Button>
              <Button 
                onClick={handleConfirmTransfer} 
                disabled={submitting || !isConfirmed}
                className="rounded-2xl font-black py-7 flex-1 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {submitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : 'Xác nhận hoàn tất'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderSettlementPage;
