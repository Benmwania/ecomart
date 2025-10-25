from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet,
    UserViewSet,
    SellerViewSet,
    PublicUserViewSet,
    register_user,
    login_user,
    get_profile,
    update_profile,
)

# DRF router for ViewSets
router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'sellers', SellerViewSet, basename='seller')
router.register(r'public', PublicUserViewSet, basename='public-user')

# Combined URL patterns
urlpatterns = [
    # Function-based endpoints (these are the ones your frontend is calling)
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', get_profile, name='get_profile'),
    path('profile/update/', update_profile, name='update_profile'),

    # Include router-based API endpoints
    path('', include(router.urls)),
]