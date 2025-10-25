import numpy as np
from django.db.models import Q
from collections import Counter
from products.models import Product, ProductReview
from users.models import User

class RecommendationEngine:
    def __init__(self):
        self.min_similarity_threshold = 0.1
    
    def get_user_preferences(self, user):
        """Extract user preferences from profile and behavior"""
        preferences = user.preferences or {}
        
        # Analyze purchase history
        purchased_products = Product.objects.filter(order_items__order__user=user)
        purchased_categories = purchased_products.values_list('category__name', flat=True)
        
        # Analyze review patterns
        user_reviews = ProductReview.objects.filter(user=user)
        sustainability_ratings = [r.sustainability_rating for r in user_reviews if r.sustainability_rating]
        
        preferences.update({
            'preferred_categories': list(set(purchased_categories)),
            'avg_sustainability_rating': np.mean(sustainability_ratings) if sustainability_ratings else 5.0,
            'preferred_brands': list(set(purchased_products.values_list('brand', flat=True))),
        })
        
        return preferences
    
    def calculate_eco_score(self, product):
        """Calculate comprehensive eco-score for a product"""
        score = 5.0  # Base score
        
        # Sustainability certifications boost
        if product.sustainability_certifications:
            score += len(product.sustainability_certifications) * 0.5
        
        # Organic and vegan bonuses
        if product.is_organic:
            score += 1.0
        if product.is_vegan:
            score += 0.5
        if product.is_cruelty_free:
            score += 0.5
        if product.is_recyclable:
            score += 0.5
        
        # Carbon footprint penalty
        if product.carbon_footprint:
            if product.carbon_footprint < 1.0:
                score += 1.0
            elif product.carbon_footprint > 5.0:
                score -= 1.0
        
        # Ensure score is between 0 and 10
        return max(0, min(10, score))
    
    def get_personalized_recommendations(self, user, limit=10):
        """Get personalized product recommendations for a user"""
        preferences = self.get_user_preferences(user)
        
        # Base queryset - active, approved products user hasn't purchased
        purchased_ids = Product.objects.filter(
            order_items__order__user=user
        ).values_list('id', flat=True)
        
        queryset = Product.objects.filter(
            is_active=True, 
            is_approved=True
        ).exclude(id__in=purchased_ids)
        
        # Filter by user preferences
        if preferences.get('preferred_categories'):
            queryset = queryset.filter(
                category__name__in=preferences['preferred_categories']
            )
        
        # Calculate scores and order by relevance
        products_with_scores = []
        for product in queryset:
            relevance_score = 0
            
            # Category match
            if product.category.name in preferences.get('preferred_categories', []):
                relevance_score += 3
            
            # Brand preference
            if product.brand in preferences.get('preferred_brands', []):
                relevance_score += 2
            
            # Sustainability alignment
            user_sustainability_pref = preferences.get('avg_sustainability_rating', 5) / 5.0
            product_sustainability = (product.eco_score or 5) / 10.0
            sustainability_match = 1 - abs(user_sustainability_pref - product_sustainability)
            relevance_score += sustainability_match * 2
            
            products_with_scores.append((product, relevance_score))
        
        # Sort by relevance score and return top results
        products_with_scores.sort(key=lambda x: x[1], reverse=True)
        return [product for product, score in products_with_scores[:limit]]
    
    def get_similar_products(self, product, limit=8):
        """Get products similar to the given product"""
        same_category = Product.objects.filter(
            category=product.category,
            is_active=True,
            is_approved=True
        ).exclude(id=product.id)
        
        # Calculate similarity based on attributes
        similar_products = []
        for p in same_category:
            similarity = 0
            
            # Brand similarity
            if p.brand == product.brand:
                similarity += 2
            
            # Price range similarity (within 20%)
            price_ratio = min(p.price, product.price) / max(p.price, product.price)
            if price_ratio > 0.8:
                similarity += 1
            
            # Sustainability similarity
            eco_diff = abs((p.eco_score or 5) - (product.eco_score or 5))
            if eco_diff <= 2:
                similarity += 1
            
            if similarity >= self.min_similarity_threshold:
                similar_products.append((p, similarity))
        
        similar_products.sort(key=lambda x: x[1], reverse=True)
        return [p for p, similarity in similar_products[:limit]]

# Global instance
recommendation_engine = RecommendationEngine()