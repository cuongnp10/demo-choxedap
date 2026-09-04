import { formatRelativeTime } from './utils';
import { generalClient, sellerClient, buyerClient, adminClient, inspectorClient } from './api-client';
import type { BikeProduct, BikeDetail } from '../types/bike';
import type { UserProfile } from '../types/user';
import type { OrderStatus, OrderListItem } from '../types/order';

// Map backend VIP Level to Frontend UI Tiers
export function mapVipTier(tier: string | null | undefined): 'NOI_TROI' | 'NOI_BAT' | 'DE_THAY' | 'THUONG' | undefined {
  if (!tier) return undefined;
  const t = tier.toUpperCase();
  if (t.includes('NOI_TROI') || t.includes('NỔI TRỘI')) return 'NOI_TROI';
  if (t.includes('NOI_BAT') || t.includes('NỔI BẬT')) return 'NOI_BAT';
  if (t.includes('DE_THAY') || t.includes('DỄ THẤY')) return 'DE_THAY';
  if (t.includes('THUONG') || t.includes('THƯỜNG')) return 'THUONG';
  return undefined;
}

const sanitizeName = (name: string | null | undefined, fallback: string) => {
  if (!name) return fallback;
  const lower = name.toLowerCase();
  if (lower.includes("77") || lower.includes("quản trị viên") || lower.includes("admin")) {
    return fallback;
  }
  return name;
};

/**
 * 1. BIKE & LISTING API (AUTOMATED)
 */
