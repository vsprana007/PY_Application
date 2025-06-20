from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Review, ReviewHelpful
from .serializers import ReviewSerializer, CreateReviewSerializer
from products.models import Product

class ProductReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return Review.objects.filter(product_id=product_id, is_approved=True)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_review(request, product_id):
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    # Check if user has already reviewed this product
    if Review.objects.filter(user=request.user, product=product).exists():
        return Response({
            'success': False,
            'message': 'You have already reviewed this product'
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = CreateReviewSerializer(
        data=request.data,
        context={'request': request, 'product_id': product_id}
    )
    
    if serializer.is_valid():
        review = serializer.save()
        return Response({
            'success': True,
            'message': 'Review created successfully',
            'review': ReviewSerializer(review, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_review_helpful(request, review_id):
    review = get_object_or_404(Review, id=review_id, is_approved=True)
    
    helpful_vote, created = ReviewHelpful.objects.get_or_create(
        user=request.user,
        review=review
    )
    
    if created:
        review.helpful_count += 1
        review.save()
        message = 'Review marked as helpful'
    else:
        helpful_vote.delete()
        review.helpful_count -= 1
        review.save()
        message = 'Helpful vote removed'
    
    return Response({
        'success': True,
        'message': message,
        'helpful_count': review.helpful_count
    })

class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)
