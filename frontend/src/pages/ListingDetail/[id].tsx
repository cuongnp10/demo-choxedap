import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BikeCard } from '../../components/BikeCard';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Heart, 
  Share2, 
  MessageCircle, 
  Crown, 
  Star, 
  Play, 
  Truck, 
  Facebook, 
  Link as LinkIcon, 
  Check, 
  Copy,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  Video
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { bikeApi, favoritesApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import type { BikeDetail } from '../../types/bike';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { SellerTrustModal } from '../../components/SellerTrustModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Helmet } from 'react-helmet-async';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openPeerChat } = useChat();
  const { user, setIsAuthModalOpen } = useAuth();
  const [product, setProduct] = useState<BikeDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [mainMedia, setMainMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Immediate favorite check from localStorage
  useEffect(() => {
    if (!id) return;
    const localFavorites = JSON.parse(localStorage.getItem('favoriteBikes') || '[]');
    const stringId = id.toString();
    const isLocallyFavorite = localFavorites.some((favId: any) => favId.toString() === stringId);
    setIsFavorite(isLocallyFavorite);
  }, [id, user]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const productDetail = await bikeApi.getBikeById(id);
        setProduct(productDetail);
        
        // Ưu tiên chọn video nếu có và đã được duyệt, ngược lại chọn ảnh đầu tiên
        if (productDetail.videoUrl && productDetail.videoStatus === 'APPROVED') {
          setMainMedia({ type: 'video', url: productDetail.videoUrl });
        } else if (productDetail.images && productDetail.images.length > 0) {
          setMainMedia({ type: 'image', url: productDetail.images[0] });
        } else if (productDetail.videos && productDetail.videos.length > 0) {
          setMainMedia({ type: 'video', url: productDetail.videos[0] });
        }

        // Then check API if user is logged in for definitive status
        if (user) {
          try {
            const favoriteStatus = await favoritesApi.checkIsFavorite(id);
            // If API says favorite but local doesn't, update both
            if (favoriteStatus) {
              setIsFavorite(true);
              const localFavorites = JSON.parse(localStorage.getItem('favoriteBikes') || '[]');
              if (!localFavorites.some((favId: any) => favId.toString() === id.toString())) {
                localFavorites.push(id.toString());
                localStorage.setItem('favoriteBikes', JSON.stringify(localFavorites));
              }
            }
          } catch (apiError) {
            console.error("Failed to check favorite status via API:", apiError);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      }
    };

    const fetchRelated = async () => {
      try {
        const related = await bikeApi.getFeaturedBikes();
        setRelatedProducts(related);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      }
    };

    fetchProduct();
    fetchRelated();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    
    // Optimistic UI update + LocalStorage (consistent with BikeCard)
    const localFavorites = JSON.parse(localStorage.getItem('favoriteBikes') || '[]');
    const newFavoriteState = !isFavorite;
    
    if (newFavoriteState) {
      if (!localFavorites.includes(id)) {
        localFavorites.push(id);
      }
    } else {
      const filtered = localFavorites.filter((favId: string) => favId !== id);
      localStorage.setItem('favoriteBikes', JSON.stringify(filtered));
    }
    
    if (newFavoriteState) {
      localStorage.setItem('favoriteBikes', JSON.stringify(localFavorites));
    }

    setIsFavorite(newFavoriteState);
    toast.success(newFavoriteState ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");

    if (!user) return; // Stop here if not logged in, localStorage is enough for guests

    setIsTogglingFavorite(true);
    try {
      await favoritesApi.toggleFavorite(id);
    } catch (error) {
      console.error("Favorite toggle API error:", error);
      // We don't revert optimistic update to keep UI snappy, matching BikeCard behavior
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleProtectedAction = (action: () => void, requireKyc: boolean = false) => {
    if (!user) {
      setPendingAction(() => action);
      setIsAuthModalOpen(true);
      return;
    }

    if (requireKyc) {
      const isKycComplete = user.kycStatus === "VERIFIED";
      if (!isKycComplete) {
        toast.error("Vui lòng hoàn thiện hồ sơ (SĐT, Địa chỉ, Tài khoản ngân hàng) để thực hiện giao dịch", {
          action: {
            label: "Cập nhật ngay",
            onClick: () => navigate("/account/profile")
          },
        });
        return;
      }
    }

    action();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết!");
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    },
    {
      name: 'X',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.9 1.15283H22.582L14.54 10.3418L24 22.8478H16.595L10.791 15.2648L4.157 22.8478H0.469L9.069 13.0168L0 1.15283H7.593L12.834 8.08383L18.9 1.15283ZM17.607 20.6468H19.646L6.482 3.23883H4.292L17.607 20.6468Z" />
        </svg>
      ),
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product?.name || '')}`,
    }
  ];

  // If user logs in while modal is open, we can potentially execute the pending action
  useEffect(() => {
    if (user && pendingAction) {
      // For auto-executing pending actions after login, we don't strictly enforce KYC 
      // here because the user might need to be redirected to profile first anyway.
      // But we can check it.
      const isKycComplete = user.kycStatus === "VERIFIED";
      // If the pending action requires KYC but it's not complete, we just clear it and notify
      // (This is a simplified approach)
      pendingAction();
      setPendingAction(null);
      setIsAuthModalOpen(false);
    }
  }, [user, pendingAction]);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  const renderBadges = () => {
    const badgeClass = "h-[26px] rounded-full px-3 text-[12px] font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 border border-white/20 backdrop-blur-sm";
    
    return (
      <div className="absolute left-4 top-4 z-30 flex flex-col gap-2 items-start">
        {/* VIP Badges */}
        {product.vipTier === 'NOI_TROI' && (
          <Badge className={`${badgeClass} bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600`}>
            <Crown className="w-3.5 h-3.5 fill-white" />
            Nổi trội
          </Badge>
        )}
        {product.vipTier === 'NOI_BAT' && (
          <Badge className={`${badgeClass} bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500`}>
            <Star className="w-3.5 h-3.5 fill-white" />
            Nổi bật
          </Badge>
        )}
        {(product.vipTier === 'DE_THAY' || product.vipTier === 'THUONG') && (
          <Badge className={`${badgeClass} bg-slate-500`}>
            Dễ thấy
          </Badge>
        )}

        {/* Certified Badge */}
        {product.isCertified && (
          <Badge className={`${badgeClass} bg-[#2E9147]`}>
            <ShieldCheck className="w-3.5 h-3.5 fill-white" />
            Kiểm định
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 font-['Inter',sans-serif]">
      <Helmet>
        <title>{`${product.name} | Cho Xe Dap - Mua bán xe đạp thể thao`}</title>
        <meta name="description" content={`Mua ngay ${product.name} giá ${product.price} tại ${product.location}. Xe chính hãng, giao hàng toàn quốc.`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description[0]?.substring(0, 160)} />
        <meta property="og:image" content={product.images[0]} />
      </Helmet>
      {/* Breadcrumb could go here */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Media */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
            {mainMedia?.type === 'video' ? (
              <video 
                src={mainMedia.url} 
                controls 
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <ImageWithFallback 
                src={mainMedia?.url || (product.images.length > 0 ? product.images[0] : '')} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            )}
            {renderBadges()}
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {/* Video Thumbnail (Owner's view - Pending) */}
            {product.videoUrl && product.videoStatus === 'PENDING' && (
              <div 
                onClick={() => setMainMedia({ type: 'video', url: product.videoUrl! })}
                className={`relative aspect-[4/3] bg-black rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-indigo-500/50 transition-all ${mainMedia?.type === 'video' && mainMedia.url === product.videoUrl ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <video src={product.videoUrl} className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  <span className="text-[8px] font-black text-white bg-indigo-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Chờ duyệt</span>
                </div>
              </div>
            )}

            {/* Video Thumbnail (Guest's view - Pending) */}
            {!product.videoUrl && product.videoStatus === 'PENDING' && (
              <div 
                className="relative aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden flex flex-col items-center justify-center p-2 text-center border-2 border-dashed border-indigo-200"
                title="Video đang chờ duyệt"
              >
                <Video className="w-6 h-6 text-indigo-400 mb-1" />
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter leading-tight">Video Chờ duyệt</span>
              </div>
            )}

            {/* Video Thumbnail (if approved) */}
            {product.videoUrl && product.videoStatus === 'APPROVED' && (
              <div 
                onClick={() => setMainMedia({ type: 'video', url: product.videoUrl! })}
                className={`relative aspect-[4/3] bg-black rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-[#2E9147]/50 transition-all ${mainMedia?.type === 'video' && mainMedia.url === product.videoUrl ? 'ring-2 ring-[#2E9147]' : ''}`}
              >
                <video src={product.videoUrl} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-[#2E9147] fill-[#2E9147]" />
                  </div>
                </div>
              </div>
            )}

            {/* Other Videos from media array */}
            {product.videos.filter(v => v !== product.videoUrl).map((v, i) => (
              <div 
                key={`video-${i}`}
                onClick={() => setMainMedia({ type: 'video', url: v })}
                className={`relative aspect-[4/3] bg-black rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-[#2E9147]/50 transition-all ${mainMedia?.type === 'video' && mainMedia.url === v ? 'ring-2 ring-[#2E9147]' : ''}`}
              >
                <video src={v} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-[#2E9147] fill-[#2E9147]" />
                  </div>
                </div>
              </div>
            ))}

            {/* Image Thumbnails */}
            {product.images.map((img: string, i: number) => (
              <div 
                key={i} 
                onClick={() => setMainMedia({ type: 'image', url: img })}
                className={`aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-[#2E9147]/50 transition-all ${mainMedia?.type === 'image' && mainMedia.url === img ? 'ring-2 ring-[#2E9147]' : ''}`}
              >
                <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Inspection Status */}
            <div className="mb-4">
              {product.inspectionStatus === 'COMPLETED' && product.isCertified ? (
                <div className="inline-flex flex-col gap-2 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-semibold w-fit">
                    <ShieldCheck size={16} />
                    Đã được kiểm định
                  </div>
                  {product.inspectionMessage && (
                    <div className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                      " {product.inspectionMessage} "
                    </div>
                  )}
                </div>
              ) : (product.inspectionStatus === 'PENDING' || product.inspectionStatus === 'ACCEPTED') ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold">
                  <ShieldCheck size={16} />
                  Đang chờ kiểm định
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-sm font-semibold">
                  <ShieldCheck size={16} />
                  Chưa kiểm định
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-green-600">{product.price}</span>
                <span className="text-base line-through text-gray-400 mb-1">{product.originalPrice}</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-[#2E9147] border-[#2E9147]/20 flex items-center gap-1.5 py-1 px-3 rounded-full font-semibold text-xs">
                <Truck size={14} />
                Miễn phí giao hàng
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {product.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                Đăng {product.postedDate}
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div 
            onClick={() => setIsSellerModalOpen(true)}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center text-gray-400 font-black text-xl border border-gray-100 shadow-inner group-hover:scale-105 transition-transform">
                {product.seller.avatar ? (
                  <img src={product.seller.avatar} alt={product.seller.name} className="w-full h-full object-cover" />
                ) : (
                  product.seller.name.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-gray-900 tracking-tight">{product.seller.name}</p>
                  {(() => {
                    const score = product.seller.reputationScore ?? 50;
                    if (score >= 75) return (
                      <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-tighter">
                        Xuất sắc
                      </Badge>
                    );
                    if (score >= 50) return (
                      <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-tighter">
                        Tốt
                      </Badge>
                    );
                    if (score >= 15) return (
                      <Badge className="bg-yellow-100 text-yellow-700 border-0 rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-tighter">
                        Trung bình
                      </Badge>
                    );
                    return (
                      <Badge className="bg-red-100 text-red-700 border-0 rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-tighter">
                        Cảnh báo
                      </Badge>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {product.seller.rating || 5.0} ({product.seller.reviews} nhận xét)
                  </p>
                  <p className="text-xs font-bold text-gray-400">Tham gia {product.seller.joinDate}</p>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </div>
          </div>

          <SellerTrustModal 
            isOpen={isSellerModalOpen}
            onClose={setIsSellerModalOpen}
            seller={product.seller}
          />

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                disabled={user?.id === product.seller.userId}
                onClick={() => handleProtectedAction(() => {
                  const numericPrice = parseInt(product.price.replace(/\./g, '').replace(' đ', ''));
                  navigate(`/checkout?amount=${numericPrice}&type=full&desc=Thanh toan full ${product.name}&postingId=${id}`);
                }, true)}
                className="flex-1 text-base font-semibold rounded-lg py-6 bg-[#2E9147] hover:bg-[#257a3b] shadow-md transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user?.id === product.seller.userId ? 'Xe của bạn' : 'Thanh toán ngay'}
              </Button>
              <div className="flex-1 flex flex-col gap-1">
                <Button
                  disabled={user?.id === product.seller.userId}
                  onClick={() => handleProtectedAction(() => {
                    const numericPrice = parseInt(product.price.replace(/\./g, '').replace(' đ', ''));
                    const depositAmount = Math.floor(numericPrice * 0.1);
                    navigate(`/checkout?amount=${numericPrice >= 1000000 ? depositAmount : numericPrice}&type=deposit&desc=Dat coc ${product.name}&postingId=${id}`);
                  }, true)}
                  className="w-full text-base font-semibold rounded-lg py-6 bg-[#EF4444] hover:bg-red-600 shadow-md transition-all text-white border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {user?.id === product.seller.userId ? 'Xe của bạn' : 'Đặt cọc (10%)'}
                </Button>
                {user?.id !== product.seller.userId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter cursor-help hover:text-red-500 transition-colors">
                          <HelpCircle size={10} />
                          Chính sách hoàn cọc 100%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[240px] p-3 rounded-xl bg-gray-900 text-white border-0 shadow-2xl">
                        <p className="text-[11px] font-medium leading-relaxed">
                          Sàn cam kết <span className="text-red-400 font-black">hoàn tiền 100%</span> nếu Người bán từ chối giao dịch hoặc xe không đúng mô tả khi kiểm tra trực tiếp.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            {user?.id === product.seller.userId && (
              <p className="text-xs text-amber-600 font-medium text-center bg-amber-50 py-2 rounded-lg border border-amber-100">
                Bạn không thể mua hoặc đặt cọc cho xe của chính mình.
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 py-6 rounded-lg text-base font-medium border-gray-300 hover:bg-gray-50 text-gray-700"
                onClick={() => handleProtectedAction(() => openPeerChat(
                  { id: product.seller.userId?.toString() || 'unknown', name: product.seller.name, avatar: product.seller.avatar },
                  `Chào bạn, mình quan tâm đến xe "${product.name}" của bạn.`
                ))}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Thương lượng
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={isTogglingFavorite}
                className={`h-[52px] w-[52px] rounded-lg border-gray-300 hover:bg-gray-50 shrink-0 transition-colors ${isFavorite ? 'bg-red-50 border-red-200' : ''}`}
                onClick={() => handleProtectedAction(handleToggleFavorite)}
                aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-[52px] w-[52px] rounded-lg border-gray-300 hover:bg-gray-50 shrink-0 group/report"
                onClick={() => handleProtectedAction(() => navigate(`/account/buyer/report/listing/${id}`))}
                title="Báo cáo tin đăng"
                aria-label="Báo cáo tin đăng"
              >
                <AlertTriangle className="h-5 w-5 text-gray-400 group-hover/report:text-red-500 transition-colors" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-[52px] w-[52px] rounded-lg border-gray-300 hover:bg-gray-50 shrink-0" aria-label="Chia sẻ sản phẩm">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-4">
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Chia sẻ sản phẩm</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {shareLinks.map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                            {link.icon}
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{link.name}</span>
                        </a>
                      ))}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <input 
                          type="text" 
                          readOnly 
                          value={window.location.href} 
                          className="flex-1 bg-transparent text-xs text-gray-500 truncate outline-none"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-white"
                          onClick={handleCopyLink}
                        >
                          <Copy className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Safety Banner */}
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start text-blue-800 border border-blue-100">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold block mb-1">Mua bán an toàn</span>
              Luôn kiểm tra xe trực tiếp trước khi thanh toán. Không chuyển khoản đặt cọc trước khi xem xe.
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#2E9147] rounded-full"></div>
              Mô tả chi tiết
            </h2>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description[0]}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#2E9147] rounded-full"></div>
              Thông số kỹ thuật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-gray-50/50 p-6 md:p-8 rounded-2xl border border-gray-100">
              {product.specs && product.specs.filter(spec => 
                spec.value && 
                spec.value !== 'N/A' && 
                spec.value !== 'Không rõ' && 
                spec.value !== 'Standard' && 
                spec.value !== ''
              ).length > 0 ? (
                product.specs
                  .filter(spec => 
                    spec.value && 
                    spec.value !== 'N/A' && 
                    spec.value !== 'Không rõ' && 
                    spec.value !== 'Standard' && 
                    spec.value !== ''
                  )
                  .map((spec, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-gray-200/60 last:border-0 md:last:border-b">
                      <span className="text-gray-500 font-medium">{spec.label}</span>
                      <span className="text-gray-900 font-bold text-right">{spec.value}</span>
                    </div>
                  ))
              ) : (
                <div className="col-span-full py-4 text-center text-gray-400 italic">
                  Không có thông tin thông số kỹ thuật chi tiết.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-20 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Sản phẩm khác
          </h2>
          <Button variant="ghost" className="text-[#2E9147] font-bold hover:bg-green-50" onClick={() => navigate('/buy')}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.slice(0, 4).map((bike) => (
            <BikeCard key={bike.id} {...bike} onClick={() => navigate(`/listing/${bike.id}`)} />
          ))}
        </div>
      </section>

      {/* Modals */}
      <SellerTrustModal 
        isOpen={isSellerModalOpen}
        onClose={setIsSellerModalOpen}
        seller={product.seller}
      />
      
      <Toaster position="top-center" richColors />
    </div >
  );
}