export const bikeApi = {
  getFeaturedBikes: async (): Promise<BikeProduct[]> => {
    const { data } = await generalClient.GET("/bikes/featured");
    const res = data as any;
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.items || []);
    return items.map((item: any) => ({
      id: item.id.toString(),
      image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
      name: item.title,
      location: item.location || 'TP. Hồ Chí Minh',
      postedDate: formatRelativeTime(item.createdAt),
      price: item.price?.toLocaleString('vi-VN') + ' ₫',
      rawPrice: item.price,
      createdAt: item.createdAt,
      isCertified: item.isCertified,
      vipTier: mapVipTier(item.vipTier)
    }));
  },
  getCertifiedBikes: async (): Promise<BikeProduct[]> => {
    const { data } = await generalClient.GET("/bikes/certified");
    const res = data as any;
    const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.items || []);
    return items.map((item: any) => ({
      id: item.id.toString(),
      image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
      name: item.title,
      location: item.location || 'TP. Hồ Chí Minh',
      postedDate: formatRelativeTime(item.createdAt),
      price: item.price?.toLocaleString('vi-VN') + ' ₫',
      rawPrice: item.price,
      createdAt: item.createdAt,
      isCertified: item.isCertified,
      vipTier: mapVipTier(item.vipTier)
    }));
  },
  getProducts: async (filters?: any): Promise<{ items: BikeProduct[], totalCount: number, totalPages: number, page: number, pageSize: number }> => {
    // Map frontend filters to backend query parameters
    const queryParams: any = {};
    if (filters) {
      if (filters.query) queryParams.Q = filters.query;
      if (filters.brand) queryParams.Brand = filters.brand;
      if (filters.location) queryParams.Location = filters.location;
      if (filters.category) queryParams.CategoryId = parseInt(filters.category);
      if (filters.sellerId) queryParams.SellerId = parseInt(filters.sellerId);
      if (filters.certifiedOnly !== undefined) queryParams.IsCertified = filters.certifiedOnly;
      if (filters.page) queryParams.Page = filters.page;
      if (filters.pageSize) queryParams.PageSize = filters.pageSize;
      if (filters.sortBy) {
        if (filters.sortBy === "height-asc") queryParams.SortBy = "height-asc";
        else if (filters.sortBy === "height-desc") queryParams.SortBy = "height-desc";
        else if (filters.sortBy === "price-asc") queryParams.SortBy = "price-asc";
        else if (filters.sortBy === "price-desc") queryParams.SortBy = "price-desc";
        else if (filters.sortBy === "newest") queryParams.SortBy = "newest";
      }
      
      if (filters.height && filters.height !== "all") {
        // Map frontend height range to backend FrameSize
        if (filters.height === "1m30-1m40" || filters.height === "1m40-1m50") queryParams.FrameSize = "XS";
        else if (filters.height === "1m50-1m60") queryParams.FrameSize = "S";
        else if (filters.height === "1m60-1m70") queryParams.FrameSize = "M";
        else if (filters.height === "1m70-1m80") queryParams.FrameSize = "L";
        else if (filters.height === "1m80-plus") queryParams.FrameSize = "XL";
        else queryParams.FrameSize = filters.height; // Fallback
      }
    }

    const { data } = await generalClient.GET("/bikes", {
      params: { query: queryParams }
    });
    
    const res = data as any;
    const backendData = res?.data || res || {};
    const items = Array.isArray(backendData.items) ? backendData.items : (Array.isArray(res?.data) ? res.data : []);
    
    return {
      items: items.map((item: any) => ({
        id: item.id.toString(),
        image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
        name: item.title,
        location: item.location || 'TP. Hồ Chí Minh',
        postedDate: formatRelativeTime(item.createdAt),
        price: item.price?.toLocaleString('vi-VN') + ' ₫',
        rawPrice: item.price,
        createdAt: item.createdAt,
        isCertified: item.isCertified,
        vipTier: mapVipTier(item.vipTier),
        frameSize: item.frameSize
      })),
      totalCount: backendData.totalCount || items.length,
      totalPages: backendData.totalPages || 1,
      page: backendData.page || 1,
      pageSize: backendData.pageSize || 12
    };
  },
  getBikeById: async (id: string): Promise<BikeDetail> => {
    const { data, error } = await generalClient.GET("/bikes/{id}", {
      params: { path: { id: parseInt(id) } }
    });
    const d = (data as any)?.data || data || (error as any)?.data || error;
    if (!d || (error && (error as any).statusCode !== 200)) {
      throw new Error((error as any)?.message || "Không tìm thấy xe đạp hoặc tin đăng chưa được duyệt.");
    }

    const mapCondition = (cond: string | null | undefined) => {
      if (!cond) return "";
      const c = cond.toUpperCase();
      if (c === "NEW") return "Mới 100% (New)";
      if (c === "LIKE_NEW" || c === "LIKENEW") return "Như mới 99% (Like New)";
      if (c === "GOOD") return "Tốt 80-95% (Good)";
      if (c === "FAIR") return "Khá 70-80% (Fair)";
      return cond;
    };

    const bicycle = d.bicycle || {};
    const allSpecs = [
      { label: 'Thương hiệu', value: bicycle.brand },
      { label: 'Model', value: bicycle.model },
      { label: 'Dòng xe', value: d.categoryName || bicycle.categoryName },
      { label: 'Màu sắc', value: bicycle.color },
      { label: 'Kích thước khung', value: bicycle.frameSize },
      { label: 'Năm sản xuất', value: bicycle.year?.toString() },
      { label: 'Tình trạng', value: mapCondition(bicycle.condition) },
      { label: 'Chất liệu khung', value: bicycle.frameMaterial },
      { label: 'Hệ thống phanh', value: bicycle.brakeSystem },
      { label: 'Bộ truyền động', value: bicycle.drivetrain },
      { label: 'Số tốc độ', value: bicycle.speedCount?.toString() },
    ];

    const filteredSpecs = allSpecs.filter(spec => 
      spec.value && 
      spec.value.toString().trim() !== "" && 
      spec.value.toString().toUpperCase() !== "N/A" &&
      spec.value.toString().toUpperCase() !== "UNDEFINED" &&
      spec.value.toString() !== "0"
    ) as { label: string; value: string }[];
    return {
      id: d.id.toString(),
      name: d.title,
      price: d.price?.toLocaleString('vi-VN') + ' ₫',
      location: d.seller?.address || 'TP. Hồ Chí Minh',
      postedDate: formatRelativeTime(d.createdAt),
      description: d.description ? d.description.split('\n') : [],
      specs: [
        { label: 'Hãng xe', value: d.bicycle?.brand || 'N/A' },
        { label: 'Dòng xe', value: d.bicycle?.categoryName || 'N/A' },
        { label: 'Model', value: d.bicycle?.model || 'N/A' },
        { label: 'Màu sắc', value: d.bicycle?.color || 'N/A' },
        { label: 'Kích thước khung', value: d.bicycle?.frameSize || 'N/A' },
        { label: 'Năm sản xuất', value: d.bicycle?.year?.toString() || 'N/A' },
        { label: 'Tình trạng', value: d.bicycle?.condition || 'N/A' },
        { label: 'Chất liệu khung', value: d.bicycle?.frameMaterial || 'N/A' },
        { label: 'Hệ thống phanh', value: d.bicycle?.brakeSystem || 'N/A' },
      ],
      seller: {
        userId: d.seller?.id?.toString(),
        name: d.seller?.fullName,
        rating: parseFloat(d.seller?.rating || 5.0),
        reviews: d.seller?.reviewsCount || 0,
        avatar: d.seller?.avatar,
        reputationScore: d.seller?.reputationScore,
        totalOrders: d.seller?.totalOrders,
        successRate: d.seller?.successRate,
        responseTime: d.seller?.responseTime,
        joinDate: d.seller?.joinDate ? new Date(d.seller.joinDate).getFullYear().toString() : "2024"
      },
      images: d.media?.filter((m: any) => m.type === 'IMAGE' || m.type === 0 || m.type?.toUpperCase() === 'IMAGE').map((m: any) => m.url) || [],
      videos: d.media?.filter((m: any) => m.type === 'VIDEO' || m.type === 1 || m.type?.toUpperCase() === 'VIDEO').map((m: any) => m.url) || [],
      videoUrl: d.videoUrl,
      videoStatus: d.videoStatus,
      bicycle: d.bicycle,
      posting: d,
      isCertified: d.isCertified,
      vipTier: mapVipTier(d.vipTier),
      inspectionStatus: d.inspectionStatus,
      inspectionMessage: d.inspectionMessage
    };
  }
};

