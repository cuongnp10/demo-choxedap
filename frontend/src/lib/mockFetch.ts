export const MOCK_BIKES = [
  {
    id: 1,
    title: "Xe Đạp Thể Thao Giant Trance 3 2023",
    price: 15500000,
    thumbnailUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
    location: "TP. Hồ Chí Minh",
    createdAt: new Date().toISOString(),
    isCertified: true,
    vipTier: "NOI_BAT",
    frameSize: "M",
    description: "Cần bán xe Giant Trance 3 đời mới, ít đi.",
    seller: {
      id: 1,
      fullName: "Nguyễn Văn A",
      rating: "4.8",
      reviewsCount: 12,
      avatar: "",
      joinDate: "2023-01-01T00:00:00Z"
    },
    bicycle: {
      brand: "Giant",
      model: "Trance 3",
      categoryName: "Xe đạp địa hình",
      color: "Đen",
      frameSize: "M",
      year: 2023,
      condition: "LIKE_NEW",
      frameMaterial: "Nhôm",
      brakeSystem: "Phanh đĩa thủy lực",
      drivetrain: "Shimano Deore",
      speedCount: 12
    }
  },
  {
    id: 2,
    title: "Xe Đạp Đua Trek Emonda SL 5",
    price: 45000000,
    thumbnailUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
    location: "Hà Nội",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isCertified: false,
    vipTier: "THUONG",
    frameSize: "L",
    description: "Xe đua Trek carbon nguyên bản.",
    seller: {
      id: 2,
      fullName: "Trần Thị B",
      rating: "5.0",
      reviewsCount: 3,
      avatar: "",
      joinDate: "2024-02-15T00:00:00Z"
    },
    bicycle: {
      brand: "Trek",
      model: "Emonda SL 5",
      categoryName: "Xe đạp đua",
      color: "Đỏ",
      frameSize: "L",
      year: 2022,
      condition: "GOOD",
      frameMaterial: "Carbon",
      brakeSystem: "Phanh đĩa",
      drivetrain: "Shimano 105",
      speedCount: 22
    }
  },
  {
    id: 3,
    title: "Xe Đạp Địa Hình Carbon Fiber S-Works",
    price: 95000000,
    thumbnailUrl: "https://images.unsplash.com/photo-1596758369389-98075f1b135c",
    location: "Đà Nẵng",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isCertified: true,
    vipTier: "NOI_TROI",
    frameSize: "M",
    description: "Xe địa hình cao cấp từ Specialized. Sườn carbon siêu nhẹ, phuộc nhún Fox. Thích hợp đổ đèo.",
    seller: {
      id: 3,
      fullName: "Lê Văn C",
      rating: "4.9",
      reviewsCount: 15,
      avatar: "https://i.pravatar.cc/150?u=c",
      joinDate: "2023-01-20T00:00:00Z"
    },
    bicycle: {
      brand: "Specialized",
      model: "S-Works Epic",
      categoryName: "Xe đạp địa hình",
      color: "Trắng",
      frameSize: "M",
      year: 2024,
      condition: "NEW",
      frameMaterial: "Carbon",
      brakeSystem: "Phanh đĩa thủy lực",
      drivetrain: "SRAM XX1 Eagle",
      speedCount: 12
    }
  },
  {
    id: 4,
    title: "Xe Đạp Touring Cannondale Topstone",
    price: 32000000,
    thumbnailUrl: "https://images.unsplash.com/photo-1511994298241-608e28f14fde",
    location: "Hà Nội",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    isCertified: false,
    vipTier: "VIP1",
    frameSize: "L",
    description: "Xe đạp đường trường gravel bike, lốp gai bám đường tốt, khung nhôm phuộc carbon.",
    seller: {
      id: 4,
      fullName: "Phạm T",
      rating: "4.5",
      reviewsCount: 8,
      avatar: "https://i.pravatar.cc/150?u=t",
      joinDate: "2023-05-12T00:00:00Z"
    },
    bicycle: {
      brand: "Cannondale",
      model: "Topstone 3",
      categoryName: "Xe đạp Gravel",
      color: "Xanh lá",
      frameSize: "L",
      year: 2021,
      condition: "GOOD",
      frameMaterial: "Nhôm",
      brakeSystem: "Phanh đĩa cơ",
      drivetrain: "Shimano Sora",
      speedCount: 18
    }
  },
  {
    id: 5,
    title: "Xe Đạp Trẻ Em Royal Baby",
    price: 2500000,
    thumbnailUrl: "https://images.unsplash.com/photo-1506041696001-c918ff86b0da",
    location: "Hồ Chí Minh",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    isCertified: false,
    vipTier: "THUONG",
    frameSize: "S",
    description: "Xe đạp cho bé từ 5-8 tuổi. Còn rất mới, phụ tùng đầy đủ bánh phụ.",
    seller: {
      id: 5,
      fullName: "Trần Mẹ Bỉm",
      rating: "5.0",
      reviewsCount: 2,
      avatar: "https://i.pravatar.cc/150?u=m",
      joinDate: "2024-06-01T00:00:00Z"
    },
    bicycle: {
      brand: "Royal Baby",
      model: "Freestyle 16",
      categoryName: "Xe đạp trẻ em",
      color: "Hồng",
      frameSize: "16 inch",
      year: 2023,
      condition: "LIKE_NEW",
      frameMaterial: "Thép",
      brakeSystem: "Phanh vành",
      drivetrain: "Single speed",
      speedCount: 1
    }
  },
  {
    id: 6,
    title: "Xe Đạp Trợ Lực Điện (E-Bike) Engwe",
    price: 18500000,
    thumbnailUrl: "https://images.unsplash.com/photo-1620286820241-1e96e007d4b4",
    location: "Đà Lạt",
    createdAt: new Date(Date.now() - 5000000).toISOString(),
    isCertified: true,
    vipTier: "NOI_BAT",
    frameSize: "M",
    description: "Xe đạp điện gấp gọn, pin trâu đi được 60km, tốc độ tối đa 45km/h. Tặng kèm baga và khoá phanh.",
    seller: {
      id: 6,
      fullName: "Shop Xe Điện ĐL",
      rating: "4.8",
      reviewsCount: 120,
      avatar: "https://i.pravatar.cc/150?u=shop",
      joinDate: "2022-11-10T00:00:00Z"
    },
    bicycle: {
      brand: "Engwe",
      model: "Engine Pro",
      categoryName: "Xe đạp trợ lực điện",
      color: "Đen",
      frameSize: "20 inch",
      year: 2024,
      condition: "NEW",
      frameMaterial: "Nhôm",
      brakeSystem: "Phanh đĩa thủy lực",
      drivetrain: "Shimano 7 Speed",
      speedCount: 7
    }
  }
];

