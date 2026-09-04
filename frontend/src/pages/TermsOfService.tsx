import React from "react";

export const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Terms of Service - Cho Xe Dap</h1>
      
      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <p className="text-lg text-gray-700 leading-relaxed">
            Việc sử dụng dịch vụ trên sàn <strong>Cho Xe Dap</strong> đồng nghĩa với việc bạn đồng ý với các điều khoản dưới đây.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Trách nhiệm của Người bán (Seller)</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Cam kết cung cấp thông tin chính xác về tình trạng xe.</li>
            <li>Phải hoàn thành KYC (Xác thực SĐT, Địa chỉ, Ngân hàng) trước khi đăng tin.</li>
            <li>Chịu trách nhiệm về tính pháp lý của sản phẩm (không bán xe trộm cắp, xe không rõ nguồn gốc).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Trách nhiệm của Người mua (Buyer)</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Kiểm tra kỹ thông tin sản phẩm và báo cáo kiểm định (nếu có) trước khi quyết định mua.</li>
            <li>Cam kết thanh toán đúng hạn cho các đơn hàng đã đặt cọc/mua ngay.</li>
            <li>Tuân thủ quy tắc ứng xử văn minh khi chat với Seller.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Quy định về Giao dịch & Thanh toán</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Mọi giao dịch phí dịch vụ (đăng bài, đẩy tin) không được hoàn lại sau khi bài đăng đã công khai.</li>
            <li><strong>Hoàn tiền cọc</strong>: Chỉ thực hiện nếu Seller từ chối đơn hàng hoặc xe không đúng mô tả (sau khi Admin xác minh).</li>
            <li><strong>Mất cọc</strong>: Buyer mất 100% cọc nếu tự ý hủy đơn sau khi Seller đã xác nhận và chuẩn bị giao hàng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Kiểm duyệt & Xử phạt</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Hệ thống có quyền ẩn hoặc xóa bài đăng vi phạm chính sách mà không cần báo trước.</li>
            <li>Tài khoản vi phạm quy tắc sàn sẽ bị cảnh cáo hoặc khóa vĩnh viễn (3 lần cảnh cáo = Ban vĩnh viễn).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Giới hạn trách nhiệm</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Cho Xe Dap</strong> là nền tảng kết nối. Chúng tôi không chịu trách nhiệm về các hư hỏng phát sinh do quá trình sử dụng xe sau khi giao dịch đã hoàn tất và quá thời hạn báo cáo đơn hàng (24h).</li>
            <li>Mọi tranh chấp kỹ thuật sẽ dựa trên báo cáo của Inspector và video đồng kiểm làm căn cứ giải quyết.</li>
          </ul>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-gray-500 italic">
          Cập nhật lần cuối: 14 tháng 3, 2024
        </footer>
      </div>
    </div>
  );
};