/**
 * 2. USER & AUTH API
 */
export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data, error } = await generalClient.GET("/user/profile");
    const res = (data as any) || (error as any);
    if (!res || (error && (error as any).statusCode !== 200)) {
       throw new Error(res?.message || "Không thể tải thông tin profile");
    }
    return res.data || res;
  },
  getActiveMembership: async () => {
    const { data, error } = await generalClient.GET("/user/membership");
    if (error) return null;
    const res = data as any;
    return res?.data || null;
  },
  updateProfile: async (body: any): Promise<UserProfile> => {
    const { data, error } = await generalClient.PUT("/user/profile", { body });
    const res = (data as any) || (error as any);
    if (!res || (error && (error as any).statusCode !== 200)) {
       throw new Error(res?.message || "Không thể cập nhật profile");
    }
    return res.data || res;
  },
  requestPhoneOtp: async (phoneNumber: string) => {
    const { data } = await generalClient.POST("/user/phone/request-otp", { body: { phoneNumber } });
    return (data as any)?.data || data;
  },
  verifyPhoneOtp: async (phoneNumber: string, otp: string) => {
    const { data } = await generalClient.POST("/user/phone/verify-otp", { body: { phoneNumber, otp } });
    return (data as any)?.data || data;
  },
  changePassword: async (body: any) => {
    const { data, error } = await generalClient.POST("/user/change-password", { body });
    const res = (data as any) || (error as any);
    if (!res || (error && (error as any).statusCode !== 200)) {
       throw new Error(res?.message || "Không thể đổi mật khẩu");
    }
    return res.data || res;
  }
};

/**
 * 3. MEMBERSHIP API
 */
export const membershipApi = {
  getPlans: async () => {
    const { data } = await generalClient.GET("/memberships/plans");
    return (data as any)?.data || (data as any) || [];
  }
};

/**
 * 4. SELLER & POSTING API
 */
export const postingApi = {
  createPosting: async (body: any) => {
    const { data, error } = await sellerClient.POST("/seller/postings", { body });
    if (error) {
      console.error("Create posting failed:", error);
      throw new Error((error as any)?.message || "Không thể tạo tin đăng trên hệ thống.");
    }
    return (data as any)?.data || data;
  },
  updatePosting: async (id: number, body: any) => {
    const { data, error } = await sellerClient.PUT("/seller/postings/{id}", { 
      params: { path: { id } },
      body 
    });
    if (error) {
      console.error("Update posting failed:", error);
      throw new Error((error as any)?.message || "Không thể cập nhật tin đăng.");
    }
    return (data as any)?.data || data;
  },
  moderatePosting: async (id: number) => {
    const { data, error } = await sellerClient.POST("/seller/postings/{id}/ai-check" as any, {
      params: { path: { id } }
    });
    if (error) {
      console.error("Moderate posting failed:", error);
      throw new Error((error as any)?.message || "Không thể kiểm duyệt tin đăng.");
    }
    return (data as any)?.data || data;
  },
  getById: async (id: string | number) => {
    const { data } = await sellerClient.GET("/seller/postings/{id}", {
      params: { path: { id: typeof id === 'string' ? parseInt(id) : id } }
    });
    return (data as any)?.data || data;
  },
  getMyPostings: async () => {
    const { data } = await sellerClient.GET("/seller/postings");
    return (data as any)?.data || (data as any) || [];
  },
  deletePosting: async (id: number) => {
    const { data, error } = await sellerClient.DELETE("/seller/postings/{id}", { 
      params: { path: { id } }
    });
    if (error) {
      console.error("Delete posting failed:", error);
      throw new Error((error as any)?.message || "Không thể xóa tin đăng.");
    }
    return (data as any)?.data || data;
  }
};

