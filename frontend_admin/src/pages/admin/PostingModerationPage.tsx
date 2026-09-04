import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast, Toaster } from 'sonner';
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Posting {
  id: string;
  title: string;
  description: string;
  sellerName: string;
  price: number;
  createdAt: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'DELETED' | 'Waiting';
  type: 'NEW_PENDING' | 'EDIT' | 'APPROVED_POST' | 'ALL';
  isVisible: boolean;
  PendingEditContent?: string;
  bicycle?: {
    brandName?: string;
    categoryName?: string;
    model?: string;
    year?: number;
    condition?: string;
    conditionPercentage?: number;
    frameMaterial?: string;
    frameSize?: string;
    color?: string;
    wheelset?: string;
    brakeType?: string;
    groupsetBrand?: string;
    speedCount?: number;
    drivetrain?: string;
    hasOriginalReceipt?: boolean;
  };
}

const PostingModerationPage = () => {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'NEW_PENDING' | 'VIDEO' | 'EDIT' | 'APPROVED_POST'>('NEW_PENDING');
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPostings = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'APPROVED_POST') {
        response = await api.get('/admin/postings', {
          params: { status: 'APPROVED', page: 1, pageSize: 1000 }
        });
      } else {
        response = await api.get('/admin/postings/pending', {
          params: {
            type: activeTab === 'NEW_PENDING' ? 'post' :
              activeTab === 'VIDEO' ? 'video' :
              activeTab === 'EDIT' ? 'edit' : 'all'
          }
        });
      }

      const responseData = response.data.data;
      const items = activeTab === 'APPROVED_POST' ? responseData.items : responseData;

      // Map dữ liệu từ backend sang format của frontend
      const mappedData: Posting[] = items.map((item: any) => {
        const vUrl = item.videoUrl || item.VideoUrl;
        const itemStatus = item.status || item.Status;
        const vStatus = item.videoStatus || item.VideoStatus;
        const eStatus = item.editStatus || item.EditStatus;
        const pEditContent = item.pendingEditContent || item.PendingEditContent;

        let determinedType: 'NEW_PENDING' | 'EDIT' | 'APPROVED_POST' | 'ALL' = 'NEW_PENDING';
        
        if (eStatus === 'PENDING' || pEditContent) {
          determinedType = 'EDIT';
        } else if (itemStatus === 'PENDING' || (itemStatus === 'APPROVED' && vStatus === 'PENDING')) {
          determinedType = 'NEW_PENDING';
        } else if (itemStatus === 'APPROVED') {
          determinedType = 'APPROVED_POST';
        }

        return {
          id: (item.id || item.Id)?.toString() || '',
          title: item.title || item.Title || 'Không có tiêu đề',
          description: item.description || item.Description || '',
          sellerName: item.sellerName || item.SellerName || 'Người bán',
          price: item.price || item.Price || 0,
          createdAt: item.createdAt || item.CreatedAt || new Date().toISOString(),
          thumbnail: item.thumbnail || item.Thumbnail || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100&h=100&fit=crop',
          images: item.images || item.Images || [],
          videoUrl: vUrl,
          status: itemStatus,
          type: determinedType,
          isVisible: item.isVisible ?? true,
          PendingEditContent: pEditContent,
          bicycle: item.bicycle || item.Bicycle
        };
      });

      setPostings(mappedData);
      setTotalCount(mappedData.length);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Không thể tải danh sách tin đăng từ server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, [activeTab]);

  // Reset page when tab or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filter]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenDetail = (posting: Posting) => {
    setSelectedPosting(posting);
  };

  const handleWatchVideo = (url?: string) => {
    if (!url) {
      toast.error('Tin đăng này không có video để xem');
      return;
    }
    setSelectedVideo(url);
  };

  const handleApprove = async (id: string) => {
    try {
      if (activeTab === 'EDIT') {
        await api.post(`/admin/postings/${id}/review-edit`, {
          action: 'APPROVE'
        });
      } else {
        await api.post(`/admin/postings/${id}/review`, {
          target: activeTab === 'VIDEO' ? 'Video' : 'Post',
          action: 'Approve',
          note: 'Duyệt bởi Admin'
        });
      }
      setPostings(prev => prev.filter(p => p.id !== id));
      setSelectedPosting(null);
      toast.success('Đã duyệt thành công');
    } catch (error) {
      toast.error('Duyệt thất bại');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Lý do từ chối:');
    if (reason === null) return;

    try {
      if (activeTab === 'EDIT') {
        await api.post(`/admin/postings/${id}/review-edit`, {
          action: 'REJECT',
          note: reason
        });
      } else {
        await api.post(`/admin/postings/${id}/review`, {
          target: activeTab === 'VIDEO' ? 'Video' : 'Post',
          action: 'Reject',
          note: reason
        });
      }
      setPostings(prev => prev.filter(p => p.id !== id));
      setSelectedPosting(null);
      toast.success('Đã từ chối');
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleToggleVisibility = async (posting: Posting) => {
    const newVisibility = !posting.isVisible;
    try {
      await api.patch(`/admin/postings/${posting.id}/visibility`, null, {
        params: { isVisible: newVisibility }
      });
      setPostings(prev => prev.map(p => p.id === posting.id ? { ...p, isVisible: newVisibility } : p));
      if (selectedPosting?.id === posting.id) {
        setSelectedPosting({ ...selectedPosting, isVisible: newVisibility });
      }
      toast.success(newVisibility ? 'Đã hiển thị tin đăng' : 'Đã ẩn tin đăng');
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  const allFilteredPostings = postings.filter(p =>
    ((p.title?.toLowerCase() || '').includes(filter.toLowerCase()) ||
      (p.sellerName?.toLowerCase() || '').includes(filter.toLowerCase()))
  );

  // Apply local pagination
  const paginatedPostings = allFilteredPostings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Sync total count for pagination UI when filter changes
  useEffect(() => {
    setTotalCount(allFilteredPostings.length);
  }, [filter, postings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý tin đăng</h1>
          <p className="text-gray-500 mt-1">Duyệt nội dung mới và quản lý hiển thị các tin đang hoạt động</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm tin đăng..."
              className="pl-12 pr-6 py-3 bg-white border-0 shadow-clay rounded-2xl focus:ring-2 focus:ring-primary outline-none w-full sm:w-80 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-gray-100 rounded-[24px] w-fit">
        {[
          { key: 'NEW_PENDING', label: 'Chưa duyệt' },
          { key: 'VIDEO', label: 'Video' },
          { key: 'EDIT', label: 'Chỉnh sửa' },
          { key: 'APPROVED_POST', label: 'Đã duyệt' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "px-8 py-3 rounded-[18px] text-sm font-bold transition-all duration-300",
              activeTab === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-clay overflow-hidden border-0">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <ClipboardList className="absolute inset-0 m-auto text-primary" size={24} />
            </div>
            <p className="text-gray-500 font-bold tracking-tight">Đang tải dữ liệu...</p>
          </div>
        ) : allFilteredPostings.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-gray-300" size={40} />
            </div>
            <p className="text-gray-500 font-bold text-lg">Không tìm thấy tin đăng nào</p>
            <p className="text-gray-400 mt-2">Danh sách {activeTab === 'APPROVED_POST' ? 'đã duyệt' : 'chờ duyệt'} đang trống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Nội dung</th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Người bán</th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Giá niêm yết</th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedPostings.map((posting) => (
                  <tr key={posting.id} className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => handleOpenDetail(posting)}
                        >
                          <img
                            src={posting.thumbnail}
                            alt={posting.title}
                            className={cn(
                              "w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform duration-300",
                              !posting.isVisible && "grayscale opacity-50"
                            )}
                          />
                          {posting.videoUrl && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl">
                              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-primary border-b-[6px] border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            "font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors",
                            !posting.isVisible && "text-gray-400 line-through"
                          )}>{posting.title}</p>
                          <div className="flex items-center space-x-3 mt-1.5">
                            <button 
                              onClick={() => handleOpenDetail(posting)}
                              className="text-sm text-primary font-bold flex items-center opacity-60 hover:opacity-100 transition-opacity"
                            >
                              Chi tiết
                              <ExternalLink size={14} className="ml-1.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                          {posting.sellerName?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-gray-600">{posting.sellerName || 'Người bán'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-foreground">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(posting.price || 0)}
                    </td>
                    <td className="px-8 py-6">
                      {activeTab === 'APPROVED_POST' ? (
                        <div className="flex flex-col">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest w-fit",
                            posting.isVisible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          )}>
                            {posting.isVisible ? 'Đang hiển thị' : 'Đang ẩn'}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">
                            {new Date(posting.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-gray-500">{new Date(posting.createdAt).toLocaleDateString('vi-VN')}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(posting.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        {activeTab === 'APPROVED_POST' ? (
                          <button
                            onClick={() => handleToggleVisibility(posting)}
                            className={cn(
                              "px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm",
                              posting.isVisible 
                                ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white" 
                                : "bg-primary text-white hover:bg-primary/90"
                            )}
                          >
                            {posting.isVisible ? 'Ẩn tin' : 'Hiện tin'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(posting.id)}
                              className="w-11 h-11 flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-200"
                              title="Chấp thuận"
                            >
                              <CheckCircle size={22} />
                            </button>
                            <button
                              onClick={() => handleReject(posting.id)}
                              className="w-11 h-11 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-200"
                              title="Từ chối"
                            >
                              <XCircle size={22} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination UI */}
        {!loading && totalCount > 0 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-bold text-gray-500">
              Hiển thị <span className="text-primary">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> - <span className="text-primary">{Math.min(currentPage * pageSize, totalCount)}</span> trên tổng số <span className="text-primary">{totalCount}</span> tin đăng
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

      {/* Detail Modal */}
      {selectedPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={cn(
            "relative bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]",
            activeTab === 'VIDEO' ? "max-w-4xl w-full" : "max-w-5xl w-full"
          )}>
            <button 
              onClick={() => setSelectedPosting(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white text-gray-900 rounded-full transition-all shadow-lg border border-gray-100"
            >
              <XCircle size={24} />
            </button>

            {/* Media Gallery / Video View */}
            <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
              {activeTab === 'VIDEO' ? (
                <div className="h-full flex flex-col">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Duyệt Video tin đăng</h3>
                  <div className="flex-1 flex items-center justify-center bg-black rounded-[32px] overflow-hidden shadow-xl ring-1 ring-black/5 min-h-[400px]">
                    {selectedPosting.videoUrl ? (
                      <video 
                        src={selectedPosting.videoUrl} 
                        controls 
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-white font-bold">Không có video</div>
                    )}
                  </div>
                  <div className="mt-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tin đăng gốc</p>
                    <h4 className="text-lg font-black text-foreground">{selectedPosting.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">Người bán: <span className="font-bold text-gray-700">{selectedPosting.sellerName}</span></p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Hình ảnh & Video bài đăng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPosting.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        className="w-full aspect-square object-cover rounded-[24px] shadow-sm hover:scale-105 transition-transform" 
                        alt="Bicycle detail"
                      />
                    ))}
                    {selectedPosting.videoUrl && (
                      <div className="col-span-2 mt-4 aspect-video rounded-[32px] overflow-hidden bg-black shadow-xl ring-1 ring-black/5">
                        <video 
                          src={selectedPosting.videoUrl} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Info & Actions */}
            <div className={cn(
              "p-10 flex flex-col border-l border-gray-50 overflow-y-auto",
              activeTab === 'VIDEO' ? "w-full md:w-[350px]" : "w-full md:w-[450px]"
            )}>
              {activeTab === 'VIDEO' ? (
                <div className="space-y-8 flex-1">
                  <div>
                    <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Thao tác duyệt</p>
                    <h2 className="text-2xl font-black text-foreground leading-tight">Duyệt Video</h2>
                    <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                      Nội dung tin đăng và hình ảnh đã được AI duyệt thành công và đang hiển thị. Admin chỉ cần duyệt tính hợp lệ của Video này.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex-1">
                  <div>
                    <p className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Thông tin tin đăng</p>
                    <h2 className="text-2xl font-black text-foreground leading-tight">{selectedPosting.title}</h2>
                  </div>

                  {activeTab === 'EDIT' && selectedPosting.PendingEditContent ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                        <ClipboardList size={18} />
                        <span className="text-sm font-black uppercase">So sánh thay đổi</span>
                      </div>
                      {/* ... (rest of edit comparison code) */}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Người bán</p>
                        <p className="font-bold text-gray-700">{selectedPosting.sellerName}</p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase mb-1">Giá bán</p>
                        <p className="text-xl font-black text-primary">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPosting.price)}
                        </p>
                      </div>
                      
                      {/* Description section for NEW_PENDING */}
                      {activeTab === 'NEW_PENDING' && selectedPosting.description && (
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Mô tả chi tiết</p>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedPosting.description}</p>
                        </div>
                      )}

                      {/* Bicycle specs for NEW_PENDING */}
                      {activeTab === 'NEW_PENDING' && selectedPosting.bicycle && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Thông số kỹ thuật</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Thương hiệu', value: selectedPosting.bicycle.brandName },
                              { label: 'Dòng xe', value: selectedPosting.bicycle.categoryName },
                              { label: 'Model', value: selectedPosting.bicycle.model },
                              { label: 'Năm SX', value: selectedPosting.bicycle.year },
                              { label: 'Tình trạng', value: selectedPosting.bicycle.condition },
                              { label: 'Độ mới', value: selectedPosting.bicycle.conditionPercentage ? `${selectedPosting.bicycle.conditionPercentage}%` : null },
                              { label: 'Chất liệu khung', value: selectedPosting.bicycle.frameMaterial },
                              { label: 'Kích cỡ khung', value: selectedPosting.bicycle.frameSize },
                              { label: 'Màu sắc', value: selectedPosting.bicycle.color },
                              { label: 'Bánh xe', value: selectedPosting.bicycle.wheelset },
                              { label: 'Hệ thống phanh', value: selectedPosting.bicycle.brakeType },
                              { label: 'Bộ truyền động', value: selectedPosting.bicycle.drivetrain },
                              { label: 'Groupset', value: selectedPosting.bicycle.groupsetBrand },
                              { label: 'Số tốc độ', value: selectedPosting.bicycle.speedCount },
                              { label: 'Giấy tờ gốc', value: selectedPosting.bicycle.hasOriginalReceipt ? 'Có' : 'Không' },
                            ].filter(item => item.value !== null && item.value !== undefined && item.value !== '').map((item, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{item.label}</p>
                                <p className="text-xs font-bold text-gray-700">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-700 uppercase mb-1 flex items-center">
                      <ClipboardList size={14} className="mr-2" />
                      Trạng thái tin
                    </p>
                    <p className="text-sm text-amber-800 font-medium italic">
                      {selectedPosting.status === 'PENDING' ? 'Đang chờ duyệt mới' : 
                       selectedPosting.status === 'APPROVED' ? 'Đang hiển thị công khai' : 
                       selectedPosting.status === 'SOLD' ? 'Đã bán' : selectedPosting.status}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button
                  onClick={() => handleReject(selectedPosting.id)}
                  className="flex items-center justify-center py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-bold transition-all shadow-sm group"
                >
                  <XCircle size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  {activeTab === 'VIDEO' ? 'Từ chối Video' : 'Từ chối'}
                </button>
                <button
                  onClick={() => handleApprove(selectedPosting.id)}
                  className="flex items-center justify-center py-4 bg-green-600 text-white hover:bg-green-700 rounded-2xl font-bold transition-all shadow-lg shadow-green-200 group"
                >
                  <CheckCircle size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  {activeTab === 'EDIT' ? 'Duyệt sửa' : activeTab === 'VIDEO' ? 'Duyệt Video' : 'Duyệt tin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full transition-all border border-white/10"
            >
              <XCircle size={24} />
            </button>
            <video 
              src={selectedVideo} 
              controls 
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostingModerationPage;
