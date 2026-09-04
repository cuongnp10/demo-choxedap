import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export const PaymentError: React.FC = () => {
    const [searchParams] = useSearchParams();

    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-t-4 border-t-red-500 shadow-xl text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <XCircle className="w-20 h-20 text-red-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-red-600">Thanh toán thất bại</CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                        {searchParams.get('message') || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-500">
                        Vui lòng kiểm tra lại thông tin thẻ hoặc số dư tài khoản và thử lại.
                    </p>

                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg">
                        <Link to="/checkout">
                            Thử lại <RefreshCcw className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>

                    <Button variant="ghost" asChild className="w-full">
                        <Link to="/">Quay về trang chủ</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
