from rest_framework import serializers
from .models import Review, ReviewHelpful, ExternalReview
from accounts.serializers import UserProfileSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    user_has_voted_helpful = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'title', 'comment', 'is_verified_purchase',
                 'helpful_count', 'user_has_voted_helpful', 'created_at', 'updated_at']

    def get_user_has_voted_helpful(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ReviewHelpful.objects.filter(user=request.user, review=obj).exists()
        return False

class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['product_id'] = self.context['product_id']
        return super().create(validated_data)

class ExternalReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalReview
        fields = ['review_id', 'verified_buyer', 'product_title', 'rating', 
                 'author', 'timestamp', 'title', 'body', 'source']
