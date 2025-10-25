import React, { createContext, useContext, useState, ReactNode } from 'react';
import { paymentService } from '../services/paymentService';

interface PaymentContextType {
  processPayment: (orderId: number, method: string, details: any) => Promise<any>;
  paymentLoading: boolean;
  paymentError: string | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const processPayment = async (orderId: number, method: string, details: any) => {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      let result;
      
      switch (method) {
        case 'mpesa':
          result = await paymentService.initiateMpesaPayment(orderId, details.phoneNumber);
          break;
        case 'paypal':
          result = await paymentService.initiatePaypalPayment(orderId);
          break;
        case 'card':
          result = await paymentService.createStripePaymentIntent(orderId);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      setPaymentLoading(false);
      return result;
    } catch (error: any) {
      setPaymentLoading(false);
      setPaymentError(error.response?.data?.error || 'Payment failed. Please try again.');
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{
      processPayment,
      paymentLoading,
      paymentError,
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};