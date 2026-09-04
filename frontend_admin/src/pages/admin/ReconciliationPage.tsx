import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  Search, 
  ArrowDownLeft, 
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
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
  userFullName: string;
  userEmail: string;
  createdAt: string;
}

const ReconciliationPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    status: 'PAID'
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/transactions', {
        params: {
          status: filter.status || undefined,
          page: 1,
          pageSize: 1000
        }
      });
      if (response.data.status === "Success") {
        const items = response.data.data.items || [];
        setTransactions(items);
        setTotalCount(items.length);
      }
    } catch (error: any) {
      toast.error('Lỗi khi tải dữ liệu đối soát');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter.status]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.status, filter.search]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`Đã sao chép ${field}`);
  };

  const allFilteredTransactions = transactions.filter(t => 
    t.transactionReference?.toLowerCase().includes(filter.search.toLowerCase()) ||
    t.userFullName?.toLowerCase().includes(filter.search.toLowerCase()) ||
    t.id.toString().includes(filter.search)
  );

  // Apply local pagination
  const paginatedTransactions = allFilteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Sync total count for pagination UI when filter changes
  useEffect(() => {
    setTotalCount(allFilteredTransactions.length);
  }, [filter.search, transactions]);

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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Đối soát dòng tiền</h1>
          <p className="text-gray-500 mt-1">Kiểm tra và đối soát các giao dịch thực tế từ ngân hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[32px] shadow-clay">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm theo mã giao dịch, tên người dùng, mã đơn..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-primary outline-none"
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select 
            className="w-full bg-gray-50 rounded-2xl border-0 px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-bold text-gray-600"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="PAID">Đã thanh toán (Thành công)</option>
            <option value="PENDING">Chờ xử lý (Đang chờ)</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-clay overflow-hidden border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Mã GD / Thời gian</th>
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Số tiền thực tế</th>
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Người thực hiện</th>
                <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Đối soát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Đang tải dữ liệu đối soát...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center text-gray-400 font-bold italic">
                    Không tìm thấy giao dịch nào cần đối soát.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <ArrowDownLeft size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-foreground text-lg tracking-tight">{t.transactionReference}</p>
                            <button 
                              onClick={() => copyToClipboard(t.transactionReference, 'Mã giao dịch')}
                              className="p-1 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {copiedField === 'Mã giao dịch' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold flex items-center mt-1 uppercase tracking-widest">
                            <Calendar size={12} className="mr-2" />
                            {new Date(t.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <p className="text-2xl font-black text-foreground tracking-tighter">
                        +{new Intl.NumberFormat('vi-VN').format(t.amount)}
                        <span className="text-sm ml-1">₫</span>
                      </p>
                    </td>
                    <td className="px-10 py-8">
                      <div>
                        <p className="font-bold text-gray-700">{t.userFullName}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{t.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-center">
                        {t.status === 'PAID' ? (
                          <div className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-green-100">
                            <CheckCircle2 size={14} className="mr-2" />
                            Khớp lệnh
                          </div>
                        ) : t.status === 'PENDING' ? (
                          <div className="flex items-center px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-100">
                            <Clock size={14} className="mr-2" />
                            Chờ khớp
                          </div>
                        ) : (
                          <div className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">
                            <AlertCircle size={14} className="mr-2" />
                            Lệch lệnh
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {!loading && totalCount > 0 && (
          <div className="mt-8 px-10 py-6 bg-white rounded-[40px] shadow-clay border-0 flex flex-col sm:flex-row items-center justify-between gap-4">
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

export default ReconciliationPage;
