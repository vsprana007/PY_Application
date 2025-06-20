from rest_framework import serializers
from .models import PaymentSession

class PaymentSessionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    order_amount = serializers.DecimalField(source='order.total_amount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentSession
        fields = [
            'id', 'order', 'order_number', 'order_amount', 'cashfree_order_id',
            'payment_session_id', 'payment_status', 'payment_method',
            'transaction_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['cashfree_order_id', 'payment_session_id', 'transaction_id']

class CreatePaymentSessionSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    return_url = serializers.URLField(required=False)
    notify_url = serializers.URLField(required=False)
