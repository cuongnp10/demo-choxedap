import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  Zap, 
  Crown, 
  Edit2, 
  Check, 
  X,
  Clock,
  Tag,
  Percent
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

interface Package {
  id: number;
  name: string;
  level: string;
  price: number;
  durationDays: number;
  description: string;
}

interface MembershipPlan {
  id: number;
  tier: string;
  name: string;
  price: number;
  durationDays: number;
  discountPercentage: number;
  description: string;
}

const ServiceFeesPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgRes, planRes] = await Promise.all([
        api.get('/admin/packages'),
        api.get('/admin/membership-plans')
      ]);
      
      // Đảm bảo lấy đúng dữ liệu từ ResponseModel
      const pkgData = pkgRes.data?.data || pkgRes.data || [];
      const planData = planRes.data?.data || planRes.data || [];
      
      setPackages(Array.isArray(pkgData) ? pkgData : []);
      setPlans(Array.isArray(planData) ? planData : []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error('Lỗi khi tải cấu hình phí: ' + errorMsg);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartEdit = (type: 'PKG' | 'PLAN', item: any) => {
    setEditingId(`${type}-${item.id}`);
    setEditForm({ ...item });
  };

  const handleSave = async (type: 'PKG' | 'PLAN') => {
    try {
      const endpoint = type === 'PKG' ? `/admin/packages/${editForm.id}` : `/admin/membership-plans/${editForm.id}`;
      // Gán đúng trường Level/Tier trước khi gửi
      const payload = { ...editForm };
      if (type === 'PKG') payload.level = editForm.level || editForm.name;
      if (type === 'PLAN') payload.tier = editForm.tier || editForm.name;
      
      await api.put(endpoint, payload);
      toast.success('Cập nhật thành công');
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" richColors />
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Cấu hình phí dịch vụ</h1>
        <p className="text-gray-500 mt-1">Điều chỉnh mức giá cho các gói VIP và hội viên trên toàn hệ thống</p>
      </div>

      {/* VIP Packages Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Zap size={20} fill="currentColor" />
          </div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Gói VIP đẩy tin</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? [1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[32px]"></div>) : 
            packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-[32px] shadow-clay p-8 border-0 hover:scale-[1.02] transition-all group">
                {editingId === `PKG-${pkg.id}` ? (
                  <div className="space-y-4">
                    <input 
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2 font-bold text-sm"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full bg-gray-50 border-0 rounded-xl pl-8 pr-4 py-2 font-black text-primary text-xl"
                        value={editForm.price}
                        onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary">₫</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <input 
                        type="number"
                        className="w-20 bg-gray-50 border-0 rounded-lg px-2 py-1 text-xs font-bold"
                        value={editForm.durationDays}
                        onChange={e => setEditForm({...editForm, durationDays: Number(e.target.value)})}
                      />
                      <span className="text-xs text-gray-400 font-bold">ngày</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => handleSave('PKG')} className="flex-1 bg-primary text-white p-2 rounded-xl"><Check size={18} className="mx-auto" /></button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-gray-400 p-2 rounded-xl"><X size={18} className="mx-auto" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{pkg.level}</span>
                      <button onClick={() => handleStartEdit('PKG', pkg)} className="text-gray-300 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    </div>
                    <h3 className="mt-4 font-black text-xl text-foreground">{pkg.name}</h3>
                    <p className="mt-2 text-3xl font-black text-primary tracking-tighter">
                      {new Intl.NumberFormat('vi-VN').format(pkg.price)}<span className="text-sm ml-1 font-bold italic">₫</span>
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={14} className="mr-2" />
                        Thời hạn {pkg.durationDays} ngày
                      </div>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2 italic">"{pkg.description}"</p>
                    </div>
                  </>
                )}
              </div>
            ))
          }
        </div>
      </section>

      {/* Membership Plans Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Crown size={20} fill="currentColor" />
          </div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Gói Hội Viên</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? [1,2,3].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-[40px]"></div>) : 
            plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-[40px] shadow-clay p-10 border-0 hover:shadow-clay-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:bg-purple-100 transition-colors"></div>
                
                {editingId === `PLAN-${plan.id}` ? (
                  <div className="space-y-6 relative z-10">
                    <input 
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-3 font-black text-xl"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full bg-gray-50 border-0 rounded-2xl pl-10 pr-4 py-4 font-black text-primary text-4xl tracking-tighter"
                        value={editForm.price}
                        onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary text-2xl">₫</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giảm phí (%)</label>
                        <input 
                          type="number"
                          className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2 font-bold text-purple-600"
                          value={editForm.discountPercentage}
                          onChange={e => setEditForm({...editForm, discountPercentage: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời hạn (ngày)</label>
                        <input 
                          type="number"
                          className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2 font-bold text-gray-600"
                          value={editForm.durationDays}
                          onChange={e => setEditForm({...editForm, durationDays: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => handleSave('PLAN')} className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold">Lưu lại</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold">Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">{plan.tier}</span>
                      <button onClick={() => handleStartEdit('PLAN', plan)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 hover:text-primary transition-colors"><Edit2 size={18} /></button>
                    </div>
                    <h3 className="mt-6 font-black text-3xl text-foreground tracking-tight">{plan.name}</h3>
                    <p className="mt-4 text-5xl font-black text-primary tracking-tighter">
                      {new Intl.NumberFormat('vi-VN').format(plan.price)}<span className="text-xl ml-1 font-bold italic">₫</span>
                    </p>
                    <div className="mt-10 space-y-4">
                      <div className="flex items-center gap-3 text-sm font-black text-purple-600">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"><Percent size={16} /></div>
                        Ưu đãi giảm {plan.discountPercentage}% phí
                      </div>
                      <div className="flex items-center gap-3 text-sm font-black text-gray-400">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><Clock size={16} /></div>
                        Thời hạn sử dụng {plan.durationDays} ngày
                      </div>
                    </div>
                    <p className="mt-8 text-sm text-gray-400 font-medium italic border-l-2 border-purple-100 pl-4 leading-relaxed">
                      "{plan.description}"
                    </p>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
};

export default ServiceFeesPage;
