from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, CreateOrderSerializer
from cart.models import Cart
from accounts.models import Address
from decimal import Decimal

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    serializer = CreateOrderSerializer(data=request.data)
    if serializer.is_valid():
        address_id = serializer.validated_data['address_id']
        payment_method = serializer.validated_data['payment_method']
        notes = serializer.validated_data.get('notes', '')

        try:
            # Get user's cart
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                return Response({
                    'success': False,
                    'message': 'Cart is empty'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get shipping address
            address = get_object_or_404(Address, id=address_id, user=request.user)

            with transaction.atomic():
                # Calculate totals
                subtotal = cart.total_amount
                shipping_cost = Decimal('50') if subtotal < Decimal('500') else Decimal('0')  # Free shipping above ₹500
                tax_amount = subtotal * Decimal('0.18')  # 18% GST
                total_amount = subtotal + shipping_cost + tax_amount

                # Create order
                order = Order.objects.create(
                    user=request.user,
                    status='pending',
                    payment_method=payment_method,
                    subtotal=subtotal,
                    shipping_cost=shipping_cost,
                    tax_amount=tax_amount,
                    total_amount=total_amount,
                    shipping_name=address.name,
                    shipping_mobile=address.mobile,
                    shipping_address_line_1=address.address_line_1,
                    shipping_address_line_2=address.address_line_2,
                    shipping_city=address.city,
                    shipping_state=address.state,
                    shipping_pincode=address.pincode,
                    notes=notes
                )

                # Create order items
                for cart_item in cart.items.all():
                    price = cart_item.variant.price if cart_item.variant else cart_item.product.price
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        variant=cart_item.variant,
                        quantity=cart_item.quantity,
                        price=price
                    )

                # Create initial status history
                OrderStatusHistory.objects.create(
                    order=order,
                    status='pending',
                    notes='Order created',
                    created_by=request.user
                )

                # Clear cart
                cart.items.all().delete()

                return Response({
                    'success': True,
                    'message': 'Order created successfully',
                    'order': OrderSerializer(order, context={'request': request}).data
                })

        except Cart.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Cart not found'
            }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        
        if order.status in ['shipped', 'delivered']:
            return Response({
                'success': False,
                'message': 'Cannot cancel order that has been shipped or delivered'
            }, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'cancelled'
        order.save()

        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status='cancelled',
            notes='Order cancelled by customer',
            created_by=request.user
        )

        return Response({
            'success': True,
            'message': 'Order cancelled successfully',
            'order': OrderSerializer(order, context={'request': request}).data
        })

    except Order.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Order not found'
        }, status=status.HTTP_404_NOT_FOUND)
