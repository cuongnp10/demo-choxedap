import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export const PaymentCancel: React.FC = () => {
    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-t-4 border-t-yellow-500 shadow-xl text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="w-20 h-20 text-yellow-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-yellow-700">Đã hủy thanh toán</CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                        Bạn đã hủy giao dịch. Đơn hàng vẫn chưa được thanh toán.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700 py-6 text-lg text-white">
                        <Link to="/checkout">
                            Quay lại trang thanh toán
                        </Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full py-6">
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5" /> Về trang chủ
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
