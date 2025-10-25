import requests
import json
import base64
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from .models import Payment, MpesaTransaction

class MpesaGateway:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.business_shortcode = settings.MPESA_BUSINESS_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = f"{settings.BASE_URL}/api/payments/mpesa/callback/"

    def get_access_token(self):
        """Get M-Pesa API access token"""
        try:
            auth = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
                headers=headers
            )
            
            if response.status_code == 200:
                return response.json()['access_token']
            else:
                raise Exception(f"M-Pesa token error: {response.text}")
                
        except Exception as e:
            raise Exception(f"Failed to get M-Pesa access token: {str(e)}")

    def stk_push(self, phone_number, amount, order_number, account_reference):
        """Initiate STK push payment"""
        try:
            access_token = self.get_access_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = base64.b64encode(
                f"{self.business_shortcode}{self.passkey}{timestamp}".encode()
            ).decode()
            
            payload = {
                "BusinessShortCode": self.business_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone_number,
                "PartyB": self.business_shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": f"Payment for order {order_number}"
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ResponseCode') == '0':
                    return {
                        'success': True,
                        'checkout_request_id': result['CheckoutRequestID'],
                        'customer_message': result['CustomerMessage']
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('ResponseDescription', 'STK push failed')
                    }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

class PayPalGateway:
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.mode = settings.PAYPAL_MODE  # 'sandbox' or 'live'

    def get_access_token(self):
        """Get PayPal API access token"""
        try:
            auth = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            data = 'grant_type=client_credentials'
            
            base_url = 'https://api-m.sandbox.paypal.com' if self.mode == 'sandbox' else 'https://api-m.paypal.com'
            response = requests.post(f'{base_url}/v1/oauth2/token', headers=headers, data=data)
            
            if response.status_code == 200:
                return response.json()['access_token']
            else:
                raise Exception(f"PayPal token error: {response.text}")
                
        except Exception as e:
            raise Exception(f"Failed to get PayPal access token: {str(e)}")

    def create_order(self, amount, currency='USD', order_id=None):
        """Create a PayPal order"""
        try:
            access_token = self.get_access_token()
            base_url = 'https://api-m.sandbox.paypal.com' if self.mode == 'sandbox' else 'https://api-m.paypal.com'
            
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "reference_id": f"order_{order_id}",
                        "amount": {
                            "currency_code": currency,
                            "value": str(amount)
                        }
                    }
                ],
                "application_context": {
                    "return_url": f"{settings.FRONTEND_URL}/checkout/success",
                    "cancel_url": f"{settings.FRONTEND_URL}/checkout/cancel",
                    "brand_name": "EcoMart",
                    "user_action": "PAY_NOW"
                }
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f'{base_url}/v2/checkout/orders',
                json=payload,
                headers=headers
            )
            
            if response.status_code == 201:
                result = response.json()
                return {
                    'success': True,
                    'order_id': result['id'],
                    'approval_url': next(link['href'] for link in result['links'] if link['rel'] == 'approve')
                }
            else:
                return {
                    'success': False,
                    'error': response.text
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def capture_order(self, order_id):
        """Capture a PayPal payment"""
        try:
            access_token = self.get_access_token()
            base_url = 'https://api-m.sandbox.paypal.com' if self.mode == 'sandbox' else 'https://api-m.paypal.com'
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f'{base_url}/v2/checkout/orders/{order_id}/capture',
                headers=headers
            )
            
            if response.status_code == 201:
                result = response.json()
                return {
                    'success': True,
                    'capture_id': result['purchase_units'][0]['payments']['captures'][0]['id'],
                    'status': result['status']
                }
            else:
                return {
                    'success': False,
                    'error': response.text
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

class StripeGateway:
    def __init__(self):
        self.secret_key = settings.STRIPE_SECRET_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    def create_payment_intent(self, amount, currency='usd', metadata=None):
        """Create a Stripe Payment Intent"""
        try:
            import stripe
            stripe.api_key = self.secret_key
            
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def confirm_payment(self, payment_intent_id):
        """Confirm a Stripe payment"""
        try:
            import stripe
            stripe.api_key = self.secret_key
            
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'success': True,
                'status': intent.status,
                'amount': intent.amount / 100,
                'currency': intent.currency
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }