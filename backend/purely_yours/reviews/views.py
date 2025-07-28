from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Review, ReviewHelpful, ExternalReview, ReviewsSummary
from .serializers import ReviewSerializer, CreateReviewSerializer, ExternalReviewSerializer
from products.models import Product

class ProductReviewsView(generics.ListAPIView):
    serializer_class = ExternalReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ExternalReview.objects.filter(product_id=product_id)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_review(request, product_id):
    import uuid
    from django.utils import timezone
    
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    # Check if user has already reviewed this product
    existing_review = Review.objects.filter(user=request.user, product=product).first()
    if existing_review:
        # Update existing review
        serializer = CreateReviewSerializer(
            existing_review,
            data=request.data,
            context={'request': request, 'product_id': product_id}
        )
        
        if serializer.is_valid():
            review = serializer.save()
            
            # Update corresponding ExternalReview
            external_review = ExternalReview.objects.filter(
                author=request.user.email,
                product=product
            ).first()
            
            if external_review:
                external_review.rating = review.rating
                external_review.title = review.title
                external_review.body = review.comment
                external_review.timestamp = timezone.now()
                external_review.save()
            else:
                # Create new ExternalReview
                ExternalReview.objects.create(
                    review_id=uuid.uuid4(),
                    product=product,
                    verified_buyer=review.is_verified_purchase,
                    product_title=product.name,
                    product_url=f"/products/{product.id}",
                    rating=review.rating,
                    author=request.user.email,
                    timestamp=timezone.now(),
                    title=review.title,
                    body=review.comment,
                    source='internal',
                    is_imported=False
                )
            
            # Update reviews summary
            summary, created = ReviewsSummary.objects.get_or_create(product=product)
            summary.update_summary()
            
            return Response({
                'success': True,
                'message': 'Review updated successfully',
                'review': ReviewSerializer(review, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create new review
    serializer = CreateReviewSerializer(
        data=request.data,
        context={'request': request, 'product_id': product_id}
    )
    
    if serializer.is_valid():
        review = serializer.save()
        
        # Also create ExternalReview
        ExternalReview.objects.create(
            review_id=uuid.uuid4(),
            product=product,
            verified_buyer=review.is_verified_purchase,
            product_title=product.name,
            product_url=f"/products/{product.id}",
            rating=review.rating,
            author=request.user.email,
            timestamp=timezone.now(),
            title=review.title,
            body=review.comment,
            source='internal',
            is_imported=False
        )
        
        # Update reviews summary
        summary, created = ReviewsSummary.objects.get_or_create(product=product)
        summary.update_summary()
        
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

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_review(request, review_id):
    import uuid
    from django.utils import timezone
    
    review = get_object_or_404(Review, id=review_id, user=request.user)
    
    serializer = CreateReviewSerializer(
        review,
        data=request.data,
        context={'request': request, 'product_id': review.product.id}
    )
    
    if serializer.is_valid():
        updated_review = serializer.save()
        
        # Update corresponding ExternalReview
        external_review = ExternalReview.objects.filter(
            author=request.user.email,
            product=updated_review.product
        ).first()
        
        if external_review:
            external_review.rating = updated_review.rating
            external_review.title = updated_review.title
            external_review.body = updated_review.comment
            external_review.timestamp = timezone.now()
            external_review.verified_buyer = updated_review.is_verified_purchase
            external_review.save()
        else:
            # Create new ExternalReview if doesn't exist
            ExternalReview.objects.create(
                review_id=uuid.uuid4(),
                product=updated_review.product,
                verified_buyer=updated_review.is_verified_purchase,
                product_title=updated_review.product.name,
                product_url=f"/products/{updated_review.product.id}",
                rating=updated_review.rating,
                author=request.user.email,
                timestamp=timezone.now(),
                title=updated_review.title,
                body=updated_review.comment,
                source='internal',
                is_imported=False
            )
        
        return Response({
            'success': True,
            'message': 'Review updated successfully',
            'review': ReviewSerializer(updated_review, context={'request': request}).data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def product_reviews_summary(request, product_id):
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    # Get or create reviews summary
    summary, created = ReviewsSummary.objects.get_or_create(product=product)
    
    # Update summary if it doesn't exist or if requested
    if created or request.GET.get('refresh') == 'true':
        summary.update_summary()
    
    # Return summary data in the same format as your JSON
    return Response({
        'success': True,
        'reviews_summary': {
            'total_reviews': summary.total_reviews,
            'average_rating': float(summary.average_rating),
            'rating_distribution': summary.rating_distribution,
            'verified_buyers': summary.verified_buyers,
            'verified_buyer_percentage': float(summary.verified_buyer_percentage)
        }
    })
