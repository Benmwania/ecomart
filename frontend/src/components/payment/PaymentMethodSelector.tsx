import React, { useState } from 'react';
import { CreditCard, Phone, Globe, Check } from 'lucide-react';
import { MpesaPayment } from './MpesaPayment';
import { PayPalPayment } from './PayPalPayment';
import { CardPayment } from './CardPayment';

interface PaymentMethodSelectorProps {
  orderId: number;
  amount: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

type PaymentMethod = 'mpesa' | 'paypal' | 'card';

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mpesa');

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay via M-Pesa STK Push',
      icon: Phone,
      color: 'green',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with PayPal or card',
      icon: Globe,
      color: 'blue',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay directly with your card',
      icon: CreditCard,
      color: 'purple',
    },
  ];

  const handlePaymentSuccess = (paymentData: any) => {
    onPaymentSuccess(paymentData);
  };

  const handlePaymentError = (error: string) => {
    onPaymentError(error);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id as PaymentMethod)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedMethod === method.id
                  ? `border-${method.color}-500 bg-${method.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <method.icon className={`w-6 h-6 text-${method.color}-600`} />
                {selectedMethod === method.id && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
              <h4 className="font-semibold text-gray-900">{method.name}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Payment Method */}
      <div>
        {selectedMethod === 'mpesa' && (
          <MpesaPayment
            orderId={orderId}
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        {selectedMethod === 'paypal' && (
          <PayPalPayment
            orderId={orderId}
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        {selectedMethod === 'card' && (
          <CardPayment
            orderId={orderId}
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </div>

      {/* Security Assurance */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-500 mr-2" />
          <span>All payments are secure and encrypted</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <Check className="w-4 h-4 text-green-500 mr-2" />
          <span>Your data is protected and never stored</span>
        </div>
      </div>
    </div>
  );
};