from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ai_preferences')
    sustainability_focus = models.CharField(max_length=20, default='balanced')  # balanced, high, max
    preferred_categories = models.JSONField(default=list)
    avoided_materials = models.JSONField(default=list)
    
    updated_at = models.DateTimeField(auto_now=True)

class ProductEmbedding(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='embedding')
    embedding_vector = models.JSONField()  # Store AI-generated embeddings
    updated_at = models.DateTimeField(auto_now=True)