export const MOCK_USER = {
  id: 1,
  fullName: "Người dùng Demo",
  email: "demo@choxedap.app",
  phoneNumber: "0123456789",
  role: "Buyer",
  avatar: ""
};

export const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  const path = url.replace(/^(http|https):\/\/[^/]+/, '').split('?')[0];

  console.log(`[Mock API] ${init?.method || (input instanceof Request ? input.method : 'GET')} ${path}`);

  const createResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify({ data, statusCode: status, isSuccess: true, message: "Success" }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  if (path.includes('/bikes/featured') || path.includes('/bikes/certified')) {
    return createResponse(MOCK_BIKES);
  }
  if (path.match(/\/bikes\/\d+/)) {
    const id = parseInt(path.split('/').pop() || '1');
    const bike = MOCK_BIKES.find(b => b.id === id) || MOCK_BIKES[0];
    return createResponse(bike);
  }
  if (path.endsWith('/bikes') || path.includes('/bikes?')) {
    return createResponse({
      items: MOCK_BIKES,
      totalCount: MOCK_BIKES.length,
      totalPages: 1,
      page: 1,
      pageSize: 12
    });
  }
  if (path.includes('/auth/login') || path.includes('/auth/google') || path.includes('/auth/register/verify-otp')) {
    return createResponse({
      token: "MOCK_FIREBASE_TOKEN_LOCAL_BYPASS",
      userId: MOCK_USER.id,
      fullName: MOCK_USER.fullName,
      email: MOCK_USER.email,
      role: MOCK_USER.role,
      avatar: MOCK_USER.avatar,
      phoneNumber: MOCK_USER.phoneNumber,
      phoneVerified: true,
      address: "123 Demo Street",
      bankAccountNumber: "123456789",
      bankName: "Demo Bank",
      bankAccountHolderName: "NGUOI DUNG DEMO",
      kycStatus: "VERIFIED"
    });
  }
  if (path.includes('/auth/register/request-otp') || path.includes('/auth/phone/verify')) {
    return createResponse({});
  }
  if (path.includes('/user/profile')) {
    return createResponse(MOCK_USER);
  }
  if (path.includes('/metadata/brands')) {
    return createResponse(["Giant", "Trek", "Specialized", "Cannondale", "Scott"]);
  }
  if (path.includes('/metadata/categories')) {
    return createResponse([{ id: 1, name: "Xe đạp địa hình" }, { id: 2, name: "Xe đạp đua" }]);
  }
  if (path.includes('/metadata/colors')) {
    return createResponse(["Đen", "Trắng", "Đỏ", "Xanh"]);
  }
  if (path.includes('/metadata/materials')) {
    return createResponse(["Nhôm", "Carbon", "Thép"]);
  }
  if (path.includes('/metadata/brake-types')) {
    return createResponse(["Phanh đĩa", "Phanh vành", "Phanh thủy lực"]);
  }
  if (path.includes('/metadata/settings')) {
    return createResponse([]);
  }
  
  // Default mock for anything else
  return createResponse([]);
};
