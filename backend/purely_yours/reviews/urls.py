from django.urls import path
from . import views

urlpatterns = [
    path('product/<int:product_id>/', views.ProductReviewsView.as_view(), name='product_reviews'),
    path('product/<int:product_id>/summary/', views.product_reviews_summary, name='product_reviews_summary'),
    path('product/<int:product_id>/create/', views.create_review, name='create_review'),
    path('<int:review_id>/helpful/', views.mark_review_helpful, name='mark_review_helpful'),
    path('my-reviews/', views.UserReviewsView.as_view(), name='user_reviews'),
]
