from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('', views.ProductListView.as_view(), name='product_list'),
    path('featured/', views.featured_products, name='featured_products'),
    path('bestsellers/', views.bestsellers, name='bestsellers'),
    path('search/', views.search_products, name='search_products'),
    path('categories/<slug:category_slug>/', views.CategoryProductsView.as_view(), name='category_products'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
]
