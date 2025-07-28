from django.contrib import admin
from .models import Review, ReviewHelpful, ExternalReview, ReviewsSummary

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'title', 'is_verified_purchase', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'is_approved', 'created_at')
    search_fields = ('user__email', 'product__name', 'title', 'comment')
    list_editable = ('is_approved',)

@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    list_display = ('user', 'review', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'review__title')

@admin.register(ExternalReview)
class ExternalReviewAdmin(admin.ModelAdmin):
    list_display = ('review_id', 'product', 'author', 'rating', 'verified_buyer', 'source', 'timestamp', 'created_at')
    list_filter = ('rating', 'verified_buyer', 'source', 'is_imported', 'timestamp', 'created_at')
    search_fields = ('author', 'product__name', 'product_title', 'title', 'body', 'review_id')
    readonly_fields = ('review_id', 'created_at', 'updated_at')
    list_editable = ('verified_buyer',)
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Review Information', {
            'fields': ('review_id', 'product', 'author', 'rating', 'verified_buyer')
        }),
        ('Content', {
            'fields': ('title', 'body', 'product_title', 'product_url')
        }),
        ('Metadata', {
            'fields': ('source', 'is_imported', 'timestamp', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ReviewsSummary)
class ReviewsSummaryAdmin(admin.ModelAdmin):
    list_display = ('product', 'total_reviews', 'average_rating', 'verified_buyers', 'verified_buyer_percentage', 'last_updated')
    list_filter = ('last_updated', 'created_at')
    search_fields = ('product__name',)
    readonly_fields = ('last_updated', 'created_at')
    
    fieldsets = (
        ('Product Information', {
            'fields': ('product',)
        }),
        ('Review Statistics', {
            'fields': ('total_reviews', 'average_rating', 'verified_buyers', 'verified_buyer_percentage')
        }),
        ('Rating Distribution', {
            'fields': ('one_star_count', 'two_star_count', 'three_star_count', 'four_star_count', 'five_star_count'),
            'classes': ('wide',)
        }),
        ('Timestamps', {
            'fields': ('last_updated', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['update_summaries']
    
    def update_summaries(self, request, queryset):
        """Admin action to update selected review summaries"""
        updated_count = 0
        for summary in queryset:
            summary.update_summary()
            updated_count += 1
        
        self.message_user(
            request,
            f"Successfully updated {updated_count} review summaries.",
            level='SUCCESS'
        )
    
    update_summaries.short_description = "Update selected review summaries"