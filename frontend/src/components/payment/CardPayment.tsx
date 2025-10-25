import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, XCircle } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';
import { Button } from '../ui/Button';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

interface CardPaymentProps {
  orderId: number;
  amount: number;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

const CardPaymentForm: React.FC<CardPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { processPayment, paymentLoading } = usePayment();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [clientSecret, setClientSecret] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const result = await processPayment(orderId, 'card', {});
        if (result.success) {
          setClientSecret(result.client_secret);
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        onError(error.message || 'Failed to initialize card payment');
      }
    };

    createPaymentIntent();
  }, [orderId, processPayment, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setPaymentStatus('processing');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      return;
    }

    try {
      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setPaymentStatus('failed');
        onError(error.message || 'Card payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        onSuccess({
          method: 'card',
          transaction_id: paymentIntent.id,
          amount: amount,
          last4: paymentIntent.payment_method?.card?.last4,
        });
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      onError(error.message || 'Card payment failed');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
          <CreditCard className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Credit/Debit Card</h3>
          <p className="text-gray-600">Pay securely with your card</p>
        </div>
      </div>

      {paymentStatus === 'idle' && clientSecret && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Element */}
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>

          {/* Security Notice */}
          <div className="flex items-center text-sm text-gray-600">
            <Lock className="w-4 h-4 mr-2" />
            Your payment details are secure and encrypted
          </div>

          <Button
            type="submit"
            loading={paymentLoading}
            disabled={!stripe}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Pay ${amount.toFixed(2)}
          </Button>

          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>American Express</span>
          </div>
        </form>
      )}

      {paymentStatus === 'processing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Processing Payment...
          </h4>
          <p className="text-gray-600">
            Please wait while we process your card payment
          </p>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h4>
          <p className="text-gray-600">
            Your card payment has been processed
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

      {!clientSecret && paymentStatus === 'idle' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      )}
    </div>
  );
};

// Wrap with Stripe Elements provider
export const CardPayment: React.FC<CardPaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CardPaymentForm {...props} />
    </Elements>
  );
};