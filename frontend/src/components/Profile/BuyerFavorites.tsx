import { useEffect, useState } from "react";
import { BikeCard } from "../../components/BikeCard";
import { useNavigate } from "react-router-dom";
import { favoritesApi } from "../../lib/api";
import type { BikeProduct } from "../../types/bike";
import { Loader2 } from "lucide-react";

export function BuyerFavorites() {
    const [favoriteBikes, setFavoriteBikes] = useState<BikeProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            try {
                let data: BikeProduct[] = [];
                try {
                    data = await favoritesApi.getFavorites();
                } catch (e) {
                    console.warn("Could not fetch favorites from backend, using local storage");
                }

                // Sync with local storage
                const backendIds = data.map(b => b.id.toString());
                const localFavIds: string[] = JSON.parse(localStorage.getItem('favoriteBikes') || '[]');

                const missingIds = localFavIds.filter(id => !backendIds.includes(id));

                if (missingIds.length > 0) {
                    const { bikeApi } = await import('../../lib/api');
                    const missingBikesPromises = missingIds.map(async (id) => {
                        try {
                            const detail = await bikeApi.getBikeById(id);
                            return {
                                id: detail.id,
                                image: detail.images?.[0] || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e',
                                name: detail.name,
                                location: detail.location,
                                postedDate: detail.postedDate || 'Vừa xong',
                                price: detail.price,
                                isCertified: detail.isCertified,
                                vipTier: detail.vipTier,
                                frameSize: detail.bicycle?.frameSize
                            } as BikeProduct;
                        } catch (e) {
                            return null;
                        }
                    });

                    const resolvedBikes = (await Promise.all(missingBikesPromises)).filter(Boolean) as BikeProduct[];
                    data = [...data, ...resolvedBikes];
                }

                setFavoriteBikes(data);
            } catch (error) {
                console.error("Failed to fetch favorite bikes", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2E9147]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-gray-900">Xe đạp yêu thích</h2>
                    <p className="text-gray-500 text-sm mt-1">Danh sách xe đạp bạn đã lưu lại</p>
                </div>
            </div>

            {favoriteBikes.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có xe đạp yêu thích</h3>
                    <p className="text-gray-500">Bạn chưa lưu chiếc xe nào. Hãy khám phá và thả tim nhé!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
                    {favoriteBikes.map((product) => (
                        <BikeCard
                            key={product.id}
                            {...product}
                            initialIsFavorite={true}
                            onFavoriteToggle={(id, isFavorite) => {
                                if (!isFavorite) {
                                    setFavoriteBikes(prev => prev.filter(bike => bike.id !== id));
                                }
                            }}
                            onClick={() => navigate(`/listing/${product.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
