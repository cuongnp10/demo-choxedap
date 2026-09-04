import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast, Toaster } from 'sonner';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  FileSearch,
  ExternalLink,
  History,
  Truck,
  Image as ImageIcon,
  Play,
  Search,
  Zap,
  Trash2,
  Lock,
  ArrowRight,
  AlertTriangle,
  Info,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import inspectorService from '../../services/inspectorService';

interface InspectionReport {
  id: number;
  reportId?: number | null;
  postingId?: number | null;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | string;
  inspectionVideoUrl?: string | null;
  inspectorId?: number | string | null;
  createdAt?: string | null;
  resolvedAt?: string | null;
  notes?: string | null;
  result?: 'PASSED' | 'FAILED' | 'TRUE' | 'FALSE' | string | null;
  comments?: string | null;
  inspectedAt?: string | null;
}

interface Report {
  id: number;
  reportCode: string;
  category: 'POSTING' | 'ORDER' | 'USER' | 'OTHER';
  reason: string;
  description: string;
  evidenceUrls?: string[];
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'Pending' | 'Handled' | 'Dismissed';
  createdAt: string;
  handledAt?: string | null;
  handledBy?: string | null;
  handlingNote?: string | null;
  reporterName: string;
  sellerName?: string;
  postingId?: number;
  postingTitle?: string;
  orderId?: number;
  orderCode?: string;
  inspectionReport?: InspectionReport | any;
  isPostingInspected?: boolean;
}

const categoryLabels: Record<string, string> = {
  POSTING: 'Bài đăng',
  ORDER: 'Đơn hàng',
  USER: 'Người dùng',
  OTHER: 'Khác'
};

const reasonLabels: Record<string, string> = {
  'FAKE_PRODUCT': 'Hàng giả / Sai mô tả',
  'WRONG_PRICE': 'Giá sai (Bài đăng)',
  'MISLEADING': 'Thông tin sai lệch / gây hiểu lầm',
  'SPAM': 'Spam / Quảng cáo',
  'SCAM': 'Lừa đảo / Gian lận',
  'INAPPROPRIATE': 'Nội dung không phù hợp',
  'TECHNICAL': 'Lỗi kỹ thuật hàng',
  'CONTENT': 'Lỗi nội dung bài đăng',
  'BOMB': 'Bùng hàng',
  'OTHER': 'Lý do khác'
};

const specLabels: Record<string, string> = {
  brandName: 'Thương hiệu',
  categoryName: 'Danh mục',
  model: 'Dòng xe',
  year: 'Năm sản xuất',
  condition: 'Tình trạng',
  frameSize: 'Kích cỡ khung',
  frameMaterial: 'Chất liệu khung',
  brakeType: 'Hệ thống phanh',
  color: 'Màu sắc',
  drivetrain: 'Bộ truyền động',
  wheelset: 'Cặp bánh'
};

const reputationPenalties: Record<string, string> = {
  'TECHNICAL': '-15 điểm Seller\n+3 điểm Buyer',
  'OTHER': '-10 điểm Buyer (Báo cáo sai)',
  'BOMB': '-20 điểm Buyer (Bùng hàng)',
  'FAKE_PRODUCT': '-5 điểm Seller\n+2 điểm Buyer',
  'SCAM': '-5 điểm Seller & Khóa tài khoản\n+2 điểm Buyer',
};

const conditionLabels: Record<string, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Gần như mới',
  GOOD: 'Tốt',
  FAIR: 'Khá',
  USED_LIKE_NEW: 'Đã dùng — Gần như mới',
  USED_GOOD: 'Đã dùng — Tốt'
};

const ReportManagementPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Handled' | 'Dismissed'>('Pending');
  const [activeType, setActiveType] = useState<'ALL' | 'POSTING' | 'ORDER'>('ALL');
  const [pendingCount, setPendingCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [resolveModalReport, setResolveModalReport] = useState<Report | null>(null);
  const [dismissModalReport, setDismissModalReport] = useState<Report | null>(null);
  const [evidenceModalReport, setEvidenceModalReport] = useState<Report | null>(null);
  const [inspectionResultModal, setInspectionResultModal] = useState<Report | null>(null);
  const [postingModalPosting, setPostingModalPosting] = useState<any | null>(null);

  // Form
  const [resolveAction, setResolveAction] = useState('HIDE_AND_WARN');
  const [handlingNote, setHandlingNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isHandlingNoteValid = handlingNote.trim().length >= 10;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/reports', {
        params: { 
          status: statusFilter, 
          type: activeType === 'ALL' ? null : activeType,
          page: 1, 
          pageSize: 1000 
        }
      });
      if (response.data.status === "Success") {
        const items = (response.data.data.items || []).map((r: any) => {
          const evidenceUrls = r.evidenceUrls || r.EvidenceUrls || [];
          const rawIR = r.inspectionReport || r.InspectionReport;
          
          let normalizedIR = null;
          if (rawIR) {
            normalizedIR = {
              ...rawIR,
              inspectionVideoUrl: rawIR.inspectionVideoUrl || rawIR.InspectionVideoUrl || rawIR.inspectionVideoRecordUrl || rawIR.InspectionVideoRecordUrl || null,
              result: rawIR.result || rawIR.Result,
              status: rawIR.status || rawIR.Status,
              comments: rawIR.comments || rawIR.Comments || rawIR.notes || rawIR.Notes,
              inspectedAt: rawIR.inspectedAt || rawIR.InspectedAt
            };
          }

          return {
            ...r,
            category: r.category || r.Category || (r.postingId ? 'POSTING' : r.orderId ? 'ORDER' : 'OTHER'),
            evidenceUrls,
            inspectionReport: normalizedIR,
            isPostingInspected: r.isPostingInspected || r.IsPostingInspected || false
          };
        });
        setReports(items);
        setTotalCount(items.length);

        // Update pending count badge if we are on the pending tab or just fetched it
        if (statusFilter === 'Pending' && activeType === 'ALL') {
          setPendingCount(items.length);
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Separate effect to keep pending count updated when switching tabs
  useEffect(() => {
    if (statusFilter !== 'Pending' || activeType !== 'ALL') {
      const fetchPendingCount = async () => {
        try {
          const response = await api.get('/admin/reports', {
            params: { status: 'Pending', type: null, page: 1, pageSize: 1 }
          });
          if (response.data.status === "Success") {
            setPendingCount(response.data.data.totalCount);
          }
        } catch (e) { console.error("Error fetching pending count", e); }
      };
      fetchPendingCount();
    }
  }, [statusFilter, activeType]);

  const openPostingDetail = async (postingId: number) => {
    try {
      const res = await api.get(`/admin/postings/${postingId}`);
      if (res?.data?.status === 'Success' && res.data.data) {
        const item = res.data.data;
        const mapped = {
          id: item.id || item.Id,
          title: item.title || item.Title,
          description: item.description || item.Description,
          images: item.images || item.Images || (item.media ? item.media.filter((m:any) => (m.type || m.Type) === 'IMAGE').map((m:any) => m.url || m.Url) : []),
          videoUrl: item.videoUrl || item.VideoUrl || (item.media ? item.media.find((m:any) => (m.type || m.Type) === 'VIDEO')?.url : null),
          bicycle: item.bicycle || item.Bicycle,
          sellerName: item.sellerName || item.SellerName,
        };
        setPostingModalPosting(mapped);
      } else {
        toast.error('Không thể tải chi tiết tin đăng');
      }
    } catch (err) {
      console.error('fetch posting detail', err);
      toast.error('Lỗi khi lấy tin đăng');
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter, activeType]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalReport) return;
    if (handlingNote.length < 10) { toast.error('Ghi chú phải có ít nhất 10 ký tự'); return; }

    setSubmitting(true);
    try {
      await api.post(`/admin/reports/${resolveModalReport.id}/resolve`, { action: resolveAction, note: handlingNote });
      toast.success('Đã xử lý thành công');
      setResolveModalReport(null);
      setHandlingNote('');
      fetchReports();
    } catch (error: any) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally { setSubmitting(false); }
  };

  const handleDismiss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dismissModalReport) return;
    if (handlingNote.length < 10) { toast.error('Lý do phải có ít nhất 10 ký tự'); return; }

    setSubmitting(true);
    try {
      await api.post(`/admin/reports/${dismissModalReport.id}/dismiss`, { note: handlingNote });
      toast.success('Đã bác bỏ thành công');
      setDismissModalReport(null);
      setHandlingNote('');
      fetchReports();
    } catch (error: any) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally { setSubmitting(false); }
  };

  const filteredReports = reports.filter(r => {
    const matches = (r.postingTitle?.toLowerCase() || "").includes(filter.toLowerCase()) ||
      (r.sellerName?.toLowerCase() || "").includes(filter.toLowerCase()) ||
      (r.reportCode?.toLowerCase() || "").includes(filter.toLowerCase());

    if (activeType === 'POSTING') return matches && r.category === 'POSTING';
    if (activeType === 'ORDER') return matches && r.category === 'ORDER';
    return matches;
  });

  const paginatedReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredReports.length / pageSize);

  const isVideo = (url: string) => ['.mp4', '.mov', '.avi', '.webm'].some(ext => url.toLowerCase().endsWith(ext)) || (url.toLowerCase().includes('cloudinary') && url.toLowerCase().includes('/video/upload/'));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý Báo cáo & Khiếu nại</h1>
          <p className="text-gray-500 mt-1">Xử lý vi phạm chính sách và tranh chấp giao dịch</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text" placeholder="Tìm theo tin đăng, người bán, mã..."
            className="pl-12 pr-6 py-4 bg-white border-0 shadow-clay rounded-2xl focus:ring-2 focus:ring-primary outline-none w-full sm:w-96 transition-all"
            value={filter} onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex p-2 bg-gray-100/50 backdrop-blur-sm rounded-[28px] w-fit border border-gray-100">
          {[
            { key: 'Pending', label: 'Chờ xử lý' },
            { key: 'Handled', label: 'Đã giải quyết' },
            { key: 'Dismissed', label: 'Đã bác bỏ' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { 
                if (statusFilter === tab.key) fetchReports();
                else { setStatusFilter(tab.key as any); setCurrentPage(1); }
              }}
              className={cn(
                "px-8 py-3.5 rounded-[22px] text-sm font-black transition-all duration-500 uppercase tracking-widest flex items-center gap-2",
                statusFilter === tab.key ? "bg-white text-primary shadow-clay" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.label}
              {tab.key === 'Pending' && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2 p-1.5 bg-gray-50 rounded-[22px] border-2 border-gray-100 shadow-inner">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'POSTING', label: 'Bài đăng' },
            { key: 'ORDER', label: 'Đơn hàng' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                if (activeType === cat.key) fetchReports();
                else { setActiveType(cat.key as any); setCurrentPage(1); }
              }}
              className={cn(
                "px-6 py-2.5 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                activeType === cat.key
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="p-32 bg-white rounded-[40px] shadow-clay flex flex-col items-center">
            <div className="w-16 h-16 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : paginatedReports.length === 0 ? (
          <div className="p-32 bg-white rounded-[40px] shadow-clay flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mb-8">
              <ShieldCheck size={48} className="text-gray-200" />
            </div>
            <p className="text-2xl font-black text-foreground">Hệ thống sạch sẽ!</p>
            <p className="text-gray-400 mt-3 font-medium text-lg">Không có nội dung nào cần xử lý.</p>
          </div>
        ) : (
          paginatedReports.map((report) => (
            <div key={report.id} className="bg-white rounded-[40px] shadow-clay border-0 p-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10 hover:shadow-clay-lg transition-all duration-500 group relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-2 h-full opacity-0 group-hover:opacity-100 transition-opacity", report.category === 'ORDER' ? "bg-amber-500" : "bg-red-500")}></div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", report.category === 'ORDER' ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500")}>
                    {report.category === 'ORDER' ? <History size={28} /> : <AlertTriangle size={28} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase", report.category === 'ORDER' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600")}>
                        {categoryLabels[report.category] || report.category}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black tracking-widest uppercase">
                        #{report.id}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black tracking-widest uppercase">{report.reportCode}</span>
                    </div>
                    <h3 className="font-black text-2xl text-foreground mt-2 tracking-tight line-clamp-1">{reasonLabels[report.reason] || report.reason}</h3>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-8 rounded-[32px] space-y-4">
                  <p className="text-lg font-bold text-gray-700 leading-relaxed italic">"{report.description}"</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 border-t border-gray-100/50">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {report.category === 'POSTING' ? 'Bài đăng bị báo cáo' : 'Sản phẩm trong đơn hàng'}
                        </p>
                        <p className="font-black text-foreground text-lg">{report.postingTitle || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người bán</p>
                        <p className="font-black text-primary text-lg">{report.sellerName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người báo cáo</p>
                        <div className="flex items-center font-black text-gray-700 text-lg">
                          <User size={18} className="mr-2 text-gray-300" /> {report.reporterName}
                        </div>
                      </div>
                      {report.category === 'ORDER' && report.orderId && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Truck size={12} /> Đơn hàng</p>
                          <p className="font-black text-foreground text-lg">{report.orderCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {statusFilter !== 'Pending' && (
                  <div className={cn("p-6 rounded-[28px] border border-dashed grid grid-cols-1 md:grid-cols-2 gap-6", statusFilter === 'Handled' ? "bg-green-50/50 border-green-100" : "bg-gray-50/50 border-gray-100")}>
                    <div>
                      <p className={cn("text-[10px] font-black uppercase mb-1", statusFilter === 'Handled' ? "text-green-700" : "text-gray-500")}>Ghi chú xử lý</p>
                      <p className="text-base font-black text-foreground">{report.handlingNote}</p>
                    </div>
                    <div className="md:text-right">
                      <p className={cn("text-[10px] font-black uppercase mb-1", statusFilter === 'Handled' ? "text-green-700" : "text-gray-500")}>Xử lý bởi {report.handledBy}</p>
                      <p className="text-base font-black text-foreground">{report.handledAt ? new Date(report.handledAt).toLocaleString('vi-VN') : '—'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:w-px lg:self-stretch bg-gray-100 hidden lg:block mx-10"></div>

              <div className="flex flex-col gap-4 min-w-[240px]">
                {statusFilter === 'Pending' ? (
                  <>
                    <button
                      onClick={() => { setResolveModalReport(report); setHandlingNote(''); setResolveAction(report.category === 'ORDER' ? 'REFUND_APPROVE' : 'HIDE_AND_WARN'); }}
                      className={cn("w-full font-black py-5 px-8 rounded-3xl shadow-xl flex items-center justify-center transition-all active:scale-95", report.category === 'ORDER' ? "bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700" : "bg-red-600 text-white shadow-red-200 hover:bg-red-700")}
                    >
                      {report.category === 'ORDER' ? <FileSearch size={20} className="mr-2" /> : <ShieldAlert size={20} className="mr-2" />}
                      Giải quyết
                    </button>

                    {report.category === 'ORDER' && report.isPostingInspected && (!report.inspectionReport || report.inspectionReport.status?.toUpperCase() === 'CANCELLED') && (
                      <button
                        onClick={async () => {
                          try {
                            const pid = report.postingId || (report as any).order?.postingId || (report as any).order?.PostingId;
                            if (!pid) { toast.error('Không tìm thấy tin đăng liên quan'); return; }
                            const res = await inspectorService.openInspectionFromReport(report.id, Number(pid));
                            if (res?.status === 'Success') { toast.success('Đã mở yêu cầu kiểm định'); fetchReports(); }
                            else { toast.error(res?.message || 'Không thể mở kiểm định'); }
                          } catch (err) { toast.error('Lỗi khi yêu cầu mở kiểm định'); }
                        }}
                        className="w-full bg-primary text-white font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all shadow-lg shadow-green-100 hover:bg-primary/90 active:scale-95"
                      >
                        <FileSearch size={18} className="mr-2" /> Mở kiểm định
                      </button>
                    )}

                    {report.category === 'ORDER' && report.inspectionReport && report.inspectionReport.status?.toUpperCase() !== 'CANCELLED' && (
                      <div className="w-full">
                        {report.inspectionReport.status?.toUpperCase() === 'COMPLETED' ? (
                          <button
                            onClick={() => setInspectionResultModal(report)}
                            className="w-full bg-primary/10 text-primary border-2 border-primary/20 font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all hover:bg-primary/20 shadow-sm"
                          >
                            <FileSearch size={18} className="mr-2" /> Xem kiểm định
                          </button>
                        ) : (
                          <div className="w-full bg-gray-50 text-gray-400 border-2 border-gray-100 font-black py-5 px-8 rounded-3xl flex items-center justify-center cursor-default">
                            <Clock size={18} className="mr-2" /> Đang chờ kiểm định
                          </div>
                        )}
                      </div>
                    )}

                    {report.category !== 'USER' && (report.postingId || (report as any).order?.postingId || (report as any).order?.PostingId) && (
                      <button
                        onClick={() => {
                          const pid = report.postingId || (report as any).order?.postingId || (report as any).order?.PostingId;
                          openPostingDetail(Number(pid));
                        }}
                        className="w-full bg-amber-50 text-amber-700 border-2 border-amber-100 hover:bg-amber-100 font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all"
                      >
                        <ExternalLink size={18} className="mr-2" /> Xem tin đăng
                      </button>
                    )}

                    {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                      <button
                        onClick={() => setEvidenceModalReport(report)}
                        className="w-full bg-blue-50 text-blue-700 border-2 border-blue-100 hover:bg-blue-100 font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all"
                      >
                        <ImageIcon size={18} className="mr-2" /> Xem minh chứng
                      </button>
                    )}

                    <button
                      onClick={() => { setDismissModalReport(report); setHandlingNote(''); }}
                      className="w-full bg-white border-2 border-gray-100 text-gray-500 hover:text-gray-700 font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all"
                    >
                      <XCircle size={20} className="mr-2" /> Bác bỏ
                    </button>
                  </>
                ) : (
                  <>
                    <div className={cn("w-full font-black py-5 px-8 rounded-3xl flex items-center justify-center border", statusFilter === 'Handled' ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-100 text-gray-500 border-gray-200")}>
                      {statusFilter === 'Handled' ? 'Đã hoàn tất' : 'Đã bác bỏ'}
                    </div>
                    {report.inspectionReport && report.inspectionReport.status?.toUpperCase() === 'COMPLETED' && (
                      <button
                        onClick={() => setInspectionResultModal(report)}
                        className="w-full bg-white border-2 border-gray-100 text-blue-600 hover:border-blue-200 font-black py-5 px-8 rounded-3xl flex items-center justify-center transition-all"
                      >
                        <FileSearch size={18} className="mr-2" />
                        Xem lại kiểm định
                      </button>
                    )}
                  </>
                )}

              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
          <Button variant="ghost" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-14 px-8 border-gray-100">Trước</Button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={cn("w-14 h-14 rounded-2xl font-black transition-all", currentPage === i + 1 ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" : "bg-gray-50 text-gray-400 hover:bg-gray-100")}>{i + 1}</button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-14 px-8 border-gray-100">Tiếp</Button>
        </div>
      )}

      {/* Posting detail modal */}
      <Dialog open={!!postingModalPosting} onOpenChange={() => setPostingModalPosting(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[40px] shadow-clay p-0 border-0">
          <DialogHeader className="p-8 bg-amber-50/50 sticky top-0 z-10 backdrop-blur-md">
            <DialogTitle className="text-2xl font-black text-amber-900 flex items-center gap-3">
              <ExternalLink /> {postingModalPosting?.title || 'Chi tiết tin đăng'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><ImageIcon size={16} /> Hình ảnh & Video</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {postingModalPosting?.images?.map((img: string, idx: number) => (
                  <div key={idx} className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm aspect-square relative group">
                    <img src={img} alt={`img-${idx}`} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                    <a href={img} target="_blank" rel="noreferrer" className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 bg-black/20 flex items-center justify-center transition-opacity">
                      <Button variant="secondary" size="sm" className="font-bold rounded-xl">Phóng to</Button>
                    </a>
                  </div>
                ))}
                {postingModalPosting?.videoUrl && (
                  <div className="col-span-2 rounded-2xl overflow-hidden bg-black shadow-lg relative group aspect-video md:aspect-auto">
                    <video controls src={postingModalPosting.videoUrl} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Mô tả chi tiết</h4>
              <div className="p-6 bg-gray-50 rounded-[28px] text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{postingModalPosting?.description}</div>
            </div>
            {postingModalPosting?.bicycle && (
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Zap size={16} /> Thông số xe đạp</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(postingModalPosting.bicycle).filter(([k, v]) => v !== null && v !== "" && !["id", "conditionPercentage", "hasOriginalReceipt"].includes(k)).map(([k, v]: any) => (
                    <div key={k} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{specLabels[k] || k}</span>
                      <span className="text-sm font-bold text-gray-900">{k === 'condition' ? conditionLabels[v] || v : v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-8 pt-0"><Button onClick={() => setPostingModalPosting(null)} className="w-full rounded-2xl py-6 font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 border-0">Đóng lại</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence View Modal */}
      <Dialog open={!!evidenceModalReport} onOpenChange={() => setEvidenceModalReport(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[40px] shadow-clay p-0 border-0 outline-none">
          <DialogHeader className="p-8 bg-blue-50/50 sticky top-0 z-10 backdrop-blur-md">
            <DialogTitle className="text-2xl font-black text-blue-900 flex items-center gap-3">
              <ImageIcon className="text-blue-600" /> Minh chứng báo cáo #{evidenceModalReport?.reportCode}
            </DialogTitle>
            <DialogDescription className="font-bold text-blue-800/60 mt-1">
              Hình ảnh và video do người dùng cung cấp làm bằng chứng vi phạm.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidenceModalReport?.evidenceUrls?.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm aspect-square relative group border-2 border-white">
                    {isVideo(url) ? (
                      <video src={url} className="w-full h-full object-cover" controls />
                    ) : (
                      <>
                        <img src={url} alt={`evidence-${idx}`} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                        <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 bg-black/20 flex items-center justify-center transition-opacity">
                          <Button variant="secondary" size="sm" className="font-bold rounded-xl shadow-lg">Phóng to</Button>
                        </a>
                      </>
                    )}
                  </div>
                ))}
                {evidenceModalReport?.inspectionReport?.inspectionVideoUrl && (
                  <div className="col-span-1 md:col-span-2 rounded-2xl overflow-hidden bg-black shadow-lg relative aspect-video border-2 border-white">
                    <div className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Video Kiểm định</div>
                    <video controls src={evidenceModalReport.inspectionReport.inspectionVideoUrl} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung báo cáo</p>
              <p className="text-gray-700 font-bold leading-relaxed italic">"{evidenceModalReport?.description}"</p>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-4">
            <Button onClick={() => setEvidenceModalReport(null)} className="flex-1 rounded-2xl py-6 font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 border-0">Đóng lại</Button>
            <Button 
              onClick={() => {
                setResolveModalReport(evidenceModalReport);
                setEvidenceModalReport(null);
              }}
              className="flex-1 rounded-2xl py-6 font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100"
            >
              Tiến hành xử lý <ArrowRight size={18} className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={!!resolveModalReport} onOpenChange={(open) => !open && setResolveModalReport(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[40px] border-0 shadow-clay p-0 overflow-hidden outline-none">
          <DialogHeader className={cn("p-8", resolveModalReport?.category === 'ORDER' ? "bg-amber-50" : "bg-red-50")}>
            <DialogTitle className={cn("text-2xl font-black tracking-tight flex items-center gap-3", resolveModalReport?.category === 'ORDER' ? "text-amber-600" : "text-red-600")}>
              <Award /> {resolveModalReport?.category === 'ORDER' ? 'Giải quyết Tranh chấp' : 'Phán quyết vi phạm'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Chọn hành động phù hợp để xử lý báo cáo #{resolveModalReport?.reportCode}. Các thay đổi về điểm uy tín sẽ được áp dụng tự động.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolve} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {((resolveModalReport?.evidenceUrls && resolveModalReport.evidenceUrls.length > 0) || resolveModalReport?.inspectionReport?.inspectionVideoUrl) && (
              <div className="space-y-3">
                <Label className="font-black text-gray-700 text-sm uppercase tracking-widest ml-2">Minh chứng vi phạm</Label>
                <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-3xl">
                  {resolveModalReport?.evidenceUrls?.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm relative group">
                      {isVideo(url) ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <Play size={16} fill="white" className="text-white" />
                        </div>
                      ) : (
                        <img src={url} className="w-full h-full object-cover" alt="Evidence" />
                      )}
                      <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 z-10" />
                    </div>
                  ))}
                  {resolveModalReport?.inspectionReport?.inspectionVideoUrl && (
                    <div key="ir-video" className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-gray-900 relative group">
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Play size={16} fill="white" className="text-white" />
                        <span className="text-[8px] font-black text-white uppercase mt-1">Video KĐ</span>
                      </div>
                      <a href={resolveModalReport.inspectionReport.inspectionVideoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 z-10" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="font-black text-gray-700 text-sm uppercase tracking-widest ml-2">Phán quyết & Hành động *</Label>
              <RadioGroup value={resolveAction} onValueChange={setResolveAction} className="grid grid-cols-1 gap-4">
                {(resolveModalReport?.category === 'ORDER' ? (
                  [
                    { id: 'REFUND_APPROVE', label: 'Chấp nhận Khiếu nại (Hoàn hàng/Trả tiền)', penalty: 'TECHNICAL' },
                    { id: 'REFUND_REJECT', label: 'Từ chối Khiếu nại', penalty: 'OTHER' },
                    { id: 'BOMB_PENALTY', label: 'Phạt Bom hàng', penalty: 'BOMB' },
                  ]
                ) : (
                  [
                    { id: 'HIDE_POSTING', label: 'Ẩn tin đăng vi phạm', penalty: 'FAKE_PRODUCT' },
                    { id: 'DELETE_POSTING', label: 'Xóa tin đăng vi phạm', penalty: 'FAKE_PRODUCT' },
                    { id: 'HIDE_AND_WARN', label: 'Ẩn tin + Cảnh cáo Seller', penalty: 'FAKE_PRODUCT' },
                    { id: 'HIDE_AND_BAN', label: 'Khóa vĩnh viễn tài khoản', penalty: 'SCAM' },
                  ]
                )).map((action) => (
                  <Label
                    key={action.id}
                    htmlFor={action.id}
                    className={cn(
                      "flex flex-col p-5 rounded-3xl border transition-all cursor-pointer relative isolate",
                      resolveAction === action.id
                        ? (resolveModalReport?.category === 'ORDER' ? "border-amber-500 bg-amber-50/50 shadow-inner" : "border-red-500 bg-red-50/50 shadow-inner")
                        : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={action.id} id={action.id} className={resolveModalReport?.category === 'ORDER' ? "text-amber-600 border-amber-500" : "text-red-600 border-red-500"} />
                      <span className="font-black cursor-pointer text-base">{action.label}</span>
                    </div>
                    <div className="mt-3 ml-7 space-y-1.5">
                      <div className={cn(
                        "flex items-start gap-2",
                        resolveModalReport?.category === 'ORDER' ? "text-amber-700" : "text-red-700"
                      )}>
                        <Zap size={12} className={cn("mt-1", resolveModalReport?.category === 'ORDER' ? "fill-amber-700" : "fill-red-700")} />
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-tight">Hệ quả:</div>
                          <div className="mt-1 text-sm font-black">
                            {(() => {
                              const txt = reputationPenalties[action.penalty] || '';
                              const parts = txt.split('\n');
                              return (
                                <>
                                  <div>{parts[0]}</div>
                                  {parts[1] ? <div className="text-green-600">{parts[1]}</div> : null}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="font-black text-gray-700 text-sm uppercase tracking-widest ml-2">Ghi chú & Phán quyết công khai *</Label>
              <Textarea 
                placeholder="Nhập chi tiết phán quyết và lý do cho các bên liên quan..." 
                className="rounded-3xl min-h-[120px] bg-gray-50 border-0 p-6 font-medium leading-relaxed focus:ring-2 focus:ring-primary/20" 
                value={handlingNote} 
                onChange={(e) => setHandlingNote(e.target.value)} 
              />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Ít nhất 10 ký tự</p>
            </div>

            <DialogFooter className="gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => setResolveModalReport(null)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest">Hủy</Button>
              <Button
                type="submit"
                disabled={submitting || !isHandlingNoteValid}
                className={cn(
                  "flex-[2] rounded-2xl h-14 font-black uppercase tracking-widest text-white shadow-xl",
                  resolveModalReport?.category === 'ORDER'
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-red-600 hover:bg-red-700 shadow-red-200",
                  (submitting || !isHandlingNoteValid) ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : !isHandlingNoteValid ? (
                  'Ghi chú ít nhất 10 ký tự'
                ) : (
                  'Xác nhận xử lý'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dismiss Modal */}
      <Dialog open={!!dismissModalReport} onOpenChange={() => setDismissModalReport(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[40px] shadow-clay border-0 p-10 outline-none">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center"><XCircle size={24} /></div>Bác bỏ báo cáo</DialogTitle><DialogDescription className="font-bold text-gray-500 text-lg">Bạn chắc chắn báo cáo này là không chính xác?</DialogDescription></DialogHeader>
          <form onSubmit={handleDismiss} className="space-y-8">
            <div className="space-y-3">
              <Label className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2">Lý do bác bỏ *</Label>
              <Textarea placeholder="Nhập lý do bác bỏ chi tiết..." className="rounded-[32px] min-h-[180px] bg-gray-50 border-0 shadow-inner p-8 font-medium text-lg leading-relaxed focus:ring-2 focus:ring-gray-200" value={handlingNote} onChange={(e) => setHandlingNote(e.target.value)} />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">Ít nhất 10 ký tự</p>
            </div>
            <DialogFooter className="sm:justify-start gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting || !isHandlingNoteValid}
                className={cn(
                  "flex-1 rounded-2xl h-16 font-black uppercase tracking-widest",
                  "bg-gray-900 hover:bg-black text-white shadow-xl",
                  (submitting || !isHandlingNoteValid) ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                {submitting ? <Loader2 className="animate-spin" /> : !isHandlingNoteValid ? 'Ít nhất 10 ký tự' : 'Xác nhận bác bỏ'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDismissModalReport(null)} className="rounded-2xl h-16 font-black uppercase tracking-widest px-10">Hủy</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspection View Modal */}
      <Dialog open={!!inspectionResultModal} onOpenChange={(open) => !open && setInspectionResultModal(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[40px] border-0 shadow-clay p-0 overflow-hidden outline-none">
          <DialogHeader className={cn("p-8", (inspectionResultModal?.inspectionReport?.result === 'PASSED' || inspectionResultModal?.inspectionReport?.result === 'TRUE') ? "bg-green-50" : "bg-red-50")}>
            <DialogTitle className={cn("text-2xl font-black tracking-tight flex items-center gap-3", (inspectionResultModal?.inspectionReport?.result === 'PASSED' || inspectionResultModal?.inspectionReport?.result === 'TRUE') ? "text-green-600" : "text-red-600")}>
              {(inspectionResultModal?.inspectionReport?.result === 'PASSED' || inspectionResultModal?.inspectionReport?.result === 'TRUE') ? <ShieldCheck /> : <ShieldAlert />}
              Kết quả Kiểm định từ KĐV
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kết luận</p>
                <p className={cn("font-black text-lg", (inspectionResultModal?.inspectionReport?.result === 'PASSED' || inspectionResultModal?.inspectionReport?.result === 'TRUE') ? "text-green-600" : "text-red-600")}>
                  {(inspectionResultModal?.inspectionReport?.result === 'PASSED' || inspectionResultModal?.inspectionReport?.result === 'TRUE') ? 'ĐẠT KIỂM ĐỊNH / ĐÚNG' : 'KHÔNG ĐẠT / SAI'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngày kiểm định</p>
                <p className="font-black text-foreground text-lg">
                  {inspectionResultModal?.inspectionReport?.inspectedAt ? new Date(inspectionResultModal.inspectionReport.inspectedAt).toLocaleDateString('vi-VN') : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-gray-700 text-sm uppercase tracking-widest ml-2">Ghi chú từ KĐV</Label>
              <div className="bg-gray-50 p-6 rounded-3xl min-h-[100px] text-gray-700 font-medium leading-relaxed">
                {inspectionResultModal?.inspectionReport?.comments || inspectionResultModal?.inspectionReport?.notes || 'Không có ghi chú chi tiết.'}
              </div>
            </div>

            {inspectionResultModal?.inspectionReport?.inspectionVideoUrl && (
              <div className="space-y-2">
                <Label className="font-black text-gray-700 text-sm uppercase tracking-widest ml-2">Video quay lại quá trình</Label>
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 group">
                  <video src={inspectionResultModal.inspectionReport.inspectionVideoUrl} className="w-full h-full object-cover" controls />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setInspectionResultModal(null)} className="rounded-2xl font-black px-12 py-6 bg-gray-100 text-gray-500 border-0 shadow-none flex-1">Đóng</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportManagementPage;
