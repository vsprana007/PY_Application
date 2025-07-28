from rest_framework import generics, filters, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Collection, Product, ProductTag
from .serializers import CollectionSerializer, ProductListSerializer, ProductDetailSerializer, ProductTagSerializer
from .filters import ProductFilter

class CollectionListView(generics.ListAPIView):
    queryset = Collection.objects.filter(is_active=True)
    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class TagListView(generics.ListAPIView):
    queryset = ProductTag.objects.all()
    serializer_class = ProductTagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'collections__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).prefetch_related('collections')

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class CollectionProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        collection_slug = self.kwargs['collection_slug']
        return Product.objects.filter(
            is_active=True,
            collections__slug=collection_slug
        ).prefetch_related('collections')

class TagProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        tag_slug = self.kwargs['tag_slug']
        try:
            tag = ProductTag.objects.get(slug=tag_slug)
            return Product.objects.filter(
                is_active=True,
                tag_assignments__tag=tag
            ).distinct().prefetch_related('collections')
        except ProductTag.DoesNotExist:
            return Product.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['tag_slug'] = self.kwargs['tag_slug']
        return context



@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_products(request):
    query = request.GET.get('q', '')
    collection = request.GET.get('collection', '')
    
    products = Product.objects.filter(is_active=True)
    
    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(collections__name__icontains=query)
        )
    
    if collection:
        products = products.filter(collections__slug=collection)
    
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response({
        'results': serializer.data,
        'count': products.count(),
        'query': query
    })
