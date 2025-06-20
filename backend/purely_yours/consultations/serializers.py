from rest_framework import serializers
from .models import Doctor, DoctorAvailability, Consultation, ConsultationFeedback

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = DoctorAvailability
        fields = ['id', 'weekday', 'weekday_display', 'start_time', 'end_time', 'is_active']

class DoctorSerializer(serializers.ModelSerializer):
    availability = DoctorAvailabilitySerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_consultations = serializers.ReadOnlyField()

    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization', 'qualification', 'experience_years',
                 'bio', 'profile_image', 'consultation_fee', 'availability',
                 'average_rating', 'total_consultations']

class ConsultationFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationFeedback
        fields = ['id', 'rating', 'comment', 'would_recommend', 'created_at']

class ConsultationSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    feedback = ConsultationFeedbackSerializer(read_only=True)

    class Meta:
        model = Consultation
        fields = ['id', 'doctor', 'consultation_type', 'scheduled_date', 'scheduled_time',
                 'duration_minutes', 'status', 'patient_name', 'patient_age', 'patient_gender',
                 'symptoms', 'medical_history', 'current_medications', 'consultation_notes',
                 'prescription', 'follow_up_required', 'follow_up_date', 'consultation_fee',
                 'payment_status', 'meeting_link', 'feedback', 'created_at', 'updated_at']

class BookConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ['doctor', 'consultation_type', 'scheduled_date', 'scheduled_time',
                 'patient_name', 'patient_age', 'patient_gender', 'symptoms',
                 'medical_history', 'current_medications']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['consultation_fee'] = validated_data['doctor'].consultation_fee
        return super().create(validated_data)

class CreateFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationFeedback
        fields = ['rating', 'comment', 'would_recommend']
