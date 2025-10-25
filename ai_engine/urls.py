from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIRecommendationView

router = DefaultRouter()
router.register(r'recommendations', AIRecommendationView, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints for frontend compatibility
    path('recommendations/', AIRecommendationView.as_view({'get': 'user_recommendations'}), name='ai-recommendations'),
    path('trending-products/', AIRecommendationView.as_view({'get': 'trending_products'}), name='trending-products'),
    path('products/<int:pk>/similar/', AIRecommendationView.as_view({'get': 'similar_products'}), name='similar-products'),
    path('sustainability-insights/', AIRecommendationView.as_view({'get': 'sustainability_insights'}), name='sustainability-insights'),
    path('eco-score/calculate/', AIRecommendationView.as_view({'post': 'calculate_eco_score'}), name='calculate-eco-score'),
]