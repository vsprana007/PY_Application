from django.contrib import admin
from .models import Doctor, DoctorAvailability, Consultation, ConsultationFeedback

class DoctorAvailabilityInline(admin.TabularInline):
    model = DoctorAvailability
    extra = 1

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'experience_years', 'consultation_fee', 'is_active')
    list_filter = ('specialization', 'is_active', 'created_at')
    search_fields = ('name', 'email', 'specialization')
    inlines = [DoctorAvailabilityInline]

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('user', 'doctor', 'scheduled_date', 'scheduled_time', 'status', 'consultation_type')
    list_filter = ('status', 'consultation_type', 'scheduled_date', 'created_at')
    search_fields = ('user__email', 'doctor__name', 'patient_name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ConsultationFeedback)
class ConsultationFeedbackAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'rating', 'would_recommend', 'created_at')
    list_filter = ('rating', 'would_recommend', 'created_at')
    search_fields = ('consultation__user__email', 'consultation__doctor__name')
