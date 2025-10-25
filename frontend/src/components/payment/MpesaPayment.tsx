import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { paymentService } from '../../services/paymentService';
import { Button } from '../ui/Button';

interface MpesaPaymentProps {
  orderId: number;
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

export const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const { processPayment, paymentLoading } = usePayment();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [polling, setPolling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.match(/^(?:254|\+254|0)?[17]\d{8}$/)) {
      onError('Please enter a valid Kenyan phone number');
      return;
    }

    try {
      setPaymentStatus('pending');
      const result = await processPayment(orderId, 'mpesa', { phoneNumber });
      
      if (result.success) {
        setCheckoutRequestId(result.checkout_request_id);
        startPolling(result.checkout_request_id);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error: any) {
      setPaymentStatus('failed');
      onError(error.message || 'M-Pesa payment failed');
    }
  };

  const startPolling = async (checkoutId: string) => {
    setPolling(true);
    
    try {
      const result = await paymentService.pollMpesaPayment(checkoutId);
      
      if (result.status === 'completed') {
        setPaymentStatus('success');
        onSuccess({
          method: 'mpesa',
          transaction_id: result.transaction_id,
          amount: amount,
          phone_number: phoneNumber,
        });
      } else {
        setPaymentStatus('failed');
        onError('Payment was not completed. Please try again.');
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      onError('Payment confirmation timeout. Please check your M-Pesa messages.');
    } finally {
      setPolling(false);
    }
  };

  const retryPayment = () => {
    setPaymentStatus('idle');
    setCheckoutRequestId('');
    setPolling(false);
  };

  // Convert USD to KES (approximate rate)
  const amountInKES = Math.round(amount * 115);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
          <Phone className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">M-Pesa Payment</h3>
          <p className="text-gray-600">Pay via M-Pesa STK Push</p>
        </div>
      </div>

      {paymentStatus === 'idle' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">+</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="254712345678"
                className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your M-Pesa registered phone number (format: 254712345678)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              💡 You will receive an STK push on your phone to complete the payment of{' '}
              <strong>KES {amountInKES.toLocaleString()}</strong>
            </p>
          </div>

          <Button
            type="submit"
            loading={paymentLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Pay with M-Pesa
          </Button>
        </form>
      )}

      {paymentStatus === 'pending' && (
        <div className="text-center py-6">
          {polling ? (
            <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          ) : (
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          )}
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {polling ? 'Confirming Payment...' : 'Waiting for Payment'}
          </h4>
          <p className="text-gray-600 mb-4">
            {polling 
              ? 'Checking payment status...'
              : 'Check your phone for an M-Pesa STK push notification'
            }
          </p>
          {!polling && (
            <div className="space-y-2 text-sm text-gray-500">
              <p>1. Enter your M-Pesa PIN</p>
              <p>2. Confirm the payment of KES {amountInKES.toLocaleString()}</p>
              <p>3. Wait for automatic confirmation</p>
            </div>
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
            Your M-Pesa payment has been confirmed
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
          <div className="space-y-2">
            <Button
              onClick={retryPayment}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};