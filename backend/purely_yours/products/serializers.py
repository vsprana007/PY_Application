from rest_framework import serializers
from .models import Collection, Product, ProductVariant, ProductImage, ProductTag, FAQ

class CollectionSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count','show_on_homepage']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']

class ProductVariantSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price', 'original_price', 
                 'discount_percentage', 'stock_quantity', 'is_active']

class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = ['id', 'name', 'slug']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order']

class ProductListSerializer(serializers.ModelSerializer):
    collections = CollectionSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'original_price', 
                 'discount_percentage', 'primary_image', 'collections', 'tags',
                 'average_rating', 'review_count', 'stock_quantity']

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        return None

    def get_tags(self, obj):
        tags = ProductTag.objects.filter(product_assignments__product=obj)
        return ProductTagSerializer(tags, many=True).data
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    collections = CollectionSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    faqs = FAQSerializer(many=True, read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'collections', 'sku',
                 'price', 'original_price', 'discount_percentage', 'stock_quantity',
                 'key_benefits', 'key_ingredients', 'how_to_consume', 
                 'who_should_take', 'how_it_helps', 'disclaimer', 'analytical_report',
                 'images', 'variants', 'tags', 'faqs', 'average_rating', 
                 'review_count', 'created_at']

    def get_tags(self, obj):
        tags = ProductTag.objects.filter(product_assignments__product=obj)
        return ProductTagSerializer(tags, many=True).data
