import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    min_eco_score = django_filters.NumberFilter(field_name="eco_score", lookup_expr='gte')
    category = django_filters.CharFilter(field_name="category__name", lookup_expr='iexact')
    is_organic = django_filters.BooleanFilter(field_name="is_organic")
    is_vegan = django_filters.BooleanFilter(field_name="is_vegan")
    is_cruelty_free = django_filters.BooleanFilter(field_name="is_cruelty_free")
    
    class Meta:
        model = Product
        fields = ['category', 'min_price', 'max_price', 'min_eco_score', 
                 'is_organic', 'is_vegan', 'is_cruelty_free']