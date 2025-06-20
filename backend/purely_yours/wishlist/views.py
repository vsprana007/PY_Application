from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer, AddToWishlistSerializer
from products.models import Product

class WishlistView(generics.RetrieveAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_wishlist(request):
    serializer = AddToWishlistSerializer(data=request.data)
    if serializer.is_valid():
        product_id = serializer.validated_data['product_id']
        product = get_object_or_404(Product, id=product_id, is_active=True)

        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product
        )
        
        if created:
            message = 'Item added to wishlist successfully'
        else:
            message = 'Item already in wishlist'

        return Response({
            'success': True,
            'message': message,
            'wishlist': WishlistSerializer(wishlist, context={'request': request}).data
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_wishlist(request, item_id):
    try:
        wishlist_item = WishlistItem.objects.get(
            id=item_id,
            wishlist__user=request.user
        )
        wishlist_item.delete()
        
        wishlist = Wishlist.objects.get(user=request.user)
        return Response({
            'success': True,
            'message': 'Item removed from wishlist',
            'wishlist': WishlistSerializer(wishlist, context={'request': request}).data
        })
        
    except WishlistItem.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Wishlist item not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_wishlist(request):
    try:
        wishlist = Wishlist.objects.get(user=request.user)
        wishlist.items.all().delete()
        
        return Response({
            'success': True,
            'message': 'Wishlist cleared successfully',
            'wishlist': WishlistSerializer(wishlist, context={'request': request}).data
        })
        
    except Wishlist.DoesNotExist:
        return Response({
            'success': True,
            'message': 'Wishlist is already empty'
        })
