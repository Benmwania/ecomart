from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, MpesaCallbackView, StripeWebhookView

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'mpesa-callback', MpesaCallbackView, basename='mpesa-callback')
router.register(r'stripe-webhook', StripeWebhookView, basename='stripe-webhook')

urlpatterns = [
    path('', include(router.urls)),
]
