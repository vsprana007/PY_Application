from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address, OTP

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_mobile_verified', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_mobile_verified')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'mobile')
    ordering = ('email',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('mobile', 'is_mobile_verified', 'date_of_birth', 'gender')
        }),
    )

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'city', 'state', 'is_default')
    list_filter = ('state', 'is_default')
    search_fields = ('user__email', 'name', 'city')

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('mobile', 'otp', 'is_verified', 'created_at', 'expires_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('mobile',)
