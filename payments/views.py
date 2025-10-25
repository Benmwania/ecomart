from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json
import stripe
from .models import Payment, MpesaTransaction
from .serializers import PaymentSerializer
from .services import MpesaGateway, PayPalGateway, StripeGateway

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

    @action(detail=False, methods=['post'])
    def initiate_mpesa(self, request):
        """Initiate M-Pesa STK push payment"""
        order_id = request.data.get('order_id')
        phone_number = request.data.get('phone_number')
        
        if not order_id or not phone_number:
            return Response(
                {'error': 'Order ID and phone number are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get order and calculate amount
            from orders.models import Order
            order = Order.objects.get(id=order_id, user=request.user)
            amount = order.total
            
            # Format phone number (ensure it starts with 254)
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]
            elif phone_number.startswith('+'):
                phone_number = phone_number[1:]
            elif not phone_number.startswith('254'):
                phone_number = '254' + phone_number
            
            # Initialize M-Pesa gateway
            mpesa_gateway = MpesaGateway()
            result = mpesa_gateway.stk_push(
                phone_number=phone_number,
                amount=int(amount),
                order_number=order.order_number,
                account_reference="EcoMart"
            )
            
            if result['success']:
                # Create payment record
                payment = Payment.objects.create(
                    order=order,
                    payment_method='mpesa',
                    amount=amount,
                    status='pending'
                )
                
                # Create M-Pesa transaction record
                MpesaTransaction.objects.create(
                    payment=payment,
                    phone_number=phone_number,
                    merchant_request_id=result.get('checkout_request_id'),
                    checkout_request_id=result.get('checkout_request_id')
                )
                
                return Response({
                    'success': True,
                    'checkout_request_id': result['checkout_request_id'],
                    'message': result['customer_message']
                })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def initiate_paypal(self, request):
        """Initiate PayPal payment"""
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'Order ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from orders.models import Order
            order = Order.objects.get(id=order_id, user=request.user)
            amount = order.total
            
            paypal_gateway = PayPalGateway()
            result = paypal_gateway.create_order(
                amount=amount,
                order_id=order.id
            )
            
            if result['success']:
                # Create payment record
                payment = Payment.objects.create(
                    order=order,
                    payment_method='paypal',
                    amount=amount,
                    status='pending',
                    transaction_id=result['order_id']
                )
                
                return Response({
                    'success': True,
                    'order_id': result['order_id'],
                    'approval_url': result['approval_url']
                })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_stripe_intent(self, request):
        """Create Stripe Payment Intent"""
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'Order ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from orders.models import Order
            order = Order.objects.get(id=order_id, user=request.user)
            amount = order.total
            
            stripe_gateway = StripeGateway()
            result = stripe_gateway.create_payment_intent(
                amount=amount,
                metadata={
                    'order_id': order.id,
                    'user_id': request.user.id,
                    'order_number': order.order_number
                }
            )
            
            if result['success']:
                # Create payment record
                payment = Payment.objects.create(
                    order=order,
                    payment_method='card',
                    amount=amount,
                    status='pending',
                    transaction_id=result['payment_intent_id']
                )
                
                return Response({
                    'success': True,
                    'client_secret': result['client_secret'],
                    'payment_intent_id': result['payment_intent_id']
                })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def confirm_stripe_payment(self, request):
        """Confirm Stripe payment"""
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response(
                {'error': 'Payment intent ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            stripe_gateway = StripeGateway()
            result = stripe_gateway.confirm_payment(payment_intent_id)
            
            if result['success']:
                # Update payment status
                payment = Payment.objects.get(transaction_id=payment_intent_id)
                if result['status'] == 'succeeded':
                    payment.status = 'completed'
                    payment.processed_at = timezone.now()
                    payment.save()
                    
                    # Update order status
                    payment.order.status = 'confirmed'
                    payment.order.save()
                    
                    return Response({
                        'success': True,
                        'status': 'completed'
                    })
                else:
                    return Response({
                        'success': False,
                        'error': f"Payment status: {result['status']}"
                    })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(viewsets.ViewSet):
    """Handle M-Pesa STK push callbacks"""
    
    @action(detail=False, methods=['post'])
    def callback(self, request):
        try:
            callback_data = json.loads(request.body)
            
            # Extract callback metadata
            callback_metadata = callback_data['Body']['stkCallback'].get('CallbackMetadata', {})
            result_code = callback_data['Body']['stkCallback']['ResultCode']
            checkout_request_id = callback_data['Body']['stkCallback']['CheckoutRequestID']
            
            # Find the M-Pesa transaction
            mpesa_transaction = MpesaTransaction.objects.get(
                checkout_request_id=checkout_request_id
            )
            payment = mpesa_transaction.payment
            
            if result_code == 0:
                # Payment successful
                payment.status = 'completed'
                payment.transaction_id = callback_metadata.get('MpesaReceiptNumber', '')
                payment.processed_at = timezone.now()
                payment.payment_gateway_response = callback_data
                payment.save()
                
                # Update order status
                payment.order.status = 'confirmed'
                payment.order.save()
                
                # Update M-Pesa transaction
                mpesa_transaction.result_code = result_code
                mpesa_transaction.result_description = 'Success'
                mpesa_transaction.save()
                
            else:
                # Payment failed
                payment.status = 'failed'
                payment.payment_gateway_response = callback_data
                payment.save()
                
                mpesa_transaction.result_code = result_code
                mpesa_transaction.result_description = callback_data['Body']['stkCallback']['ResultDesc']
                mpesa_transaction.save()
            
            return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Success'})
            
        except Exception as e:
            return JsonResponse({'ResultCode': 1, 'ResultDesc': str(e)})

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(viewsets.ViewSet):
    """Handle Stripe webhooks"""
    
    @action(detail=False, methods=['post'])
    def webhook(self, request):
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        
        try:
            stripe_gateway = StripeGateway()
            
            event = stripe.Webhook.construct_event(
                payload, sig_header, stripe_gateway.webhook_secret
            )
            
            # Handle the event
            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                self.handle_payment_succeeded(payment_intent)
            elif event['type'] == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                self.handle_payment_failed(payment_intent)
            
            return JsonResponse({'success': True})
            
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except stripe.error.SignatureVerificationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    def handle_payment_succeeded(self, payment_intent):
        """Handle successful Stripe payment"""
        try:
            payment = Payment.objects.get(transaction_id=payment_intent['id'])
            payment.status = 'completed'
            payment.processed_at = timezone.now()
            payment.save()
            
            # Update order status
            payment.order.status = 'confirmed'
            payment.order.save()
            
        except Payment.DoesNotExist:
            pass
    
    def handle_payment_failed(self, payment_intent):
        """Handle failed Stripe payment"""
        try:
            payment = Payment.objects.get(transaction_id=payment_intent['id'])
            payment.status = 'failed'
            payment.save()
            
        except Payment.DoesNotExist:
            pass