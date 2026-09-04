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
  const url = typeof input === 'string' ? input : input.toString();
  const path = url.replace(/^(http|https):\/\/[^/]+/, '').split('?')[0];

  console.log(`[Mock API] ${init?.method || 'GET'} ${path}`);

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
  if (path.endsWith('/bikes')) {
    return createResponse({
      items: MOCK_BIKES,
      totalCount: 2,
      totalPages: 1,
      page: 1,
      pageSize: 12
    });
  }
  if (path.includes('/user/profile')) {
    return createResponse(MOCK_USER);
  }
  
  // Default mock for anything else
  return createResponse({});
};