/**
 * 5. FAVORITES API
 */
export const favoritesApi = {
  getFavorites: async (): Promise<BikeProduct[]> => {
    const { data } = await buyerClient.GET("/buyer/favorites");
    const res = data as any;
    const items = res?.data || res || [];
    return items.map((item: any) => ({
      id: (item.postingId || item.id).toString(),
      image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
      name: item.title,
      location: item.location || 'TP. Hồ Chí Minh',
      postedDate: formatRelativeTime(item.favoritedAt || item.createdAt),
      price: item.price?.toLocaleString('vi-VN') + ' ₫',
      isCertified: item.isCertified,
      vipTier: mapVipTier(item.vipTier),
      frameSize: item.frameSize
    }));
  },
  toggleFavorite: async (id: string) => {
    // Check if currently favorite
    const isFav = await favoritesApi.checkIsFavorite(id);
    if (isFav) {
      const { data } = await buyerClient.DELETE("/buyer/favorites/{postingId}", {
        params: { path: { postingId: parseInt(id) } }
      });
      return (data as any)?.data || data;
    } else {
      const { data } = await buyerClient.POST("/buyer/favorites/{postingId}", {
        params: { path: { postingId: parseInt(id) } }
      });
      return (data as any)?.data || data;
    }
  },
  checkIsFavorite: async (id: string) => {
    const { data } = await buyerClient.GET("/buyer/favorites");
    const res = data as any;
    const favorites = res?.data || res || [];
    // Correctly check for postingId in the returned FavoriteItemDto list
    return favorites.some((f: any) => 
      (f.postingId && f.postingId.toString() === id.toString()) || 
      (f.id && f.id.toString() === id.toString())
    );
  }
};

/**
 * 6. ORDER & PAYMENT API
 */
export const orderApi = {
  getMyPurchases: async (): Promise<OrderListItem[]> => {
    const { data } = await buyerClient.GET("/buyer/orders");
    const res = data as any;
    const items = res?.data || res || [];
    return items.map((item: any) => ({
      id: item.id.toString(),
      postingId: item.postingId,
      date: item.createdAt,
      status: item.status as OrderStatus,
      postingTitle: item.postingTitle,
      sellerName: sanitizeName(item.sellerName, "Người bán"),
      bike: {
        name: item.bikeName || item.postingTitle,
        image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
        price: item.totalAmount?.toLocaleString('vi-VN') + ' ₫'
      },
      totalAmount: item.totalAmount,
      isReported: item.isReported,
      rating: item.rating,
      reviewComment: item.reviewComment
    }));
  },
  getOrderDetail: async (id: string) => {
    const { data } = await buyerClient.GET("/buyer/orders/{id}", {
      params: { path: { id: parseInt(id) } }
    });
    const res = (data as any)?.data || data;
    if (res) {
      res.sellerName = sanitizeName(res.sellerName, "Người bán");
      res.buyerName = sanitizeName(res.buyerName, "Người mua");
    }
    return res;
  },
  getMySales: async () => {
    const { data } = await sellerClient.GET("/seller/orders");
    const res = (data as any)?.data || (data as any) || [];
    if (Array.isArray(res)) {
      return res.map((item: any) => ({
        ...item,
        buyerName: sanitizeName(item.buyerName, "Người mua"),
        sellerName: sanitizeName(item.sellerName, "Người bán")
      }));
    }
    return res;
  },
  getOrderTracking: async (id: string) => {
    const { data } = await buyerClient.GET("/buyer/orders/{id}/tracking" as any, {
        params: { path: { id: parseInt(id) } }
    });
    return (data as any)?.data || data;
  },
  submitReview: async (orderId: string | number, body: { rating: number, comment: string }) => {
    const { data } = await buyerClient.POST("/buyer/orders/{id}/review" as any, {
        params: { path: { id: typeof orderId === 'string' ? parseInt(orderId) : orderId } },
        body
    });
    return (data as any)?.data || data;
  }
};

