import { Star, Camera, MessageSquare, Inbox, Bike, User, CheckCircle2 } from 'lucide-react';
import type { SubmittedReview } from '../../types/review';

interface BuyerReviewsProps {
  reviews?: SubmittedReview[];
}

export function BuyerReviews({ reviews = [] }: BuyerReviewsProps) {

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Bạn chưa thực hiện đánh giá nào. Hãy trải nghiệm mua hàng và chia sẻ cảm nhận với cộng đồng nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Lịch sử đánh giá</h3>
        <span className="text-xs font-bold text-[#2E9147] bg-green-50 px-3 py-1.5 rounded-full">{reviews.length} đánh giá</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.map((review) => (
          <div key={review.orderId} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden hover:shadow-lg hover:border-[#2E9147]/20 transition-all">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">

              {/* Product Context Left */}
              <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={review.image} alt={review.bikeName} className="w-full h-full object-contain mix-blend-multiply p-2" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug">{review.bikeName}</h4>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>Người bán: {review.shopName}</span>
                    </div>
                    {/* <div className="flex items-center gap-2">
                       {review.reviewType === "COMMENT" ? (
                         <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                           <MessageSquare className="w-2.5 h-2.5" />
                           Thảo luận
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#2E9147]/10 text-[#2E9147] rounded-md border border-[#2E9147]/20">
                           <CheckCircle2 className="w-2.5 h-2.5" />
                           Đánh giá
                         </span>
                       )}
                    </div> */}
                    {review.reviewType === "ORDER_REVIEW" && (
                       <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mt-0.5">
                         <span>ĐH: #{review.orderId}</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Content Right */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {review.reviewType === "ORDER_REVIEW" ? (
                      <>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"}`}
                          />
                        ))}
                        <span className="ml-3 font-bold text-gray-900">{review.rating}/5</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MessageSquare className="w-5 h-5 text-[#2E9147]/30" />
                        <span className="text-sm font-bold uppercase tracking-tight">Nội dung thảo luận</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">{review.date}</span>
                </div>

                <div className={`border rounded-2xl p-5 flex-1 relative ${review.reviewType === 'COMMENT' ? 'bg-blue-50/30 border-blue-100/50' : 'bg-gray-50/70 border-gray-100'}`}>
                  <p className="text-gray-700 leading-relaxed relative z-10 whitespace-pre-wrap font-medium text-[15px]">
                    {review.comment ? review.comment : <span className="text-gray-400 italic">Người mua không để lại bình luận chi tiết.</span>}
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
