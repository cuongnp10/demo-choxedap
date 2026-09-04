import React, { useEffect, useState, useRef } from 'react';
import inspectorService from '../../services/inspectorService';
import type { InspectionRequest, SubmitReportDto, InspectionReport } from '../../services/inspectorService';
import { uploadToCloudinary } from '../../services/cloudinary';
import { toast, Toaster } from 'sonner';
import { 
  ClipboardCheck, 
  MapPin, 
  Calendar, 
  Loader2,
  Check,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  MessageSquare,
  Trophy,
  AlertTriangle,
  Image,
  Play,
  Gavel,
  User,
  ExternalLink,
  History,
  Truck,
  Clock,
  Upload
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type InspectionStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
type InspectionCategory = 'POSTING' | 'ORDER';

const statusLabels: Record<string, string> = {
  'PENDING': 'Chờ nhận',
  'ACCEPTED': 'Đang thực hiện',
  'COMPLETED': 'Hoàn thành',
  'CANCELLED': 'Đã hủy'
};

const InspectionRequestsPage = () => {
  const [requests, setRequests] = useState<InspectionRequest[]>([]);
  const [disputes, setDisputes] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InspectionStatus>('PENDING');
  const [activeCategory, setActiveCategory] = useState<InspectionCategory>('POSTING');

  // Modal States
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<InspectionReport | null>(null);
  const [resolveVerdict, setResolveVerdict] = useState('');

  // Form States
  const [meetUrl, setMeetUrl] = useState('https://meet.google.com/abc-xyz-def');
  const [inspectionResult, setInspectionResult] = useState<boolean>(true); // true = Pass/Correct, false = Fail/Wrong
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [reportForm, setReportForm] = useState({
    comments: '',
    reportUrl: 'https://drive.google.com/file/d/...',
    meetingRecordUrl: '' // This can still manually hold a URL
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (activeCategory === 'ORDER') {
        const res = await inspectorService.getInspectionReports(activeTab);
        console.log(`[Inspector] Fetched ORDER reports for ${activeTab}:`, res.data);
        setDisputes(res.data || []);
        setRequests([]);
      } else {
        const response = await inspectorService.getInspections(activeTab);
        console.log(`[Inspector] Fetched POSTING requests for ${activeTab}:`, response.data);
        
        if (activeTab === 'COMPLETED' || activeTab === 'ACCEPTED') {
          const list: InspectionRequest[] = response.data || [];
          const detailedList = await Promise.all(
            list.map(async (req) => {
              try {
                const detailRes = await inspectorService.getInspectionDetail(req.id);
                return { ...req, ...detailRes.data };
              } catch {
                return req;
              }
            })
          );
          setRequests(detailedList);
        } else {
          setRequests(response.data || []);
        }
      }
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu từ server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, activeCategory]);

  const handleOpenAccept = (id: number) => {
    setProcessingId(id);
    setIsAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    // If a dispute (ORDER category) is selected, call server endpoint to accept InspectionReport
    if (activeCategory === 'ORDER' && selectedDispute) {
      setIsSubmittingModal(true);
      try {
        await inspectorService.acceptInspectionReport(selectedDispute.id, meetUrl);
        // Remove from local list immediately
        setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
        toast.success('Đã nhận kiểm định cho đơn');
        setIsAcceptModalOpen(false);
        setSelectedDispute(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể nhận kiểm định');
      } finally {
        setIsSubmittingModal(false);
      }
      return;
    }

    if (!processingId || !meetUrl) return;
    setIsSubmittingModal(true);
    try {
      await inspectorService.acceptInspection(processingId, meetUrl);
      setRequests(prev => prev.filter(r => r.id !== processingId));
      toast.success('Đã nhận yêu cầu kiểm định');
      setIsAcceptModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể nhận yêu cầu');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const [cancelReason, setCancelReason] = useState('');

  const handleOpenCancel = (id: number) => {
    setCancelReason(''); // Reset reason
    if (activeCategory === 'ORDER') {
      const d = disputes.find(x => x.id === id);
      setSelectedDispute(d || null);
      setIsCancelModalOpen(true);
      return;
    }
    setProcessingId(id);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    setIsSubmittingModal(true);
    try {
      if (activeCategory === 'ORDER' && selectedDispute) {
        await inspectorService.cancelInspectionReport(selectedDispute.id, cancelReason);
        setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
        toast.success('Đã hủy đơn tranh chấp');
        setIsCancelModalOpen(false);
        setSelectedDispute(null);
        return;
      }

      if (!processingId) return;
      await inspectorService.cancelInspection(processingId, cancelReason);
      setRequests(prev => prev.filter(r => r.id !== processingId));
      toast.success('Đã hủy yêu cầu thành công');
      setIsCancelModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy yêu cầu');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleOpenReport = async (id: number) => {
    setInspectionResult(true); // Reset to default true (Pass/Correct)
    setVideoFile(null);
    if (activeCategory === 'ORDER') {
      const d = disputes.find(x => x.id === id);
      setSelectedDispute(d || null);
      setReportForm({ ...reportForm, comments: '', meetingRecordUrl: '' });
      setIsReportModalOpen(true);
      return;
    }
    
    setProcessingId(id);
    setReportForm({ ...reportForm, comments: '', meetingRecordUrl: '' });
    setIsReportModalOpen(true);

    // Fetch details to ensure we have media and specs for the modal
    try {
      const detailRes = await inspectorService.getInspectionDetail(id);
      if (detailRes.status === "Success") {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, ...detailRes.data } : r));
      }
    } catch (error) {
      console.error("Failed to fetch inspection details for modal", error);
    }
  };

  const handleConfirmReport = async () => {
    setIsSubmittingModal(true);
    try {
      let finalVideoUrl = reportForm.meetingRecordUrl;

      // 1. If there's a video file, upload it first
      if (videoFile) {
        setIsUploadingVideo(true);
        try {
          const res = await uploadToCloudinary(videoFile);
          finalVideoUrl = res.secure_url;
        } catch (err) {
          toast.error('Lỗi khi tải video lên Cloudinary');
          setIsSubmittingModal(false);
          setIsUploadingVideo(false);
          return;
        }
        setIsUploadingVideo(false);
      }

      if (!finalVideoUrl && !reportForm.meetingRecordUrl) {
        toast.error('Vui lòng tải lên video minh chứng hoặc cung cấp link');
        setIsSubmittingModal(false);
        return;
      }

      // Map boolean result to the required backend string
      const finalResult = activeCategory === 'ORDER' 
        ? (inspectionResult ? 'TRUE' : 'FALSE') 
        : (inspectionResult ? 'PASSED' : 'FAILED');

      const reportDto: SubmitReportDto = {
        result: finalResult as any,
        comments: reportForm.comments,
        inspectionVideoUrl: finalVideoUrl,
        inspectedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      };

      if (activeCategory === 'ORDER' && selectedDispute) {
        await inspectorService.submitInspectionReport(selectedDispute.id, reportDto);
        setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
        toast.success('Đã gửi báo cáo kiểm định cho đơn');
        setIsReportModalOpen(false);
        setSelectedDispute(null);
        setReportForm({ comments: '', reportUrl: '', meetingRecordUrl: '' });
        setVideoFile(null);
        return;
      }

      if (!processingId) return;
      await inspectorService.submitReport(processingId, reportDto);
      setRequests(prev => prev.filter(r => r.id !== processingId));
      toast.success('Đã gửi báo cáo kiểm định thành công');
      setIsReportModalOpen(false);
      setReportForm({ comments: '', reportUrl: '', meetingRecordUrl: '' });
      setVideoFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi báo cáo thất bại');
    } finally {
      setIsSubmittingModal(false);
    }
  };


  const processingRequest = processingId ? requests.find(r => r.id === processingId) : null;

  const mediaUrlsForModal = (() => {
    // For ORDER category, use selectedDispute attachments; for POSTING use processingRequest.mediaUrls
    if (activeCategory === 'ORDER') {
      if (!selectedDispute) return [] as string[];
      const urls = [...(selectedDispute.mediaUrls || [])];
      if (selectedDispute.inspectionVideoUrl && !urls.includes(selectedDispute.inspectionVideoUrl)) urls.unshift(selectedDispute.inspectionVideoUrl);
      return urls;
    }
    return processingRequest?.mediaUrls || [];
  })();

  const isVideo = (url: string) => {
    const videoExts = ['.mp4', '.mov', '.avi', '.webm'];
    return videoExts.some(ext => url.toLowerCase().includes(ext));
  };

  const isOrder = activeCategory === 'ORDER';
  const theme = {
    text: isOrder ? 'text-amber-600' : 'text-primary',
    bg: isOrder ? 'bg-amber-600' : 'bg-primary',
    hoverBg: isOrder ? 'hover:bg-amber-700' : 'hover:bg-primary/90',
    lightBg: isOrder ? 'bg-amber-50' : 'bg-primary/5',
    border: isOrder ? 'border-amber-100' : 'border-primary/10',
    icon: isOrder ? 'text-amber-600' : 'text-primary',
    iconBg: isOrder ? 'bg-amber-100' : 'bg-primary/10',
    shadow: isOrder ? 'shadow-amber-200' : 'shadow-primary/20'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Cổng thông tin Inspector</h1>
          <p className="text-gray-500 mt-1">Thực hiện kiểm định bài đăng và giải quyết tranh chấp kỹ thuật</p>
        </div>
      </div>

      {/* Top category selector (outermost): Posting vs Order */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => setActiveCategory('POSTING')}
          className={cn(
            'px-6 py-2 rounded-[18px] font-bold transition-all',
            activeCategory === 'POSTING' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-600'
          )}
        >
          Bài đăng (người bán)
        </button>
        <button
          onClick={() => setActiveCategory('ORDER')}
          className={cn(
            'px-6 py-2 rounded-[18px] font-bold transition-all',
            activeCategory === 'ORDER' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-gray-100 text-gray-600'
          )}
        >
          Đơn hàng (người mua)
        </button>
      </div>

      <div className="flex p-1.5 bg-gray-100 rounded-[24px] w-fit overflow-x-auto max-w-full gap-1">
        {[
          { key: 'PENDING', label: 'Chờ nhận' },
          { key: 'ACCEPTED', label: 'Đang thực hiện' },
          { key: 'COMPLETED', label: 'Hoàn thành' },
          { key: 'CANCELLED', label: 'Đã hủy' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "px-6 sm:px-8 py-3 rounded-[18px] text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2",
              activeTab === tab.key 
                ? `bg-white ${theme.text} shadow-sm` 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-6">
          <Loader2 className={cn("w-12 h-12 animate-spin", theme.text)} />
          <p className="text-gray-500 font-bold tracking-tight text-sm uppercase tracking-widest">Đang đồng bộ dữ liệu...</p>
        </div>
      ) : activeCategory === 'ORDER' ? (
        disputes.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[32px] shadow-clay border-0">
            <ClipboardCheck size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg">Không có báo cáo kiểm định</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {disputes.map((d: InspectionReport) => {
              const orderId = d.order?.id ?? d.userReportId ?? d.id;
              const title = d.order?.postingTitle ?? 'Tiêu đề không xác định';
              const description = d.comments ?? d.result ?? '';

              return (
                <div key={d.id} className="group bg-white rounded-[32px] shadow-clay border-0 p-8 hover:scale-[1.02] transition-all duration-300 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", theme.iconBg)}>
                        <Gavel className={theme.icon} size={28} />
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border leading-tight", theme.text, theme.lightBg, theme.border)}>
                        Yêu cầu kiểm định xe đang mua
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest shrink-0 mt-1">
                      #{orderId}
                    </div>
                  </div>
                  <h3 className={cn("font-bold text-xl text-foreground mb-6 line-clamp-2 leading-tight transition-colors flex-grow", isOrder ? 'group-hover:text-amber-600' : 'group-hover:text-primary')}>
                    {title}
                  </h3>
                  
                  {d.status === 'COMPLETED' && (
                    <div className="space-y-3 mb-6">
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] w-fit shadow-sm border",
                        d.result === 'TRUE' 
                          ? "bg-emerald-500 text-white border-emerald-400" 
                          : "bg-red-500 text-white border-red-400"
                      )}>
                        {d.result === 'TRUE' ? 'BÁO CÁO ĐÚNG (TRUE)' : 'BÁO CÁO SAI (FALSE)'}
                      </div>
                      
                      <div className={cn(
                        "p-5 rounded-3xl text-sm font-medium border-2 transition-colors",
                        d.result === 'TRUE'
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                          : "bg-red-50/50 border-red-100 text-red-900"
                      )}>
                        <p className={cn(
                          "font-black uppercase text-[10px] tracking-widest mb-2",
                          d.result === 'TRUE' ? "text-emerald-600" : "text-red-600"
                        )}>Nhận xét của bạn</p>
                        <p className="italic leading-relaxed">"{d.comments || 'Không có nhận xét chi tiết'}"</p>
                      </div>
                    </div>
                  )}

                  {d.status === 'CANCELLED' && (
                    <div className="p-4 rounded-2xl text-sm font-medium border border-red-100/50 mb-4 bg-red-50/30 text-red-600">
                      <p className="font-black uppercase text-[10px] tracking-widest mb-1">Lý do hủy</p>
                      <p className="italic text-gray-700 leading-relaxed">"{d.cancelReason || 'Không có lý do chi tiết'}"</p>
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-500 text-sm font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3"><MapPin size={16} className={theme.icon} /></div>
                      {d.location && d.location !== 'N/A' ? (
                        <span className="line-clamp-1">{d.location}</span>
                      ) : (
                        <span className="line-clamp-1 text-gray-400 italic">Địa điểm chưa xác định</span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3"><Calendar size={16} className={theme.icon} /></div>
                      <span>{new Date(d.requestedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {d.status === 'ACCEPTED' && d.externalInspectionLink && (
                      <a href={d.externalInspectionLink} target="_blank" rel="noreferrer" className={cn("hover:underline text-sm font-bold break-all block p-3 rounded-xl border", theme.text, theme.lightBg, theme.border)}>
                        {d.externalInspectionLink}
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 italic mb-4">{description}</p>
                  <div className="mt-auto">
                    <div className="flex gap-2">
                      {d.mediaUrls?.slice(0, 3).map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="w-1/3 aspect-square rounded-xl overflow-hidden border border-gray-100">
                          <img src={url} className="w-full h-full object-cover" />
                        </a>
                      ))}
                      {d.inspectionVideoUrl && (d.mediaUrls?.length || 0) < 3 ? (
                        <a href={d.inspectionVideoUrl} target="_blank" rel="noreferrer" className="w-1/3 aspect-square rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-900 text-white">Video</a>
                      ) : null}
                    </div>

                    <div className="mt-6 space-y-3">
                      {d.status === 'PENDING' ? (
                        <button onClick={() => { setSelectedDispute(d); setIsAcceptModalOpen(true); }} className={cn("w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center transition-all", theme.bg, theme.hoverBg, theme.shadow)}>
                          <Plus size={20} className="mr-2" /> Nhận kiểm định
                        </button>
                      ) : d.status === 'ACCEPTED' ? (
                        <>
                          <button onClick={() => { setSelectedDispute(d); setIsReportModalOpen(true); }} className={cn("w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all shadow-lg", theme.bg, theme.hoverBg, theme.shadow)}>
                            <Check size={20} className="mr-2" /> Gửi báo cáo
                          </button>
                          <button onClick={() => { setSelectedDispute(d); setIsCancelModalOpen(true); }} className="w-full bg-white border-2 border-red-500 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center transition-all hover:bg-red-50">
                            <XCircle size={20} className="mr-2" /> Hủy nhận
                          </button>
                        </>
                      ) : (
                        <div className="w-full bg-gray-50 text-gray-400 font-bold py-4 rounded-2xl flex items-center justify-center border border-gray-100">
                          <CheckCircle size={20} className="mr-2" /> {statusLabels[d.status || 'PENDING'] || d.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : requests.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[32px] shadow-clay border-0">
          <ClipboardCheck size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-lg">Mọi thứ đã gọn gàng!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map((request) => (
            <div key={request.id} className="group bg-white rounded-[32px] shadow-clay border-0 p-8 hover:scale-[1.02] transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", theme.iconBg)}>
                    <ClipboardCheck className={theme.icon} size={28} />
                  </div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border leading-tight", theme.text, theme.lightBg, theme.border)}>
                    Yêu cầu kiểm định xe bán
                  </span>
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest shrink-0 mt-1">
                  #{request.id}
                </div>
              </div>
              <h3 className={cn("font-bold text-xl text-foreground mb-6 line-clamp-2 leading-tight transition-colors flex-grow", isOrder ? 'group-hover:text-amber-600' : 'group-hover:text-primary')}>
                {request.postingTitle}
              </h3>

              {request.status === 'COMPLETED' && request.record && (
                <div className={cn("px-3 py-2 rounded-xl text-xs font-bold w-fit", request.record.result === 'PASSED' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                  {request.record.result === 'PASSED' ? 'ĐẠT (PASSED)' : 'KHÔNG ĐẠT (FAILED)'}
                </div>
              )}
              
              {request.status === 'COMPLETED' && request.record && (
                <div className={cn("p-4 rounded-2xl text-sm font-medium border border-emerald-100/50 mb-4 bg-emerald-50/30", theme.text)}>
                  <p className="font-black uppercase text-[10px] tracking-widest mb-1 text-emerald-600">Nhận xét của bạn</p>
                  <p className="italic text-gray-700 leading-relaxed">"{request.record.comments || 'Không có nhận xét chi tiết'}"</p>
                </div>
              )}

              {request.status === 'CANCELLED' && (
                <div className="p-4 rounded-2xl text-sm font-medium border border-red-100/50 mb-4 bg-red-50/30 text-red-600">
                  <p className="font-black uppercase text-[10px] tracking-widest mb-1">Lý do hủy</p>
                  <p className="italic text-gray-700 leading-relaxed">"{request.cancelReason || 'Không có lý do chi tiết'}"</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-500 text-sm font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3"><MapPin size={16} className={theme.icon} /></div>
                  {request.location && request.location !== 'N/A' ? (
                    <span className="line-clamp-1">{request.location}</span>
                  ) : (
                    <span className="line-clamp-1 text-gray-400 italic">Địa điểm chưa xác định</span>
                  )}
                </div>
                <div className="flex items-center text-gray-500 text-sm font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3"><Calendar size={16} className={theme.icon} /></div>
                  <span>{new Date(request.requestedDate).toLocaleDateString('vi-VN')}</span>
                </div>
                {request.status === 'ACCEPTED' && request.externalInspectionLink && (
                  <a href={request.externalInspectionLink} target="_blank" rel="noreferrer" className={cn("hover:underline text-sm font-bold break-all block p-3 rounded-xl border", theme.text, theme.lightBg, theme.border)}>
                    {request.externalInspectionLink}
                  </a>
                )}
                
              </div>
              <div className="space-y-3">
                {request.status === 'PENDING' ? (
                  <button onClick={() => handleOpenAccept(request.id)} className={cn("w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center transition-all", theme.bg, theme.hoverBg, theme.shadow)}>
                    <Plus size={20} className="mr-2" /> Nhận kiểm định
                  </button>
                ) : request.status === 'ACCEPTED' ? (
                  <>
                    <button onClick={() => handleOpenReport(request.id)} className={cn("w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all shadow-lg", theme.bg, theme.hoverBg, theme.shadow)}>
                      <Check size={20} className="mr-2" /> Gửi báo cáo
                    </button>
                    <button onClick={() => handleOpenCancel(request.id)} className="w-full bg-white border-2 border-red-500 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center transition-all hover:bg-red-50">
                      <XCircle size={20} className="mr-2" /> Hủy nhận
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-gray-50 text-gray-400 font-bold py-4 rounded-2xl flex items-center justify-center border border-gray-100">
                    <CheckCircle size={20} className="mr-2" /> {request.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center text-4xl">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mr-3", theme.iconBg)}>
                <Video className={theme.icon} size={20} />
              </div>
              Nhận kiểm định
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-500 text-base">
              Vui lòng cung cấp link cuộc họp trực tuyến (Google Meet/Zoom) để chủ xe có thể tham gia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meetUrl" className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] ml-2">Link cuộc họp</Label>
              <Input
                id="meetUrl"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className={cn("rounded-xl py-6 bg-gray-50 border-0 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-inner", isOrder ? 'focus-visible:ring-amber-600' : 'focus-visible:ring-primary')}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start gap-3">
            <Button
              type="button"
              className={cn("rounded-xl px-8 py-6 font-bold flex-1 text-white shadow-lg", theme.bg, theme.hoverBg, theme.shadow)}
              onClick={handleConfirmAccept}
              disabled={isSubmittingModal || !meetUrl}
            >
              {isSubmittingModal ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Xác nhận
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl px-8 py-6 font-bold flex-1"
              onClick={() => setIsAcceptModalOpen(false)}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 flex items-center text-4xl">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mr-3">
                <XCircle className="text-red-600" size={20} />
              </div>
              Hủy nhận yêu cầu
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-500 text-base">
              Vui lòng nhập lý do hủy yêu cầu kiểm định này.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] ml-2">Lý do hủy *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Nhập lý do chi tiết..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="rounded-xl min-h-[120px] bg-gray-50 border-0 focus-visible:ring-red-500 shadow-inner p-4 font-medium"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-start gap-3 mt-2">
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl px-8 py-6 font-bold flex-1 shadow-lg shadow-red-200"
              onClick={handleConfirmCancel}
              disabled={isSubmittingModal || !cancelReason.trim()}
            >
              {isSubmittingModal ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Xác nhận hủy
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl px-8 py-6 font-bold flex-1 border-2 border-gray-100"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Quay lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute / Order Modal (legacy, unused by categories now) */}
      <Dialog open={isDisputeModalOpen} onOpenChange={setIsDisputeModalOpen}>
        {/* Simplified for brevity - original code preserved in logic above */}
      </Dialog>

      {/* Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className={cn("rounded-[40px] max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl transition-all duration-500", activeCategory === 'ORDER' ? "sm:max-w-6xl" : "sm:max-w-4xl")}>
          <DialogHeader className="p-10 pb-4 text-4xl">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mr-4", theme.iconBg)}>
                <ClipboardCheck className={theme.icon} size={24} />
              </div>
              Gửi báo cáo kết quả
            </DialogTitle>
          </DialogHeader>

          <div className={cn(
            "flex flex-col lg:grid divide-y lg:divide-y-0 lg:divide-x divide-gray-100",
            activeCategory === 'ORDER' ? "lg:grid-cols-3" : "lg:grid-cols-2"
          )}>
            {/* Column 1: User Report (Original Dispute) - ONLY for ORDER mode */}
            {activeCategory === 'ORDER' && (
              <div className="p-10 bg-red-50/20 flex flex-col gap-8 animate-in slide-in-from-left duration-500">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-4xl">
                      <AlertTriangle size={16} className="text-red-600" />
                    </div>
                    <h4 className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] mt-0.5">Khiếu nại của người mua</h4>
                  </div>
                  
                  <div className="p-6 bg-white rounded-3xl border-2 border-red-50 shadow-sm min-h-[120px]">
                    <p className="text-base font-bold text-gray-700 leading-relaxed italic">
                      "{selectedDispute?.userReportDescription || 'Không có mô tả chi tiết'}"
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] mb-6 ml-1">Bằng chứng khiếu nại</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDispute?.userReportEvidence?.map((url: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-clay border-2 border-white group">
                        {isVideo(url) ? <div className="w-full h-full bg-gray-900 flex items-center justify-center"><Play size={20} fill="white" className="text-white" /></div> : <img src={url} className="w-full h-full object-cover" />}
                        <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ExternalLink size={14} className="text-white" /></a>
                      </div>
                    ))}
                    {(!selectedDispute?.userReportEvidence || selectedDispute.userReportEvidence.length === 0) && (
                      <div className="col-span-2 py-8 text-center bg-white/50 rounded-2xl border-2 border-dashed border-gray-100 text-base">
                        <p className="font-black text-gray-300 uppercase tracking-widest text-center">Không có minh chứng</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Column 2: Posting Specs & Images (Reference) */}
            <div className="p-10 bg-gray-50/50 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-4xl", theme.iconBg)}>
                    <FileText size={16} className={theme.icon} />
                  </div>
                  <h4 className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] mt-0.5">Thông số tin đăng</h4>
                </div>
                
                {(() => {
                  const specs = activeCategory === 'ORDER' ? selectedDispute?.bicycleSpecs : processingRequest?.bicycleSpecs;
                  if (!specs) return <div className="flex justify-center p-8 text-gray-300 italic text-sm text-base">Đang tải thông số...</div>;
                  
                  return (
                    <div className="space-y-2.5">
                      {Object.entries(specs).map(([key, value]) => {
                        if (!value) return null;
                        
                        const labelMap: Record<string, string> = {
                          brandName: 'Hãng',
                          categoryName: 'Dòng',
                          model: 'Model',
                          year: 'Đời',
                          frameSize: 'Size',
                          frameMaterial: 'Khung',
                          brakeType: 'Phanh',
                          color: 'Màu',
                          condition: 'Tình trạng',
                          drivetrain: 'Truyền động',
                          wheelset: 'Bánh'
                        };

                        const label = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);

                        return (
                          <div key={key} className="flex justify-between items-center gap-4 border-b border-gray-100/50 pb-2 last:border-0">
                            <span className="font-black text-gray-400 uppercase tracking-tight shrink-0 text-xs">
                              {label}
                            </span>
                            <span className="font-black text-gray-700 text-right line-clamp-1 text-base">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div>
                <h4 className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] mb-6 ml-1">Hình ảnh gốc</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(activeCategory === 'ORDER' ? selectedDispute?.mediaUrls : mediaUrlsForModal)?.map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-clay border-2 border-white group">
                      {isVideo(url) ? <div className="w-full h-full bg-gray-900 flex items-center justify-center"><Play size={20} fill="white" className="text-white" /></div> : <img src={url} className="w-full h-full object-cover" />}
                      <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ExternalLink size={14} className="text-white" /></a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Inspector Verdict Form */}
            <div className="p-10 space-y-8 bg-white">
              <div className="space-y-3">
                <Label className={cn("font-black uppercase tracking-[0.2em] ml-2 text-xs", theme.text)}>Kết quả giám định *</Label>
                <div className="flex gap-2 p-1.5 bg-gray-50 rounded-[22px] border-2 border-gray-100 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setInspectionResult(true)}
                    className={cn(
                      "whitespace-pre-line flex-1 py-4 px-2 rounded-[18px] font-black text-sm transition-all flex items-center justify-center gap-1.5",
                      (inspectionResult === true)
                        ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {inspectionResult === true && <CheckCircle size={14} />}
                    {activeCategory === 'ORDER' ? 'BÁO CÁO\nĐÚNG (TRUE)' : 'ĐẠT\n(PASSED)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionResult(false)}
                    className={cn(
                      "whitespace-pre-line flex-1 py-4 px-2 rounded-[18px] font-black text-sm transition-all flex items-center justify-center gap-1.5",
                      (inspectionResult === false)
                        ? "bg-white text-red-600 shadow-sm ring-1 ring-red-100" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {inspectionResult === false && <XCircle size={14} />}
                    {activeCategory === 'ORDER' ? 'BÁO CÁO\nSAI (FALSE)' : 'KHÔNG ĐẠT\n(FAILED)'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] ml-2">Nhận xét chi tiết *</Label>
                <Textarea value={reportForm.comments} onChange={(e) => setReportForm({...reportForm, comments: e.target.value})} placeholder="Nhập phán quyết kỹ thuật của bạn tại đây..." className="rounded-[32px] min-h-[150px] bg-gray-50 border-0 shadow-inner p-6 font-medium text-base" />
              </div>

              <div className="space-y-3">
                <Label className="font-black text-gray-400 text-xs uppercase tracking-[0.2em] ml-2">Video minh chứng (Tải lên hoặc dán link) *</Label>
                
                {/* Video Evidence Container */}
                <div className="space-y-4">
                  {/* Upload Area */}
                  {!reportForm.meetingRecordUrl && (
                    <div 
                      onClick={() => videoInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-[32px] p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group",
                        videoFile ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      )}
                    >
                      <input 
                        type="file" 
                        ref={videoInputRef} 
                        className="hidden" 
                        accept="video/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setVideoFile(file);
                          if (file) setReportForm(prev => ({ ...prev, meetingRecordUrl: '' }));
                        }}
                      />
                      
                      {isUploadingVideo ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className={cn("animate-spin", theme.text)} size={32} />
                          <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Đang tải video...</span>
                        </div>
                      ) : videoFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="text-emerald-500" size={32} />
                          <span className="text-xs font-black text-emerald-600 truncate max-w-[200px]">{videoFile.name}</span>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setVideoFile(null);
                              if (videoInputRef.current) videoInputRef.current.value = ''; 
                            }}
                            className="text-[10px] font-black uppercase text-red-400 hover:text-red-600 transition-colors"
                          >
                            Gỡ bỏ
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", theme.iconBg)}>
                            <Upload className={theme.icon} size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-gray-600">Chọn video minh chứng</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mt-1">MP4, MOV hoặc AVI</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* URL Input Area - Hidden if file is selected */}
                  {!videoFile && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {!reportForm.meetingRecordUrl && (
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                          <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-300"><span className="bg-white px-4">Hoặc dán link trực tiếp</span></div>
                        </div>
                      )}

                      <Input 
                        value={reportForm.meetingRecordUrl} 
                        onChange={(e) => setReportForm({...reportForm, meetingRecordUrl: e.target.value})} 
                        placeholder="https://drive.google.com/..." 
                        className="rounded-2xl py-8 bg-gray-50 border-0 shadow-inner font-bold text-base" 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  className={cn("flex-1 rounded-2xl py-8 font-black text-white shadow-xl text-base", theme.bg, theme.hoverBg, theme.shadow)} 
                  onClick={handleConfirmReport} 
                  disabled={isSubmittingModal || !reportForm.comments || (!videoFile && !reportForm.meetingRecordUrl)}
                >
                  {isSubmittingModal ? <Loader2 className="animate-spin" /> : 'Gửi báo cáo ngay'}
                </Button>
                <Button variant="ghost" className="rounded-2xl py-8 font-black px-10 border border-gray-100 text-base" onClick={() => setIsReportModalOpen(false)}>Hủy</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspectionRequestsPage;
