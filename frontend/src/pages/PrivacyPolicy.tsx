import React from "react";

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Privacy Policy - Cho Xe Dap</h1>
      
      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <p className="text-lg text-gray-700 leading-relaxed">
            Chào mừng bạn đến với sàn thương mại điện tử <strong>Cho Xe Dap</strong>. Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Thông tin chúng tôi thu thập</h2>
          <p className="mb-2 text-gray-600">Để cung cấp dịch vụ tốt nhất, chúng tôi thu thập:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Thông tin tài khoản</strong>: Họ tên, Email, Số điện thoại (xác thực qua OTP).</li>
            <li><strong>Thông tin giao dịch</strong>: Địa chỉ lấy hàng/giao hàng, Số tài khoản ngân hàng (dành cho thanh toán và hoàn tiền).</li>
            <li><strong>Dữ liệu bài đăng</strong>: Hình ảnh, Video xe đạp của Seller.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Cách chúng tôi sử dụng thông tin</h2>
          <p className="mb-2 text-gray-600">Thông tin của bạn được sử dụng để:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Xác thực danh tính và hỗ trợ liên lạc giữa Buyer và Seller.</li>
            <li>Xử lý các giao dịch thanh toán và vận chuyển.</li>
            <li>Kiểm duyệt bài đăng thông qua AI (Google Gemini) để đảm bảo an toàn cho cộng đồng.</li>
            <li>Gửi thông báo quan trọng về trạng thái đơn hàng và bài đăng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Chia sẻ thông tin với bên thứ ba</h2>
          <p className="mb-2 text-gray-600">Chúng tôi chỉ chia sẻ thông tin cần thiết với các đối tác tin cậy:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>SePay</strong>: Xử lý thanh toán.</li>
            <li><strong>Twilio</strong>: Gửi mã xác thực OTP.</li>
            <li><strong>SendGrid</strong>: Gửi thông báo Email.</li>
            <li><strong>Đơn vị vận chuyển</strong>: Cung cấp địa chỉ để Shipper lấy và giao hàng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Bảo mật dữ liệu</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Mọi kết nối đều được mã hóa qua SSL/HTTPS.</li>
            <li>Thông tin ngân hàng được lưu trữ an toàn và chỉ Admin có quyền truy cập để thực hiện lệnh chuyển tiền thủ công.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Quyền của người dùng</h2>
          <p className="text-gray-700">
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang cá nhân hoặc liên hệ Admin.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-gray-500 italic">
          Cập nhật lần cuối: 14 tháng 3, 2024
        </footer>
      </div>
    </div>
  );
};
