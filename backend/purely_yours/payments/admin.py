from django.contrib import admin
from .models import PaymentSession, PaymentWebhook

@admin.register(PaymentSession)
class PaymentSessionAdmin(admin.ModelAdmin):
    list_display = ['order', 'cashfree_order_id', 'payment_status', 'payment_method', 'created_at']
    list_filter = ['payment_status', 'payment_method', 'created_at']
    search_fields = ['cashfree_order_id', 'order__order_number', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(PaymentWebhook)
class PaymentWebhookAdmin(admin.ModelAdmin):
    list_display = ['cashfree_order_id', 'event_type', 'processed', 'created_at']
    list_filter = ['event_type', 'processed', 'created_at']
    search_fields = ['cashfree_order_id']
    readonly_fields = ['created_at']
