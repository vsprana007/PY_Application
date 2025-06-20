from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order

User = get_user_model()

class PaymentSession(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('created', 'Created'),
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment_session')
    cashfree_order_id = models.CharField(max_length=100, unique=True)
    payment_session_id = models.CharField(max_length=200)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='created')
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_sessions'

    def __str__(self):
        return f"Payment for Order {self.order.order_number}"

class PaymentWebhook(models.Model):
    cashfree_order_id = models.CharField(max_length=100)
    event_type = models.CharField(max_length=50)
    webhook_data = models.JSONField()
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_webhooks'

    def __str__(self):
        return f"Webhook {self.event_type} for {self.cashfree_order_id}"
