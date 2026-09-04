import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { reportApi } from "../../lib/api";
import { AlertTriangle, ShieldAlert, Camera } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postingId?: number;
  orderId?: number;
  targetName: string;
}

const VIOLATION_TYPES = [
  { value: 'FAKE_PRODUCT', label: 'Sản phẩm giả mạo / Nhái' },
  { value: 'WRONG_PRICE', label: 'Giá không đúng thực tế' },
  { value: 'SPAM', label: 'Spam / Đăng trùng lặp' },
  { value: 'SCAM', label: 'Dấu hiệu lừa đảo' },
  { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
  { value: 'OTHER', label: 'Lý do khác' },
];

const DISPUTE_TYPES = [
  { value: 'TECHNICAL', label: 'Lỗi kỹ thuật / Hỏng hóc không nêu' },
  { value: 'CONTENT', label: 'Sai mô tả / Thiếu phụ kiện' },
  { value: 'SCAM', label: 'Lừa đảo / Tráo hàng' },
  { value: 'OTHER', label: 'Lý do khác' },
];

export function ReportModal({ isOpen, onClose, postingId, orderId, targetName }: ReportModalProps) {
  const [reason, setReason] = useState(orderId ? 'TECHNICAL' : 'FAKE_PRODUCT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 10) {
      toast.error("Mô tả phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      await reportApi.createReport({
        postingId,
        orderId,
        reason,
        description,
      });
      toast.success("Đã gửi báo cáo thành công. Ban quản trị sẽ sớm xem xét yêu cầu của bạn.");
      onClose();
      setDescription('');
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi báo cáo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const types = orderId ? DISPUTE_TYPES : VIOLATION_TYPES;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-600">
            {orderId ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            {orderId ? "Báo cáo / Khiếu nại đơn hàng" : "Báo cáo vi phạm tin đăng"}
          </DialogTitle>
          <DialogDescription className="font-medium">
            Bạn đang báo cáo: <span className="text-foreground font-bold">{targetName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="font-bold text-sm uppercase tracking-wider text-gray-500">Lý do báo cáo *</Label>
            <RadioGroup 
              value={reason} 
              onValueChange={setReason}
              className="grid grid-cols-1 gap-2"
            >
              {types.map((type) => (
                <div 
                  key={type.value} 
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    reason === type.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100'
                  }`}
                  onClick={() => setReason(type.value)}
                >
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="font-bold cursor-pointer flex-1">{type.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-sm uppercase tracking-wider text-gray-500">Chi tiết vi phạm *</Label>
            <Textarea
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 10 ký tự)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] rounded-xl resize-none"
              required
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Lưu ý:</strong> Việc báo cáo sai sự thật hoặc lạm dụng tính năng này có thể dẫn đến việc tài khoản của bạn bị hạn chế. Vui lòng cung cấp thông tin trung thực.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold flex-1 py-6">
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || description.length < 10}
              className="rounded-xl font-bold flex-1 py-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
