import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { assets } from "../lib/assets";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BikeCard } from "../components/BikeCard";
import { BikeCardSkeleton } from "../components/BikeCardSkeleton";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { bikeApi, metadataApi } from "../lib/api";
import type { BikeProduct } from "../types/bike";
import { Helmet } from "react-helmet-async";

type BuyPageProps = {
  initialQuery?: string;
  onSearch?: (query: string) => void;
};

export function BuyPage({ initialQuery = "", onSearch }: BuyPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [query, setQuery] = useState(initialQuery);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedHeight, setSelectedHeight] = useState<string>("all");
  const [products, setProducts] = useState<BikeProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>(["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

  useEffect(() => {
    setQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedBrand, selectedLocation, selectedCategory, selectedHeight, certifiedOnly]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [fetchedBrands, fetchedCategories, fetchedLocations] = await Promise.all([
          metadataApi.getBrands().catch(() => []),
          metadataApi.getCategories().catch(() => []),
          metadataApi.getLocations().catch(() => [])
        ]);
        setBrands(fetchedBrands || []);
        setCategories(fetchedCategories || []);
        if (fetchedLocations && fetchedLocations.length > 0) {
            setLocations(fetchedLocations);
        }
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await bikeApi.getProducts({
          query: query || undefined,
          brand: selectedBrand !== "all" ? selectedBrand : undefined,
          location: selectedLocation !== "all" ? selectedLocation : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          height: selectedHeight !== "all" ? selectedHeight : undefined,
          certifiedOnly,
          page: page,
          pageSize: 30,
          sortBy: sortBy !== "relevant" ? sortBy : undefined
        });

        const finalItems = result.items;
        const finalTotal = result.totalCount;

        if (page === 1) {
          setProducts(finalItems);
        } else {
          setProducts(prev => [...prev, ...finalItems]);
        }

        setTotalCount(finalTotal);
        setHasMore(finalItems.length === 30 && (page * 30) < finalTotal);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [query, selectedBrand, selectedLocation, selectedCategory, selectedHeight, certifiedOnly, page, sortBy]);

  const handleSearch = () => {
    onSearch?.(query.trim());
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const frameSizeWeight: Record<string, number> = {
    "XS": 1,
    "S": 2,
    "M": 3,
    "L": 4,
    "XL": 5
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === "price-asc") {
      return (a.rawPrice || 0) - (b.rawPrice || 0);
    }
    if (sortBy === "price-desc") {
      return (b.rawPrice || 0) - (a.rawPrice || 0);
    }
    if (sortBy === "height-asc") {
      return (frameSizeWeight[a.frameSize || ""] || 0) - (frameSizeWeight[b.frameSize || ""] || 0);
    }
    if (sortBy === "height-desc") {
        return (frameSizeWeight[b.frameSize || ""] || 0) - (frameSizeWeight[a.frameSize || ""] || 0);
    }
    return 0;
  });

  return (
    <div className="w-full flex flex-col items-center pb-12 font-['Inter',sans-serif]">
      <Helmet>
        <title>Mua xe</title>
      </Helmet>
      {/* Header / Search Section */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 flex flex-col items-center py-2 px-4 md:px-6">
        <div className="w-full max-w-[1200px] flex flex-col gap-3">

          {/* Top Row: Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button type="button" className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/80 hover:bg-zinc-50 transition-colors shrink-0">
              <div className="w-3 h-3 text-black"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M6 12h12m-9 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <span className="text-xs font-semibold text-black">Bộ lọc</span>
            </button>

            {selectedBrand !== "all" && (
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-black/20 bg-gray-50 shrink-0">
                <span className="text-xs font-medium text-black">{selectedBrand}</span>
                <button onClick={() => setSelectedBrand("all")} className="p-0.5 hover:bg-gray-200 rounded-full text-zinc-500">
                  <X size={12} />
                </button>
              </div>
            )}

            {selectedHeight !== "all" && (
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-black/20 bg-gray-50 shrink-0">
                <span className="text-xs font-medium text-black">
                  {selectedHeight === "1m30-1m40" ? "Dưới 155cm" :
                    selectedHeight === "1m40-1m50" ? "Dưới 155cm" :
                      selectedHeight === "1m50-1m60" ? "155 - 165cm" :
                        selectedHeight === "1m60-1m70" ? "165 - 175cm" :
                          selectedHeight === "1m70-1m80" ? "175 - 183cm" : 
                            selectedHeight === "1m80-plus" ? "Trên 183cm" : selectedHeight}
                </span>
                <button onClick={() => setSelectedHeight("all")} className="p-0.5 hover:bg-gray-200 rounded-full text-zinc-500">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full h-[42px] md:h-[48px] bg-[#F7F7F7] rounded-full border border-zinc-200 flex items-center px-4 gap-2.5 hover:border-zinc-300 transition-colors focus-within:border-[#2E9147] focus-within:ring-1 focus-within:ring-[#2E9147]">
            <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-[#2E9147]">
              <ImageWithFallback src={assets.heroSearchIcon} alt="" className="w-full h-full object-contain mix-blend-multiply" />
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tìm kiếm xe đạp..."
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-base font-medium placeholder:text-zinc-400"
            />

            <button
              onClick={handleSearch}
              className="h-[32px] md:h-[38px] px-5 md:px-6 bg-[#2E9147] hover:bg-[#257a3b] text-white rounded-full font-bold text-xs md:text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Filters Row */}
          <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-0.5">
            <div className="flex flex-wrap items-center gap-2 md:gap-4 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-black whitespace-nowrap">Hãng xe</span>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="h-8 w-[130px] rounded-lg border-[#6B6B6B] bg-white text-xs">
                    <SelectValue placeholder="Chọn hãng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả hãng</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand} className="text-xs">{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-black whitespace-nowrap">Vị trí</span>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-8 w-[130px] rounded-lg border-[#6B6B6B] bg-white text-xs">
                    <SelectValue placeholder="Toàn quốc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Toàn quốc</SelectItem>
                    {locations.filter(loc => loc !== "Toàn quốc").map(loc => (
                      <SelectItem key={loc} value={loc} className="text-xs">{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-black whitespace-nowrap">Thể loại xe</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 w-[155px] rounded-lg border-[#6B6B6B] bg-white text-xs">
                    <SelectValue placeholder="Tất cả thể loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Tất cả thể loại</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-black whitespace-nowrap">Chiều cao</span>
                <Select value={selectedHeight} onValueChange={setSelectedHeight}>
                  <SelectTrigger className="h-8 w-[130px] rounded-lg border-[#6B6B6B] bg-white text-xs">
                    <SelectValue placeholder="Chiều cao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Chiều cao</SelectItem>
                    <SelectItem value="1m40-1m50" className="text-xs">Dưới 155cm</SelectItem>
                    <SelectItem value="1m50-1m60" className="text-xs">155 - 165cm</SelectItem>
                    <SelectItem value="1m60-1m70" className="text-xs">165 - 175cm</SelectItem>
                    <SelectItem value="1m70-1m80" className="text-xs">175 - 183cm</SelectItem>
                    <SelectItem value="1m80-plus" className="text-xs">Trên 183cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pl-2 cursor-pointer group" onClick={() => setCertifiedOnly(!certifiedOnly)}>
                <Switch 
                  checked={certifiedOnly} 
                  onCheckedChange={setCertifiedOnly} 
                  className="h-4 w-7 data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-white border border-zinc-300 data-[state=checked]:border-[#34C759]" 
                  thumbClassName="size-3 data-[state=checked]:translate-x-[12px] data-[state=unchecked]:translate-x-0 bg-white"
                />
                <span className="text-xs font-medium text-black select-none whitespace-nowrap group-hover:text-[#2E9147] transition-colors">Đã kiểm định</span>
              </div>
            </div>

            <div className="w-full lg:w-auto flex justify-end">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 w-[180px] rounded-lg border-zinc-300 bg-white text-xs">
                  <SelectValue placeholder="Liên quan nhất" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant" className="text-xs">Liên quan nhất</SelectItem>
                  <SelectItem value="newest" className="text-xs">Mới nhất</SelectItem>
                  <SelectItem value="price-asc" className="text-xs">Giá tăng dần</SelectItem>
                  <SelectItem value="price-desc" className="text-xs">Giá giảm dần</SelectItem>
                  <SelectItem value="height-asc" className="text-xs">Chiều cao tăng dần</SelectItem>
                  <SelectItem value="height-desc" className="text-xs">Chiều cao giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1200px] px-4 md:px-6 pt-5 md:pt-6">
        {/* Results Info */}
        <div className="mb-5">
          <h2 className="text-lg md:text-xl text-black">
            {isLoading ? (
              "Đang tìm kiếm sản phẩm..."
            ) : (
              <>Có <span className="font-bold text-[#2E9147]">{totalCount}</span> sản phẩm phù hợp:</>
            )}
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 justify-items-center">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <BikeCardSkeleton key={`skeleton-${idx}`} />
              ))
            : sortedProducts
                .map((product, idx) => (
                  <BikeCard
                    key={product.id || idx}
                    {...product}
                    onClick={() => navigate(`/listing/${product.id}`)}
                  />
                ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-8 py-3 bg-white border-2 border-[#2E9147] text-[#2E9147] rounded-full font-bold text-sm hover:bg-[#2E9147] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang tải..." : "Xem thêm sản phẩm"}
            </button>
          </div>
        )}
      </div>

      {/* Related Section */}
      <div className="w-full mt-12 border-t border-gray-100 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Sản phẩm liên quan</h2>
            <button className="text-[#2E9147] font-semibold text-sm hover:underline flex items-center gap-1">
              Xem tất cả <span className="text-base">›</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {isLoading 
              ? Array.from({ length: 3 }).map((_, i) => <BikeCardSkeleton key={`rel-skeleton-${i}`} />)
              : products.slice(0, 3).map((p, i) => (
                  <BikeCard key={`related-${i}`} {...p} onClick={() => navigate(`/listing/${p.id}`)} />
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
