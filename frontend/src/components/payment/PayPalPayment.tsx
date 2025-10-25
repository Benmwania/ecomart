import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { Button } from '../ui/Button';

interface PayPalPaymentProps {
  orderId: number;
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const { processPayment, paymentLoading } = usePayment();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'redirecting' | 'success' | 'failed'>('idle');
  const [approvalUrl, setApprovalUrl] = useState('');

  const handlePaypalPayment = async () => {
    try {
      setPaymentStatus('redirecting');
      const result = await processPayment(orderId, 'paypal', {});
      
      if (result.success) {
        setApprovalUrl(result.approval_url);
        // Redirect to PayPal
        window.location.href = result.approval_url;
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      setPaymentStatus('failed');
      onError(error.message || 'PayPal payment failed');
    }
  };

  // Handle PayPal return (this would be called when user returns from PayPal)
  const handlePayPalReturn = async () => {
    // In a real implementation, you would capture the payment here
    // using the token from the URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Capture payment
        setPaymentStatus('success');
        onSuccess({
          method: 'paypal',
          transaction_id: token,
          amount: amount,
        });
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      onError(error.message || 'Failed to capture PayPal payment');
    }
  };

  // Check if this is a PayPal return
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_method') === 'paypal') {
      handlePayPalReturn();
    }
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">PayPal</h3>
          <p className="text-gray-600">Pay with PayPal account or card</p>
        </div>
      </div>

      {paymentStatus === 'idle' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">${amount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Payment processed by PayPal</span>
              <span>Secure</span>
            </div>
          </div>

          <Button
            onClick={handlePaypalPayment}
            loading={paymentLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue to PayPal
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-gray-500 text-center">
            You will be redirected to PayPal to complete your payment securely
          </p>
        </div>
      )}

      {paymentStatus === 'redirecting' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Redirecting to PayPal...
          </h4>
          <p className="text-gray-600">
            Please wait while we connect to PayPal
          </p>
          {approvalUrl && (
            <p className="text-sm text-blue-600 mt-4">
              If you are not redirected automatically,{' '}
              <a href={approvalUrl} className="underline">click here</a>
            </p>
          )}
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h4>
          <p className="text-gray-600">
            Your PayPal payment has been confirmed
          </p>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="text-center py-6">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Failed
          </h4>
          <p className="text-gray-600 mb-4">
            Please try again or use a different payment method
          </p>
          <Button
            onClick={() => setPaymentStatus('idle')}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};