export const paymentsApi = {
  createOrderPayment: async (postingId: number, purpose: string) => {
    const { data, error } = await buyerClient.POST("/payments/order", {
      body: { postingId, purpose }
    });
    if (error) throw new Error((error as any)?.message || "Không thể tạo lệnh thanh toán (ORDER)");
    return (data as any)?.data || data;
  },
  createMembershipPayment: async (membershipPlanId: number) => {
    const { data, error } = await generalClient.POST("/payments/membership", {
      body: { membershipPlanId }
    });
    if (error) throw new Error((error as any)?.message || "Không thể tạo lệnh thanh toán (MEMBERSHIP)");
    return (data as any)?.data || (data as any) || [];
  },
  createVipPayment: async (postingId: number, packageId: number, durationDays: number, includePostingFee: boolean, includeInspectionFee: boolean, manualReview: boolean = false) => {
    try {
      const res = await fetchBE("/payments/vip-package", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postingId, packageId, durationDays, includePostingFee, includeInspectionFee, manualReview })
      });
      
      // The backend returns a ResponseModel which fetchBE parses. 
      // Successful responses (200 OK) might still have a StatusCode >= 400 in the body.
      if (res && res.statusCode >= 400) {
        throw new Error(res.message || "Lỗi từ máy chủ (VIP_PACKAGE)");
      }
      return res?.data || res;
    } catch (err: any) {
      // Re-throw with more context if it's not already an Error object with a message
      throw new Error(err.message || "Không thể kết nối đến máy chủ thanh toán");
    }
  },
  getStatus: async (paymentCode: string) => {
    const { data, error } = await generalClient.GET("/payments/status/{paymentCode}" as any, {
      params: { path: { paymentCode } }
    });
    if (error) throw new Error((error as any)?.message || "Không thể lấy trạng thái thanh toán");
    return (data as any)?.data || data;
  },
  bypassSepayPayment: async (paymentCode: string) => {
    // We use fetchBE here because generalClient might not have the new test-only endpoint in its generated schema
    return await fetchBE(`/payments/bypass-sepay/${paymentCode}`, {
        method: 'POST'
    });
  }
};

/**
 * 7. REVIEWS API
 */
export const reviewApi = {
  getMyReviews: async () => {
    const { data } = await buyerClient.GET("/buyer/reviews");
    return (data as any)?.data || (data as any) || [];
  },
  getReceivedReviews: async () => {
    const { data } = await buyerClient.GET("/buyer/reviews/received" as any);
    return (data as any)?.data || (data as any) || [];
  },
  postReview: async (postingId: number, content: string) => {
    const { data } = await buyerClient.POST("/buyer/reviews/{postingId}", {
      params: { path: { postingId } },
      body: { content }
    });
    return (data as any)?.data || data;
  }
};

/**
 * 8. CHAT API
 */
export const chatApi = {
  getConversations: async () => {
    const { data } = await generalClient.GET("/api/Chat/conversations");
    const res = data as any;
    return res?.data || res || [];
  },
  getMessages: async (conversationId: number) => {
    const { data } = await generalClient.GET("/api/Chat/messages/{conversationId}", {
      params: { path: { conversationId } }
    });
    const res = data as any;
    return res?.data || res || [];
  },
  markAllRead: async () => {
    const { data } = await generalClient.POST("/api/Chat/mark-all-read");
    const res = data as any;
    return res?.data || res || [];
  }
};

/**
 * 7. AI API
 */
