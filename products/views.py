from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Category, Product, ProductReview
from .serializers import (
    CategorySerializer, ProductListSerializer, 
    ProductDetailSerializer, ProductReviewSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'eco_score', 'created_at', 'average_rating']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True, is_approved=True)
        
        # Prefetch related data for performance
        queryset = queryset.select_related('seller', 'category').prefetch_related('images', 'reviews')
        
        # Filter by sustainability preferences
        eco_friendly = self.request.query_params.get('eco_friendly')
        if eco_friendly:
            queryset = queryset.filter(eco_score__gte=7.0)
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        product = self.get_object()
        serializer = ProductReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if user already reviewed this product
            existing_review = ProductReview.objects.filter(product=product, user=request.user).first()
            if existing_review:
                return Response(
                    {'error': 'You have already reviewed this product.'},
                    status=400
                )
            
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=201)
        
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products (high eco_score and rating)"""
        try:
            # Get high eco_score products with good ratings
            featured_products = self.get_queryset().filter(
                eco_score__gte=8.0
            ).annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-eco_score', '-avg_rating')[:12]
            
            # If no high-rated products, fallback to just high eco_score
            if not featured_products:
                featured_products = self.get_queryset().filter(
                    eco_score__gte=8.0
                ).order_by('-eco_score')[:12]
            
            serializer = self.get_serializer(featured_products, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Final fallback - just return any active products
            fallback_products = self.get_queryset().order_by('-eco_score')[:12]
            serializer = self.get_serializer(fallback_products, many=True)
            return Response(serializer.data)


class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProductReview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)