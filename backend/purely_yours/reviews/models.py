from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product

User = get_user_model()

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name} - {self.rating} stars"

class ReviewHelpful(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'review']

    def __str__(self):
        return f"{self.user.email} found {self.review.id} helpful"


class ExternalReview(models.Model):
    review_id = models.UUIDField(unique=True, help_text="External review UUID")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='external_reviews')
    verified_buyer = models.BooleanField(default=False)
    product_title = models.CharField(max_length=255, help_text="Product title from external source")
    product_url = models.CharField(max_length=500, blank=True, help_text="Product URL from external source")
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    author = models.CharField(max_length=200, help_text="Review author name")
    timestamp = models.DateTimeField(help_text="Original review timestamp")
    title = models.CharField(max_length=500, blank=True, help_text="Review title")
    body = models.TextField(help_text="Review content/body")
    source = models.CharField(max_length=100, default='external', help_text="Source platform")
    is_imported = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['verified_buyer']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"External Review: {self.author} - {self.product_title} - {self.rating} stars"


class ReviewsSummary(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='reviews_summary')
    total_reviews = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Rating distribution
    one_star_count = models.PositiveIntegerField(default=0)
    two_star_count = models.PositiveIntegerField(default=0)
    three_star_count = models.PositiveIntegerField(default=0)
    four_star_count = models.PositiveIntegerField(default=0)
    five_star_count = models.PositiveIntegerField(default=0)
    
    verified_buyers = models.PositiveIntegerField(default=0)
    verified_buyer_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "External Reviews Summary"
        verbose_name_plural = "External Reviews Summaries"

    def __str__(self):
        return f"External Reviews Summary for {self.product.name}: {self.total_reviews} reviews, {self.average_rating} avg"
    
    def update_summary(self):
        """Update summary statistics based on external reviews only"""
        from django.db.models import Avg
        
        # Get only external reviews for this product
        external_reviews = self.product.external_reviews.all()
        
        # Count total external reviews
        self.total_reviews = external_reviews.count()
        
        if self.total_reviews > 0:
            # Calculate average rating from external reviews only
            external_avg = external_reviews.aggregate(avg=Avg('rating'))['avg'] or 0
            self.average_rating = external_avg
            
            # Calculate rating distribution from external reviews only
            self.one_star_count = external_reviews.filter(rating=1).count()
            self.two_star_count = external_reviews.filter(rating=2).count()
            self.three_star_count = external_reviews.filter(rating=3).count()
            self.four_star_count = external_reviews.filter(rating=4).count()
            self.five_star_count = external_reviews.filter(rating=5).count()
            
            # Calculate verified buyers from external reviews only
            self.verified_buyers = external_reviews.filter(verified_buyer=True).count()
            self.verified_buyer_percentage = (self.verified_buyers / self.total_reviews) * 100
        else:
            # No external reviews found
            self.average_rating = 0
            self.one_star_count = 0
            self.two_star_count = 0
            self.three_star_count = 0
            self.four_star_count = 0
            self.five_star_count = 0
            self.verified_buyers = 0
            self.verified_buyer_percentage = 0
        
        self.save()
    
    @property
    def rating_distribution(self):
        """Return rating distribution as a dictionary"""
        return {
            "1_star": self.one_star_count,
            "2_star": self.two_star_count,
            "3_star": self.three_star_count,
            "4_star": self.four_star_count,
            "5_star": self.five_star_count,
        }