export const aiApi = {
  moderate: async (body: any) => {
    const { data } = await generalClient.POST("/ai/moderate", { body });
    return data as any;
  },
  chat: async (message: string, history: string[] = []) => {
    const { data } = await buyerClient.POST("/ai/chat", { body: { message, history } });
    return data as any;
  },
  getHistory: async () => {
    const { data } = await buyerClient.GET("/ai/history");
    return data as any;
  },
  getSuggestions: async (query: string): Promise<string[]> => {
    const { data } = await (generalClient as any).GET("/ai/suggestions", { 
      params: { query: { query } } 
    });
    return (data as any) || [];
  },
  suggestContent: async (categoryName: string, currentDescription: string, productContext: string) => {
    const { data } = await (generalClient as any).POST("/ai/suggest-content", { body: { categoryName, currentDescription, productContext } });
    return data as any;
  },
  suggestPrice: async (brand: string, model: string, year: string, categoryName: string, condition: string) => {
    const { data } = await (generalClient as any).POST("/ai/suggest-price", { body: { brand, model, year, categoryName, condition } });
    return data as any;
  }
};

/**
 * 8. METADATA API
 */
export const metadataApi = {
  getBrands: async () => {
    const { data } = await generalClient.GET("/metadata/brands");
    const res = data as any;
    return res?.data || res || [];
  },
  getCategories: async () => {
    const { data } = await generalClient.GET("/metadata/categories");
    const res = data as any;
    return res?.data || res || [];
  },
  getColors: async () => {
    const { data } = await generalClient.GET("/metadata/colors");
    const res = data as any;
    return res?.data || res || [];
  },
  getMaterials: async () => {
    const { data } = await generalClient.GET("/metadata/materials");
    const res = data as any;
    return res?.data || res || [];
  },
  getBrakeTypes: async () => {
    const { data } = await generalClient.GET("/metadata/brake-types");
    const res = data as any;
    return res?.data || res || [];
  },
  getLocations: async () => {
    const { data } = await (generalClient as any).GET("/metadata/locations");
    const res = data as any;
    return res?.data || res || [];
  }
};

/**
 * 9. ADMIN & INSPECTOR API
 */
export const adminApi = {
  getDashboard: async () => {
    const { data } = await adminClient.GET("/admin/stats/overview");
    return (data as any)?.data || data;
  },
  getUsers: async () => {
    const { data } = await adminClient.GET("/admin/users");
    return (data as any)?.data || data;
  }
};

export const inspectorApi = {
  getAssignedTasks: async () => {
    const { data } = await inspectorClient.GET("/inspector/inspections/pending");
    return (data as any)?.data || data;
  }
};

/**
 * 10. REPORT API
 */
export const reportApi = {
  createReport: async (body: {
    postingId?: number;
    orderId?: number;
    reason: string;
    description: string;
    evidenceImages?: string;
  }) => {
    const { data, error } = await generalClient.POST("/reports", { body });
    if (error) throw new Error((error as any)?.message || "Không thể gửi báo cáo");
    return (data as any)?.data || data;
  },
  submitUserReport: async (body: {
    postingId?: number;
    orderId?: number;
    reason: string;
    description: string;
    evidenceImages?: string;
  }) => {
    const { data, error } = await generalClient.POST("/user/report", { body });
    if (error) throw new Error((error as any)?.message || "Không thể gửi báo cáo");
    return (data as any)?.data || data;
  }
};

import { mockFetch } from './mockFetch';

// EXPORT BACKWARD COMPATIBILITY
export const fetchBE = async (endpoint: string, options?: any) => {
    // This is a fallback to not break old code that still calls fetchBE directly
    const baseURL = import.meta.env.VITE_API_URL || "https://choxedap.app";
    const token = localStorage.getItem("choxedap_token");
    
    // Đảm bảo URL được nối đúng cách, tránh dấu gạch chéo kép
    const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullURL = `${cleanBaseURL}${cleanEndpoint}`;
    
    const requestOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
    };

    const response = await mockFetch(fullURL, requestOptions);

    if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // If body is not JSON, use status text
        }
        throw new Error(errorMessage);
    }

    // Check if content-type is application/json before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    
    return null;
};

// DEFAULT EXPORT FOR AXIOS-STYLE COMPATIBILITY
const api = {
    get: (endpoint: string) => fetchBE(endpoint, { method: 'GET' }).then(data => ({ data })),
    post: (endpoint: string, body?: any) => fetchBE(endpoint, { 
        method: 'POST', 
        body: body ? JSON.stringify(body) : undefined 
    }).then(data => ({ data })),
    put: (endpoint: string, body?: any) => fetchBE(endpoint, { 
        method: 'PUT', 
        body: body ? JSON.stringify(body) : undefined 
    }).then(data => ({ data })),
    delete: (endpoint: string) => fetchBE(endpoint, { method: 'DELETE' }).then(data => ({ data }))
};

export default api;
