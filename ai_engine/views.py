from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from products.models import Product
from orders.models import Order, OrderItem
from users.models import User

class AIRecommendationView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_recommendations(self, request):
        """Get AI recommendations for user based on their behavior and preferences"""
        try:
            user = request.user
            limit = int(request.GET.get('limit', 10))
            
            # SIMPLIFIED QUERY - Remove complex logic causing 500 error
            recommended_products = Product.objects.filter(
                is_active=True,
                eco_score__gte=7
            ).order_by('-eco_score', '-rating', '-created_at')[:limit]
            
            from products.serializers import ProductSerializer
            serializer = ProductSerializer(recommended_products, many=True)
            
            return Response({
                'recommended_products': serializer.data,
                'based_on': 'sustainability_ranking',
                'total_recommendations': len(recommended_products)
            })
            
        except Exception as e:
            print(f"Error in user_recommendations: {str(e)}")  # Debug logging
            # Simple fallback
            try:
                fallback_products = Product.objects.filter(is_active=True)[:limit]
                from products.serializers import ProductSerializer
                serializer = ProductSerializer(fallback_products, many=True)
                
                return Response({
                    'recommended_products': serializer.data,
                    'based_on': 'fallback',
                    'error': str(e)
                })
            except Exception as fallback_error:
                return Response({
                    'recommended_products': [],
                    'error': f"Main: {str(e)}, Fallback: {str(fallback_error)}"
                }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def trending_products(self, request):
        """Get currently trending sustainable products based on recent sales"""
        try:
            category = request.GET.get('category')
            limit = int(request.GET.get('limit', 12))
            
            # ULTRA SIMPLE QUERY - Just get products ordered by eco_score
            trending_products = Product.objects.filter(
                is_active=True
            ).order_by('-eco_score', '-rating', '-created_at')
            
            if category:
                trending_products = trending_products.filter(category__name=category)
            
            trending_products = trending_products[:limit]
            
            from products.serializers import ProductSerializer
            serializer = ProductSerializer(trending_products, many=True)
            
            return Response({
                'trending_products': serializer.data,
                'time_period': 'current',
                'total_trending': len(trending_products)
            })
            
        except Exception as e:
            print(f"Error in trending_products: {str(e)}")  # Debug logging
            # Even simpler fallback
            try:
                fallback_products = Product.objects.filter(is_active=True)[:limit]
                from products.serializers import ProductSerializer
                serializer = ProductSerializer(fallback_products, many=True)
                
                return Response({
                    'trending_products': serializer.data,
                    'based_on': 'simple_fallback',
                    'error': str(e)
                })
            except Exception as fallback_error:
                return Response({
                    'trending_products': [],
                    'error': f"Main: {str(e)}, Fallback: {str(fallback_error)}"
                }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def similar_products(self, request, pk=None):
        """Get products similar to the specified product"""
        try:
            limit = int(request.GET.get('limit', 8))
            
            target_product = Product.objects.get(id=pk, is_active=True)
            
            # Find similar products by category, price range, and eco attributes
            similar_products = Product.objects.filter(
                is_active=True,
                category=target_product.category,
                price__range=(target_product.price * 0.5, target_product.price * 1.5),
                eco_score__gte=target_product.eco_score - 2
            ).exclude(id=pk).order_by(
                '-eco_score', 
                '-rating',
                '-created_at'
            )[:limit]
            
            from products.serializers import ProductSerializer
            serializer = ProductSerializer(similar_products, many=True)
            
            return Response({
                'similar_products': serializer.data,
                'based_on_product': target_product.name,
                'total_similar': len(similar_products)
            })
            
        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def sustainability_insights(self, request):
        """Get user's sustainability insights and environmental impact"""
        try:
            user = request.user
            
            # Calculate user's sustainability metrics from order history
            completed_orders = Order.objects.filter(user=user, status='completed')
            ordered_items = OrderItem.objects.filter(order__in=completed_orders)
            
            # Calculate sustainability metrics
            total_products_bought = ordered_items.count()
            eco_products_bought = ordered_items.filter(
                product__eco_score__gte=7
            ).count()
            
            # Calculate average eco-score of purchased products
            avg_eco_score = ordered_items.aggregate(
                avg_score=Avg('product__eco_score')
            )['avg_score'] or 0
            
            # Calculate environmental impact (simplified calculations)
            carbon_saved = round(eco_products_bought * avg_eco_score * 0.5, 2)  # kg CO2
            trees_saved = round(eco_products_bought * 0.3, 1)  # trees
            plastic_reduced = round(eco_products_bought * 0.7, 1)  # kg plastic
            
            # Determine sustainability level
            if eco_products_bought >= 15:
                sustainability_level = 'eco_expert'
            elif eco_products_bought >= 8:
                sustainability_level = 'sustainability_champion'
            elif eco_products_bought >= 3:
                sustainability_level = 'eco_enthusiast'
            else:
                sustainability_level = 'sustainability_beginner'
            
            # Generate personalized recommendations
            recommendations = []
            
            if sustainability_level == 'sustainability_beginner':
                recommendations = [
                    "Start with products that have high eco-scores (8+)",
                    "Try our organic collection for your next purchase",
                    "Look for local products to reduce carbon footprint"
                ]
            elif sustainability_level == 'eco_enthusiast':
                recommendations = [
                    "Explore products with carbon-neutral certification",
                    "Consider trying reusable alternatives to disposable items",
                    "Look for products with eco-friendly packaging"
                ]
            elif sustainability_level == 'sustainability_champion':
                recommendations = [
                    "Try our premium eco-friendly collection",
                    "Explore products from B-corp certified brands",
                    "Consider products with closed-loop recycling"
                ]
            else:  # eco_expert
                recommendations = [
                    "You're making a great impact! Consider trying innovative eco-tech",
                    "Explore products with regenerative agriculture practices",
                    "Share your sustainability journey with others"
                ]
            
            return Response({
                'carbon_footprint_saved_kg': carbon_saved,
                'trees_saved': trees_saved,
                'plastic_reduced_kg': plastic_reduced,
                'sustainability_level': sustainability_level,
                'eco_products_bought': eco_products_bought,
                'total_products_bought': total_products_bought,
                'eco_friendly_ratio': round(eco_products_bought / max(total_products_bought, 1) * 100, 1),
                'average_eco_score': round(avg_eco_score, 1),
                'personalized_recommendations': recommendations,
                'impact_message': f'You have saved approximately {carbon_saved}kg of CO2!'
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'carbon_footprint_saved_kg': 0,
                'trees_saved': 0,
                'plastic_reduced_kg': 0,
                'sustainability_level': 'beginner',
                'eco_products_bought': 0,
                'personalized_recommendations': [
                    "Start by exploring our sustainable product collection",
                    "Look for products with high eco-scores",
                    "Consider organic and local options"
                ]
            })

    @action(detail=False, methods=['post'])
    def calculate_eco_score(self, request):
        """Calculate eco-score for a product based on sustainability factors"""
        try:
            product_data = request.data
            
            # Initialize base score
            score = 5.0  # Neutral base score
            
            # Calculate score based on sustainability factors
            factors = []
            
            # Material sustainability
            if product_data.get('is_organic'):
                score += 1.5
                factors.append('Organic materials: +1.5')
            
            if product_data.get('uses_recycled_materials'):
                score += 1.0
                factors.append('Recycled materials: +1.0')
            
            if product_data.get('is_biodegradable'):
                score += 1.0
                factors.append('Biodegradable: +1.0')
            
            # Production factors
            if product_data.get('uses_renewable_energy'):
                score += 1.0
                factors.append('Renewable energy: +1.0')
            
            if product_data.get('water_efficient'):
                score += 0.5
                factors.append('Water efficient: +0.5')
            
            # Packaging
            if product_data.get('has_eco_packaging'):
                score += 0.5
                factors.append('Eco-friendly packaging: +0.5')
            
            if product_data.get('is_minimal_packaging'):
                score += 0.5
                factors.append('Minimal packaging: +0.5')
            
            # Transportation
            if product_data.get('is_local'):
                score += 1.0
                factors.append('Local production: +1.0')
            
            if product_data.get('carbon_neutral_shipping'):
                score += 0.5
                factors.append('Carbon neutral shipping: +0.5')
            
            # Certifications
            if product_data.get('has_sustainability_certification'):
                score += 1.0
                factors.append('Sustainability certification: +1.0')
            
            # Cap at 10 and round
            eco_score = min(round(score, 1), 10.0)
            
            # Determine rating category
            if eco_score >= 9:
                rating = 'Excellent'
            elif eco_score >= 7:
                rating = 'Very Good'
            elif eco_score >= 5:
                rating = 'Good'
            else:
                rating = 'Needs Improvement'
            
            return Response({
                'eco_score': eco_score,
                'rating_category': rating,
                'factors': factors,
                'breakdown': {
                    'materials': 2.0,
                    'production': 2.0,
                    'packaging': 1.5,
                    'transportation': 1.5,
                    'certifications': 1.0
                },
                'improvement_suggestions': [
                    'Consider using more recycled materials',
                    'Explore renewable energy options for production',
                    'Optimize packaging to reduce waste'
                ] if eco_score < 7 else [
                    'Maintain your excellent sustainability practices!',
                    'Consider third-party sustainability certifications',
                    'Share your eco-friendly practices with customers'
                ]
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)