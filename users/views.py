from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.conf import settings
from datetime import datetime, timedelta
import jwt

from .models import User, SellerProfile, UserProfile
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    SellerProfileSerializer,
)


# =========================================
# AUTHENTICATION VIEWSET
# =========================================
class AuthViewSet(viewsets.ViewSet):
    """
    Handles user registration, login, logout, and token refresh
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Register a new user (customer or seller)
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            # Automatically create a UserProfile
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': user.user_type,
                    'phone_number': request.data.get('phone_number', ''),
                    'business_name': request.data.get('business_name', '')
                }
            )

            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        User login (email or username)
        """
        data = request.data
        user = authenticate(username=data.get('email') or data.get('username'), password=data.get('password'))
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """
        Blacklist refresh token to log out
        """
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def refresh_token(self, request):
        """
        Refresh access token using refresh token
        """
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            return Response({'access': str(token.access_token)}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_400_BAD_REQUEST)


# =========================================
# USER VIEWSET
# =========================================
class UserViewSet(viewsets.ModelViewSet):
    """
    Manage user profiles (view, update, change password, sustainability data)
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """
        Retrieve or update current user's profile
        """
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        serializer = self.get_serializer(user, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Change password
        """
        user = request.user
        current = request.data.get('current_password')
        new = request.data.get('new_password')
        if not current or not new:
            return Response({'error': 'Current and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(current):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new)
        user.save()
        return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def sustainability_impact(self, request):
        """
        Placeholder sustainability impact metrics
        """
        return Response({
            'carbon_saved_kg': 45.2,
            'plastic_saved_kg': 2.3,
            'trees_supported': 3,
            'eco_products_purchased': 15,
            'sustainability_score': 8.5,
            'water_saved_liters': 1200
        })


# =========================================
# SELLER VIEWSET
# =========================================
class SellerViewSet(viewsets.ModelViewSet):
    """
    Manage seller profiles and verification
    """
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SellerProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        try:
            seller_profile = SellerProfile.objects.get(user=request.user)
        except SellerProfile.DoesNotExist:
            return Response({'error': 'Seller profile not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(self.get_serializer(seller_profile).data)
        serializer = self.get_serializer(seller_profile, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def apply_verification(self, request):
        """
        Apply for seller verification
        """
        try:
            seller_profile = SellerProfile.objects.get(user=request.user)
            seller_profile.verification_status = 'pending'
            seller_profile.save()
            return Response({'message': 'Verification request submitted'}, status=status.HTTP_200_OK)
        except SellerProfile.DoesNotExist:
            return Response({'error': 'Seller profile not found'}, status=status.HTTP_404_NOT_FOUND)


# =========================================
# PUBLIC USER VIEWSET
# =========================================
class PublicUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public user information (limited fields)
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(is_active=True).only('id', 'username', 'date_joined')

    @action(detail=True, methods=['get'])
    def public_profile(self, request, pk=None):
        user = get_object_or_404(User, id=pk, is_active=True)
        return Response({
            'id': user.id,
            'username': user.username,
            'member_since': user.date_joined,
            'is_seller': user.user_type == 'seller'
        })


# =========================================
# FUNCTION-BASED API VIEWS (SIMPLE JWT)
# =========================================
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Registration endpoint using Simple JWT
    """
    try:
        data = request.data
        
        # Check if user exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user with all fields
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            user_type=data.get('user_type', 'customer'),
            phone_number=data.get('phone_number', ''),
            business_name=data.get('business_name', '')
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Generate Simple JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'phone_number': user.phone_number,
                'business_name': user.business_name
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),  # Simple JWT access token
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """
    Login endpoint using Simple JWT
    """
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate Simple JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'phone_number': user.phone_number,
                'business_name': user.business_name
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),  # Simple JWT access token
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_profile(request):
    """
    Retrieve current user's profile
    """
    user = request.user
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type,
            'phone_number': user.phone_number,
            'business_name': user.business_name
        }
    })

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """
    Update user and profile data
    """
    try:
        user = request.user
        data = request.data
        
        # Update fields
        for field in ['first_name', 'last_name', 'email', 'phone_number', 'business_name']:
            if field in data:
                setattr(user, field, data[field])
        
        user.save()
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'phone_number': user.phone_number,
                'business_name': user.business_name
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)