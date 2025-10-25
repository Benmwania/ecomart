import api from './api';

export const paymentService = {
  // M-Pesa Payment
  initiateMpesaPayment: async (orderId: number, phoneNumber: string) => {
    const response = await api.post('/payments/initiate_mpesa/', {
      order_id: orderId,
      phone_number: phoneNumber,
    });
    return response.data;
  },

  // PayPal Payment
  initiatePaypalPayment: async (orderId: number) => {
    const response = await api.post('/payments/initiate_paypal/', {
      order_id: orderId,
    });
    return response.data;
  },

  // Stripe Payment
  createStripePaymentIntent: async (orderId: number) => {
    const response = await api.post('/payments/create_stripe_intent/', {
      order_id: orderId,
    });
    return response.data;
  },

  confirmStripePayment: async (paymentIntentId: string) => {
    const response = await api.post('/payments/confirm_stripe_payment/', {
      payment_intent_id: paymentIntentId,
    });
    return response.data;
  },

  // Check payment status
  getPaymentStatus: async (orderId: number) => {
    const response = await api.get(`/payments/order/${orderId}/status/`);
    return response.data;
  },

  // Poll M-Pesa payment status
  pollMpesaPayment: async (checkoutRequestId: string, maxAttempts: number = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await api.get(`/payments/mpesa/status/${checkoutRequestId}/`);
        const data = response.data;
        
        if (data.status === 'completed' || data.status === 'failed') {
          return data;
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Polling error:', error);
      }
    }
    
    throw new Error('Payment polling timeout');
  },
};