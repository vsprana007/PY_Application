from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer
from products.models import Product, ProductVariant

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    if serializer.is_valid():
        product_id = serializer.validated_data['product_id']
        variant_id = serializer.validated_data.get('variant_id')
        quantity = serializer.validated_data['quantity']

        product = get_object_or_404(Product, id=product_id, is_active=True)
        variant = None
        if variant_id:
            variant = get_object_or_404(ProductVariant, id=variant_id, product=product, is_active=True)

        cart, created = Cart.objects.get_or_create(user=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({
            'success': True,
            'message': 'Item added to cart successfully',
            'cart': CartSerializer(cart, context={'request': request}).data
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_cart_item(request, item_id):
    serializer = UpdateCartItemSerializer(data=request.data)
    if serializer.is_valid():
        quantity = serializer.validated_data['quantity']
        
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            
            if quantity == 0:
                cart_item.delete()
                message = 'Item removed from cart'
            else:
                cart_item.quantity = quantity
                cart_item.save()
                message = 'Cart item updated successfully'
            
            cart = Cart.objects.get(user=request.user)
            return Response({
                'success': True,
                'message': message,
                'cart': CartSerializer(cart, context={'request': request}).data
            })
            
        except CartItem.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Cart item not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        cart_item = CartItem.objects.get(
            id=item_id,
            cart__user=request.user
        )
        cart_item.delete()
        
        cart = Cart.objects.get(user=request.user)
        return Response({
            'success': True,
            'message': 'Item removed from cart',
            'cart': CartSerializer(cart, context={'request': request}).data
        })
        
    except CartItem.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Cart item not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_cart(request):
    try:
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
        
        return Response({
            'success': True,
            'message': 'Cart cleared successfully',
            'cart': CartSerializer(cart, context={'request': request}).data
        })
        
    except Cart.DoesNotExist:
        return Response({
            'success': True,
            'message': 'Cart is already empty'
        })

