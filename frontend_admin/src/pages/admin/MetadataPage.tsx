import React, { useEffect, useState, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  Settings,
  Plus,
  Edit2,
  Trash2,
  Bike,
  Tag,
  Palette,
  Layers,
  Search,
  Image as ImageIcon,
  Upload,
  X,
  Disc
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { uploadToCloudinary } from '../../services/cloudinary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

interface MetadataItem {
  id: number;
  name: string;
  description?: string;
  hexCode?: string;
  count?: number;
  // Support PascalCase from backend
  Name?: string;
  Description?: string;
  HexCode?: string;
  PostingCount?: number;
}

interface SettingItem {
  id: number;
  key: string;
  value: string;
  updatedAt?: string;
  // Support PascalCase from backend
  Key?: string;
  Value?: string;
  UpdatedAt?: string;
}

interface HeroSlide {
  settingKey: string;
  settingId: number;
  label: string;
  url: string | null;
  publicId: string | null;
  title: string | null;
  subtitle: string | null;
}

type TabType = 'CATEGORIES' | 'BRANDS' | 'MATERIALS' | 'COLORS' | 'BRAKE_TYPES' | 'SETTINGS' | 'HERO';

const MetadataPage = () => {
  const [items, setItems] = useState<MetadataItem[]>([]);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('CATEGORIES');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    { settingKey: 'HeroSlide1', settingId: 0, label: 'Slide 1', url: null, publicId: null, title: null, subtitle: null },
    { settingKey: 'HeroSlide2', settingId: 0, label: 'Slide 2', url: null, publicId: null, title: null, subtitle: null },
    { settingKey: 'HeroSlide3', settingId: 0, label: 'Slide 3', url: null, publicId: null, title: null, subtitle: null },
  ]);
  const [heroUploading, setHeroUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MetadataItem | SettingItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hexCode: '#000000',
    value: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getEndpoint = (tab: TabType) => {
    switch (tab) {
      case 'CATEGORIES': return 'admin/metadata/categories';
      case 'BRANDS': return 'admin/metadata/brands';
      case 'MATERIALS': return 'admin/metadata/materials';
      case 'COLORS': return 'admin/metadata/colors';
      case 'BRAKE_TYPES': return 'admin/metadata/brake-types';
      case 'SETTINGS': return 'admin/metadata/settings';
      default: return '';
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const res = await api.get('/admin/metadata/settings');
      const settingsList: any[] = res.data?.data || [];
      console.log("[HeroDebug] Settings list:", settingsList.map(s => s.SettingKey || s.settingKey || s.Key || s.key));
      
      // Lọc ra các settings có liên quan đến Hero để hỗ trợ tự động nếu key không khớp
      const backendHeroSettings = settingsList.filter(s => {
        const k = (s.SettingKey || s.settingKey || s.Key || s.key || "").toString().toLowerCase();
        return k.includes('hero');
      });

      setHeroSlides(prev => prev.map((slide, index) => {
        const normalize = (str: string) => (str || "").toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetKey = normalize(slide.settingKey);

        // Thử tìm chính xác trước
        let found = settingsList.find(s => {
          const k = normalize(s.SettingKey || s.settingKey || s.Key || s.key || "");
          return k === targetKey;
        });

        // Nếu không thấy, thử lấy theo thứ tự từ danh sách chứa từ 'hero'
        if (!found && backendHeroSettings[index]) {
          found = backendHeroSettings[index];
          console.log(`[HeroDebug] Auto-mapping ${slide.settingKey} to backend key: ${found.SettingKey || found.Key || found.settingKey || found.key}`);
        }

        if (!found) {
          return slide;
        }
        
        const settingValue = found.SettingValue || found.settingValue || found.Value || found.value;
        const settingId = found.id || found.Id || found.ID || 0;
        
        let url: string | null = null;
        let publicId: string | null = null;
        let title: string | null = null;
        let subtitle: string | null = null;
        
        if (settingValue) {
          try {
            const parsed = JSON.parse(settingValue);
            url = parsed.url ?? null;
            publicId = parsed.publicId ?? null;
            title = parsed.title ?? null;
            subtitle = parsed.subtitle ?? null;
          } catch { 
            url = settingValue; 
          }
        }
        // Giữ nguyên slide.settingKey ban đầu (HeroSlide1, 2, 3) để tránh trùng lặp key khi render
        return { ...slide, settingId, url, publicId, title, subtitle };
      }));
    } catch (err) {
      toast.error('Không thể tải ảnh Hero');
    }
  };

  const handleHeroUpload = async (settingKey: string, file: File) => {
    const slide = heroSlides.find(s => s.settingKey === settingKey);
    if (!slide) return;
    
    setHeroUploading(settingKey);
    try {
      const uploaded = await uploadToCloudinary(file);
      const imageUrl = uploaded.secure_url;
      
      // Sử dụng PATCH chuyên dụng - Gửi kèm cả title/subtitle hiện tại nếu có
      await api.patch(`/admin/hero-images/${settingKey}`, null, {
        params: { 
          imageUrl,
          title: slide.title,
          subtitle: slide.subtitle
        }
      });
      
      // Sau khi patch thành công, cập nhật state để hiển thị preview
      setHeroSlides(prev => prev.map(s =>
        s.settingKey === settingKey ? { ...s, url: imageUrl, publicId: uploaded.public_id } : s
      ));
      toast.success(`Đã cập nhật ${slide.label} thành công`);
      
      // Refresh lại danh sách để lấy ID thật từ Backend (phục vụ các tính năng khác nếu cần)
      fetchHeroSlides();
    } catch (error: any) {
      toast.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setHeroUploading(null);
    }
  };

  const handleHeroInfoUpdate = async (settingKey: string, title: string, subtitle: string) => {
    const slide = heroSlides.find(s => s.settingKey === settingKey);
    if (!slide) return;
    
    setHeroUploading(settingKey);
    try {
      await api.patch(`/admin/hero-images/${settingKey}`, null, {
        params: { 
          imageUrl: slide.url,
          title,
          subtitle
        }
      });
      
      setHeroSlides(prev => prev.map(s =>
        s.settingKey === settingKey ? { ...s, title, subtitle } : s
      ));
      toast.success(`Đã cập nhật thông tin ${slide.label}`);
    } catch (error: any) {
      toast.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setHeroUploading(null);
    }
  };

  const handleHeroDelete = async (settingKey: string) => {
    const slide = heroSlides.find(s => s.settingKey === settingKey);
    if (!slide?.url) return;
    
    if (!window.confirm(`Xóa ảnh ${slide.label}? Ảnh sẽ bị xóa khỏi Cloudinary.`)) return;
    
    setHeroUploading(settingKey);
    try {
      await api.delete(`/admin/hero-images/${settingKey}`);
      setHeroSlides(prev => prev.map(s =>
        s.settingKey === settingKey ? { ...s, url: null, publicId: null } : s
      ));
      toast.success(`Đã xóa ảnh ${slide.label}`);
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setHeroUploading(null);
    }
  };

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const endpoint = getEndpoint(activeTab);
      const response = await api.get(endpoint);
      const data = response.data.data || [];
      
      if (activeTab === 'SETTINGS') {
        // Normalize PascalCase/EntityCase to camelCase
        const normalized = data.map((s: any) => ({
          id: s.Id ?? s.id,
          key: s.SettingKey ?? s.settingKey ?? s.Key ?? s.key,
          value: s.SettingValue ?? s.settingValue ?? s.Value ?? s.value,
          updatedAt: s.UpdatedAt ?? s.updatedAt
        }));
        setSettings(normalized);
      } else {
        // Normalize PascalCase to camelCase
        const normalized = data.map((i: any) => ({
          id: i.Id ?? i.id,
          name: i.Name ?? i.name,
          description: i.Description ?? i.description,
          hexCode: i.HexCode ?? i.hexCode,
          count: i.PostingCount ?? i.count
        }));
        setItems(normalized);
      }
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'HERO') {
      fetchHeroSlides();
    } else {
      fetchMetadata();
    }
  }, [activeTab]);

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', hexCode: '#000000', value: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: MetadataItem | SettingItem) => {
    setCurrentItem(item);
    if ('key' in item) {
      // SettingItem
      setFormData({ name: '', description: '', hexCode: '', value: item.value });
    } else {
      // MetadataItem
      setFormData({ 
        name: item.name, 
        description: item.description || '', 
        hexCode: item.hexCode || '#000000',
        value: '' 
      });
    }
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (item: MetadataItem) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = getEndpoint(activeTab);
      const payload: any = { name: formData.name };
      if (activeTab === 'CATEGORIES' || activeTab === 'BRANDS') payload.description = formData.description;
      if (activeTab === 'COLORS') payload.hexCode = formData.hexCode;

      await api.post(endpoint, payload);
      toast.success('Đã thêm thành công');
      setIsAddModalOpen(false);
      fetchMetadata();
    } catch (error: any) {
      toast.error('Lỗi khi thêm: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    setIsSubmitting(true);
    try {
      const endpoint = `${getEndpoint(activeTab)}/${currentItem.id}`;
      let payload: any = {};
      
      if (activeTab === 'SETTINGS') {
        payload = { value: formData.value };
      } else {
        payload = { name: formData.name };
        if (activeTab === 'CATEGORIES' || activeTab === 'BRANDS' || activeTab === 'MATERIALS') payload.description = formData.description;
        if (activeTab === 'COLORS') payload.hexCode = formData.hexCode;
      }

      await api.put(endpoint, payload);
      toast.success('Đã cập nhật thành công');
      setIsEditModalOpen(false);
      fetchMetadata();
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentItem) return;
    setIsSubmitting(true);
    try {
      const endpoint = `${getEndpoint(activeTab)}/${currentItem.id}`;
      await api.delete(endpoint);
      toast.success('Đã xóa thành công');
      setIsDeleteModalOpen(false);
      fetchMetadata();
    } catch (error: any) {
      toast.error('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => 
    (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSettings = settings.filter(s => 
    (s.key || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý Metadata</h1>
          <p className="text-gray-500 mt-1">Cấu hình các danh mục, thương hiệu và tham số hệ thống</p>
        </div>
        {activeTab !== 'SETTINGS' && activeTab !== 'HERO' && (
          <Button 
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-2xl shadow-lg shadow-primary/20 flex items-center transition-all active:scale-95 border-0"
          >
            <Plus size={20} className="mr-2" />
            Thêm mới
          </Button>
        )}
      </div>

      {/* Modern Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { key: 'CATEGORIES', label: 'Loại xe', icon: Bike },
          { key: 'BRANDS', label: 'Thương hiệu', icon: Tag },
          { key: 'MATERIALS', label: 'Chất liệu', icon: Layers },
          { key: 'COLORS', label: 'Màu sắc', icon: Palette },
          { key: 'BRAKE_TYPES', label: 'Loại phanh', icon: Disc },
          { key: 'SETTINGS', label: 'Cấu hình', icon: Settings },
          { key: 'HERO', label: 'Ảnh Hero', icon: ImageIcon }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-[32px] border-0 transition-all duration-300",
                isActive 
                  ? "bg-white shadow-clay scale-105" 
                  : "bg-gray-100/50 text-gray-400 hover:bg-gray-100"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
              )}>
                <tab.icon size={24} />
              </div>
              <span className={cn("font-bold text-sm", isActive ? "text-primary" : "text-gray-500")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          placeholder="Tìm kiếm..." 
          className="pl-12 py-6 rounded-2xl border-0 bg-white shadow-clay"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] shadow-clay border-0 overflow-hidden">
        {activeTab === 'HERO' ? (
          <div className="p-8">
            <p className="text-gray-500 text-sm mb-6">
              Quản lý ảnh nền cho 3 slide trên trang chủ. Nếu để trống, sẽ dùng ảnh mặc định.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {heroSlides.map((slide) => {
                const isUploading = heroUploading === slide.settingKey;
                return (
                  <div key={slide.settingKey} className="border-2 border-dashed border-gray-200 rounded-[24px] overflow-hidden">
                    <div className="relative aspect-video bg-gray-100">
                      {slide.url ? (
                        <img src={slide.url} alt={slide.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon size={40} />
                          <span className="text-xs mt-2 font-medium">Dùng ảnh mặc định</span>
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-bold text-sm text-foreground">{slide.label}</p>
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={el => { fileInputRefs.current[slide.settingKey] = el; }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroUpload(slide.settingKey, file);
                              e.target.value = '';
                            }}
                            disabled={isUploading}
                          />
                          <span
                            onClick={() => fileInputRefs.current[slide.settingKey]?.click()}
                            className={cn(
                              "w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all",
                              "bg-primary/10 text-primary hover:bg-primary/20",
                              isUploading && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Upload size={14} />
                            {slide.url ? 'Thay ảnh' : 'Tải ảnh lên'}
                          </span>
                        </label>
                        {slide.url && (
                          <button
                            onClick={() => handleHeroDelete(slide.settingKey)}
                            disabled={isUploading}
                            className="py-2 px-3 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : loading ? (
          <div className="p-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold tracking-tight">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {activeTab === 'SETTINGS' ? 'Tham số' : 'Tên hiển thị'}
                  </th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {activeTab === 'SETTINGS' ? 'Giá trị' : 'Mô tả'}
                  </th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {activeTab === 'SETTINGS' ? 'Cập nhật' : 'Thanh trạng thái'}
                  </th>
                  <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold">
                {activeTab === 'SETTINGS' ? (
                  filteredSettings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-8 py-6 text-foreground font-bold">{item.key}</td>
                      <td className="px-8 py-6">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-mono text-xs break-all">
                          {item.value || 'null'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-gray-400 text-xs">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="w-10 h-10 inline-flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-8 py-6 text-foreground font-bold">
                        <div className="flex items-center gap-3">
                          {activeTab === 'COLORS' && (
                            <div 
                              className="w-5 h-5 rounded-full border border-gray-100" 
                              style={{ backgroundColor: item.hexCode }}
                            />
                          )}
                          {item.name}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-500 text-sm">
                        {item.description || '—'}
                      </td>
                      <td className="px-8 py-6 text-gray-400 text-xs">
                        {item.count !== undefined ? (
                          <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-tight uppercase">
                            {item.count} bài đăng
                          </span>
                        ) : (
                          <span className="text-gray-300 italic">Sẵn dụng</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(item)}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {(activeTab === 'SETTINGS' ? filteredSettings.length : filteredItems.length) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                      Không tìm thấy dữ liệu nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-0 shadow-clay">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Thêm {activeTab.replace('_', ' ').toLowerCase()}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold text-gray-700">Tên hiển thị</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập tên..." 
                required 
                className="rounded-xl"
              />
            </div>
            
            {(activeTab === 'CATEGORIES' || activeTab === 'BRANDS' || activeTab === 'MATERIALS') && (
              <div className="space-y-2">
                <Label htmlFor="desc" className="font-bold text-gray-700">Mô tả</Label>
                <Textarea 
                  id="desc" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Nhập mô tả ngắn..." 
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            )}

            {activeTab === 'COLORS' && (
              <div className="space-y-2">
                <Label htmlFor="hex" className="font-bold text-gray-700">Mã màu (Hex)</Label>
                <div className="flex gap-3">
                  <Input 
                    id="hex" 
                    type="color"
                    value={formData.hexCode}
                    onChange={(e) => setFormData({...formData, hexCode: e.target.value})}
                    className="w-16 h-10 p-1 rounded-lg cursor-pointer"
                  />
                  <Input 
                    value={formData.hexCode}
                    onChange={(e) => setFormData({...formData, hexCode: e.target.value})}
                    placeholder="#000000" 
                    className="flex-1 rounded-xl uppercase"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl font-bold">Hủy</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold bg-primary px-8">
                {isSubmitting ? 'Đang xử lý...' : 'Lưu lại'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-0 shadow-clay">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Chỉnh sửa {activeTab === 'SETTINGS' ? 'cấu hình' : activeTab.replace('_', ' ').toLowerCase()}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 py-4">
            {activeTab === 'SETTINGS' ? (
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Giá trị cho {(currentItem as SettingItem)?.key}</Label>
                <Textarea 
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="rounded-xl min-h-[120px] font-mono text-sm"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="font-bold text-gray-700">Tên hiển thị</Label>
                  <Input 
                    id="edit-name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    className="rounded-xl"
                  />
                </div>
                
                {(activeTab === 'CATEGORIES' || activeTab === 'BRANDS' || activeTab === 'MATERIALS') && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc" className="font-bold text-gray-700">Mô tả</Label>
                    <Textarea 
                      id="edit-desc" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>
                )}

                {activeTab === 'COLORS' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-hex" className="font-bold text-gray-700">Mã màu (Hex)</Label>
                    <div className="flex gap-3">
                      <Input 
                        id="edit-hex" 
                        type="color"
                        value={formData.hexCode}
                        onChange={(e) => setFormData({...formData, hexCode: e.target.value})}
                        className="w-16 h-10 p-1 rounded-lg cursor-pointer"
                      />
                      <Input 
                        value={formData.hexCode}
                        onChange={(e) => setFormData({...formData, hexCode: e.target.value})}
                        className="flex-1 rounded-xl uppercase"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl font-bold">Hủy</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold bg-primary px-8">
                {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-0 shadow-clay">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-red-600">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 font-medium">
              Bạn có chắc chắn muốn xóa <span className="font-bold text-foreground">"{(currentItem as MetadataItem)?.name}"</span>?
            </p>
            <p className="text-sm text-gray-400 mt-2">Hành động này không thể hoàn tác.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl font-bold">Hủy</Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="rounded-xl font-bold bg-red-600 px-8"
            >
              {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MetadataPage;
