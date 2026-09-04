import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  X,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast, Toaster } from 'sonner';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Transaction {
  id: string;
  referenceType: string;
  purpose: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  referenceId?: string;
  paymentCode?: string;
}

const AnalyticsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    purpose: '',
    startDate: '',
    endDate: ''
  });

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats/overview');
      if (response.data.status === "Success") {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/transactions', {
        params: {
          page,
          pageSize: 10,
          ...filters
        }
      });
      if (response.data.status === "Success") {
        setTransactions(response.data.data.items);
        setTotalCount(response.data.data.totalCount);
      }
    } catch (error) {
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'SUCCESS':
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black uppercase tracking-wider">Thành công</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black uppercase tracking-wider">Chờ xử lý</span>;
      case 'FAILED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-wider">Thất bại</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-black uppercase tracking-wider">{status}</span>;
    }
  };

  // Lấy dữ liệu biểu đồ từ API hoặc sử dụng dữ liệu mặc định nếu chưa có
  const chartData = stats?.weeklyRevenue?.length > 0 
    ? stats.weeklyRevenue 
    : [
        { day: 'T2', revenue: 0 },
        { day: 'T3', revenue: 0 },
        { day: 'T4', revenue: 0 },
        { day: 'T5', revenue: 0 },
        { day: 'T6', revenue: 0 },
        { day: 'T7', revenue: 0 },
        { day: 'CN', revenue: 0 },
      ];

  const growthPercentage = stats?.growthPercentage || 0;
  const isGrowthPositive = growthPercentage >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <Toaster position="top-right" />
      
      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden relative animate-in zoom-in-95 duration-300 border-0">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-8 top-8 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} className="text-gray-400" />
            </button>

            <div className="p-12">
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  "w-20 h-20 rounded-[28px] flex items-center justify-center mb-6",
                  selectedTx.status === 'PAID' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                )}>
                  {selectedTx.status === 'PAID' ? <CheckCircle2 size={40} /> : <Clock size={40} />}
                </div>
                <h3 className="text-3xl font-black text-foreground">Chi tiết giao dịch</h3>
                <p className="text-gray-400 font-bold mt-2">Mã: #{selectedTx.id}</p>
                <div className="mt-6 text-4xl font-black text-primary">
                  {formatCurrency(selectedTx.amount)}
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center">
                    <DollarSign className="text-gray-400 mr-3" size={20} />
                    <span className="text-gray-500 font-bold">Người thanh toán</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground">{selectedTx.userFullName || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{selectedTx.userEmail || ''}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center">
                    <FileText className="text-gray-400 mr-3" size={20} />
                    <span className="text-gray-500 font-bold">Nội dung</span>
                  </div>
                  <span className="font-black text-foreground">{selectedTx.purpose}</span>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center">
                    <Calendar className="text-gray-400 mr-3" size={20} />
                    <span className="text-gray-500 font-bold">Thời gian</span>
                  </div>
                  <span className="font-black text-foreground">
                    {new Date(selectedTx.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center">
                    <CreditCard className="text-gray-400 mr-3" size={20} />
                    <span className="text-gray-500 font-bold">Hình thức</span>
                  </div>
                  <span className="font-black text-foreground">Chuyển khoản (VietQR)</span>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center">
                    <AlertCircle className="text-gray-400 mr-3" size={20} />
                    <span className="text-gray-500 font-bold">Trạng thái</span>
                  </div>
                  {getStatusBadge(selectedTx.status)}
                </div>
              </div>

              <button 
                onClick={() => setSelectedTx(null)}
                className="w-full mt-10 py-5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Thống kê doanh thu</h1>
          <p className="text-gray-500 mt-1">Phân tích dòng tiền và hiệu suất tăng trưởng trong tuần qua</p>
        </div>
        {/* <div className="flex gap-3">
          <button 
            onClick={() => toast.info("Tính năng xuất báo cáo PDF/Excel đang được phát triển")}
            className="flex items-center px-6 py-3 bg-white border-0 shadow-clay rounded-2xl font-bold text-foreground hover:scale-105 transition-all"
          >
            <Download size={20} className="mr-2" />
            Xuất báo cáo
          </button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-clay p-10 border-0">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground">Biểu đồ doanh thu tuần này</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span className="text-xs font-bold text-gray-400 uppercase">Doanh thu (VNĐ)</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FB923C" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-8">
          <div className="bg-primary rounded-[40px] shadow-clay p-10 text-white relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
              <TrendingUp size={120} />
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-primary-foreground/60 font-black uppercase text-xs tracking-widest">Tổng doanh thu (Phí sàn)</p>
                <h2 className="text-4xl font-black mt-2 leading-tight">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </h2>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-primary-foreground/60 font-black uppercase text-xs tracking-widest">Tổng giao dịch (GMV)</p>
                <h2 className="text-2xl font-black mt-2 leading-tight opacity-90">
                  {formatCurrency(stats?.monthlyGmv || 0)}
                </h2>
                <p className="text-[10px] text-primary-foreground/40 font-bold mt-1 uppercase italic">
                  * Bao gồm cả tiền giữ hộ từ đơn hàng
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-primary-foreground/60 font-bold">Mục tiêu doanh thu</span>
                <span className="font-black">85%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="mt-8 flex items-center bg-white/10 rounded-2xl p-4">
              {isGrowthPositive ? (
                <ArrowUpRight size={24} className="mr-3 text-white" />
              ) : (
                <TrendingUp size={24} className="mr-3 text-white rotate-180" />
              )}
              <div>
                <p className="text-xs font-bold text-primary-foreground/60 uppercase">Tăng trưởng</p>
                <p className="text-lg font-black">
                  {isGrowthPositive ? '+' : ''}{growthPercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-[40px] shadow-clay p-10 border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <History size={24} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-foreground">Lịch sử giao dịch</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <Calendar size={18} className="text-gray-400 mr-2" />
              <input 
                type="date" 
                className="bg-transparent border-0 text-sm font-bold focus:ring-0 outline-none"
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <select 
              className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-sm font-bold outline-none"
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PAID">Thành công</option>
              <option value="PENDING">Đang chờ</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Mã giao dịch</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Ngày thực hiện</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nội dung</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Số tiền</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8 bg-gray-50/20 rounded-2xl mb-2"></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">Không có dữ liệu giao dịch</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-6 font-black text-foreground text-sm">#{tx.id ? String(tx.id).substring(0, 8) : '---'}...</td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      <span className="block text-[10px] text-gray-400 font-bold">
                        {new Date(tx.createdAt).toLocaleTimeString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tx.purpose}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{tx.referenceType}</p>
                    </td>
                    <td className="px-6 py-6 text-right">
                      {(() => {
                        const isOutgoing = tx.purpose === 'SETTLEMENT' || tx.purpose === 'REFUND';
                        return (
                          <span className={cn(
                            "text-sm font-black tracking-tight",
                            isOutgoing ? "text-rose-600" : "text-foreground"
                          )}>
                            {isOutgoing ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(tx.amount)}
                            <span className="text-[10px] ml-0.5">₫</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 10 && (
          <div className="mt-10 flex items-center justify-between border-t border-gray-50 pt-8">
            <p className="text-sm text-gray-400 font-bold">
              Hiển thị <span className="text-foreground">{transactions.length}</span> trên <span className="text-foreground">{totalCount}</span> giao dịch
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= totalCount}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
