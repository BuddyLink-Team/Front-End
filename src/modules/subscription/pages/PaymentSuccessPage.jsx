import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Redirects to /checkout?orderCode=... to ensure payment is verified by the authoritative backend
 */
export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (orderCode) {
      navigate(`/checkout?orderCode=${orderCode}`, { replace: true });
    } else {
      navigate('/subscription', { replace: true });
    }
  }, [navigate, orderCode]);

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-on-surface-variant">Đang chuyển hướng xác thực giao dịch...</p>
    </div>
  );
};

export default PaymentSuccessPage;
