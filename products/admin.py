from django.contrib import admin
from .models import Category, Product, ProductImage, ProductReview

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'name': ('name',)}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'seller', 'category', 'price', 'eco_score', 'is_active', 'is_approved', 'created_at')
    list_filter = ('category', 'is_active', 'is_approved', 'is_organic', 'is_vegan', 'created_at')
    search_fields = ('name', 'description', 'brand', 'seller__username')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('seller', 'category', 'name', 'description', 'brand')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'compare_price', 'sku', 'quantity', 'track_quantity')
        }),
        ('Sustainability', {
            'fields': ('eco_score', 'sustainability_certifications', 'carbon_footprint',
                      'is_organic', 'is_vegan', 'is_cruelty_free', 'packaging_type', 'is_recyclable')
        }),
        ('Product Details', {
            'fields': ('condition', 'weight', 'dimensions')
        }),
        ('Status', {
            'fields': ('is_active', 'is_approved', 'ai_tags')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'sustainability_rating', 'is_verified_purchase', 'created_at')
    list_filter = ('rating', 'sustainability_rating', 'is_verified_purchase', 'created_at')
    search_fields = ('product__name', 'user__username', 'title')
    readonly_fields = ('created_at', 'updated_at')