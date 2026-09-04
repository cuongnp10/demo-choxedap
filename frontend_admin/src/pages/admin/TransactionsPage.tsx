import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  Search, 
  ArrowUpRight, 
  Calendar,
  Download,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

interface Transaction {
  id: number;
  transactionReference: string;
  amount: number;
  purpose: string;
  status: string;
  referenceType: string;
  referenceId: number;
  userFullName: string;
  userEmail: string;
  createdAt: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    purpose: '',
    status: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/transactions', {
        params: {
          purpose: filter.purpose || undefined,
          status: filter.status || undefined,
          page: currentPage,
          pageSize: pageSize
        }
      });
      if (response.data.status === "Success") {
        setTransactions(response.data.data.items || []);
        setTotalCount(response.data.data.totalCount || 0);
      }
    } catch (error: any) {
      toast.error('Lỗi khi tải giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter.purpose, filter.status, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.purpose, filter.status]);

  const filteredData = transactions.filter(t => 
    t.transactionReference?.toLowerCase().includes(filter.search.toLowerCase()) ||
    t.userFullName?.toLowerCase().includes(filter.search.toLowerCase()) ||
    t.userEmail?.toLowerCase().includes(filter.search.toLowerCase())
  );

  // Apply local pagination
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Sync total count for pagination UI when filter changes
  useEffect(() => {
    setTotalCount(filteredData.length);
  }, [filter.search, transactions]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPurposeLabel = (purpose: string) => {
    switch (purpose) {
      case 'ORDER_PAYMENT': return { label: 'Thanh toán đơn', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'ORDER_DEPOSIT': return { label: 'Đặt cọc đơn', color: 'text-cyan-600', bg: 'bg-cyan-50' };
      case 'MEMBERSHIP_UPGRADE': return { label: 'Nâng cấp hội viên', color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'POSTING_FEE': return { label: 'Phí đẩy tin', color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'SETTLEMENT': return { label: 'Tất toán cho Seller', color: 'text-rose-600', bg: 'bg-rose-50' };
      case 'REFUND': return { label: 'Hoàn tiền Buyer', color: 'text-orange-600', bg: 'bg-orange-50' };
      default: return { label: purpose, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Lịch sử giao dịch</h1>
          <p className="text-gray-500 mt-1">Theo dõi toàn bộ dòng tiền trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white shadow-clay rounded-2xl text-gray-500 hover:text-primary transition-colors border-0">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[32px] shadow-clay">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm theo mã GD, người dùng..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary outline-none"
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
          />
        </div>
        <select 
          className="bg-gray-50 rounded-2xl border-0 px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-bold text-gray-600"
          value={filter.purpose}
          onChange={(e) => setFilter({...filter, purpose: e.target.value})}
        >
          <option value="">Tất cả mục đích</option>
          <option value="ORDER_PAYMENT">Thanh toán đơn</option>
          <option value="ORDER_DEPOSIT">Đặt cọc</option>
          <option value="MEMBERSHIP_UPGRADE">Hội viên</option>
          <option value="POSTING_FEE">Phí đẩy tin</option>
          <option value="SETTLEMENT">Tất toán</option>
          <option value="REFUND">Hoàn tiền</option>
        </select>
        <select 
          className="bg-gray-50 rounded-2xl border-0 px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-bold text-gray-600"
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="SUCCESS">Thành công</option>
          <option value="PENDING">Đang chờ</option>
          <option value="FAILED">Thất bại</option>
        </select>
      </div>

      <div className="bg-white rounded-[32px] shadow-clay overflow-hidden border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Giao dịch / Thời gian</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Người thực hiện</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Mục đích</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Số tiền</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Đang tải giao dịch...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">Không tìm thấy giao dịch nào.</td>
                </tr>
              ) : (
                paginatedData.map((t) => {
                  const purpose = getPurposeLabel(t.purpose);
                  const isOutgoing = t.purpose === 'SETTLEMENT' || t.purpose === 'REFUND';
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                            isOutgoing ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"
                          )}>
                            {isOutgoing ? (
                              <ArrowUpRight size={18} className="rotate-180" />
                            ) : (
                              <ArrowUpRight size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-foreground tracking-tight">{t.transactionReference || `TXN-${t.id}`}</p>
                            <p className="text-[10px] text-gray-400 font-bold flex items-center mt-1 uppercase tracking-wider">
                              <Calendar size={10} className="mr-1" />
                              {new Date(t.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 text-sm leading-none">{t.userFullName}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">{t.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider", purpose.bg, purpose.color)}>
                          {purpose.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className={cn(
                          "font-black text-lg tracking-tighter",
                          isOutgoing ? "text-rose-600" : "text-foreground"
                        )}>
                          {isOutgoing ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(t.amount)}
                          <span className="text-xs ml-1">₫</span>
                        </p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          (t.status === 'PAID' || t.status === 'SUCCESS') ? "bg-green-100 text-green-600" : 
                          (t.status === 'PENDING' || t.status === 'UNPAID') ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                        )}>
                          {t.status === 'PAID' || t.status === 'SUCCESS' ? 'Thành công' : 
                           t.status === 'PENDING' || t.status === 'UNPAID' ? 'Chờ xử lý' : 'Thất bại'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {!loading && totalCount > 0 && (
          <div className="mt-8 px-8 py-6 bg-white rounded-[32px] shadow-clay border-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-bold text-gray-500">
              Hiển thị <span className="text-primary">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> - <span className="text-primary">{Math.min(currentPage * pageSize, totalCount)}</span> trên tổng số <span className="text-primary">{totalCount}</span> giao dịch
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
      </div>
    </div>
  );
};

export default TransactionsPage;
