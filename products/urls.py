from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ProductReviewViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')  # Added basename
router.register(r'reviews', ProductReviewViewSet, basename='review')  # Added basename

urlpatterns = [
    path('', include(router.urls)),
    
    # Add direct URL for featured products
    path('featured/', ProductViewSet.as_view({'get': 'featured'}), name='featured-products'),
]