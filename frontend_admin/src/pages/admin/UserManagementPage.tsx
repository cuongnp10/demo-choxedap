import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast, Toaster } from 'sonner';
import {
  Search,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Mail,
  Phone,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Award,
  Zap
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'USER' | 'ADMIN' | 'INSPECTOR';
  status: 'ACTIVE' | 'BANNED';
  kycStatus: 'VERIFIED' | 'UNVERIFIED';
  reputationScore?: number; // Mặc định 50
  warningCount?: number;
  createdAt: string;
}

const getReputationLabel = (score: number = 50) => {
  if (score >= 90) return { label: 'Xuất sắc', color: 'text-green-600 bg-green-50' };
  if (score >= 80) return { label: 'Tốt', color: 'text-emerald-600 bg-emerald-50' };
  if (score >= 70) return { label: 'Khá tốt', color: 'text-blue-600 bg-blue-50' };
  if (score >= 60) return { label: 'Bình thường', color: 'text-indigo-600 bg-indigo-50' };
  if (score >= 40) return { label: 'Chưa rõ', color: 'text-gray-500 bg-gray-50' };
  if (score >= 20) return { label: 'Cảnh báo', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Bị khóa', color: 'text-red-600 bg-red-50' };
};

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'INSPECTOR'>('ALL');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reputationModalUser, setReputationModalUser] = useState<User | null>(null);

  // Form states for reputation adjustment
  const [adjType, setAdjType] = useState<'ADD' | 'SUB'>('ADD');
  const [adjPoints, setAdjPoints] = useState('5');
  const [adjReason, setAdjReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Xử lý debounce cho tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(handler);
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          page: currentPage,
          pageSize: pageSize,
          search: debouncedFilter // Sử dụng filter đã debounce
        }
      });
      const items = response.data.data.items || [];
      const total = response.data.data.totalCount || 0;

      // Map reputation score and warning count (đề phòng trường hợp API trả về null)
      const enrichedItems = items.map((u: any) => ({
        ...u,
        reputationScore: u.reputationScore ?? 50,
        warningCount: u.warningCount ?? 0
      }));

      setUsers(enrichedItems);
      setTotalCount(total);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, currentPage, debouncedFilter]);

  // Reset về trang 1 khi đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, debouncedFilter]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const effectiveTotalPages = Math.min(totalPages, 100); // Giới hạn tối đa 100 trang theo yêu cầu

  const handleAdjustReputation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reputationModalUser) return;

    const points = parseInt(adjPoints);
    if (isNaN(points) || points <= 0 || points > 50) {
      toast.error('Số điểm điều chỉnh tối đa là 50');
      return;
    }
    if (adjReason.length < 5) {
      toast.error('Vui lòng nhập lý do rõ ràng (tối thiểu 5 ký tự)');
      return;
    }

    setSubmitting(true);
    try {
      const finalChange = adjType === 'ADD' ? points : -points;

      await api.post(`/admin/users/${reputationModalUser.id}/reputation`, {
        amount: finalChange,
        reason: adjReason
      });

      toast.success(`Đã điều chỉnh ${finalChange > 0 ? 'cộng' : 'trừ'} ${points} điểm uy tín`);
      setReputationModalUser(null);
      setAdjReason('');
      fetchUsers();
    } catch (error) {
      toast.error('Điều chỉnh thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanUser = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn khóa người dùng này?')) {
      try {
        await api.post(`/admin/users/${id}/ban`, {
          reason: 'Vi phạm chính sách sàn',
          durationDays: -1
        });
        fetchUsers();
        toast.success('Đã khóa người dùng thành công');
      } catch (error) {
        toast.error('Thao tác thất bại');
      }
    }
  };

  const handleUnbanUser = async (id: string) => {
    try {
      await api.post(`/admin/users/${id}/unban`);
      fetchUsers();
      toast.success('Đã mở khóa người dùng');
    } catch (error) {
      toast.error('Thao tác thất bại');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= effectiveTotalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý người dùng</h1>
          <p className="text-gray-500 mt-1">Tra cứu, phân quyền và kiểm soát hệ thống uy tín thành viên</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="pl-12 pr-6 py-4 bg-white border-0 shadow-clay rounded-2xl focus:ring-2 focus:ring-primary outline-none w-full sm:w-96 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex p-1.5 bg-gray-100/50 backdrop-blur-sm rounded-[24px] w-fit border border-gray-100">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'USER', label: 'Người dùng' },
          { key: 'INSPECTOR', label: 'Kiểm định viên' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key as any)}
            className={cn(
              "px-10 py-3 rounded-[18px] text-sm font-black transition-all duration-500 uppercase tracking-widest",
              roleFilter === tab.key ? "bg-white text-primary shadow-clay" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-clay overflow-hidden border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Thành viên</th>
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Điểm Uy tín</th>
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center text-gray-400 font-bold">Không tìm thấy người dùng</td></tr>
              ) : (
                users.map((user) => {
                  const rep = getReputationLabel(user.reputationScore);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-primary/10 text-primary font-black rounded-2xl flex items-center justify-center text-xl shadow-inner border-0">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-foreground text-lg group-hover:text-primary transition-colors">{user.fullName}</p>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                              user.role === 'INSPECTOR' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                            )}>{user.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-500 font-bold">
                            <Mail size={14} className="mr-2 text-gray-300" /> {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 font-bold">
                            <Phone size={14} className="mr-2 text-gray-300" /> {user.phoneNumber || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Zap size={16} className="text-amber-500 fill-amber-500" />
                            <span className="font-black text-xl text-foreground tracking-tighter">{user.reputationScore}/100</span>
                          </div>
                          <span className={cn("mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit", rep.color)}>
                            {rep.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {user.status === 'ACTIVE' ? (
                          <div className="flex items-center text-green-600 font-black text-xs uppercase tracking-widest">
                            <CheckCircle2 size={16} className="mr-2" /> Hoạt động
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 font-black text-xs uppercase tracking-widest">
                            <ShieldAlert size={16} className="mr-2" /> Đã khóa
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setReputationModalUser(user); setAdjReason(''); }}
                            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all"
                            title="Điều chỉnh Uy tín"
                          >
                            <Award size={24} />
                          </button>
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                              title="Khóa tài khoản"
                            >
                              <Ban size={24} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all"
                              title="Mở khóa"
                            >
                              <CheckCircle2 size={24} />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye size={24} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination UI */}
      {!loading && totalCount > 0 && (
        <div className="px-8 py-6 bg-white rounded-[32px] shadow-clay border-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-gray-500">
            Hiển thị <span className="text-primary">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> - <span className="text-primary">{Math.min(currentPage * pageSize, totalCount)}</span> trên tổng số <span className="text-primary">{totalCount}</span> thành viên
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
              Trang {currentPage} / {effectiveTotalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === effectiveTotalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-50 transition-all hover:text-primary hover:border-primary"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => handlePageChange(effectiveTotalPages)}
              disabled={currentPage === effectiveTotalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-50 transition-all hover:text-primary hover:border-primary"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Reputation Adjustment Modal */}
      <Dialog open={!!reputationModalUser} onOpenChange={(open) => !open && setReputationModalUser(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-[40px] border-0 shadow-clay p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-amber-50">
            <DialogTitle className="text-2xl font-black tracking-tight text-amber-600 flex items-center gap-3">
              <Award /> Điều chỉnh Uy tín
            </DialogTitle>
            <DialogDescription className="text-amber-800/60 font-medium text-sm">
              Thưởng hoặc phạt điểm uy tín cho người dùng dựa trên hành vi trên sàn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustReputation} className="p-8 space-y-6">
            <div className="p-6 bg-gray-50 rounded-[28px] flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-primary shadow-sm">{reputationModalUser?.fullName.charAt(0)}</div>
              <div>
                <p className="font-black text-foreground uppercase tracking-tight">{reputationModalUser?.fullName}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Uy tín hiện tại: {reputationModalUser?.reputationScore}/100</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-black text-gray-700 text-sm uppercase tracking-widest">Loại điều chỉnh</Label>
              <RadioGroup value={adjType} onValueChange={setAdjType as any} className="flex gap-4">
                <div className={cn("flex-1 flex items-center space-x-2 p-4 rounded-2xl border transition-all cursor-pointer", adjType === 'ADD' ? "border-green-500 bg-green-50/50" : "border-gray-100")}>
                  <RadioGroupItem value="ADD" id="add" className="text-green-600 border-green-500" />
                  <Label htmlFor="add" className="font-bold cursor-pointer text-green-700 uppercase tracking-tighter">Thưởng điểm</Label>
                </div>
                <div className={cn("flex-1 flex items-center space-x-2 p-4 rounded-2xl border transition-all cursor-pointer", adjType === 'SUB' ? "border-red-500 bg-red-50/50" : "border-gray-100")}>
                  <RadioGroupItem value="SUB" id="sub" className="text-red-600 border-red-500" />
                  <Label htmlFor="sub" className="font-bold cursor-pointer text-red-700 uppercase tracking-tighter">Phạt điểm</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points" className="font-black text-gray-700 text-sm uppercase tracking-widest">Số điểm (Tối đa 50)</Label>
              <Input
                id="points" type="number" min="1" max="50"
                value={adjPoints} onChange={(e) => setAdjPoints(e.target.value)}
                className="rounded-2xl py-6 font-black text-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-gray-700 text-sm uppercase tracking-widest">Lý do điều chỉnh *</Label>
              <Textarea
                value={adjReason} onChange={(e) => setAdjReason(e.target.value)}
                placeholder="Nhập lý do cụ thể (vd: Thưởng thành viên tích cực, Phạt vi phạm...)"
                className="rounded-2xl min-h-[100px]" required
              />
            </div>

            <DialogFooter className="gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => setReputationModalUser(null)} className="rounded-2xl font-black py-6 flex-1 border-gray-100">Hủy</Button>
              <Button type="submit" disabled={submitting} className="rounded-2xl font-black py-6 flex-1 bg-amber-600 shadow-xl shadow-amber-200">
                {submitting ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal - Giữ nguyên logic nhưng update UI chuyên nghiệp */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[40px] border-0 shadow-clay p-0 overflow-hidden">
          <DialogHeader className="p-10 bg-primary/5 pb-20 relative">
            <div className="absolute -bottom-12 left-10 w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center font-black text-primary text-4xl border-4 border-white">
              {selectedUser?.fullName.charAt(0)}
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground">{selectedUser?.fullName}</DialogTitle>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Hồ sơ định danh #{selectedUser?.id}</p>
          </DialogHeader>

          <div className="p-10 pt-16 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-[28px] space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uy tín sàn</p>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-500 fill-amber-500" />
                  <p className="font-black text-2xl text-foreground tracking-tighter">{selectedUser?.reputationScore}/100</p>
                </div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", getReputationLabel(selectedUser?.reputationScore).color.split(' ')[0])}>
                  Hạng: {getReputationLabel(selectedUser?.reputationScore).label}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[28px] space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</p>
                <div className="flex items-center gap-2">
                  {selectedUser?.status === 'ACTIVE' ? <CheckCircle2 className="text-green-500" /> : <ShieldAlert className="text-red-500" />}
                  <p className="font-black text-xl text-foreground uppercase tracking-tight">{selectedUser?.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}</p>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cảnh cáo: {selectedUser?.warningCount || 0}/3</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin chi tiết</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center text-gray-500 font-bold"><Mail size={18} className="mr-3 text-gray-300" /> Email</div>
                  <p className="font-black text-foreground">{selectedUser?.email}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center text-gray-500 font-bold"><Phone size={18} className="mr-3 text-gray-300" /> Điện thoại</div>
                  <p className="font-black text-foreground">{selectedUser?.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center text-gray-500 font-bold"><Calendar size={18} className="mr-3 text-gray-300" /> Tham gia ngày</div>
                  <p className="font-black text-foreground">{formatDate(selectedUser?.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setSelectedUser(null)} className="flex-1 rounded-2xl font-black py-6 border-gray-100">Đóng</Button>
              <Button
                onClick={() => { setReputationModalUser(selectedUser); setSelectedUser(null); }}
                className="flex-1 rounded-2xl font-black py-6 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200"
              >
                <Award size={18} className="mr-2" /> Điều chỉnh Uy tín
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;