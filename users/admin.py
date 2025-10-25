from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SellerProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'avatar', 'is_verified', 'preferences')
        }),
    )

@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'verification_status', 'total_products', 'total_sales')
    list_filter = ('verification_status', 'created_at')
    search_fields = ('business_name', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')