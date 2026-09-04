import { Star, MessageSquare, User } from 'lucide-react';
import type { SubmittedReview } from '../../types/review';

interface SellerReviewsProps {
  reviews?: SubmittedReview[];
}

export function SellerReviews({ reviews = [] }: SellerReviewsProps) {

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào từ người mua</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Bạn chưa nhận được đánh giá nào từ khách hàng. Hãy hoàn thành các đơn hàng để nhận được phản hồi nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Đánh giá từ khách hàng</h3>
        <span className="text-xs font-bold text-[#2E9147] bg-green-50 px-3 py-1.5 rounded-full">{reviews.length} đánh giá</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.map((review) => (
          <div key={review.orderId} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden hover:shadow-lg hover:border-[#2E9147]/20 transition-all">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">

              {/* Product Context Left */}
              <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img 
                    src={review.image || "https://images.unsplash.com/photo-1485965120184-e220f721d03e"} 
                    alt={review.bikeName} 
                    className="w-full h-full object-contain mix-blend-multiply p-2" 
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug mb-2">{review.bikeName}</h4>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Người mua: {review.shopName}</span> {/* shopName here actually stores buyer name for received reviews */}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                    <span>ĐH: {review.orderId}</span>
                  </div>
                </div>
              </div>

              {/* Review Content Right */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"}`}
                      />
                    ))}
                    <span className="ml-3 font-bold text-gray-900">{review.rating}/5</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{review.date}</span>
                </div>

                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 flex-1 relative">
                  <MessageSquare className="absolute top-4 right-4 w-12 h-12 text-gray-100" />
                  <p className="text-gray-700 leading-relaxed relative z-10 whitespace-pre-wrap font-medium">
                    {review.comment ? review.comment : <span className="text-gray-400 italic">Khách hàng không để lại bình luận chi tiết.</span>}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
