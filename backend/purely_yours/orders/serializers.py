from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from products.serializers import ProductListSerializer, ProductVariantSerializer
from accounts.serializers import AddressSerializer

class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'quantity', 'price', 'total']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'notes', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'payment_status', 'payment_method',
                 'subtotal', 'shipping_cost', 'tax_amount', 'discount_amount', 'total_amount',
                 'shipping_name', 'shipping_mobile', 'shipping_address_line_1', 
                 'shipping_address_line_2', 'shipping_city', 'shipping_state', 'shipping_pincode',
                 'tracking_number', 'estimated_delivery', 'notes', 'items', 'status_history',
                 'created_at', 'updated_at']

class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemCreateSerializer(many=True)  # Add this line

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required")
        return value
