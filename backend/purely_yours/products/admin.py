from django.contrib import admin
from .models import Collection, Product, ProductVariant, ProductImage, ProductTag, ProductTagAssignment, FAQ

class ProductInline(admin.TabularInline):
    model = Product.collections.through
    extra = 3
    verbose_name = "Product"
    verbose_name_plural = "Products in this Collection"

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at', 'show_on_homepage', 'get_product_count')
    list_filter = ('is_active', 'created_at', 'show_on_homepage')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductInline]
    
    def get_product_count(self, obj):
        return obj.products.count()
    get_product_count.short_description = 'Product Count'

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1
class ProductTagAssignmentInline(admin.TabularInline):
    model = ProductTagAssignment
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_collections', 'price', 'stock_quantity', 'is_active', 'created_at')
    list_filter = ('collections', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline, FAQInline, ProductTagAssignmentInline]
    filter_horizontal = ('collections',)  # Makes many-to-many field easier to manage
    
    def get_collections(self, obj):
        return ", ".join([collection.name for collection in obj.collections.all()])
    get_collections.short_description = 'Collections'

@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


