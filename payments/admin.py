from django.contrib import admin
from .models import Payment, MpesaTransaction

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'payment_method', 'amount', 'status', 'created_at')
    list_filter = ('payment_method', 'status', 'created_at')
    search_fields = ('order__order_number', 'transaction_id')
    readonly_fields = ('created_at', 'processed_at')

@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'payment', 'result_code', 'created_at')
    list_filter = ('result_code', 'created_at')
    search_fields = ('phone_number', 'payment__order__order_number')
    readonly_fields = ('created_at',)