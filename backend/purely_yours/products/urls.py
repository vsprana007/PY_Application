from django.urls import path
from . import views

urlpatterns = [
    path('collections/', views.CollectionListView.as_view(), name='collection_list'),
    path('tags/', views.TagListView.as_view(), name='tag_list'),
    path('', views.ProductListView.as_view(), name='product_list'),
    path('search/', views.search_products, name='search_products'),
    path('collections/<slug:collection_slug>/', views.CollectionProductsView.as_view(), name='collection_products'),
    path('tags/<slug:tag_slug>/', views.TagProductsView.as_view(), name='tag_products'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
]
