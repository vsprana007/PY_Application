from rest_framework import serializers
from .models import PaymentSession

class PaymentSessionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    order_amount = serializers.DecimalField(source='order.total_amount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentSession
        fields = ['id', 'order', 'order_number', 'order_amount', 'cashfree_order_id', 
                 'payment_session_id', 'payment_status', 'transaction_id', 'created_at', 'updated_at']

class CreatePaymentSessionSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    return_url = serializers.URLField(required=False)
    notify_url = serializers.URLField(required=False)

class ProcessCardPaymentSerializer(serializers.Serializer):
    payment_session_id = serializers.CharField()
    card_data = serializers.DictField()

class VerifyOTPSerializer(serializers.Serializer):
    otp_url = serializers.URLField()
    otp = serializers.CharField(max_length=6)
    payment_session_id = serializers.CharField()
