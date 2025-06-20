from django.contrib import admin
from .models import Wishlist, WishlistItem

class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email',)
    inlines = [WishlistItemInline]

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('wishlist', 'product', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('product__name', 'wishlist__user__email')
